import { useState } from 'react'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import Campo, { Entrada } from '@components/ui/Campo'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { MEDIA_APROVACAO, MEDIA_RECUPERACAO, FREQUENCIA_MINIMA } from '@utils/constantes'
import { useTituloPagina } from '@hooks/useTituloPagina'
import estilos from './Configuracoes.module.css'

export default function Configuracoes() {
  useTituloPagina('Configuracoes')
  const { escola, salvarEscola } = useBoletimContext()
  const [form, setForm] = useState({
    nome: escola.nome ?? '',
    cnpj: escola.cnpj ?? '',
    endereco: escola.endereco ?? '',
    telefone: escola.telefone ?? '',
    diretora: escola.diretora ?? '',
    secretario: escola.secretario ?? '',
    anoLetivo: escola.anoLetivo ?? new Date().getFullYear(),
  })
  const [salvo, setSalvo] = useState(false)

  function atualizar(campo, valor) {
    setForm((atual) => ({ ...atual, [campo]: valor }))
    setSalvo(false)
  }

  function aoSalvar() {
    salvarEscola({ ...form, anoLetivo: Number(form.anoLetivo) || new Date().getFullYear() })
    setSalvo(true)
  }

  return (
    <>
      <CabecalhoPagina
        titulo="Configuracoes"
        descricao="Dados que aparecem no cabecalho impresso e regras de aprovacao."
        acoes={<Botao onClick={aoSalvar}>Salvar alteracoes</Botao>}
      />

      <div className={estilos.grade}>
        <Cartao titulo="Dados da escola">
          <div className={estilos.campos}>
            <Campo etiqueta="Nome" htmlFor="nome">
              <Entrada
                id="nome"
                value={form.nome}
                onChange={(evento) => atualizar('nome', evento.target.value)}
                placeholder="Ex.: Escola Municipal Centro"
              />
            </Campo>
            <Campo etiqueta="CNPJ" htmlFor="cnpj">
              <Entrada
                id="cnpj"
                value={form.cnpj}
                onChange={(evento) => atualizar('cnpj', evento.target.value)}
              />
            </Campo>
            <Campo etiqueta="Endereco" htmlFor="endereco">
              <Entrada
                id="endereco"
                value={form.endereco}
                onChange={(evento) => atualizar('endereco', evento.target.value)}
              />
            </Campo>
            <Campo etiqueta="Telefone" htmlFor="telefone">
              <Entrada
                id="telefone"
                value={form.telefone}
                onChange={(evento) => atualizar('telefone', evento.target.value)}
              />
            </Campo>
            <Campo etiqueta="Direcao" htmlFor="direcao" dica="Nome usado na linha de assinatura.">
              <Entrada
                id="direcao"
                value={form.diretora}
                onChange={(evento) => atualizar('diretora', evento.target.value)}
              />
            </Campo>
            <Campo etiqueta="Secretario" htmlFor="secretario">
              <Entrada
                id="secretario"
                value={form.secretario}
                onChange={(evento) => atualizar('secretario', evento.target.value)}
              />
            </Campo>
            <Campo etiqueta="Ano letivo" htmlFor="ano">
              <Entrada
                id="ano"
                type="number"
                value={form.anoLetivo}
                onChange={(evento) => atualizar('anoLetivo', evento.target.value)}
              />
            </Campo>
          </div>
          {salvo && (
            <p style={{ color: 'var(--cor-aprovado)', fontSize: 'var(--texto-sm)' }}>
              Dados da escola salvos.
            </p>
          )}
        </Cartao>

        <Cartao titulo="Regras de avaliacao">
          <div className={estilos.campos}>
            <Campo etiqueta="Media para aprovacao" htmlFor="media">
              <Entrada id="media" type="number" step="0.5" defaultValue={MEDIA_APROVACAO} />
            </Campo>
            <Campo etiqueta="Nota minima para recuperacao" htmlFor="recuperacao">
              <Entrada id="recuperacao" type="number" step="0.5" defaultValue={MEDIA_RECUPERACAO} />
            </Campo>
            <Campo
              etiqueta="Frequencia minima (%)"
              htmlFor="frequencia"
              dica="Abaixo disso o aluno reprova por faltas, mesmo com media."
            >
              <Entrada id="frequencia" type="number" defaultValue={FREQUENCIA_MINIMA} />
            </Campo>
          </div>
        </Cartao>
      </div>
    </>
  )
}
