import estilos from './CabecalhoPagina.module.css'

export default function CabecalhoPagina({ titulo, descricao, acoes }) {
  return (
    <header className={estilos.cabecalho}>
      <div>
        <h1 className={estilos.titulo}>{titulo}</h1>
        {descricao && <p className={estilos.descricao}>{descricao}</p>}
      </div>
      {acoes && <div className={estilos.acoes}>{acoes}</div>}
    </header>
  )
}
