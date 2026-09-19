import { turmas } from '@data/turmas'
import { disciplinas } from '@data/disciplinas'

export const turmaService = {
  listar: () => turmas,
  buscarPorId: (id) => turmas.find((turma) => turma.id === id) ?? null,
  listarDisciplinas: () => disciplinas,
  buscarDisciplina: (id) => disciplinas.find((disciplina) => disciplina.id === id) ?? null,
}
