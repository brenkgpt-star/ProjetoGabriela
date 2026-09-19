const CHAVE_BOLETINS = 'gb_boletins_importados'
const CHAVE_ESCOLA = 'gb_escola'
const CHAVE_TURMAS = 'gb_turmas'
const CHAVE_ALUNOS = 'gb_alunos'
const CHAVE_DISCIPLINAS = 'gb_disciplinas'
const CHAVE_CONFIGURADO = 'gb_configurado'

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave)
    return bruto ? JSON.parse(bruto) : padrao
  } catch {
    return padrao
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // Navegador sem espaco ou com storage bloqueado: segue so em memoria.
  }
}

export const armazenamentoLocal = {
  listarBoletinsImportados: () => ler(CHAVE_BOLETINS, []),
  salvarBoletinsImportados: (boletins) => gravar(CHAVE_BOLETINS, boletins),
  lerEscola: (padrao) => ler(CHAVE_ESCOLA, padrao),
  salvarEscola: (escola) => gravar(CHAVE_ESCOLA, escola),
  listarTurmas: (padrao) => ler(CHAVE_TURMAS, padrao),
  salvarTurmas: (turmas) => gravar(CHAVE_TURMAS, turmas),
  listarAlunos: (padrao) => ler(CHAVE_ALUNOS, padrao),
  salvarAlunos: (alunos) => gravar(CHAVE_ALUNOS, alunos),
  listarDisciplinas: (padrao) => ler(CHAVE_DISCIPLINAS, padrao),
  salvarDisciplinas: (disciplinas) => gravar(CHAVE_DISCIPLINAS, disciplinas),
  jaConfigurado: () => ler(CHAVE_CONFIGURADO, false),
  marcarConfigurado: () => gravar(CHAVE_CONFIGURADO, true),
}
