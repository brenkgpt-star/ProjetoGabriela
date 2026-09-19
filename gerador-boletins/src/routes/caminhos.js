// Um lugar unico para as URLs, para nao repetir string solta pelo projeto.
export const CAMINHOS = {
  painel: '/',
  comecar: '/comecar',
  alunos: '/alunos',
  turmas: '/turmas',
  boletins: '/boletins',
  novoBoletim: '/boletins/novo',
  lerBoletim: '/boletins/ler',
  boletim: (id = ':id') => `/boletins/${id}`,
  configuracoes: '/configuracoes',
}
