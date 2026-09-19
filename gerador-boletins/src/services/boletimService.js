import { boletins } from '@data/boletins'

export const boletimService = {
  listar: () => boletins,
  buscarPorId: (id) => boletins.find((boletim) => boletim.id === id) ?? null,
  listarPorTurma: (turmaId) => boletins.filter((boletim) => boletim.turmaId === turmaId),
}
