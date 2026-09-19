import estilos from './Botao.module.css'

export default function Botao({ variante = 'primario', tamanho = 'medio', tipo = 'button', children, ...resto }) {
  const classes = [estilos.botao, estilos[variante], estilos[tamanho]].join(' ')
  return (
    <button type={tipo} className={classes} {...resto}>
      {children}
    </button>
  )
}
