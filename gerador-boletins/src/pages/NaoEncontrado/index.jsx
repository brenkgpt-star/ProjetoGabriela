import { Link } from 'react-router-dom'
import Botao from '@components/ui/Botao'
import EstadoVazio from '@components/ui/EstadoVazio'
import { CAMINHOS } from '@/routes/caminhos'
import { useTituloPagina } from '@hooks/useTituloPagina'

export default function NaoEncontrado() {
  useTituloPagina('Pagina nao encontrada')

  return (
    <EstadoVazio
      titulo="Essa pagina nao existe"
      descricao="Confira o endereco digitado ou volte para o painel."
      acao={
        <Link to={CAMINHOS.painel}>
          <Botao>Ir para o painel</Botao>
        </Link>
      }
    />
  )
}
