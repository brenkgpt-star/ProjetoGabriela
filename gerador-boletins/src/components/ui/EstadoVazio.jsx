import estilos from './EstadoVazio.module.css'

export default function EstadoVazio({ titulo, descricao, acao }) {
  return (
    <div className={estilos.vazio}>
      <h3 className={estilos.titulo}>{titulo}</h3>
      <p className={estilos.descricao}>{descricao}</p>
      {acao}
    </div>
  )
}
