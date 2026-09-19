// Camada fina de acesso HTTP. Hoje o app roda com dados locais,
// mas os services ja chamam por aqui para a troca ser de um arquivo so.
const BASE_URL = import.meta.env.VITE_API_URL ?? ''

async function requisitar(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opcoes,
  })

  if (!resposta.ok) {
    throw new Error(`Falha na requisicao ${caminho}: ${resposta.status}`)
  }

  return resposta.json()
}

export const api = {
  get: (caminho) => requisitar(caminho),
  post: (caminho, corpo) => requisitar(caminho, { method: 'POST', body: JSON.stringify(corpo) }),
  put: (caminho, corpo) => requisitar(caminho, { method: 'PUT', body: JSON.stringify(corpo) }),
  delete: (caminho) => requisitar(caminho, { method: 'DELETE' }),
}
