import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import Campo, { Selecao, AreaTexto, Entrada } from '@components/ui/Campo'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { TRIMESTRES } from '@utils/constantes'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { CAMINHOS } from '@/routes/caminhos'
import estilos from './NovoBoletim.module.css'

function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function NovoBoletim() {
  useTituloPagina('Gerar boletim')
  const navegar = useNavigate()
  const { escola, turmas, alunos, disciplinas, adicionarBoletim } = useBoletimContext()

  const [turmaId, setTurmaId] = useState(() => turmas[0]?.id ?? '')
  const [alunoId, setAlunoId] = useState(() => alunos[0]?.id ?? '')
  const [observacoes, setObservacoes] = useState('')
  const [valores, setValores] = useState({})
  const [erro, setErro] = useState('')

  const alunosDaTurma = turmaId ? alunos.filter((aluno) => aluno.turmaId === turmaId) : alunos

  function atualizarValor(disciplinaId, campo, texto) {
    setValores((atuais) => ({
      ...atuais,
      [disciplinaId]: {
        tri1: null,
        rec1: null,
        tri2: null,
        rec2: null,
        tri3: null,
        rec3: null,
        faltas: 0,
        ...atuais[disciplinaId],
        [campo]: texto === '' ? null : Number(texto),
      },
    }))
  }

  function lerValor(disciplinaId, campo) {
    return valores[disciplinaId]?.[campo] ?? ''
  }

  function montarRegistro(status) {
    return {
      id: `man-${Date.now().toString(36)}`,
      alunoId,
      turmaId,
      anoLetivo: escola.anoLetivo,
      emitidoEm: hojeISO(),
      status,
      observacoes: observacoes.trim(),
      notas: disciplinas.map((disciplina) => ({
        disciplinaId: disciplina.id,
        tri1: valores[disciplina.id]?.tri1 ?? null,
        rec1: valores[disciplina.id]?.rec1 ?? null,
        tri2: valores[disciplina.id]?.tri2 ?? null,
        rec2: valores[disciplina.id]?.rec2 ?? null,
        tri3: valores[disciplina.id]?.tri3 ?? null,
        rec3: valores[disciplina.id]?.rec3 ?? null,
        faltas: valores[disciplina.id]?.faltas ?? 0,
      })),
    }
  }

  function aoSalvar(status) {
    if (!turmaId) {
      setErro('Escolha a turma. Se ainda nao ha turmas, comece pela pagina de Turmas.')
      return
    }
    if (!alunoId) {
      setErro('Escolha o aluno do boletim.')
      return
    }
    const temNota = disciplinas.some((disciplina) => {
      const linha = valores[disciplina.id]
      return (
        linha &&
        (linha.tri1 !== null ||
          linha.rec1 !== null ||
          linha.tri2 !== null ||
          linha.rec2 !== null ||
          linha.tri3 !== null ||
          linha.rec3 !== null)
      )
    })
    if (!temNota) {
      setErro('Lance ao menos uma nota antes de salvar.')
      return
    }
    const registro = montarRegistro(status)
    adicionarBoletim(registro)
    navegar(status === 'emitido' ? CAMINHOS.boletim(registro.id) : CAMINHOS.boletins)
  }

  if (!turmas.length || !alunos.length || !disciplinas.length) {
    return (
      <>
        <CabecalhoPagina
          titulo="Gerar boletim"
          descricao="Selecione o aluno, confira as notas e emita o documento."
          acoes={
            <Link to={CAMINHOS.boletins}>
              <Botao variante="secundario">Voltar</Botao>
            </Link>
          }
        />
        <Cartao>
          <EstadoVazio
            titulo="Falta cadastrar o basico"
            descricao="Para gerar boletins voce precisa de ao menos uma turma, um aluno e uma disciplina."
            acao={
              <Link to={CAMINHOS.comecar}>
                <Botao>Comecar agora</Botao>
              </Link>
            }
          />
        </Cartao>
      </>
    )
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Gerar boletim"
        descricao="Selecione o aluno, confira as notas e emita o documento."
        acoes={
          <Link to={CAMINHOS.boletins}>
            <Botao variante="secundario">Voltar</Botao>
          </Link>
        }
      />

      <div className={estilos.grade}>
        <Cartao titulo="Identificacao">
          <div className={estilos.campos}>
            <Campo etiqueta="Turma" htmlFor="turma">
              <Selecao
                id="turma"
                value={turmaId}
                onChange={(evento) => {
                  setTurmaId(evento.target.value)
                  setAlunoId('')
                }}
              >
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </Selecao>
            </Campo>

            <Campo etiqueta="Aluno" htmlFor="aluno">
              <Selecao
                id="aluno"
                value={alunoId}
                onChange={(evento) => setAlunoId(evento.target.value)}
              >
                <option value="">Escolha o aluno...</option>
                {alunosDaTurma.map((aluno) => (
                  <option key={aluno.id} value={aluno.id}>
                    {aluno.nome}
                  </option>
                ))}
              </Selecao>
            </Campo>

            <Campo etiqueta="Observacoes" htmlFor="observacoes" dica="Sai impresso no rodape do boletim.">
              <AreaTexto
                id="observacoes"
                value={observacoes}
                onChange={(evento) => setObservacoes(evento.target.value)}
                placeholder="Registre encaminhamentos do conselho de classe."
              />
            </Campo>
          </div>
        </Cartao>

        <Cartao titulo="Notas e faltas">
          <p style={{ fontSize: 'var(--texto-sm)', color: 'var(--cor-tinta-media)', marginTop: 0 }}>
            Padrao SIGAA/IFC Concordia: a recuperacao paralela (Rec) substitui a nota do
            trimestre quando for maior. Media para aprovacao: 6,0.
          </p>
          <table className={estilos.lancamento}>
            <thead>
              <tr>
                <th>Disciplina</th>
                {TRIMESTRES.flatMap((trimestre) => [
                  <th key={trimestre.campoNota} className={estilos.colunaNumero}>
                    {trimestre.curto}
                  </th>,
                  <th key={trimestre.campoRec} className={`${estilos.colunaNumero} ${estilos.colunaRec}`}>
                    Rec {trimestre.valor}
                  </th>,
                ])}
                <th className={estilos.colunaNumero}>Faltas</th>
              </tr>
            </thead>
            <tbody>
              {disciplinas.map((disciplina) => (
                <tr key={disciplina.id}>
                  <td>{disciplina.nome}</td>
                  {['tri1', 'rec1', 'tri2', 'rec2', 'tri3', 'rec3'].map((campo) => (
                    <td key={campo} className={estilos.colunaNumero}>
                      <Entrada
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        placeholder="0,0"
                        value={lerValor(disciplina.id, campo)}
                        onChange={(evento) =>
                          atualizarValor(disciplina.id, campo, evento.target.value)
                        }
                      />
                    </td>
                  ))}
                  <td className={estilos.colunaNumero}>
                    <Entrada
                      type="number"
                      min="0"
                      placeholder="0"
                      value={lerValor(disciplina.id, 'faltas')}
                      onChange={(evento) =>
                        atualizarValor(
                          disciplina.id,
                          'faltas',
                          evento.target.value === '' ? '0' : evento.target.value,
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {erro && <p style={{ color: 'var(--cor-reprovado)', fontSize: 'var(--texto-sm)' }}>{erro}</p>}

          <div className={estilos.acoes}>
            <Botao variante="secundario" onClick={() => aoSalvar('rascunho')}>
              Salvar rascunho
            </Botao>
            <Botao onClick={() => aoSalvar('emitido')}>Emitir boletim</Botao>
          </div>
        </Cartao>
      </div>
    </>
  )
}
