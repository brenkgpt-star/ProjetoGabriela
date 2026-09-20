import { Link } from 'react-router-dom'
import CabecalhoPagina from '@components/layout/CabecalhoPagina'
import { useTituloPagina } from '@hooks/useTituloPagina'
import { useBoletimContext } from '@hooks/useBoletimContext'
import { CAMINHOS } from '@/routes/caminhos'
import estilos from './Inicio.module.css'

const OPCOES = [
  {
    numero: '01',
    area: 'Documentos escolares',
    titulo: 'Boletins e escola',
    descricao: 'Painel do ano letivo, boletins por trimestre, alunos, turmas e dados da escola.',
    destino: CAMINHOS.painel,
    acao: 'Abrir documentos',
  },
  {
    numero: '02',
    area: 'Avaliacoes',
    titulo: 'Provas',
    descricao: 'Elabore provas de 10 questoes com a IA, imprima e consulte o gabarito em separado.',
    destino: CAMINHOS.provas,
    acao: 'Abrir provas',
  },
]

export default function Inicio() {
  useTituloPagina('Inicio')
  const { escola } = useBoletimContext()

  return (
    <>
      <CabecalhoPagina
        titulo={escola.nome || 'Secretaria escolar'}
        descricao={`Ano letivo de ${escola.anoLetivo} — escolha uma area para comecar.`}
      />

      <nav className={estilos.opcoes} aria-label="Areas do sistema">
        {OPCOES.map((opcao) => (
          <Link key={opcao.numero} to={opcao.destino} className={estilos.opcao}>
            <span className={estilos.numero}>{opcao.numero}</span>
            <span className={estilos.area}>{opcao.area}</span>
            <span className={estilos.titulo}>{opcao.titulo}</span>
            <span className={estilos.descricao}>{opcao.descricao}</span>
            <span className={estilos.acao}>{opcao.acao} →</span>
          </Link>
        ))}
      </nav>
    </>
  )
}
