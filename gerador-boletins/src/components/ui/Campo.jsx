import estilos from './Campo.module.css'

export default function Campo({ etiqueta, dica, htmlFor, children }) {
  return (
    <div className={estilos.campo}>
      <label className={estilos.etiqueta} htmlFor={htmlFor}>
        {etiqueta}
      </label>
      {children}
      {dica && <small className={estilos.dica}>{dica}</small>}
    </div>
  )
}

export function Entrada(props) {
  return <input className={estilos.controle} {...props} />
}

export function Selecao({ children, ...resto }) {
  return (
    <select className={estilos.controle} {...resto}>
      {children}
    </select>
  )
}

export function AreaTexto(props) {
  return <textarea className={`${estilos.controle} ${estilos.area}`} rows={4} {...props} />
}
