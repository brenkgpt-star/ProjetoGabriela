import { alunos } from '@data/alunos'

export const alunoService = {
  listar: () => alunos,
  buscarPorId: (id) => alunos.find((aluno) => aluno.id === id) ?? null,
  listarPorTurma: (turmaId) => alunos.filter((aluno) => aluno.turmaId === turmaId),
}
