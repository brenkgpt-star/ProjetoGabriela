# Gerador de boletins

Sistema web para a secretaria escolar montar, conferir e imprimir boletins por aluno,
turma e bimestre. Projeto em React + Vite, com a estrutura de pastas pronta para crescer.

## Rodando o projeto

```bash
npm install
npm run dev      # sobe em http://localhost:5173
npm run build    # gera a pasta dist/
npm run preview  # serve o build
npm run lint
```

## Estrutura de pastas

```
gerador-boletins/
├── index.html                 # ponto de entrada do Vite
├── package.json
├── vite.config.js             # plugins e aliases (@components, @pages, ...)
├── eslint.config.js
├── .env.example
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx               # monta o React e o BrowserRouter
    ├── App.jsx                # providers globais + rotas
    ├── routes/
    │   ├── AppRoutes.jsx      # mapa de rotas
    │   └── caminhos.js        # URLs em um lugar so
    ├── styles/
    │   ├── tokens.css         # cores, tipografia, espacamentos
    │   ├── global.css         # reset e estilos base
    │   └── print.css          # regras de impressao do boletim
    ├── components/
    │   ├── layout/            # moldura do app: menu, barra, cabecalho de pagina
    │   ├── ui/                # pecas reutilizaveis: botao, tabela, campo, etiqueta
    │   └── boletim/           # a folha do boletim e suas partes
    ├── pages/                 # uma pasta por tela
    │   ├── Painel/
    │   ├── Alunos/
    │   ├── Turmas/
    │   ├── Boletins/          # lista, geracao e visualizacao
    │   ├── Configuracoes/
    │   └── NaoEncontrado/
    ├── contexts/              # estado compartilhado (periodo ativo, escola)
    │   ├── boletimContext.js  # o contexto em si
    │   └── BoletimProvider.jsx
    ├── hooks/                 # regras de leitura para as telas
    ├── services/              # acesso a dados (api.js e um service por entidade)
    ├── data/                  # dados de exemplo enquanto nao ha backend
    └── utils/                 # calculos, formatadores e constantes
```

## Como cada camada conversa

```
pages  ->  hooks  ->  services  ->  data (hoje) / api.js (depois)
  |          |
  +-> components/ui e components/boletim para desenhar a tela
```

Trocar os dados de exemplo por uma API de verdade mexe so em `src/services`:
os services passam a chamar `api.js` no lugar de importar de `src/data`.

## Rotas

| Rota               | Tela                                    |
| ------------------ | --------------------------------------- |
| `/`                | Painel do bimestre                      |
| `/boletins`        | Lista de boletins gerados               |
| `/boletins/novo`   | Formulario de lancamento de notas       |
| `/boletins/:id`    | Boletim pronto, com botao de impressao  |
| `/alunos`          | Cadastro de alunos                      |
| `/turmas`          | Turmas e grade de disciplinas           |
| `/configuracoes`   | Dados da escola e regras de aprovacao   |

## Estado atual

As telas estao montadas com dados de exemplo em `src/data`. Salvar, editar e emitir
ainda nao persistem nada. O que falta para virar produto:

- backend e autenticacao da secretaria
- gravacao das notas lancadas em `/boletins/novo`
- exportacao em PDF alem do `window.print()`
- historico anual com as medias dos quatro bimestres
