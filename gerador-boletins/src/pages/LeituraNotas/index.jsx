import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import Campo, { Entrada, AreaTexto } from '@components/ui/Campo'
import FolhaBoletim from '@components/boletim/FolhaBoletim'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { extrairBoletimDaImagem, prepararImagem } from '@services/leituraService'
import { calcularNotaNecessariaTri3, calcularFaltasDisciplina } from '@utils/calculos'
import { TRIMESTRES } from '@utils/constantes'
import { CAMINHOS } from '@/routes/caminhos'
import estilos from './LeituraNotas.module.css'

function gerarSlug(nome, indice) {
  const base = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base || `disc-${indice}`
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function LeituraNotas() {
  useTituloPagina('Ler boletim')
  const navegar = useNavigate()
  const { escola, adicionarBoletim } = useBoletimContext()

  const [imagem, setImagem] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [rascunho, setRascunho] = useState(null)

  async function aoEscolherArquivo(evento) {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    setErro('')
    try {
      setImagem(await prepararImagem(arquivo))
      setRascunho(null)
    } catch (falha) {
      setErro(falha.message)
      setImagem(null)
    }
  }

  function aoTrocarFoto() {
    setImagem(null)
    setRascunho(null)
    setErro('')
  }

  async function aoExtrair() {
    if (!imagem) {
      setErro('Envie primeiro a foto do boletim.')
      return
    }
    setCarregando(true)
    setErro('')
    try {
      setRascunho(await extrairBoletimDaImagem({ imagem }))
    } catch (falha) {
      console.error('Falha na leitura do boletim:', falha)
      setErro(
        falha instanceof TypeError
          ? 'Nao foi possivel alcancar a IA. Confira a conexao com a internet.'
          : falha.message,
      )
    } finally {
      setCarregando(false)
    }
  }

  function atualizarRascunho(campo, valor) {
    setRascunho((atual) => ({ ...atual, [campo]: valor }))
  }

  function atualizarAluno(campo, valor) {
    setRascunho((atual) => ({ ...atual, aluno: { ...atual.aluno, [campo]: valor } }))
  }

  function atualizarNota(indice, campo, valor) {
    setRascunho((atual) => ({
      ...atual,
      notas: atual.notas.map((linha, i) => (i === indice ? { ...linha, [campo]: valor } : linha)),
    }))
  }

  function removerNota(indice) {
    setRascunho((atual) => ({ ...atual, notas: atual.notas.filter((_, i) => i !== indice) }))
  }

  const previa = useMemo(() => {
    if (!rascunho) return null
    return {
      alunoId: null,
      turmaId: null,
      aluno: { ...rascunho.aluno, responsavel: '' },
      turma: { ...rascunho.turma },
      anoLetivo: rascunho.anoLetivo,
      emitidoEm: hojeISO(),
      status: 'rascunho',
      observacoes: rascunho.observacoes,
      notas: rascunho.notas.map((linha, indice) => ({
        disciplinaId: gerarSlug(linha.disciplina, indice),
        disciplinaNome: linha.disciplina,
        professor: '',
        tri1: linha.tri1,
        rec1: linha.rec1 ?? null,
        tri2: linha.tri2,
        rec2: linha.rec2 ?? null,
        tri3: linha.tri3,
        rec3: linha.rec3 ?? null,
        faltas: linha.faltas ?? 0,
      })),
    }
  }, [rascunho])

  function aoCriarBoletim() {
    if (!previa) return
    if (!previa.aluno.nome.trim()) {
      setErro('Informe o nome do aluno antes de criar o boletim.')
      return
    }
    if (!previa.notas.length) {
      setErro('O boletim precisa de ao menos uma disciplina.')
      return
    }
    const registro = { ...previa, id: `imp-${Date.now()}` }
    adicionarBoletim(registro)
    navegar(CAMINHOS.boletim(registro.id))
  }

  function aoDigitarTrimestre(indice, campo, texto) {
    atualizarNota(indice, campo, texto === '' ? null : Number(texto))
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Ler boletim"
        descricao="Envie a foto de um boletim emitido em outro sistema (como o SIGAA do IFC Concordia) e a IA monta o documento anual por trimestres, com recuperacoes paralelas."
      />

      <div className={estilos.grade}>
        <Cartao titulo="1. Foto do boletim">
          <div className={estilos.campos}>
            <Campo etiqueta="Imagem" htmlFor="foto" dica="JPG, PNG ou WEBP, com o boletim legivel.">
              <Entrada
                id="foto"
                key={imagem ? 'com-foto' : 'sem-foto'}
                type="file"
                accept="image/*"
                onChange={aoEscolherArquivo}
              />
            </Campo>
            {imagem && (
              <>
                <img className={estilos.previa} src={imagem.previa} alt="Foto do boletim enviado" />
                <Botao variante="secundario" onClick={aoTrocarFoto}>
                  Trocar foto
                </Botao>
              </>
            )}
          </div>
        </Cartao>

        <Cartao titulo="2. Leitura com IA">
          <div className={estilos.campos}>
            <p className={estilos.ajuda}>
              Gratis e sem cadastro: a IA le a foto e monta o rascunho do boletim.
            </p>
            <div>
              <Botao onClick={aoExtrair} disabled={carregando || !imagem}>
                {carregando ? 'Lendo a foto...' : 'Extrair dados com IA'}
              </Botao>
            </div>
            {erro && !rascunho && <p className={estilos.erro}>{erro}</p>}
          </div>
        </Cartao>
      </div>

      {rascunho && previa && (
        <>
          <div style={{ height: 'var(--esp-4)' }} />

          <div className={estilos.grade}>
            <Cartao titulo="3. Confira os dados">
              <div className={estilos.campos}>
                <Campo etiqueta="Aluno" htmlFor="aluno-nome">
                  <Entrada
                    id="aluno-nome"
                    value={rascunho.aluno.nome}
                    onChange={(evento) => atualizarAluno('nome', evento.target.value)}
                  />
                </Campo>
                <Campo etiqueta="Matricula" htmlFor="aluno-matricula">
                  <Entrada
                    id="aluno-matricula"
                    value={rascunho.aluno.matricula}
                    onChange={(evento) => atualizarAluno('matricula', evento.target.value)}
                  />
                </Campo>
                <Campo etiqueta="Turma" htmlFor="turma-nome">
                  <Entrada
                    id="turma-nome"
                    value={rascunho.turma.nome}
                    onChange={(evento) =>
                      setRascunho((atual) => ({ ...atual, turma: { nome: evento.target.value } }))
                    }
                  />
                </Campo>
                <Campo etiqueta="Ano letivo" htmlFor="ano">
                  <Entrada
                    id="ano"
                    type="number"
                    value={rascunho.anoLetivo}
                    onChange={(evento) => atualizarRascunho('anoLetivo', Number(evento.target.value))}
                  />
                </Campo>
                <Campo etiqueta="Observacoes" htmlFor="observacoes">
                  <AreaTexto
                    id="observacoes"
                    value={rascunho.observacoes}
                    onChange={(evento) => atualizarRascunho('observacoes', evento.target.value)}
                  />
                </Campo>
              </div>
            </Cartao>

            <Cartao titulo="Notas lidas da foto">
              <p className={estilos.ajuda} style={{ marginTop: 0 }}>
                Confira tambem as recuperacoes paralelas (Rec): no SIGAA/IFC elas valem o maior
                valor entre o trimestre e a recuperacao.
              </p>
              <div className={estilos.envoltorioLancamento}>
                <table className={estilos.lancamento}>
                  <thead>
                    <tr>
                      <th className={estilos.colunaDisciplina}>Disciplina</th>
                      {TRIMESTRES.flatMap((trimestre) => [
                        <th key={trimestre.campoNota} className={estilos.colunaNumero}>
                          {trimestre.curto}
                        </th>,
                        <th key={trimestre.campoRec} className={estilos.colunaNumero}>
                          Rec {trimestre.valor}
                        </th>,
                      ])}
                      <th className={estilos.colunaNumero}>Faltas</th>
                      <th className={estilos.colunaDica}>Meta 3o Tri</th>
                      <th className={estilos.colunaDica}>Saldo Faltas</th>
                      <th className={estilos.colunaAcao} />
                    </tr>
                  </thead>
                  <tbody>
                    {previa.notas.map((linha, indice) => {
                      const meta = calcularNotaNecessariaTri3(linha)
                      const faltasInfo = calcularFaltasDisciplina(linha)

                      return (
                        <tr key={linha.disciplinaId}>
                          <td className={estilos.colunaDisciplina}>{linha.disciplinaNome}</td>
                          {['tri1', 'rec1', 'tri2', 'rec2', 'tri3', 'rec3'].map((campo) => (
                            <td key={campo} className={estilos.colunaNumero}>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                placeholder="--"
                                value={rascunho.notas[indice][campo] ?? ''}
                                onChange={(evento) => aoDigitarTrimestre(indice, campo, evento.target.value)}
                                className={estilos.inputNota}
                              />
                            </td>
                          ))}
                          <td className={estilos.colunaNumero}>
                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={rascunho.notas[indice].faltas ?? ''}
                              onChange={(evento) =>
                                atualizarNota(
                                  indice,
                                  'faltas',
                                  evento.target.value === '' ? 0 : Number(evento.target.value),
                                )
                              }
                              className={estilos.inputFalta}
                            />
                          </td>
                          <td className={estilos.colunaDica}>
                            <span
                              className={`${estilos.tagMeta} ${estilos['meta_' + meta.status]}`}
                              title={meta.detalhe}
                            >
                              {meta.texto}
                            </span>
                          </td>
                          <td className={estilos.colunaDica}>
                            <span
                              className={`${estilos.tagFalta} ${estilos['falta_' + faltasInfo.status]}`}
                              title={`Limite: ${faltasInfo.limite} faltas. ${faltasInfo.texto}`}
                            >
                              {faltasInfo.status === 'excedido'
                                ? `-${Math.abs(faltasInfo.restantes)}`
                                : `+${faltasInfo.restantes}`}
                            </span>
                          </td>
                          <td className={estilos.colunaAcao}>
                            <Botao variante="secundario" onClick={() => removerNota(indice)}>
                              Tirar
                            </Botao>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Cartao>
          </div>

          <div style={{ height: 'var(--esp-4)' }} />

          <Cartao titulo="Previa do documento">
            <FolhaBoletim boletim={previa} escola={escola} />
            <div className={`${estilos.acoes} nao-imprimir`}>
              <Botao variante="secundario" onClick={() => setRascunho(null)}>
                Descartar
              </Botao>
              <Botao onClick={aoCriarBoletim}>Criar boletim</Botao>
            </div>
          </Cartao>

          {erro && <p className={estilos.erro}>{erro}</p>}
        </>
      )}
    </>
  )
}
