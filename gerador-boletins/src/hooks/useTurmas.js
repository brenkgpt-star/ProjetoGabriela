import { useMemo } from 'react'
import { useBoletimContext } from '@hooks/useBoletimContext'

export function useTurmas() {
  const { turmas, alunos } = useBoletimContext()

  return useMemo(
    () =>
      turmas.map((turma) => ({
        ...turma,
        alunos: alunos.filter((aluno) => aluno.turmaId === turma.id),
      })),
    [turmas, alunos],
  )
}
