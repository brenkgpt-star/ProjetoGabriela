export function formatarNota(nota) {
  if (nota === null || nota === undefined || Number.isNaN(nota)) return '--'
  return nota.toFixed(1).replace('.', ',')
}

export function formatarData(iso) {
  if (!iso) return '--'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
}

export function formatarPercentual(valor) {
  return `${Math.round(valor)}%`
}

export function primeiroNome(nomeCompleto = '') {
  return nomeCompleto.split(' ')[0]
}
