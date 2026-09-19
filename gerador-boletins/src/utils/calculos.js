import { MEDIA_APROVACAO, MEDIA_RECUPERACAO, FREQUENCIA_MINIMA } from './constantes.js'

function numeroValido(valor) {
  return valor !== null && valor !== undefined && valor !== '' && !Number.isNaN(Number(valor))
}

// Regra do SIGAA/IFC Concordia: a recuperacao paralela (rec1/rec2/rec3)
// substitui a nota do trimestre quando for maior. Vale o maior entre as duas.
export function notaEfetivaTrimestre(tri, rec) {
  const triOk = numeroValido(tri)
  const recOk = numeroValido(rec)
  if (triOk && recOk) return Math.max(Number(tri), Number(rec))
  if (recOk) return Number(rec)
  if (triOk) return Number(tri)
  return null
}

export function notasEfetivas(item = {}) {
  return [
    notaEfetivaTrimestre(item.tri1, item.rec1),
    notaEfetivaTrimestre(item.tri2, item.rec2),
    notaEfetivaTrimestre(item.tri3, item.rec3),
  ]
}

// Diz se a recuperacao paralela substituiu de fato a nota do trimestre
export function recuperacaoSubstituiu(tri, rec) {
  return numeroValido(tri) && numeroValido(rec) && Number(rec) > Number(tri)
}

// A disciplina esta abaixo da media mesmo apos a recuperacao paralela?
export function precisaRecuperacao(item = {}, mediaAprovacao = MEDIA_APROVACAO) {
  const efetivas = notasEfetivas(item).filter((valor) => valor !== null)
  if (!efetivas.length) return false
  return efetivas.some((valor) => valor < mediaAprovacao)
}

export function mediaDisciplina(item = {}) {
  const trimestres = notasEfetivas(item).filter((valor) => valor !== null)
  if (!trimestres.length) return null
  return trimestres.reduce((total, valor) => total + valor, 0) / trimestres.length
}

export function calcularMedia(notas = []) {
  const medias = notas.map(mediaDisciplina).filter((media) => media !== null)
  if (!medias.length) return 0
  return medias.reduce((total, media) => total + media, 0) / medias.length
}

export function totalFaltas(notas = []) {
  return notas.reduce((total, item) => total + item.faltas, 0)
}

export function calcularFrequencia(notas = [], aulasPrevistas = 200) {
  const faltas = totalFaltas(notas)
  const presenca = ((aulasPrevistas - faltas) / aulasPrevistas) * 100
  return Math.max(0, Math.min(100, presenca))
}

export function situacaoPorNota(nota) {
  if (nota >= MEDIA_APROVACAO) return 'aprovado'
  if (nota >= MEDIA_RECUPERACAO) return 'recuperacao'
  return 'reprovado'
}

export function situacaoFinal(notas = [], aulasPrevistas = 200) {
  if (calcularFrequencia(notas, aulasPrevistas) < FREQUENCIA_MINIMA) return 'reprovado'
  return situacaoPorNota(calcularMedia(notas))
}

// Retorna a meta para o 3o trimestre com base nos trimestres ja lancados
// (usa a nota efetiva: maior entre trimestre e recuperacao paralela)
export function calcularNotaNecessariaTri3(item = {}, mediaAprovacao = MEDIA_APROVACAO) {
  const tri1 = notaEfetivaTrimestre(item.tri1, item.rec1)
  const tri2 = notaEfetivaTrimestre(item.tri2, item.rec2)
  const tri3 = notaEfetivaTrimestre(item.tri3, item.rec3)
  const tri1Valido = tri1 !== null
  const tri2Valido = tri2 !== null
  const tri3Valido = tri3 !== null

  // Se o 3o trimestre ja foi lancado, o ciclo anual ja esta concluido
  if (tri3Valido && tri1Valido && tri2Valido) {
    const media = (Number(tri1) + Number(tri2) + Number(tri3)) / 3
    if (media >= mediaAprovacao) {
      return { status: 'concluido-aprovado', texto: 'Aprovado', valor: null, detalhe: 'Media atingida' }
    }
    return { status: 'concluido-recuperacao', texto: 'Em Recuperacao', valor: null, detalhe: 'Abaixo da media' }
  }

  const pontosNecessarios = 3 * mediaAprovacao

  // Se Tri1 e Tri2 estao lancados e falta apenas o Tri3
  if (tri1Valido && tri2Valido) {
    const pontosAtuais = Number(tri1) + Number(tri2)
    const falta = pontosNecessarios - pontosAtuais
    const notaNecessaria = Math.round(falta * 10) / 10

    if (notaNecessaria <= 0) {
      return {
        status: 'garantido',
        texto: 'Ja aprovado (0,0)',
        valor: 0,
        detalhe: 'Ja atingiu os pontos necessarios',
      }
    }
    if (notaNecessaria <= 10) {
      return {
        status: 'precisa',
        texto: `Tirar ${notaNecessaria.toFixed(1).replace('.', ',')}`,
        valor: notaNecessaria,
        detalhe: `Precisa de ${notaNecessaria.toFixed(1).replace('.', ',')} no 3o tri`,
      }
    }
    return {
      status: 'dificil',
      texto: `> 10,0 (${notaNecessaria.toFixed(1).replace('.', ',')})`,
      valor: notaNecessaria,
      detalhe: 'Precisara de exame / recuperacao final',
    }
  }

  // Se apenas o Tri1 foi lancado
  if (tri1Valido) {
    const pontosRestantes = pontosNecessarios - Number(tri1)
    const mediaRestante = Math.round((pontosRestantes / 2) * 10) / 10
    return {
      status: 'em-curso',
      texto: `Media ${mediaRestante.toFixed(1).replace('.', ',')}/tri`,
      valor: mediaRestante,
      detalhe: `Faltam ${pontosRestantes.toFixed(1).replace('.', ',')} pts no total`,
    }
  }

  // Nenhum trimestre lancado ainda
  return {
    status: 'aguardando',
    texto: `Media ${mediaAprovacao.toFixed(1).replace('.', ',')}`,
    valor: mediaAprovacao,
    detalhe: 'Aguardando notas',
  }
}

// Calcula o limite e as faltas restantes permitidas por disciplina (25% de faltas permitidas por lei)
export function calcularFaltasDisciplina(item = {}, cargaHoraria = null) {
  const faltasAtuais = Number(item.faltas) || 0
  // Carga horaria padrao escolar: 80 aulas anuais (2 aulas semanais x 40 semanas)
  const carga = Number(cargaHoraria) || 80
  const limiteFaltas = Math.floor(carga * 0.25)
  const faltasRestantes = limiteFaltas - faltasAtuais

  if (faltasRestantes < 0) {
    return {
      limite: limiteFaltas,
      atuais: faltasAtuais,
      restantes: faltasRestantes,
      status: 'excedido',
      texto: `Excedeu em ${Math.abs(faltasRestantes)}`,
      badge: `${faltasAtuais}/${limiteFaltas} (Estourou)`,
    }
  }

  if (faltasRestantes <= 5) {
    return {
      limite: limiteFaltas,
      atuais: faltasAtuais,
      restantes: faltasRestantes,
      status: 'atencao',
      texto: `Restam ${faltasRestantes} falta(s)`,
      badge: `${faltasAtuais}/${limiteFaltas} (Resta ${faltasRestantes})`,
    }
  }

  return {
    limite: limiteFaltas,
    atuais: faltasAtuais,
    restantes: faltasRestantes,
    status: 'seguro',
    texto: `Pode faltar +${faltasRestantes}`,
    badge: `${faltasAtuais}/${limiteFaltas} (+${faltasRestantes})`,
  }
}
