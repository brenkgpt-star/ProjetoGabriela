import { Link } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import Cartao from '@components/ui/Cartao'
import Botao from '@components/ui/Botao'
import Tabela from '@components/ui/Tabela'
import EstadoVazio from '@components/ui/EstadoVazio'
import { useProvas } from '@hooks/useProvas'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { CAMINHOS } from '@/routes/caminhos'
import { formatarData } from '@utils/formatadores'

export default function Provas() {
  useTituloPagina('Provas')
  const { provas, removerProva } = useProvas()

  const colunas = [
    { chave: 'titulo', titulo: 'Prova', renderizar: (linha) => linha.titulo },
    { chave: 'materia', titulo: 'Materia', renderizar: (linha) => linha.materia },
    {
      chave: 'conteudos',
      titulo: 'Conteudos',
      renderizar: (linha) => `${linha.conteudos?.length ?? 0} tema(s)`,
    },
    {
      chave: 'criadaEm',
      titulo: 'Criada em',
      renderizar: (linha) => formatarData(linha.criadaEm),
    },
    {
      chave: 'acoes',
      titulo: '',
      renderizar: (linha) => (
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <Link to={CAMINHOS.prova(linha.id)}>
            <Botao variante="secundario">Abrir</Botao>
          </Link>
          <Botao variante="secundario" onClick={() => removerProva(linha.id)}>
            Excluir
          </Botao>
        </span>
      ),
    },
  ]

  return (
    <>
      <CabecalhoPagina
        titulo="Provas"
        descricao="Gere avaliacoes de 10 questoes com a IA, imprima e confira o gabarito separado."
        acoes={
          <Link to={CAMINHOS.novaProva}>
            <Botao>Gerar prova</Botao>
          </Link>
        }
      />

      <Cartao titulo="Provas geradas">
        {provas.length ? (
          <Tabela colunas={colunas} dados={provas} />
        ) : (
          <EstadoVazio
            titulo="Nenhuma prova ainda"
            descricao="Converse com a IA informando materia, conteudos e observacoes para gerar a primeira."
            acao={
              <Link to={CAMINHOS.novaProva}>
                <Botao>Gerar prova</Botao>
              </Link>
            }
          />
        )}
      </Cartao>
    </>
  )
}
