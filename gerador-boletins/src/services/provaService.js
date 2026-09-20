import { armazenamentoLocal } from './armazenamentoLocal'

export const TOTAL_QUESTOES_PROVA = 10
export const MAX_CONTEUDOS_PROVA = 10

// Mesma estrategia da leitura de boletins: Gemini quando ha chave,
// servico gratuito como reserva.
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
const TENTATIVAS_PADRAO = 2

function descreverDificuldade(nivel) {
  const n = Math.max(0, Math.min(10, Number(nivel) || 0))
  if (n <= 2) return 'muito facil (questoes diretas, de memorizacao)'
  if (n <= 4) return 'facil (questoes diretas com interpretacao simples)'
  if (n <= 6) return 'intermediario (interpretacao e aplicacao dos conteudos)'
  if (n <= 8) return 'dificil (questoes que exigem raciocinio e analise)'
  return 'muito dificil (questoes desafiadoras, de alto raciocinio)'
}

function montarInstrucao({ materia, turma, dificuldade = 5 }) {
  return [
    'Voce e um professor que elabora provas escolares no Brasil.',
    `Elabore uma prova de ${materia}${turma ? ` para a turma ${turma}` : ''}.`,
    `Nivel de dificuldade ${Math.max(0, Math.min(10, Number(dificuldade) || 0))} de 0 a 10: ${descreverDificuldade(dificuldade)}.`,
    'Devolva SOMENTE um objeto JSON, sem texto antes nem depois, neste formato:',
    '{ "titulo": "Avaliacao de ...",',
    '  "materia": "...",',
    '  "conteudos": ["conteudo 1", "conteudo 2"],',
    '  "instrucoes": "Leia com atencao... (texto impresso no cabecalho da prova)",',
    '  "questoes": [',
    '    { "enunciado": "...",',
    '      "alternativas": ["texto A", "texto B", "texto C", "texto D"],',
    '      "resposta": 0 }',
    '  ] }',
  'Regras obrigatorias:',
  `- A prova tem EXATAMENTE ${TOTAL_QUESTOES_PROVA} questoes objetivas, nem mais nem menos.`,
  `- Cada questao tem EXATAMENTE 4 alternativas (A, B, C e D), com uma unica correta.`,
  `- "resposta" e o indice (0 a 3) da alternativa correta na lista.`,
  `- Identifique no pedido do professor os conteudos a cobrar (topicos, capitulos, temas).`,
  `- Use NO MAXIMO ${MAX_CONTEUDOS_PROVA} conteudos; se o professor citar mais, fique com os 10 mais relevantes.`,
  '- Distribua as questoes entre os conteudos de forma equilibrada.',
  '- Varie a posicao da resposta correta entre as questoes (nao repita a mesma letra em sequencia).',
  '- Nivel de linguagem adequado a educacao basica, sem pegadinhas injustas.',
  '- "conteudos" lista em texto curto cada conteudo cobrado.',
  '- GRAFICOS (fisica, matematica, quimica etc.): quando a questao depender de dados visuais,',
  '  inclua "grafico" com um destes tipos:',
  '  * "barras" ou "linha": { "tipo", "titulo", "rotulos": [...], "valores": [numeros], "unidade" }.',
  '  * "aquecimento" (curva de aquecimento/resfriamento, termologia): mesmo formato de linha;',
  '    use valores iguais em sequencia para os patamares de fusao/ebulicao.',
  '  * "ciclo" (ciclo termodinamico, p x V): { "tipo": "ciclo", "titulo",',
  '    "eixoX": "V (m3)", "eixoY": "p (kPa)", "suave": true para isotermas/adiabaticas,',
  '    "pontos": [{ "x": 1, "y": 100, "rotulo": "A" }, ...] } com no minimo 3 pontos em ordem.',
  '  * "escalas" (termometria): { "tipo": "escalas", "titulo", "marcas": [{ "c": 0, "f": 32, "k": 273 }] }.',
  '  * "pizza": mesmo formato de barras (rotulos + valores numericos).',
  '  * "tabela" (calor especifico, medicoes): { "tipo": "tabela", "titulo",',
  '    "colunas": [...], "linhas": [[...], [...]] }.',
  '- "rotulos" e "valores" tem o mesmo tamanho (minimo 2 pontos) e "valores" sao numeros.',
  '- So inclua "grafico" quando ele for necessario para resolver a questao.',
].join('\n')
}

function esperar(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms))
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

function paraIndiceResposta(valor) {
  if (typeof valor === 'number' && valor >= 0 && valor <= 3) return valor
  if (typeof valor === 'string') {
    const letra = valor.trim().toUpperCase()
    const mapa = { A: 0, B: 1, C: 2, D: 3 }
    if (letra in mapa) return mapa[letra]
    const numero = Number(letra)
    if (numero >= 0 && numero <= 3) return numero
  }
  return null
}

// Grafico opcional da questao (dados visuais). Tipos: barras, linha,
// aquecimento e ciclo (termologia/termodinamica), escalas (termometria),
// pizza e tabela.
function normalizarGrafico(dados) {
  if (dados === null || dados === undefined) return null
  const titulo = dados.titulo?.trim() || ''
  const unidade = dados.unidade?.trim() || ''

  if (dados.tipo === 'ciclo') {
    const pontos = Array.isArray(dados.pontos)
      ? dados.pontos.map((ponto) => ({
        x: Number(ponto?.x),
        y: Number(ponto?.y),
        rotulo: String(ponto?.rotulo ?? '').trim(),
      }))
      : []
    if (pontos.length < 3 || pontos.some((ponto) => Number.isNaN(ponto.x) || Number.isNaN(ponto.y))) {
      return null
    }
    return {
      tipo: 'ciclo',
      titulo,
      unidade,
      eixoX: dados.eixoX?.trim() || 'V',
      eixoY: dados.eixoY?.trim() || 'p',
      suave: dados.suave === true,
      pontos,
    }
  }

  if (dados.tipo === 'tabela') {
    const colunas = Array.isArray(dados.colunas) ? dados.colunas.map((texto) => String(texto ?? '').trim()) : []
    const linhas = Array.isArray(dados.linhas)
      ? dados.linhas.map((linha) => (Array.isArray(linha) ? linha.map((celula) => String(celula ?? '').trim()) : []))
      : []
    if (colunas.length < 2 || !linhas.length || linhas.some((linha) => linha.length !== colunas.length)) {
      return null
    }
    return { tipo: 'tabela', titulo, unidade, colunas, linhas }
  }

  if (dados.tipo === 'escalas') {
    const marcas = Array.isArray(dados.marcas)
      ? dados.marcas.map((marca) => ({ c: Number(marca?.c), f: Number(marca?.f), k: Number(marca?.k) }))
      : []
    if (marcas.length < 2 || marcas.some((marca) => [marca.c, marca.f, marca.k].some((valor) => Number.isNaN(valor)))) {
      return null
    }
    return { tipo: 'escalas', titulo, unidade, marcas }
  }

  const tipo = ['linha', 'pizza', 'aquecimento'].includes(dados.tipo) ? dados.tipo : 'barras'
  const rotulos = Array.isArray(dados.rotulos) ? dados.rotulos.map((texto) => String(texto ?? '').trim()) : []
  const valores = Array.isArray(dados.valores) ? dados.valores.map((valor) => Number(valor)) : []
  if (rotulos.length < 2 || rotulos.length !== valores.length || valores.some((valor) => Number.isNaN(valor))) {
    return null
  }
  return { tipo, titulo, rotulos, valores, unidade }
}

// Garante o padrao: 10 questoes, 4 alternativas, resposta valida, max 10 conteudos.
function normalizarProva(dados, { materia, turma }) {
  const questoesBrutas = Array.isArray(dados.questoes) ? dados.questoes : []
  if (questoesBrutas.length !== TOTAL_QUESTOES_PROVA) {
    throw new Error(
      `A IA retornou ${questoesBrutas.length} questoes em vez de ${TOTAL_QUESTOES_PROVA}. Tente gerar de novo.`,
    )
  }

  const questoes = questoesBrutas.map((item, indice) => {
    const enunciado = item.enunciado?.trim() ?? ''
    const alternativas = Array.isArray(item.alternativas)
      ? item.alternativas.map((texto) => String(texto ?? '').trim())
      : []
    const resposta = paraIndiceResposta(item.resposta)
    if (!enunciado || alternativas.length !== 4 || alternativas.some((texto) => !texto) || resposta === null) {
      throw new Error(`A questao ${indice + 1} veio incompleta. Tente gerar de novo.`)
    }
    return { enunciado, alternativas, resposta, valor: 1, grafico: normalizarGrafico(item.grafico) }
  })

  const conteudos = (Array.isArray(dados.conteudos) ? dados.conteudos : [])
    .map((texto) => String(texto ?? '').trim())
    .filter(Boolean)
    .slice(0, MAX_CONTEUDOS_PROVA)

  return {
    titulo: dados.titulo?.trim() || `Avaliacao de ${materia}`,
    materia,
    turma: turma?.trim() || '',
    conteudos,
    instrucoes: dados.instrucoes?.trim() ?? '',
    questoes,
  }
}

async function buscarComTimeout(url, opcoes, ms = 60000) {
  const controle = new AbortController()
  const limite = setTimeout(() => controle.abort(), ms)
  try {
    return await fetch(url, { ...opcoes, signal: controle.signal })
  } catch (falha) {
    if (falha?.name === 'AbortError') {
      throw new Error('A geracao demorou demais e foi interrompida. Tente de novo.')
    }
    throw falha
  } finally {
    clearTimeout(limite)
  }
}

async function gerarViaLivre({ materia, turma, conversa, dificuldade }) {
  const corpo = {
    model: 'openai',
    temperature: 0.7,
    messages: [
      { role: 'system', content: montarInstrucao({ materia, turma, dificuldade }) },
      {
        role: 'user',
        content: `Pedido do professor:\n${conversa}\n\nGere a prova agora no formato JSON pedido.`,
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
      }, 60000)
      if (!resposta.ok) {
        throw new Error(`HTTP ${resposta.status}`)
      }
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
      if (texto.includes('credits') || texto.includes('top up') || texto.includes('top-up')) {
        throw new Error('O servico gratuito de IA esta indisponivel no momento.')
      }
      return normalizarProva(extrairJSON(texto), { materia, turma })
    } catch (falha) {
      ultimoErro = falha
      if (tentativa < TENTATIVAS_PADRAO) {
        await esperar(tentativa * 2000)
      }
    }
  }
  throw ultimoErro
}

async function chamarGemini(modelo, corpoRequisicao) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${CHAVE_GEMINI}`
  const ERROS_TRANSITORIOS = new Set([429, 500, 502, 503])

  const resposta = await buscarComTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: corpoRequisicao,
  }, 60000)

  if (!resposta.ok) {
    if (resposta.status === 400) {
      throw new Error('A IA nao conseguiu processar o pedido. Revise as observacoes e tente de novo.')
    }
    if (ERROS_TRANSITORIOS.has(resposta.status)) {
      const erro = new Error(`Gemini (${modelo}) temporariamente indisponivel (HTTP ${resposta.status})`)
      erro.transitorio = true
      throw erro
    }
    throw new Error(`A IA (${modelo}) respondeu com erro (HTTP ${resposta.status}).`)
  }

  const corpo = await resposta.json()
  const texto = corpo.candidates?.[0]?.content?.parts?.map((parte) => parte.text ?? '').join('') ?? ''
  if (!texto) {
    throw new Error('A IA nao conseguiu gerar a prova. Tente de novo.')
  }
  return extrairJSON(texto)
}

async function gerarViaGemini({ materia, turma, conversa, dificuldade }) {
  const corpoRequisicao = JSON.stringify({
    system_instruction: { parts: [{ text: montarInstrucao({ materia, turma, dificuldade }) }] },
    contents: [
      {
        parts: [
          { text: `Pedido do professor:\n${conversa}\n\nGere a prova agora no formato JSON pedido.` },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
  })

  let ultimoErro = null
  for (const modelo of MODELOS_CANDIDATOS) {
    for (let tentativa = 1; tentativa <= TENTATIVAS_PADRAO; tentativa += 1) {
      try {
        const dados = await chamarGemini(modelo, corpoRequisicao)
        return normalizarProva(dados, { materia, turma })
      } catch (falha) {
        ultimoErro = falha
        const ehTransitorio = falha.transitorio || falha instanceof TypeError || falha?.message?.includes('demorou demais')
        if (!ehTransitorio) throw falha
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

// Gera a prova com IA. `conversa` e o texto com conteudos e observacoes do chat.
export async function gerarProvaComIA({ materia, turma = '', conversa, dificuldade = 5 }) {
  const textoPedido = conversa?.trim() ?? ''
  if (!materia?.trim()) {
    throw new Error('Escolha a materia da prova.')
  }
  if (!textoPedido) {
    throw new Error('Descreva no chat os conteudos e observacoes da prova.')
  }

  if (CHAVE_GEMINI) {
    try {
      return await gerarViaGemini({ materia: materia.trim(), turma, conversa: textoPedido, dificuldade })
    } catch (falhaGemini) {
      try {
        return await gerarViaLivre({ materia: materia.trim(), turma, conversa: textoPedido, dificuldade })
      } catch {
        if (falhaGemini instanceof TypeError) {
          throw new Error('Nao foi possivel alcancar a IA. Confira a conexao com a internet.')
        }
        throw falhaGemini
      }
    }
  }

  try {
    return await gerarViaLivre({ materia: materia.trim(), turma, conversa: textoPedido, dificuldade })
  } catch (falhaLivre) {
    if (falhaLivre instanceof TypeError) {
      throw new Error('Nao foi possivel alcancar a IA. Confira a conexao com a internet.')
    }
    throw new Error(
      'A geracao falhou apos algumas tentativas. '
      + 'Configure uma chave do Gemini no .env para melhor resultado, ou tente de novo.',
    )
  }
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

const MAX_PAGINAS_PDF = 4
const TAMANHO_MAX_PDF = 15 * 1024 * 1024

function lerArquivoComoBase64(arquivo) {
  return new Promise((resolver, rejeitar) => {
    const leitor = new FileReader()
    leitor.onload = () => {
      const [, base64] = String(leitor.result).split(',')
      resolver(base64)
    }
    leitor.onerror = () => rejeitar(new Error('Nao foi possivel ler o arquivo PDF.'))
    leitor.readAsDataURL(arquivo)
  })
}

// Renderiza as primeiras paginas do PDF como imagens (para IAs sem leitura de PDF).
async function pdfParaImagens(base64) {
  const pdfjs = await import('pdfjs-dist')
  const { default: workerSrc } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
  const binario = Uint8Array.from(atob(base64), (caractere) => caractere.charCodeAt(0))
  const documento = await pdfjs.getDocument({ data: binario }).promise
  const total = Math.min(documento.numPages, MAX_PAGINAS_PDF)
  const imagens = []
  for (let pagina = 1; pagina <= total; pagina += 1) {
    const folha = await documento.getPage(pagina)
    const viewport = folha.getViewport({ scale: 1.6 })
    const tela = document.createElement('canvas')
    tela.width = Math.round(viewport.width)
    tela.height = Math.round(viewport.height)
    await folha.render({ canvasContext: tela.getContext('2d'), viewport }).promise
    const [, dados] = tela.toDataURL('image/jpeg', 0.85).split(',')
    imagens.push({ base64: dados, mimeType: 'image/jpeg' })
  }
  if (typeof documento.destroy === 'function') {
    await documento.destroy()
  }
  return imagens
}

// Prepara o PDF: bytes originais (o Gemini le PDF nativo) + paginas como
// imagem (reserva para o servico gratuito).
export async function prepararPDF(arquivo) {
  const ehPDF = arquivo?.type === 'application/pdf' || arquivo?.name?.toLowerCase().endsWith('.pdf')
  if (!arquivo || !ehPDF) {
    throw new Error('Envie um arquivo PDF da prova.')
  }
  if (arquivo.size > TAMANHO_MAX_PDF) {
    throw new Error('O PDF e grande demais (limite de 15 MB).')
  }
  const base64 = await lerArquivoComoBase64(arquivo)
  const paginas = await pdfParaImagens(base64)
  return { base64, paginas, nome: arquivo.name ?? 'prova.pdf' }
}

function montarInstrucaoReescrita({ dificuldade = 5 }) {
  const nivel = Math.max(0, Math.min(10, Number(dificuldade) || 0))
  return [
    'Voce recebe uma prova pronta (PDF ou fotos das paginas).',
    'REESCREVA a prova trocando APENAS os valores numericos e devolva SOMENTE um objeto JSON, sem texto antes nem depois:',
    '{ "titulo": "...", "materia": "...", "turma": "...",',
    '  "conteudos": ["conteudo 1", "conteudo 2"],',
    '  "instrucoes": "...",',
    '  "questoes": [',
    '    { "enunciado": "...",',
    '      "alternativas": ["texto A", "texto B", "texto C", "texto D"],',
    '      "resposta": 0,',
    '      "grafico": null ou um destes: { "tipo": "barras"/"linha"/"pizza"/"aquecimento",',
    '        "titulo": "...", "rotulos": [...], "valores": [...], "unidade": "..." },',
    '      { "tipo": "ciclo", "titulo": "...", "eixoX": "V (m3)", "eixoY": "p (kPa)",',
    '        "suave": true, "pontos": [{ "x": 1, "y": 100, "rotulo": "A" }, ...] },',
    '      { "tipo": "escalas", "titulo": "...", "marcas": [{ "c": 0, "f": 32, "k": 273 }] },',
    '      { "tipo": "tabela", "titulo": "...", "colunas": [...], "linhas": [[...]] } }',
    '  ] }',
    'Regras obrigatorias:',
    '- Mantenha os MESMOS conteudos, os MESMOS temas, o MESMO formato e o MESMO nivel de cada questao.',
    '- Mantenha titulo, materia e instrucoes equivalentes aos originais.',
    `- Troque APENAS os numeros dos enunciados (e das alternativas e graficos que tragam numeros).`,
    `- Recalcule a alternativa correta de cada questao ("resposta" de 0 a 3).`,
    `- EXATAMENTE ${TOTAL_QUESTOES_PROVA} questoes, 4 alternativas cada.`,
    `- No maximo ${MAX_CONTEUDOS_PROVA} conteudos.`,
    `- "grafico" so aparece quando a questao original depende de dados visuais: mantenha tipo e estrutura, ajustando os numeros com coerencia.`,
    `- Nivel de dificuldade ${nivel} de 0 a 10: ${descreverDificuldade(nivel)}.`,
  ].join('\n')
}

// Reescreve a prova do PDF com novos numeros, mantendo conteudos e formato.
export async function reescreverProvaDePDF({ pdf, dificuldade = 5 }) {
  const instrucao = montarInstrucaoReescrita({ dificuldade })
  let texto = ''

  if (CHAVE_GEMINI) {
    let ultimoErro = null
    for (const modelo of MODELOS_CANDIDATOS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${CHAVE_GEMINI}`
        const resposta = await buscarComTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: instrucao }] },
            contents: [
              {
                parts: [
                  { text: 'Reescreva esta prova trocando so os valores, no formato JSON pedido.' },
                  { inline_data: { mime_type: 'application/pdf', data: pdf.base64 } },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
          }),
        }, 120000)
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`)
        }
        const corpo = await resposta.json()
        texto = corpo.candidates?.[0]?.content?.parts?.map((parte) => parte.text ?? '').join('') ?? ''
        if (!texto) {
          throw new Error('A IA nao conseguiu ler o PDF. Tente um arquivo mais nitido.')
        }
        break
      } catch (falha) {
        ultimoErro = falha
      }
    }
    if (!texto) {
      throw ultimoErro ?? new Error('A reescrita falhou. Tente de novo.')
    }
  } else {
    const resposta = await buscarComTimeout('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai',
        temperature: 0.7,
        messages: [
          { role: 'system', content: instrucao },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Reescreva esta prova trocando so os valores, no formato JSON pedido.' },
              ...pdf.paginas.map((pagina) => ({
                type: 'image_url',
                image_url: { url: `data:${pagina.mimeType};base64,${pagina.base64}` },
              })),
            ],
          },
        ],
      }),
    }, 120000)
    if (!resposta.ok) {
      throw new Error('A reescrita falhou. Tente de novo.')
    }
    const tipoResposta = resposta.headers.get('content-type') ?? ''
    if (tipoResposta.includes('application/json')) {
      const dados = await resposta.json()
      texto = dados.choices?.[0]?.message?.content ?? dados?.text ?? ''
    } else {
      texto = await resposta.text()
    }
    if (!texto) {
      throw new Error('A IA nao conseguiu ler o PDF. Tente de novo.')
    }
  }

  const dados = extrairJSON(texto)
  return normalizarProva(dados, {
    materia: dados.materia?.trim() || 'Prova reescrita',
    turma: dados.turma?.trim() || '',
  })
}

const INSTRUCAO_EXEMPLO = [
  'Voce recebe a foto de uma prova ou avaliacao usada como EXEMPLO pelo professor.',
  'Extraia os dados e devolva SOMENTE um objeto JSON, sem texto antes nem depois.',
  'O JSON deve ter este formato:',
  '{ "materia": "Matematica", "conteudos": ["adicao", "subtracao"], "observacoes": "nivel facil, questoes contextualizadas" }',
  'Regras:',
  '- "materia" e a disciplina da prova, se visivel; senao, string vazia.',
  `- "conteudos" lista ate ${MAX_CONTEUDOS_PROVA} temas cobrados pela prova, em texto curto.`,
  '- "observacoes" resume estilo, nivel e formato das questoes, em uma frase; se nao der para saber, string vazia.',
  '- Se algum campo nao estiver visivel, use string vazia ou lista vazia; nunca invente.',
].join('\n')

function normalizarExemplo(dados) {
  const conteudos = (Array.isArray(dados.conteudos) ? dados.conteudos : [])
    .map((texto) => String(texto ?? '').trim())
    .filter(Boolean)
    .slice(0, MAX_CONTEUDOS_PROVA)
  return {
    materia: dados.materia?.trim() ?? '',
    conteudos,
    observacoes: dados.observacoes?.trim() ?? '',
  }
}

// Le a foto de uma prova de exemplo e devolve materia, conteudos e observacoes,
// para o professor nao precisar redigitar tudo no chat.
export async function extrairExemploDaImagem({ imagem }) {
  if (CHAVE_GEMINI) {
    let ultimoErro = null
    for (const modelo of MODELOS_CANDIDATOS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${CHAVE_GEMINI}`
        const resposta = await buscarComTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: INSTRUCAO_EXEMPLO }] },
            contents: [
              {
                parts: [
                  { text: 'Leia esta prova de exemplo e extraia os dados no formato pedido.' },
                  { inline_data: { mime_type: imagem.mimeType, data: imagem.base64 } },
                ],
              },
            ],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
          }),
        }, 60000)
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`)
        }
        const corpo = await resposta.json()
        const texto = corpo.candidates?.[0]?.content?.parts?.map((parte) => parte.text ?? '').join('') ?? ''
        if (!texto) {
          throw new Error('A IA nao conseguiu ler a foto. Tente uma imagem mais nitida.')
        }
        return normalizarExemplo(extrairJSON(texto))
      } catch (falha) {
        ultimoErro = falha
      }
    }
    throw ultimoErro ?? new Error('A leitura da foto falhou. Tente de novo.')
  }

  // Reserva gratuita (com visao).
  const corpo = {
    model: 'openai',
    temperature: 0.1,
    messages: [
      { role: 'system', content: INSTRUCAO_EXEMPLO },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Leia esta prova de exemplo e extraia os dados no formato pedido.' },
          { type: 'image_url', image_url: { url: `data:${imagem.mimeType};base64,${imagem.base64}` } },
        ],
      },
    ],
  }
  const resposta = await buscarComTimeout('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  }, 60000)
  if (!resposta.ok) {
    throw new Error('A leitura da foto falhou. Tente de novo.')
  }
  const tipoResposta = resposta.headers.get('content-type') ?? ''
  let texto = ''
  if (tipoResposta.includes('application/json')) {
    const dados = await resposta.json()
    texto = dados.choices?.[0]?.message?.content ?? dados?.text ?? ''
  } else {
    texto = await resposta.text()
  }
  if (!texto) {
    throw new Error('A IA nao conseguiu ler a foto. Tente uma imagem mais nitida.')
  }
  return normalizarExemplo(extrairJSON(texto))
}

const INSTRUCAO_NUMEROS = [
  'Voce recebe UMA questao objetiva de prova em JSON: { "enunciado": "...", "alternativas": ["...", "...", "...", "..."], "resposta": 0, "grafico": {...} ou null }.',
  'Devolva SOMENTE o JSON da questao atualizada, sem texto antes nem depois.',
  'Regras:',
  '- Mantenha o MESMO tema, o MESMO formato e o MESMO nivel da questao original.',
  '- Troque APENAS os valores numericos do enunciado (e das alternativas, se houver numeros).',
  '- Se houver "grafico", mantenha o tipo e a estrutura e ajuste os numeros com coerencia:',
  '  "valores" de barras/linha/pizza/aquecimento, "pontos" (x e y) de ciclo,',
  '  "marcas" de escalas ou celulas de tabela.',
  '- Recalcule a alternativa correta e atualize "resposta" (indice 0 a 3).',
  '- Sempre 4 alternativas, uma unica correta.',
].join('\n')

function normalizarQuestao(dados) {
  const enunciado = dados.enunciado?.trim() ?? ''
  const alternativas = Array.isArray(dados.alternativas)
    ? dados.alternativas.map((texto) => String(texto ?? '').trim())
    : []
  const resposta = paraIndiceResposta(dados.resposta)
  if (!enunciado || alternativas.length !== 4 || alternativas.some((texto) => !texto) || resposta === null) {
    throw new Error('A IA retornou a questao incompleta. Tente de novo.')
  }
  return { enunciado, alternativas, resposta, valor: 1, grafico: normalizarGrafico(dados.grafico) }
}

// Gera uma variacao da questao trocando so os numeros, sem refazer do zero.
export async function trocarNumerosQuestao(questao) {
  const entrada = JSON.stringify({
    enunciado: questao.enunciado,
    alternativas: questao.alternativas,
    resposta: questao.resposta,
    grafico: questao.grafico ?? null,
  })

  if (CHAVE_GEMINI) {
    let ultimoErro = null
    for (const modelo of MODELOS_CANDIDATOS) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${CHAVE_GEMINI}`
        const resposta = await buscarComTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: INSTRUCAO_NUMEROS }] },
            contents: [{ parts: [{ text: `Questao original:\n${entrada}` }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.9 },
          }),
        }, 60000)
        if (!resposta.ok) {
          throw new Error(`HTTP ${resposta.status}`)
        }
        const corpo = await resposta.json()
        const texto = corpo.candidates?.[0]?.content?.parts?.map((parte) => parte.text ?? '').join('') ?? ''
        if (!texto) {
          throw new Error('Resposta vazia da IA.')
        }
        return normalizarQuestao(extrairJSON(texto))
      } catch (falha) {
        ultimoErro = falha
      }
    }
    throw ultimoErro ?? new Error('Nao foi possivel trocar os numeros. Tente de novo.')
  }

  const resposta = await buscarComTimeout('https://text.pollinations.ai/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'openai',
      temperature: 0.9,
      messages: [
        { role: 'system', content: INSTRUCAO_NUMEROS },
        { role: 'user', content: `Questao original:\n${entrada}` },
      ],
    }),
  }, 60000)
  if (!resposta.ok) {
    throw new Error('Nao foi possivel trocar os numeros. Tente de novo.')
  }
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
  return normalizarQuestao(extrairJSON(texto))
}

export const provaService = {
  listar: () => armazenamentoLocal.listarProvas(),
  salvar: (prova) => {
    const registro = {
      ...prova,
      id: prova.id ?? `prova-${Date.now().toString(36)}`,
      criadaEm: prova.criadaEm ?? hojeISO(),
    }
    const proximas = [registro, ...armazenamentoLocal.listarProvas()]
    armazenamentoLocal.salvarProvas(proximas)
    return registro
  },
  remover: (id) => {
    const proximas = armazenamentoLocal.listarProvas().filter((prova) => prova.id !== id)
    armazenamentoLocal.salvarProvas(proximas)
  },
  atualizar: (prova) => {
    const proximas = armazenamentoLocal
      .listarProvas()
      .map((item) => (item.id === prova.id ? prova : item))
    armazenamentoLocal.salvarProvas(proximas)
    return prova
  },
}
