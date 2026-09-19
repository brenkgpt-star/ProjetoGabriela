import { useState } from 'react'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Tabela from '@components/ui/Tabela'
import Botao from '@components/ui/Botao'
import Campo, { Entrada, Selecao } from '@components/ui/Campo'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { useTurmas } from '@hooks/useTurmas'

const TURMA_INICIAL = { nome: '', turno: 'Matutino', sala: '', regente: '' }
const DISCIPLINA_INICIAL = { nome: '', professor: '', cargaHoraria: '' }

const TURNOS = ['Matutino', 'Vespertino', 'Noturno', 'Integral']

export default function Turmas() {
  useTituloPagina('Turmas')
  const {
    disciplinas,
    adicionarTurma,
    removerTurma,
    adicionarDisciplina,
    removerDisciplina,
  } = useBoletimContext()
  const turmas = useTurmas()
  const [formTurma, setFormTurma] = useState(TURMA_INICIAL)
  const [formDisciplina, setFormDisciplina] = useState(DISCIPLINA_INICIAL)
  const [erro, setErro] = useState('')

  function aoAdicionarTurma() {
    if (!formTurma.nome.trim()) {
      setErro('Informe o nome da turma.')
      return
    }
    adicionarTurma({
      nome: formTurma.nome.trim(),
      turno: formTurma.turno,
      sala: formTurma.sala.trim(),
      regente: formTurma.regente.trim(),
      totalAlunos: 0,
    })
    setFormTurma(TURMA_INICIAL)
    setErro('')
  }

  function aoRemoverTurma(turma) {
    const total = turma.alunos?.length ?? 0
    const aviso = total
      ? `Remover a turma ${turma.nome} e os ${total} aluno(s) dela?`
      : `Remover a turma ${turma.nome}?`
    if (window.confirm(aviso)) {
      removerTurma(turma.id)
    }
  }

  function aoAdicionarDisciplina() {
    if (!formDisciplina.nome.trim()) {
      setErro('Informe o nome da disciplina.')
      return
    }
    adicionarDisciplina({
      nome: formDisciplina.nome.trim(),
      professor: formDisciplina.professor.trim(),
      cargaHoraria: Number(formDisciplina.cargaHoraria) || 0,
    })
    setFormDisciplina(DISCIPLINA_INICIAL)
    setErro('')
  }

  function aoRemoverDisciplina(disciplina) {
    if (window.confirm(`Remover a disciplina ${disciplina.nome}?`)) {
      removerDisciplina(disciplina.id)
    }
  }

  const colunasTurmas = [
    { chave: 'nome', titulo: 'Turma' },
    { chave: 'turno', titulo: 'Turno' },
    { chave: 'sala', titulo: 'Sala' },
    { chave: 'regente', titulo: 'Professor regente' },
    {
      chave: 'totalAlunos',
      titulo: 'Alunos',
      alinhamento: 'right',
      renderizar: (linha) => linha.alunos?.length ?? linha.totalAlunos ?? 0,
    },
    {
      chave: 'acoes',
      titulo: '',
      renderizar: (linha) => (
        <Botao variante="secundario" onClick={() => aoRemoverTurma(linha)}>
          Tirar
        </Botao>
      ),
    },
  ]

  const colunasDisciplinas = [
    { chave: 'nome', titulo: 'Disciplina' },
    { chave: 'professor', titulo: 'Professor' },
    { chave: 'cargaHoraria', titulo: 'Carga horaria', alinhamento: 'right', renderizar: (linha) => `${linha.cargaHoraria} h` },
    {
      chave: 'acoes',
      titulo: '',
      renderizar: (linha) => (
        <Botao variante="secundario" onClick={() => aoRemoverDisciplina(linha)}>
          Tirar
        </Botao>
      ),
    },
  ]

  return (
    <>
      <CabecalhoPagina titulo="Turmas" descricao="Turmas e disciplinas que compoem o boletim." />

      <Cartao titulo="Adicionar turma">
        <Campo etiqueta="Nome da turma" htmlFor="turma-nome">
          <Entrada
            id="turma-nome"
            value={formTurma.nome}
            onChange={(evento) => setFormTurma((atual) => ({ ...atual, nome: evento.target.value }))}
            placeholder="Ex.: 7o ano A"
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Turno" htmlFor="turma-turno">
          <Selecao
            id="turma-turno"
            value={formTurma.turno}
            onChange={(evento) => setFormTurma((atual) => ({ ...atual, turno: evento.target.value }))}
          >
            {TURNOS.map((turno) => (
              <option key={turno} value={turno}>
                {turno}
              </option>
            ))}
          </Selecao>
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Sala" htmlFor="turma-sala">
          <Entrada
            id="turma-sala"
            value={formTurma.sala}
            onChange={(evento) => setFormTurma((atual) => ({ ...atual, sala: evento.target.value }))}
            placeholder="Ex.: 12"
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Professor regente" htmlFor="turma-regente">
          <Entrada
            id="turma-regente"
            value={formTurma.regente}
            onChange={(evento) =>
              setFormTurma((atual) => ({ ...atual, regente: evento.target.value }))
            }
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Botao onClick={aoAdicionarTurma}>Adicionar turma</Botao>
      </Cartao>

      <div style={{ height: 'var(--esp-4)' }} />

      <Cartao titulo="Turmas do ano letivo">
        {turmas.length ? (
          <Tabela colunas={colunasTurmas} dados={turmas} />
        ) : (
          <EstadoVazio
            titulo="Nenhuma turma cadastrada"
            descricao="Use o formulario acima para criar a primeira turma."
          />
        )}
      </Cartao>

      <div style={{ height: 'var(--esp-4)' }} />

      <Cartao titulo="Adicionar disciplina">
        <Campo etiqueta="Nome da disciplina" htmlFor="disciplina-nome">
          <Entrada
            id="disciplina-nome"
            value={formDisciplina.nome}
            onChange={(evento) =>
              setFormDisciplina((atual) => ({ ...atual, nome: evento.target.value }))
            }
            placeholder="Ex.: Matematica"
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Professor" htmlFor="disciplina-professor">
          <Entrada
            id="disciplina-professor"
            value={formDisciplina.professor}
            onChange={(evento) =>
              setFormDisciplina((atual) => ({ ...atual, professor: evento.target.value }))
            }
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Carga horaria (horas)" htmlFor="disciplina-carga">
          <Entrada
            id="disciplina-carga"
            type="number"
            min="0"
            value={formDisciplina.cargaHoraria}
            onChange={(evento) =>
              setFormDisciplina((atual) => ({ ...atual, cargaHoraria: evento.target.value }))
            }
            placeholder="Ex.: 200"
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Botao onClick={aoAdicionarDisciplina}>Adicionar disciplina</Botao>
      </Cartao>

      <div style={{ height: 'var(--esp-4)' }} />

      <Cartao titulo="Grade de disciplinas">
        {disciplinas.length ? (
          <Tabela colunas={colunasDisciplinas} dados={disciplinas} />
        ) : (
          <EstadoVazio
            titulo="Nenhuma disciplina cadastrada"
            descricao="Use o formulario acima para montar a grade."
          />
        )}
      </Cartao>

      {erro && <p style={{ color: 'var(--cor-reprovado)', fontSize: 'var(--texto-sm)' }}>{erro}</p>}
    </>
  )
}
