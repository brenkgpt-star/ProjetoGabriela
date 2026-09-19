import estilos from './Etiqueta.module.css'

export default function Etiqueta({ tom = 'neutro', children }) {
  return <span className={`${estilos.etiqueta} ${estilos[tom]}`}>{children}</span>
}
