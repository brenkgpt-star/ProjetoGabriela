import { useEffect } from 'react'

export function useTituloPagina(titulo) {
  useEffect(() => {
    document.title = `${titulo} | Boletins`
  }, [titulo])
}
