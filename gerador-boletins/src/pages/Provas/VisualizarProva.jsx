import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import EstadoVazio from '@components/ui/EstadoVazio'
import FolhaProva from '@components/prova/FolhaProva'
import { useProvas } from '@hooks/useProvas'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { trocarNumerosQuestao } from '@services/provaService'
import { CAMINHOS } from '@/routes/caminhos'

// O gabarito nunca e impresso junto com a prova: cada botao de impressao
// marca o body e o print.css mostra so o bloco correspondente.
function imprimir(modo) {
  const classe = modo === 'gabarito' ? 'imp-somente-gabarito' : 'imp-somente-prova'
  document.body.classList.add(classe)
  const limpar = () => document.body.classList.remove(classe)
  window.addEventListener('afterprint', limpar, { once: true })
  setTimeout(limpar, 1500)
  window.print()
}

export default function VisualizarProva() {
  const { id } = useParams()
  const { provas, atualizarProva } = useProvas()
  const prova = provas.find((item) => item.id === id) ?? null
  const { escola } = useBoletimContext()
  const [mostrarGabarito, setMostrarGabarito] = useState(false)
  const [ajustando, setAjustando] = useState(false)
  const [trocandoIndice, setTrocandoIndice] = useState(null)
  const [erroAjuste, setErroAjuste] = useState('')
  useTituloPagina(prova ? prova.titulo : 'Prova')

  useEffect(() => () => {
    document.body.classList.remove('imp-somente-prova', 'imp-somente-gabarito')
  }, [])

  if (!prova) {
    return (
      <EstadoVazio
        titulo="Prova nao encontrada"
        descricao="Ela pode ter sido excluida ou o endereco esta incorreto."
        acao={
          <Link to={CAMINHOS.provas}>
            <Botao variante="secundario">Ver provas</Botao>
          </Link>
        }
      />
    )
  }

  function moverQuestao(indice, destino) {
    if (destino < 0 || destino >= prova.questoes.length) return
    const questoes = [...prova.questoes]
    const [questao] = questoes.splice(indice, 1)
    questoes.splice(destino, 0, questao)
    atualizarProva({ ...prova, questoes })
    setErroAjuste('')
  }

  async function aoTrocarNumeros(indice) {
    setTrocandoIndice(indice)
    setErroAjuste('')
    try {
      const nova = await trocarNumerosQuestao(prova.questoes[indice])
      const questoes = prova.questoes.map((questao, i) => (i === indice ? nova : questao))
      atualizarProva({ ...prova, questoes })
    } catch (falha) {
      setErroAjuste(falha.message)
    } finally {
      setTrocandoIndice(null)
    }
  }

  return (
    <>
      <div className="nao-imprimir">
        <CabecalhoPagina
          titulo={prova.titulo}
          descricao={`${prova.materia}${prova.turma ? ` - ${prova.turma}` : ''} - ${prova.questoes.length} questoes`}
          acoes={
            <>
              <Link to={CAMINHOS.provas}>
                <Botao variante="secundario">Voltar</Botao>
              </Link>
              <Botao variante="secundario" onClick={() => imprimir('prova')}>
                Imprimir prova
              </Botao>
              <details style={{ display: 'inline-block', position: 'relative' }}>
                <summary
                  style={{
                    cursor: 'pointer',
                    fontSize: 'var(--texto-sm)',
                    fontWeight: 600,
                    padding: '8px 12px',
                    border: 'var(--borda)',
                    borderRadius: 8,
                    background: '#fff',
                    listStyle: 'none',
                  }}
                >
                  Mais opcoes
                </summary>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <Botao variante="secundario" onClick={() => setMostrarGabarito((visivel) => !visivel)}>
                    {mostrarGabarito ? 'Ocultar gabarito' : 'Ver gabarito'}
                  </Botao>
                  {mostrarGabarito && (
                    <Botao onClick={() => imprimir('gabarito')}>Imprimir gabarito</Botao>
                  )}
                  <Botao variante="secundario" onClick={() => setAjustando((ativo) => !ativo)}>
                    {ajustando ? 'Concluir ajustes' : 'Ajustar questoes'}
                  </Botao>
                </div>
              </details>
            </>
          }
        />
      </div>

      {ajustando && (
        <div className="nao-imprimir" style={{ marginBottom: 'var(--esp-4)' }}>
          <Cartao titulo="Ajustar questoes">
            <p style={{ marginTop: 0, fontSize: 'var(--texto-sm)', color: 'var(--cor-tinta-media)' }}>
              Troque questoes de lugar com as setas ou gere novos numeros para uma questao
              sem refazer a prova do zero.
            </p>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {prova.questoes.map((questao, indice) => (
                <li key={`${indice}-${questao.enunciado.slice(0, 12)}`} style={{ fontSize: 'var(--texto-sm)' }}>
                  <span>
                    <strong>{indice + 1}.</strong>{' '}
                    {questao.enunciado.length > 80 ? `${questao.enunciado.slice(0, 80)}…` : questao.enunciado}
                  </span>{' '}
                  <span style={{ display: 'inline-flex', gap: 4, marginLeft: 8 }}>
                    <Botao variante="secundario" onClick={() => moverQuestao(indice, indice - 1)} disabled={indice === 0}>
                      ↑
                    </Botao>
                    <Botao
                      variante="secundario"
                      onClick={() => moverQuestao(indice, indice + 1)}
                      disabled={indice === prova.questoes.length - 1}
                    >
                      ↓
                    </Botao>
                    <Botao
                      variante="secundario"
                      onClick={() => aoTrocarNumeros(indice)}
                      disabled={trocandoIndice !== null}
                    >
                      {trocandoIndice === indice ? 'Trocando...' : 'Trocar numeros'}
                    </Botao>
                  </span>
                </li>
              ))}
            </ol>
            {erroAjuste && (
              <p style={{ color: 'var(--cor-reprovado)', fontSize: 'var(--texto-sm)' }}>{erroAjuste}</p>
            )}
          </Cartao>
        </div>
      )}

      <FolhaProva prova={prova} escola={escola} mostrarGabarito={mostrarGabarito} />
    </>
  )
}
