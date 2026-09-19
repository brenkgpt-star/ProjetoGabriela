import { useMemo } from 'react'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { calcularMedia, situacaoFinal } from '@utils/calculos'

// Junta boletim + aluno + turma e ja devolve media e situacao prontas para a tela.
// Boletins vindos de foto guardam uma copia (snapshot) do aluno e da turma.
export function useBoletins() {
  const { registros, alunos, turmas } = useBoletimContext()

  return useMemo(
    () =>
      registros.map((boletim) => ({
        ...boletim,
        aluno: boletim.aluno ?? alunos.find((item) => item.id === boletim.alunoId) ?? null,
        turma: boletim.turma ?? turmas.find((item) => item.id === boletim.turmaId) ?? null,
        media: calcularMedia(boletim.notas),
        situacao: situacaoFinal(boletim.notas),
      })),
    [registros, alunos, turmas],
  )
}

export function useBoletim(id) {
  const boletins = useBoletins()
  return boletins.find((boletim) => boletim.id === id) ?? null
}
