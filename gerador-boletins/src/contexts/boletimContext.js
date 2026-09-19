import { createContext } from 'react'

// O contexto fica separado do provider para que o arquivo do provider
// exporte apenas componentes (exigencia do fast refresh do Vite).
export const BoletimContext = createContext(null)
