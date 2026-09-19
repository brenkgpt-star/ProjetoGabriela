import { Link } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Tabela from '@components/ui/Tabela'
import Etiqueta from '@components/ui/Etiqueta'
import Botao from '@components/ui/Botao'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useBoletins } from '@hooks/useBoletins'
import { useTurmas } from '@hooks/useTurmas'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { CAMINHOS } from '@/routes/caminhos'
import { formatarNota } from '@utils/formatadores'
import { SITUACOES, STATUS_BOLETIM } from '@utils/constantes'
import estilos from './Painel.module.css'

export default function Painel() {
  useTituloPagina('Painel')
  const { escola, configurado } = useBoletimContext()
  const boletins = useBoletins()
  const turmas = useTurmas()

  const rascunhos = boletins.filter((boletim) => boletim.status === 'rascunho')
  const emRecuperacao = boletins.filter((boletim) => boletim.situacao !== 'aprovado')

  const colunas = [
    { chave: 'aluno', titulo: 'Aluno', renderizar: (linha) => linha.aluno?.nome },
    { chave: 'turma', titulo: 'Turma', renderizar: (linha) => linha.turma?.nome },
    { chave: 'media', titulo: 'Media', alinhamento: 'right', renderizar: (linha) => formatarNota(linha.media) },
    {
      chave: 'situacao',
      titulo: 'Situacao',
      renderizar: (linha) => <Etiqueta tom={linha.situacao}>{SITUACOES[linha.situacao].rotulo}</Etiqueta>,
    },
    {
      chave: 'status',
      titulo: 'Documento',
      renderizar: (linha) => <Etiqueta tom={STATUS_BOLETIM[linha.status].tom}>{STATUS_BOLETIM[linha.status].rotulo}</Etiqueta>,
    },
  ]

  return (
    <>
      <CabecalhoPagina
        titulo="Painel do ano letivo"
        descricao="Acompanhe o que ja foi emitido e o que ainda falta fechar."
        acoes={
          <Link to={CAMINHOS.novoBoletim}>
            <Botao>Gerar boletim</Botao>
          </Link>
        }
      />

      {!configurado && !escola.nome && (
        <>
          <Cartao
            titulo="Bem-vindo! Por onde comecar?"
            acao={
              <>
                <Link to={CAMINHOS.lerBoletim}>
                  <Botao>Ler boletim</Botao>
                </Link>{' '}
                <Link to={CAMINHOS.comecar}>Cadastrar escola</Link>
              </>
            }
          >
            <p style={{ margin: 0, fontSize: 'var(--texto-sm)' }}>
              Escaneie a foto de um boletim para comecar na hora, sem cadastro e sem chave.
              Depois cadastre escola, turmas e alunos para gerar novos boletins.
            </p>
          </Cartao>

          <div style={{ height: 'var(--esp-4)' }} />
        </>
      )}

      <div className={estilos.indicadores}>
        <div className={estilos.indicador}>
          <span className={estilos.rotulo}>Boletins gerados</span>
          <strong className={estilos.numero}>{boletins.length}</strong>
        </div>
        <div className={estilos.indicador}>
          <span className={estilos.rotulo}>Ainda em rascunho</span>
          <strong className={estilos.numero}>{rascunhos.length}</strong>
        </div>
        <div className={estilos.indicador}>
          <span className={estilos.rotulo}>Abaixo da media</span>
          <strong className={estilos.numero}>{emRecuperacao.length}</strong>
        </div>
        <div className={estilos.indicador}>
          <span className={estilos.rotulo}>Turmas ativas</span>
          <strong className={estilos.numero}>{turmas.length}</strong>
        </div>
      </div>

      <Cartao titulo="Ultimos lancamentos" acao={<Link to={CAMINHOS.boletins}>Ver todos</Link>}>
        {boletins.length ? (
          <Tabela colunas={colunas} dados={boletins} />
        ) : (
          <EstadoVazio
            titulo="Nenhum lancamento no ano"
            descricao="Quando os boletins forem gerados, eles aparecem aqui."
          />
        )}
      </Cartao>
    </>
  )
}
