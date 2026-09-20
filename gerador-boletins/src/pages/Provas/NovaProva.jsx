import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import Campo, { Entrada, Selecao } from '@components/ui/Campo'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { useProvas } from '@hooks/useProvas'
import { useTituloPagina } from '@hooks/useTituloPagina'
import {
  gerarProvaComIA,
  extrairExemploDaImagem,
  prepararPDF,
  reescreverProvaDePDF,
  MAX_CONTEUDOS_PROVA,
  TOTAL_QUESTOES_PROVA,
} from '@services/provaService'
import { prepararImagem } from '@services/leituraService'
import { CAMINHOS } from '@/routes/caminhos'
import estilos from './NovaProva.module.css'

const OPCAO_OUTRA_MATERIA = '__outra__'

export default function NovaProva() {
  useTituloPagina('Gerar prova')
  const navegar = useNavigate()
  const { disciplinas } = useBoletimContext()
  const { salvarProva } = useProvas()

  const [materiaSel, setMateriaSel] = useState(() => disciplinas[0]?.nome ?? OPCAO_OUTRA_MATERIA)
  const [materiaLivre, setMateriaLivre] = useState('')
  const [turma, setTurma] = useState('')
  const [mensagens, setMensagens] = useState([
    {
      papel: 'ia',
      texto:
        `Ola! Vou montar uma prova de ${TOTAL_QUESTOES_PROVA} questoes objetivas. `
        + `Me diga os conteudos (ate ${MAX_CONTEUDOS_PROVA}) e as observacoes: serie, o que priorizar... `
        + 'Se preferir, envie a foto de uma prova de exemplo que eu extraio os conteudos.',
    },
  ])
  const [rascunho, setRascunho] = useState('')
  const [gerando, setGerando] = useState(false)
  const [dificuldade, setDificuldade] = useState(5)
  const [lendoFoto, setLendoFoto] = useState(false)
  const [lendoPDF, setLendoPDF] = useState(false)
  const [etapa, setEtapa] = useState(1)

  const materia = materiaSel === OPCAO_OUTRA_MATERIA ? materiaLivre.trim() : materiaSel
  const pedidosUsuario = mensagens.filter((m) => m.papel === 'usuario')
  const podeGerar = materia && pedidosUsuario.length > 0 && !gerando

  function enviarMensagem() {
    const texto = rascunho.trim()
    if (!texto || gerando) return
    setMensagens((atuais) => [...atuais, { papel: 'usuario', texto }])
    setRascunho('')
  }

  async function aoGerarProva() {
    if (!materia) return
    if (!pedidosUsuario.length) return
    setGerando(true)
    setMensagens((atuais) => [...atuais, { papel: 'ia', texto: 'Gerando sua prova, aguarde...' }])
    try {
      const conversa = pedidosUsuario.map((m) => `- ${m.texto}`).join('\n')
      const prova = await gerarProvaComIA({ materia, turma, conversa, dificuldade })
      const registro = salvarProva(prova)
      navegar(CAMINHOS.prova(registro.id))
    } catch (falha) {
      setMensagens((atuais) => [
        ...atuais,
        { papel: 'ia', texto: `Nao consegui gerar: ${falha.message}` },
      ])
    } finally {
      setGerando(false)
    }
  }

  function ajustarDificuldade(delta) {
    setDificuldade((atual) => Math.max(0, Math.min(10, atual + delta)))
  }

  async function aoEscolherPDF(evento) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo || lendoPDF) return
    setLendoPDF(true)
    setMensagens((atuais) => [...atuais, { papel: 'ia', texto: 'Lendo o PDF e reescrevendo a prova com novos valores...' }])
    try {
      const pdf = await prepararPDF(arquivo)
      const prova = await reescreverProvaDePDF({ pdf, dificuldade })
      const registro = salvarProva(prova)
      navegar(CAMINHOS.prova(registro.id))
    } catch (falha) {
      setMensagens((atuais) => [
        ...atuais,
        { papel: 'ia', texto: `Nao consegui reescrever o PDF: ${falha.message}` },
      ])
    } finally {
      setLendoPDF(false)
    }
  }

  async function aoEscolherFoto(evento) {
    const arquivo = evento.target.files?.[0]
    evento.target.value = ''
    if (!arquivo || lendoFoto) return
    setLendoFoto(true)
    try {
      const imagem = await prepararImagem(arquivo)
      setMensagens((atuais) => [...atuais, { papel: 'ia', texto: 'Lendo a prova de exemplo...' }])
      const exemplo = await extrairExemploDaImagem({ imagem })
      const partes = []
      if (exemplo.materia) partes.push(`Materia detectada: ${exemplo.materia}`)
      if (exemplo.conteudos.length) partes.push(`Conteudos: ${exemplo.conteudos.join('; ')}`)
      if (exemplo.observacoes) partes.push(`Observacoes: ${exemplo.observacoes}`)
      if (!partes.length) {
        setMensagens((atuais) => [
          ...atuais,
          { papel: 'ia', texto: 'Nao encontrei conteudos legiveis na foto. Tente uma imagem mais nitida.' },
        ])
        return
      }
      if (exemplo.materia && materiaSel === OPCAO_OUTRA_MATERIA && !materiaLivre.trim()) {
        setMateriaLivre(exemplo.materia)
      }
      const textoExemplo = `Prova de exemplo: ${partes.join('. ')}`
      setMensagens((atuais) => [
        ...atuais,
        { papel: 'usuario', texto: textoExemplo },
        { papel: 'ia', texto: 'Conteudos aproveitados da foto. Pode ajustar por aqui ou gerar a prova.' },
      ])
    } catch (falha) {
      setMensagens((atuais) => [
        ...atuais,
        { papel: 'ia', texto: `Nao consegui ler a foto: ${falha.message}` },
      ])
    } finally {
      setLendoFoto(false)
    }
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Gerar prova"
        descricao={`Converse com a IA e receba uma prova padrao de ${TOTAL_QUESTOES_PROVA} questoes.`}
        acoes={
          <Link to={CAMINHOS.provas}>
            <Botao variante="secundario">Voltar</Botao>
          </Link>
        }
      />

      <div className={estilos.fluxo}>
        {etapa === 1 && (
          <Cartao titulo="1. Materia e ajustes">
            <div className={estilos.campos}>
              <Campo etiqueta="Materia" htmlFor="materia">
                <Selecao
                  id="materia"
                  value={disciplinas.some((d) => d.nome === materiaSel) ? materiaSel : OPCAO_OUTRA_MATERIA}
                  onChange={(evento) => setMateriaSel(evento.target.value)}
                >
                  {disciplinas.map((disciplina) => (
                    <option key={disciplina.id} value={disciplina.nome}>
                      {disciplina.nome}
                    </option>
                  ))}
                  <option value={OPCAO_OUTRA_MATERIA}>Outra materia...</option>
                </Selecao>
              </Campo>
              {(materiaSel === OPCAO_OUTRA_MATERIA || !disciplinas.length) && (
                <Campo etiqueta="Nome da materia" htmlFor="materia-livre">
                  <Entrada
                    id="materia-livre"
                    value={materiaLivre}
                    onChange={(evento) => setMateriaLivre(evento.target.value)}
                    placeholder="Ex.: Ciencias"
                  />
                </Campo>
              )}
              <Campo etiqueta="Turma / serie (opcional)" htmlFor="turma">
                <Entrada
                  id="turma"
                  value={turma}
                  onChange={(evento) => setTurma(evento.target.value)}
                  placeholder="Ex.: 7o ano B"
                />
              </Campo>
              <Campo etiqueta="Dificuldade (0 a 10)" htmlFor="dificuldade">
                <div className={estilos.dificuldade}>
                  <Botao variante="secundario" onClick={() => ajustarDificuldade(-1)} disabled={dificuldade <= 0}>
                    −
                  </Botao>
                  <strong id="dificuldade" className={estilos.nivel}>{dificuldade}</strong>
                  <Botao variante="secundario" onClick={() => ajustarDificuldade(1)} disabled={dificuldade >= 10}>
                    +
                  </Botao>
                </div>
              </Campo>
              <div className={estilos.acoes}>
                <Botao onClick={() => setEtapa(2)} disabled={!materia}>
                  Continuar
                </Botao>
              </div>
            </div>
          </Cartao>
        )}

        {etapa === 2 && (
          <Cartao
            titulo={`2. Conteudos de ${materia || '...'}`}
            acao={
              <Botao variante="secundario" onClick={() => setEtapa(1)}>
                Trocar materia
              </Botao>
            }
          >
            <div className={estilos.chat}>
              <div className={estilos.mensagens}>
                {mensagens.map((mensagem, indice) => (
                  <p
                    key={indice}
                    className={`${estilos.mensagem} ${mensagem.papel === 'usuario' ? estilos.usuario : estilos.ia}`}
                  >
                    {mensagem.texto}
                  </p>
                ))}
                {gerando && <p className={`${estilos.mensagem} ${estilos.ia}`}>Gerando...</p>}
              </div>
              <div className={estilos.envio}>
                <Entrada
                  value={rascunho}
                  onChange={(evento) => setRascunho(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === 'Enter') enviarMensagem()
                  }}
                  placeholder="Ex.: Conteudos: fotossintese e cadeia alimentar. Priorizar interpretacao."
                />
                <Botao variante="secundario" onClick={enviarMensagem} disabled={gerando || !rascunho.trim()}>
                  Enviar
                </Botao>
              </div>
              <Campo etiqueta="Prova de exemplo (opcional)" htmlFor="foto-exemplo" dica="Foto de uma prova pronta: a IA extrai materia e conteudos.">
                <Entrada
                  id="foto-exemplo"
                  type="file"
                  accept="image/*"
                  onChange={aoEscolherFoto}
                />
              </Campo>
              {lendoFoto && <p className={estilos.ajuda}>Lendo a foto de exemplo...</p>}
              <div className={estilos.acoes}>
                <Botao onClick={aoGerarProva} disabled={!podeGerar}>
                  {gerando ? 'Gerando prova...' : 'Gerar prova com IA'}
                </Botao>
              </div>
            </div>
          </Cartao>
        )}
      </div>

      <div style={{ height: 'var(--esp-4)' }} />

      <details className={estilos.detalhes}>
        <summary className={estilos.resumo}>
          Ou reescreva uma prova em PDF (mantem tudo, troca so os valores)
        </summary>
        <div className={estilos.campos} style={{ marginTop: 'var(--esp-3)' }}>
          <Campo etiqueta="Arquivo PDF (ate 15 MB)" htmlFor="pdf-prova">
            <Entrada
              id="pdf-prova"
              type="file"
              accept="application/pdf,.pdf"
              onChange={aoEscolherPDF}
            />
          </Campo>
          {lendoPDF && <p className={estilos.ajuda}>Lendo o PDF e gerando a nova versao...</p>}
        </div>
      </details>
    </>
  )
}
