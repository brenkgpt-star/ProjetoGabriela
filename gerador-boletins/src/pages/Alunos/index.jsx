import { useState } from 'react'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Tabela from '@components/ui/Tabela'
import Botao from '@components/ui/Botao'
import Campo, { Entrada, Selecao } from '@components/ui/Campo'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { formatarData } from '@utils/formatadores'
import { useTituloPagina } from '@hooks/useTituloPagina'

const FORM_INICIAL = { nome: '', matricula: '', turmaId: '', nascimento: '', responsavel: '' }

export default function Alunos() {
  useTituloPagina('Alunos')
  const { alunos, turmas, adicionarAluno, removerAluno } = useBoletimContext()
  const [form, setForm] = useState(FORM_INICIAL)
  const [erro, setErro] = useState('')

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
  }

  function aoAdicionar() {
    if (!form.nome.trim()) {
      setErro('Informe o nome do aluno.')
      return
    }
    if (!form.turmaId) {
      setErro('Escolha a turma do aluno.')
      return
    }
    adicionarAluno({
      nome: form.nome.trim(),
      matricula: form.matricula.trim(),
      turmaId: form.turmaId,
      nascimento: form.nascimento,
      responsavel: form.responsavel.trim(),
    })
    setForm(FORM_INICIAL)
    setErro('')
  }

  function aoRemover(aluno) {
    if (window.confirm(`Remover ${aluno.nome} da lista?`)) {
      removerAluno(aluno.id)
    }
  }

  const colunas = [
    { chave: 'matricula', titulo: 'Matricula' },
    { chave: 'nome', titulo: 'Nome' },
    {
      chave: 'turma',
      titulo: 'Turma',
      renderizar: (linha) => turmas.find((turma) => turma.id === linha.turmaId)?.nome ?? '--',
    },
    { chave: 'nascimento', titulo: 'Nascimento', renderizar: (linha) => formatarData(linha.nascimento) },
    { chave: 'responsavel', titulo: 'Responsavel' },
    {
      chave: 'acoes',
      titulo: '',
      renderizar: (linha) => (
        <Botao variante="secundario" onClick={() => aoRemover(linha)}>
          Tirar
        </Botao>
      ),
    },
  ]

  return (
    <>
      <CabecalhoPagina
        titulo="Alunos"
        descricao="Cadastro usado para preencher o cabecalho dos boletins."
      />

      <Cartao titulo="Adicionar aluno">
        <Campo etiqueta="Nome completo" htmlFor="aluno-nome">
          <Entrada
            id="aluno-nome"
            value={form.nome}
            onChange={(evento) => atualizar('nome', evento.target.value)}
            placeholder="Ex.: Maria Silva"
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Matricula" htmlFor="aluno-matricula">
          <Entrada
            id="aluno-matricula"
            value={form.matricula}
            onChange={(evento) => atualizar('matricula', evento.target.value)}
            placeholder="Ex.: 2026001"
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Turma" htmlFor="aluno-turma">
          <Selecao
            id="aluno-turma"
            value={form.turmaId}
            onChange={(evento) => atualizar('turmaId', evento.target.value)}
          >
            <option value="">Escolha a turma...</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </Selecao>
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Nascimento" htmlFor="aluno-nascimento">
          <Entrada
            id="aluno-nascimento"
            type="date"
            value={form.nascimento}
            onChange={(evento) => atualizar('nascimento', evento.target.value)}
          />
        </Campo>
        <div style={{ height: 'var(--esp-3)' }} />
        <Campo etiqueta="Responsavel" htmlFor="aluno-responsavel">
          <Entrada
            id="aluno-responsavel"
            value={form.responsavel}
            onChange={(evento) => atualizar('responsavel', evento.target.value)}
            placeholder="Quem assina o boletim"
          />
        </Campo>
        {erro && <p style={{ color: 'var(--cor-reprovado)', fontSize: 'var(--texto-sm)' }}>{erro}</p>}
        <div style={{ height: 'var(--esp-3)' }} />
        <Botao onClick={aoAdicionar}>Adicionar aluno</Botao>
      </Cartao>

      <div style={{ height: 'var(--esp-4)' }} />

      <Cartao>
        {alunos.length ? (
          <Tabela colunas={colunas} dados={alunos} />
        ) : (
          <EstadoVazio
            titulo="Nenhum aluno cadastrado"
            descricao="Use o formulario acima para adicionar o primeiro aluno."
          />
        )}
      </Cartao>
    </>
  )
}
