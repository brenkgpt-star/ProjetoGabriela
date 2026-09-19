export const MEDIA_APROVACAO = 6
export const MEDIA_RECUPERACAO = 5
export const FREQUENCIA_MINIMA = 75

export const TRIMESTRES = [
  { valor: 1, rotulo: '1o trimestre', curto: '1o tri', campoNota: 'tri1', campoRec: 'rec1' },
  { valor: 2, rotulo: '2o trimestre', curto: '2o tri', campoNota: 'tri2', campoRec: 'rec2' },
  { valor: 3, rotulo: '3o trimestre', curto: '3o tri', campoNota: 'tri3', campoRec: 'rec3' },
]

// Recuperacao paralela estilo SIGAA/IFC Concordia: uma por trimestre.
// A nota da recuperacao substitui a do trimestre quando for maior.
export const RECUPERACOES_PARALELAS = [
  { valor: 1, rotulo: 'Recuperacao 1o tri', curto: 'Rec 1', campoNota: 'tri1', campoRec: 'rec1' },
  { valor: 2, rotulo: 'Recuperacao 2o tri', curto: 'Rec 2', campoNota: 'tri2', campoRec: 'rec2' },
  { valor: 3, rotulo: 'Recuperacao 3o tri', curto: 'Rec 3', campoNota: 'tri3', campoRec: 'rec3' },
]

export const SITUACOES = {
  aprovado: { rotulo: 'Aprovado', tom: 'aprovado' },
  recuperacao: { rotulo: 'Recuperacao', tom: 'recuperacao' },
  reprovado: { rotulo: 'Reprovado', tom: 'reprovado' },
}

export const STATUS_BOLETIM = {
  rascunho: { rotulo: 'Rascunho', tom: 'neutro' },
  emitido: { rotulo: 'Emitido', tom: 'aprovado' },
}
