import { Link, useNavigate } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Tabela from '@components/ui/Tabela'
import Etiqueta from '@components/ui/Etiqueta'
import Botao from '@components/ui/Botao'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useBoletins } from '@hooks/useBoletins'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { CAMINHOS } from '@/routes/caminhos'
import { formatarNota, formatarData } from '@utils/formatadores'
import { SITUACOES, STATUS_BOLETIM } from '@utils/constantes'

export default function Boletins() {
  useTituloPagina('Boletins')
  const navegar = useNavigate()
  const boletins = useBoletins()

  const colunas = [
    { chave: 'aluno', titulo: 'Aluno', renderizar: (linha) => linha.aluno?.nome },
    { chave: 'turma', titulo: 'Turma', renderizar: (linha) => linha.turma?.nome },
    { chave: 'ano', titulo: 'Ano', renderizar: (linha) => linha.anoLetivo },
    { chave: 'media', titulo: 'Media', alinhamento: 'right', renderizar: (linha) => formatarNota(linha.media) },
    {
      chave: 'situacao',
      titulo: 'Situacao',
      renderizar: (linha) => <Etiqueta tom={linha.situacao}>{SITUACOES[linha.situacao].rotulo}</Etiqueta>,
    },
    { chave: 'emitidoEm', titulo: 'Emissao', renderizar: (linha) => formatarData(linha.emitidoEm) },
    {
      chave: 'status',
      titulo: 'Documento',
      renderizar: (linha) => <Etiqueta tom={STATUS_BOLETIM[linha.status].tom}>{STATUS_BOLETIM[linha.status].rotulo}</Etiqueta>,
    },
  ]

  return (
    <>
      <CabecalhoPagina
        titulo="Boletins"
        descricao="Todos os documentos gerados, por aluno e ano letivo."
        acoes={
          <Link to={CAMINHOS.novoBoletim}>
            <Botao>Gerar boletim</Botao>
          </Link>
        }
      />

      <Cartao>
        {boletins.length ? (
          <Tabela
            colunas={colunas}
            dados={boletins}
            aoClicarLinha={(linha) => navegar(CAMINHOS.boletim(linha.id))}
          />
        ) : (
          <EstadoVazio
            titulo="Nenhum boletim gerado"
            descricao="Escolha uma turma e um periodo para montar o primeiro documento."
            acao={
              <Link to={CAMINHOS.novoBoletim}>
                <Botao>Gerar boletim</Botao>
              </Link>
            }
          />
        )}
      </Cartao>
    </>
  )
}
