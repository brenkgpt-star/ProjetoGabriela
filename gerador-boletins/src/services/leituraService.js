// Modelos ultrarrápidos e estáveis, sem atraso de raciocínio (tempo médio < 1.5s)
const MODELOS_PADRAO = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-3.6-flash',
]
const MODELOS_CANDIDATOS = [
  import.meta.env.VITE_IA_MODELO,
  ...MODELOS_PADRAO,
].filter((m, i, arr) => m && arr.indexOf(m) === i)
const CHAVE_GEMINI = (import.meta.env.VITE_GEMINI_API_KEY ?? '').trim()
const LARGURA_MAXIMA = 1600
const TENTATIVAS_PADRAO = 2

const INSTRUCAO = [
  'Voce recebe a foto de um boletim escolar emitido por outro sistema (por exemplo, o SIGAA do IFC Concordia).',
  'Extraia os dados e devolva SOMENTE um objeto JSON, sem texto antes nem depois.',
  'O JSON deve ter este formato:',
  '{ "aluno": { "nome": "...", "matricula": "..." },',
  '  "turma": { "nome": "..." },',
  '  "anoLetivo": 2026,',
  '  "observacoes": "...",',
  '  "notas": [ { "disciplina": "...", "tri1": 8.5, "rec1": 9.0, "tri2": 7.0, "rec2": null, "tri3": 9.0, "rec3": null, "faltas": 2 } ] }',
  'Regras:',
  '- "aluno.nome" e o nome completo do estudante; "aluno.matricula" e a matricula, se visivel.',
  '- "turma.nome" e a turma, serie ou curso, se visivel.',
  '- "anoLetivo" e o ano do documento; se nao estiver visivel, use o ano atual.',
  '- Para cada disciplina visivel, crie um item em "notas" com o nome da disciplina,',
  '  as notas de cada trimestre ("tri1", "tri2", "tri3"), as recuperacoes paralelas',
  '  ("rec1", "rec2", "rec3") e o total de faltas.',
  '- Os trimestres podem aparecer como "I, II e III", "1o, 2o e 3o tri" ou "unidades".',
  '- RECUPERACAO PARALELA (estilo SIGAA/IFC Concordia): procure colunas ou campos rotulados como',
  '  "REC", "Rec", "RP", "R.P.", "Rec. Paralela", "Recuperacao" ou "Recup. Paralela",',
  '  geralmente logo apos a coluna de cada trimestre/bimestre.',
  '  Cada recuperacao pertence ao trimestre imediatamente anterior a ela:',
  '  a 1a recuperacao e "rec1", a 2a e "rec2", a 3a e "rec3".',
  '- A recuperacao paralela substitui a nota do trimestre quando for maior, mas extraia',
  '  os dois valores separadamente (nunca some nem tire a media na extracao).',
  '- Se uma recuperacao nao existir ou estiver vazia/travessao, devolva null nesse campo.',
  '- Se o documento mostra so uma nota final por disciplina (sem divisao por trimestre),',
  '  coloque esse valor em "tri1" e omita os outros.',
  '- Se alguma nota ou falta nao estiver visivel, omita o campo em vez de inventar valor.',
  '- "observacoes" so deve trazer texto impresso no documento; se nao houver, devolva string vazia.',
].join('\n')

function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms))
}

function lerArquivoComoImagem(arquivo) {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader()
    leitor.onload = () => resolver(leitor.result)
    leitor.onerror = () => rejeitar(new Error('Nao foi possivel ler o arquivo da foto.'))
    leitor.readAsDataURL(arquivo)
  })
}

function carregarElementoImagem(url) {
  return new Promise((resolver, rejeitar) => {
    const elemento = new Image()
    elemento.onload = () => resolver(elemento)
    elemento.onerror = () => rejeitar(new Error('O arquivo enviado nao e uma imagem valida.'))
    elemento.src = url
  })
}

// Reduz fotos grandes antes do envio: a IA le bem mesmo em resolucao menor
// e a requisicao fica mais rapida.
export async function prepararImagem(arquivo) {
  if (!arquivo?.type?.startsWith('image/')) {
    throw new Error('Envie um arquivo de imagem (JPG, PNG ou WEBP).')
  }

  const original = await lerArquivoComoImagem(arquivo)
  const elemento = await carregarElementoImagem(original)
  const escala = Math.min(1, LARGURA_MAXIMA / Math.max(elemento.width, elemento.height))

  const tela = document.createElement('canvas')
  tela.width = Math.round(elemento.width * escala)
  tela.height = Math.round(elemento.height * escala)
  tela.getContext('2d').drawImage(elemento, 0, 0, tela.width, tela.height)

  const reduzida = tela.toDataURL('image/jpeg', 0.85)
  const [cabecalho, base64] = reduzida.split(',')

  return {
    base64,
    mimeType: cabecalho.match(/data:(.*);/)?.[1] ?? 'image/jpeg',
    previa: reduzida,
  }
}

function paraNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null
  const numero = Number(valor)
  return Number.isNaN(numero) ? null : numero
}

function extrairJSON(texto) {
  const semCercas = texto.replace(/```json|```/g, '').trim()
  const inicio = semCercas.indexOf('{')
  const fim = semCercas.lastIndexOf('}')
  if (inicio === -1 || fim === -1) {
    throw new Error('A resposta da IA veio em formato inesperado. Tente de novo.')
  }
  try {
    return JSON.parse(semCercas.slice(inicio, fim + 1))
  } catch {
    throw new Error('A resposta da IA veio em formato inesperado. Tente de novo.')
  }
}

function normalizarExtracao(dados) {
  const notas = (dados.notas ?? [])
    .map((item) => ({
      disciplina: item.disciplina?.trim() ?? '',
      tri1: paraNumero(item.tri1),
      rec1: paraNumero(item.rec1 ?? item.recuperacao1 ?? item.rp1),
      tri2: paraNumero(item.tri2),
      rec2: paraNumero(item.rec2 ?? item.recuperacao2 ?? item.rp2),
      tri3: paraNumero(item.tri3),
      rec3: paraNumero(item.rec3 ?? item.recuperacao3 ?? item.rp3),
      faltas: paraNumero(item.faltas) ?? 0,
    }))
    .filter((item) => item.disciplina)

  return {
    aluno: {
      nome: dados.aluno?.nome?.trim() ?? '',
      matricula: dados.aluno?.matricula?.trim() ?? '',
    },
    turma: {
      nome: dados.turma?.nome?.trim() ?? '',
    },
    anoLetivo: paraNumero(dados.anoLetivo) ?? new Date().getFullYear(),
    observacoes: dados.observacoes?.trim() ?? '',
    notas,
  }
}

function validarExtracao(extracao) {
  if (!extracao.notas.length) {
    throw new Error('Nenhuma nota foi encontrada na foto. Confira se o boletim esta legivel.')
  }
  return extracao
}

async function buscarComTimeout(url, opcoes, ms = 120000) {
  const controle = new AbortController()
  const limite = setTimeout(() => controle.abort(), ms)
  try {
    return await fetch(url, { ...opcoes, signal: controle.signal })
  } catch (falha) {
    if (falha?.name === 'AbortError') {
      throw new Error('A leitura demorou demais e foi interrompida. Tente de novo.')
    }
    throw falha
  } finally {
    clearTimeout(limite)
  }
}

// Leitura gratuita e sem chave. O servico gratuito oscila, por isso
// o site tenta de novo sozinho antes de desistir.
async function extrairViaLivre(imagem) {
  const corpo = {
    model: 'openai',
    temperature: 0,
    messages: [
      { role: 'system', content: INSTRUCAO },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Leia este boletim e extraia os dados no formato pedido.' },
          {
            type: 'image_url',
            image_url: { url: `data:${imagem.mimeType};base64,${imagem.base64}` },
          },
        ],
      },
    ],
  }

  let ultimoErro = null
  for (let tentativa = 1; tentativa <= TENTATIVAS_PADRAO; tentativa += 1) {
    try {
      const resposta = await buscarComTimeout('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
      }, 15000)
      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`)
      }
      // A resposta pode vir como JSON (OpenAI-compat) ou texto puro
      const tipoResposta = resposta.headers.get('content-type') ?? ''
      let texto = ''
      if (tipoResposta.includes('application/json')) {
        const dados = await resposta.json()
        texto = dados.choices?.[0]?.message?.content ?? dados?.text ?? ''
      } else {
        texto = await resposta.text()
      }
      if (!texto) {
        throw new Error('Resposta vazia da IA.')
      }
      // Detecta respostas da API que pedem creditos em vez de processar a imagem
      if (texto.includes('credits') || texto.includes('top up') || texto.includes('top-up')) {
        throw new Error('O servico gratuito de IA esta indisponivel no momento.')
      }
      return validarExtracao(normalizarExtracao(extrairJSON(texto)))
    } catch (falha) {
      ultimoErro = falha
      if (tentativa < TENTATIVAS_PADRAO) {
        await esperar(tentativa * 2000)
      }
    }
  }
  throw ultimoErro
}

// Chama um modelo Gemini especifico. Retorna o resultado ou lanca erro.
async function chamarGemini(modelo, corpoRequisicao) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${CHAVE_GEMINI}`
  const ERROS_TRANSITÓRIOS = new Set([429, 500, 502, 503])

  const resposta = await buscarComTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: corpoRequisicao,
  }, 20000)

  if (!resposta.ok) {
    if (resposta.status === 400) {
      throw new Error('A IA nao conseguiu processar a imagem. Tente uma foto mais nitida.')
    }
    if (ERROS_TRANSITÓRIOS.has(resposta.status)) {
      const erro = new Error(`Gemini (${modelo}) temporariamente indisponivel (HTTP ${resposta.status})`)
      erro.transitório = true
      throw erro
    }
    throw new Error(`A IA (${modelo}) respondeu com erro (HTTP ${resposta.status}).`)
  }

  const corpo = await resposta.json()
  const texto = corpo.candidates?.[0]?.content?.parts?.map((parte) => parte.text ?? '').join('') ?? ''
  if (!texto) {
    throw new Error('A IA nao conseguiu ler a foto. Tente uma imagem mais nitida.')
  }
  return validarExtracao(normalizarExtracao(extrairJSON(texto)))
}

// Usa a chave do Gemini configurada no .env. Percorre os modelos disponiveis
// e, caso algum esteja sobrecarregado (503) ou demore, aciona o proximo da lista.
async function extrairViaGemini(imagem) {
  const corpoRequisicao = JSON.stringify({
    system_instruction: { parts: [{ text: INSTRUCAO }] },
    contents: [
      {
        parts: [
          { text: 'Leia este boletim e extraia os dados no formato pedido.' },
          { inline_data: { mime_type: imagem.mimeType, data: imagem.base64 } },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  })

  let ultimoErro = null

  // Tenta a sequencia de modelos (ex: 3.7-flash -> 3.8-flash -> 3.6-flash -> 3.5-flash)
  for (const modelo of MODELOS_CANDIDATOS) {
    for (let tentativa = 1; tentativa <= TENTATIVAS_PADRAO; tentativa += 1) {
      try {
        return await chamarGemini(modelo, corpoRequisicao)
      } catch (falha) {
        ultimoErro = falha
        const ehTransitório = falha.transitório || falha instanceof TypeError || falha?.message?.includes('demorou demais')
        if (!ehTransitório) throw falha

        // Se o modelo estiver sob alta demanda (503) ou demorou demais, pula logo pro proximo modelo
        if (falha.message?.includes('503') || falha.message?.includes('demorou demais')) {
          break
        }
        if (tentativa < TENTATIVAS_PADRAO) {
          await esperar(1500)
        }
      }
    }
  }
  throw ultimoErro
}

// Quando ha chave do Gemini configurada, tenta primeiro por la (mais
// confiavel). Quando nao ha, tenta o servico gratuito.
export async function extrairBoletimDaImagem({ imagem }) {
  // Estrategia 1: Gemini primeiro (quando tem chave)
  if (CHAVE_GEMINI) {
    try {
      return await extrairViaGemini(imagem)
    } catch (falhaGemini) {
      // Se o Gemini falhar, ainda tenta o servico gratuito como reserva
      try {
        return await extrairViaLivre(imagem)
      } catch {
        // Propaga o erro mais util (do Gemini)
        if (falhaGemini instanceof TypeError) {
          throw new Error('Nao foi possivel alcancar a IA. Confira a conexao com a internet.')
        }
        throw falhaGemini
      }
    }
  }

  // Estrategia 2: servico gratuito (sem chave)
  try {
    return await extrairViaLivre(imagem)
  } catch (falhaLivre) {
    if (falhaLivre instanceof TypeError) {
      throw new Error('Nao foi possivel alcancar a IA. Confira a conexao com a internet.')
    }
    throw new Error(
      'A leitura falhou apos algumas tentativas. '
      + 'Configure uma chave do Gemini no .env para melhor resultado, '
      + 'ou confira se o boletim esta nitido e tente de novo.',
    )
  }
}

