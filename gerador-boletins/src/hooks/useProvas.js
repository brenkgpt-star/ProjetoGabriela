import { useCallback, useState } from 'react'
import { provaService } from '@services/provaService'

// Provas ficam salvas no navegador (localStorage), como os boletins importados.
export function useProvas() {
  const [provas, setProvas] = useState(() => provaService.listar())

  const recarregar = useCallback(() => {
    setProvas(provaService.listar())
  }, [])

  const salvarProva = useCallback((prova) => {
    const registro = provaService.salvar(prova)
    setProvas(provaService.listar())
    return registro
  }, [])

  const removerProva = useCallback((id) => {
    provaService.remover(id)
    setProvas(provaService.listar())
  }, [])

  const atualizarProva = useCallback((prova) => {
    const registro = provaService.atualizar(prova)
    setProvas(provaService.listar())
    return registro
  }, [])

  return { provas, recarregar, salvarProva, removerProva, atualizarProva }
}

export function useProva(id) {
  const { provas } = useProvas()
  return provas.find((prova) => prova.id === id) ?? null
}
