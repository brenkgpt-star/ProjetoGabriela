import estilos from './Cartao.module.css'

export default function Cartao({ titulo, acao, children }) {
  return (
    <section className={estilos.cartao}>
      {(titulo || acao) && (
        <header className={estilos.cabecalho}>
          {titulo && <h2 className={estilos.titulo}>{titulo}</h2>}
          {acao}
        </header>
      )}
      <div className={estilos.corpo}>{children}</div>
    </section>
  )
}
