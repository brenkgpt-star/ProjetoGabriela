import { useContext } from 'react'
import { BoletimContext } from '@contexts/boletimContext'

export function useBoletimContext() {
  const contexto = useContext(BoletimContext)
  if (!contexto) {
    throw new Error('useBoletimContext precisa estar dentro de <BoletimProvider>.')
  }
  return contexto
}
