import { Link, useParams } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Botao from '@components/ui/Botao'
import EstadoVazio from '@components/ui/EstadoVazio'
import FolhaBoletim from '@components/boletim/FolhaBoletim'
import { useBoletim } from '@hooks/useBoletins'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { CAMINHOS } from '@/routes/caminhos'

export default function VisualizarBoletim() {
  const { id } = useParams()
  const boletim = useBoletim(id)
  const { escola } = useBoletimContext()
  useTituloPagina(boletim ? boletim.aluno.nome : 'Boletim')

  if (!boletim) {
    return (
      <EstadoVazio
        titulo="Boletim nao encontrado"
        descricao="O documento pode ter sido removido ou o endereco esta incorreto."
        acao={
          <Link to={CAMINHOS.boletins}>
            <Botao variante="secundario">Ver lista de boletins</Botao>
          </Link>
        }
      />
    )
  }

  return (
    <>
      <div className="nao-imprimir">
        <CabecalhoPagina
          titulo={boletim.aluno.nome}
          descricao={`${boletim.turma.nome} - Ano letivo de ${boletim.anoLetivo}`}
          acoes={
            <>
              <Link to={CAMINHOS.boletins}>
                <Botao variante="secundario">Voltar</Botao>
              </Link>
              <Botao onClick={() => window.print()}>Imprimir</Botao>
            </>
          }
        />
      </div>

      <FolhaBoletim boletim={boletim} escola={escola} />
    </>
  )
}
