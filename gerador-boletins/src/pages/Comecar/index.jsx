import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import Campo, { Entrada, Selecao } from '@components/ui/Campo'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { CAMINHOS } from '@/routes/caminhos'
import estilos from './Comecar.module.css'

const TURNOS = ['Matutino', 'Vespertino', 'Noturno', 'Integral']

const PASSOS = [
  { numero: 1, titulo: 'Escola', descricao: 'Dados que saem no cabecalho' },
  { numero: 2, titulo: 'Turmas', descricao: 'Crie ao menos uma turma' },
  { numero: 3, titulo: 'Alunos', descricao: 'Cadastre os estudantes' },
]

export default function Comecar() {
  useTituloPagina('Comecar')
  const navegar = useNavigate()
  const {
    escola,
    turmas,
    alunos,
    salvarEscola,
    adicionarTurma,
    removerTurma,
    adicionarAluno,
    removerAluno,
    concluirConfiguracao,
  } = useBoletimContext()

  const [etapa, setEtapa] = useState(1)
  const [erro, setErro] = useState('')
  const [formEscola, setFormEscola] = useState({
    nome: escola.nome ?? '',
    anoLetivo: escola.anoLetivo ?? new Date().getFullYear(),
    diretora: escola.diretora ?? '',
  })
  const [formTurma, setFormTurma] = useState({ nome: '', turno: 'Matutino', sala: '', regente: '' })
  const [formAluno, setFormAluno] = useState({
    nome: '',
    matricula: '',
    turmaId: '',
    nascimento: '',
    responsavel: '',
  })

  function avancarEscola() {
    if (!formEscola.nome.trim()) {
      setErro('Diga o nome da escola para continuar.')
      return
    }
    salvarEscola({
      nome: formEscola.nome.trim(),
      anoLetivo: Number(formEscola.anoLetivo) || new Date().getFullYear(),
      diretora: formEscola.diretora.trim(),
    })
    setErro('')
    setEtapa(2)
  }

  function aoAdicionarTurma() {
    if (!formTurma.nome.trim()) {
      setErro('Diga o nome da turma (ex.: 7o ano A).')
      return
    }
    adicionarTurma({
      nome: formTurma.nome.trim(),
      turno: formTurma.turno,
      sala: formTurma.sala.trim(),
      regente: formTurma.regente.trim(),
      totalAlunos: 0,
    })
    setFormTurma({ nome: '', turno: 'Matutino', sala: '', regente: '' })
    setErro('')
  }

  function avancarTurmas() {
    if (!turmas.length) {
      setErro('Crie ao menos uma turma para continuar.')
      return
    }
    setErro('')
    setFormAluno((atual) => ({ ...atual, turmaId: atual.turmaId || turmas[0].id }))
    setEtapa(3)
  }

  function aoAdicionarAluno() {
    if (!formAluno.nome.trim()) {
      setErro('Diga o nome do aluno.')
      return
    }
    if (!formAluno.turmaId) {
      setErro('Escolha a turma do aluno.')
      return
    }
    adicionarAluno({
      nome: formAluno.nome.trim(),
      matricula: formAluno.matricula.trim(),
      turmaId: formAluno.turmaId,
      nascimento: formAluno.nascimento,
      responsavel: formAluno.responsavel.trim(),
    })
    setFormAluno({ nome: '', matricula: '', turmaId: formAluno.turmaId, nascimento: '', responsavel: '' })
    setErro('')
  }

  function aoConcluir() {
    concluirConfiguracao()
    navegar(CAMINHOS.painel)
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Vamos comecar"
        descricao="Cadastre escola, turmas e alunos em 3 passos rapidinhos."
      />

      <div className={estilos.passos}>
        {PASSOS.map((passo) => (
          <div
            key={passo.numero}
            className={`${estilos.passo} ${etapa === passo.numero ? estilos.ativo : ''} ${etapa > passo.numero ? estilos.feito : ''}`}
          >
            <strong>
              {passo.numero}. {passo.titulo}
            </strong>
            {passo.descricao}
          </div>
        ))}
      </div>

      {etapa === 1 && (
        <Cartao titulo="Passo 1 - Sua escola">
          <div className={estilos.campos}>
            <Campo etiqueta="Nome da escola" htmlFor="escola-nome">
              <Entrada
                id="escola-nome"
                value={formEscola.nome}
                onChange={(evento) =>
                  setFormEscola((atual) => ({ ...atual, nome: evento.target.value }))
                }
                placeholder="Ex.: Escola Municipal Centro"
              />
            </Campo>
            <Campo etiqueta="Ano letivo" htmlFor="escola-ano">
              <Entrada
                id="escola-ano"
                type="number"
                value={formEscola.anoLetivo}
                onChange={(evento) =>
                  setFormEscola((atual) => ({ ...atual, anoLetivo: evento.target.value }))
                }
              />
            </Campo>
            <Campo etiqueta="Direcao" htmlFor="escola-direcao" dica="Opcional. Sai na assinatura do boletim.">
              <Entrada
                id="escola-direcao"
                value={formEscola.diretora}
                onChange={(evento) =>
                  setFormEscola((atual) => ({ ...atual, diretora: evento.target.value }))
                }
              />
            </Campo>
          </div>
          {erro && <p className={estilos.erro}>{erro}</p>}
          <div className={estilos.acoes}>
            <span />
            <Botao onClick={avancarEscola}>Continuar para turmas</Botao>
          </div>
        </Cartao>
      )}

      {etapa === 2 && (
        <div className={estilos.grade}>
          <Cartao titulo="Passo 2 - Nova turma">
            <div className={estilos.campos}>
              <Campo etiqueta="Nome da turma" htmlFor="turma-nome">
                <Entrada
                  id="turma-nome"
                  value={formTurma.nome}
                  onChange={(evento) =>
                    setFormTurma((atual) => ({ ...atual, nome: evento.target.value }))
                  }
                  placeholder="Ex.: 7o ano A"
                />
              </Campo>
              <Campo etiqueta="Turno" htmlFor="turma-turno">
                <Selecao
                  id="turma-turno"
                  value={formTurma.turno}
                  onChange={(evento) =>
                    setFormTurma((atual) => ({ ...atual, turno: evento.target.value }))
                  }
                >
                  {TURNOS.map((turno) => (
                    <option key={turno} value={turno}>
                      {turno}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <Campo etiqueta="Sala" htmlFor="turma-sala">
                <Entrada
                  id="turma-sala"
                  value={formTurma.sala}
                  onChange={(evento) =>
                    setFormTurma((atual) => ({ ...atual, sala: evento.target.value }))
                  }
                  placeholder="Ex.: 12"
                />
              </Campo>
              <Campo etiqueta="Professor regente" htmlFor="turma-regente">
                <Entrada
                  id="turma-regente"
                  value={formTurma.regente}
                  onChange={(evento) =>
                    setFormTurma((atual) => ({ ...atual, regente: evento.target.value }))
                  }
                />
              </Campo>
            </div>
            {erro && <p className={estilos.erro}>{erro}</p>}
            <div className={estilos.acoes}>
              <Botao variante="secundario" onClick={() => setEtapa(1)}>
                Voltar
              </Botao>
              <Botao onClick={aoAdicionarTurma}>Adicionar turma</Botao>
            </div>
          </Cartao>

          <Cartao titulo={`Turmas criadas (${turmas.length})`}>
            {turmas.length ? (
              <ul className={estilos.lista}>
                {turmas.map((turma) => (
                  <li key={turma.id} className={estilos.itemLista}>
                    <span>
                      <strong>{turma.nome}</strong> - {turma.turno}
                    </span>
                    <Botao variante="secundario" onClick={() => removerTurma(turma.id)}>
                      Tirar
                    </Botao>
                  </li>
                ))}
              </ul>
            ) : (
              <EstadoVazio
                titulo="Nenhuma turma ainda"
                descricao="Adicione a primeira turma ao lado."
              />
            )}
            <div className={estilos.acoes}>
              <span />
              <Botao onClick={avancarTurmas} disabled={!turmas.length}>
                Continuar para alunos
              </Botao>
            </div>
          </Cartao>
        </div>
      )}

      {etapa === 3 && (
        <div className={estilos.grade}>
          <Cartao titulo="Passo 3 - Novo aluno">
            <div className={estilos.campos}>
              <Campo etiqueta="Nome completo" htmlFor="aluno-nome">
                <Entrada
                  id="aluno-nome"
                  value={formAluno.nome}
                  onChange={(evento) =>
                    setFormAluno((atual) => ({ ...atual, nome: evento.target.value }))
                  }
                  placeholder="Ex.: Maria Silva"
                />
              </Campo>
              <Campo etiqueta="Matricula" htmlFor="aluno-matricula">
                <Entrada
                  id="aluno-matricula"
                  value={formAluno.matricula}
                  onChange={(evento) =>
                    setFormAluno((atual) => ({ ...atual, matricula: evento.target.value }))
                  }
                  placeholder="Ex.: 2026001"
                />
              </Campo>
              <Campo etiqueta="Turma" htmlFor="aluno-turma">
                <Selecao
                  id="aluno-turma"
                  value={formAluno.turmaId}
                  onChange={(evento) =>
                    setFormAluno((atual) => ({ ...atual, turmaId: evento.target.value }))
                  }
                >
                  <option value="">Escolha a turma...</option>
                  {turmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </Selecao>
              </Campo>
              <Campo etiqueta="Responsavel" htmlFor="aluno-responsavel">
                <Entrada
                  id="aluno-responsavel"
                  value={formAluno.responsavel}
                  onChange={(evento) =>
                    setFormAluno((atual) => ({ ...atual, responsavel: evento.target.value }))
                  }
                  placeholder="Quem assina o boletim"
                />
              </Campo>
            </div>
            {erro && <p className={estilos.erro}>{erro}</p>}
            <div className={estilos.acoes}>
              <Botao variante="secundario" onClick={() => setEtapa(2)}>
                Voltar
              </Botao>
              <Botao onClick={aoAdicionarAluno}>Adicionar aluno</Botao>
            </div>
          </Cartao>

          <Cartao titulo={`Alunos cadastrados (${alunos.length})`}>
            {alunos.length ? (
              <ul className={estilos.lista}>
                {alunos.map((aluno) => (
                  <li key={aluno.id} className={estilos.itemLista}>
                    <span>
                      <strong>{aluno.nome}</strong> -{' '}
                      {turmas.find((turma) => turma.id === aluno.turmaId)?.nome ?? '--'}
                    </span>
                    <Botao variante="secundario" onClick={() => removerAluno(aluno.id)}>
                      Tirar
                    </Botao>
                  </li>
                ))}
              </ul>
            ) : (
              <EstadoVazio
                titulo="Nenhum aluno ainda"
                descricao="Adicione o primeiro aluno ao lado."
              />
            )}
            <div className={estilos.acoes}>
              <span />
              <Botao onClick={aoConcluir}>Concluir e ir para o painel</Botao>
            </div>
          </Cartao>
        </div>
      )}
    </>
  )
}
