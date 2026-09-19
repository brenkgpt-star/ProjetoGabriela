import { useCallback, useMemo, useState } from 'react'
import { BoletimContext } from './boletimContext'
import { boletimService } from '@services/boletimService'
import { armazenamentoLocal } from '@services/armazenamentoLocal'
import { escola as escolaInicial } from '@data/escola'
import { turmas as turmasIniciais } from '@data/turmas'
import { alunos as alunosIniciais } from '@data/alunos'
import { disciplinas as disciplinasIniciais } from '@data/disciplinas'

function gerarId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}`
}

export default function BoletimProvider({ children }) {
  const [importados, setImportados] = useState(() => armazenamentoLocal.listarBoletinsImportados())
  const [escola, setEscola] = useState(() => ({
    ...escolaInicial,
    ...armazenamentoLocal.lerEscola({}),
  }))
  const [turmas, setTurmas] = useState(() => armazenamentoLocal.listarTurmas(turmasIniciais))
  const [alunos, setAlunos] = useState(() => armazenamentoLocal.listarAlunos(alunosIniciais))
  const [disciplinas, setDisciplinas] = useState(() =>
    armazenamentoLocal.listarDisciplinas(disciplinasIniciais),
  )
  const [configurado, setConfigurado] = useState(() => armazenamentoLocal.jaConfigurado())

  const registros = useMemo(
    () => [...boletimService.listar(), ...importados],
    [importados],
  )

  const adicionarBoletim = useCallback((boletim) => {
    setImportados((atuais) => {
      const proximos = [...atuais, boletim]
      armazenamentoLocal.salvarBoletinsImportados(proximos)
      return proximos
    })
    return boletim
  }, [])

  const salvarEscola = useCallback((dados) => {
    setEscola((atual) => {
      const proxima = { ...atual, ...dados }
      armazenamentoLocal.salvarEscola(proxima)
      return proxima
    })
  }, [])

  const adicionarTurma = useCallback((dados) => {
    const turma = { id: gerarId('t'), ...dados }
    setTurmas((atuais) => {
      const proximas = [...atuais, turma]
      armazenamentoLocal.salvarTurmas(proximas)
      return proximas
    })
    return turma
  }, [])

  const removerTurma = useCallback((id) => {
    setTurmas((atuais) => {
      const proximas = atuais.filter((turma) => turma.id !== id)
      armazenamentoLocal.salvarTurmas(proximas)
      return proximas
    })
    setAlunos((atuais) => {
      const proximos = atuais.filter((aluno) => aluno.turmaId !== id)
      armazenamentoLocal.salvarAlunos(proximos)
      return proximos
    })
  }, [])

  const adicionarAluno = useCallback((dados) => {
    const aluno = { id: gerarId('a'), ...dados }
    setAlunos((atuais) => {
      const proximos = [...atuais, aluno]
      armazenamentoLocal.salvarAlunos(proximos)
      return proximos
    })
    return aluno
  }, [])

  const removerAluno = useCallback((id) => {
    setAlunos((atuais) => {
      const proximos = atuais.filter((aluno) => aluno.id !== id)
      armazenamentoLocal.salvarAlunos(proximos)
      return proximos
    })
  }, [])

  const adicionarDisciplina = useCallback((dados) => {
    const disciplina = { id: gerarId('d'), ...dados }
    setDisciplinas((atuais) => {
      const proximas = [...atuais, disciplina]
      armazenamentoLocal.salvarDisciplinas(proximas)
      return proximas
    })
    return disciplina
  }, [])

  const removerDisciplina = useCallback((id) => {
    setDisciplinas((atuais) => {
      const proximas = atuais.filter((disciplina) => disciplina.id !== id)
      armazenamentoLocal.salvarDisciplinas(proximas)
      return proximas
    })
  }, [])

  const concluirConfiguracao = useCallback(() => {
    armazenamentoLocal.marcarConfigurado()
    setConfigurado(true)
  }, [])

  const valor = useMemo(
    () => ({
      escola,
      turmas,
      alunos,
      disciplinas,
      configurado,
      registros,
      adicionarBoletim,
      salvarEscola,
      adicionarTurma,
      removerTurma,
      adicionarAluno,
      removerAluno,
      adicionarDisciplina,
      removerDisciplina,
      concluirConfiguracao,
    }),
    [
      escola,
      turmas,
      alunos,
      disciplinas,
      configurado,
      registros,
      adicionarBoletim,
      salvarEscola,
      adicionarTurma,
      removerTurma,
      adicionarAluno,
      removerAluno,
      adicionarDisciplina,
      removerDisciplina,
      concluirConfiguracao,
    ],
  )

  return <BoletimContext.Provider value={valor}>{children}</BoletimContext.Provider>
}
