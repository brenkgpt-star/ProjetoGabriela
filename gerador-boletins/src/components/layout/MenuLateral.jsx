import { NavLink } from 'react-router-dom'
import { CAMINHOS } from '@/routes/caminhos'
import { useBoletimContext } from '@hooks/useBoletimContext'
import estilos from './MenuLateral.module.css'

const itens = [
  { para: CAMINHOS.painel, rotulo: 'Painel', fim: true },
  { para: CAMINHOS.boletins, rotulo: 'Boletins' },
  { para: CAMINHOS.lerBoletim, rotulo: 'Ler boletim' },
  { para: CAMINHOS.alunos, rotulo: 'Alunos' },
  { para: CAMINHOS.turmas, rotulo: 'Turmas' },
  { para: CAMINHOS.configuracoes, rotulo: 'Configuracoes' },
]

export default function MenuLateral() {
  const { escola } = useBoletimContext()

  return (
    <aside className={`${estilos.menu} nao-imprimir`}>
      <div className={estilos.marca}>
        <span className={estilos.selo}>{escola.anoLetivo}</span>
        <p className={estilos.nomeEscola}>{escola.nome}</p>
      </div>

      <nav className={estilos.navegacao}>
        {itens.map((item) => (
          <NavLink
            key={item.para}
            to={item.para}
            end={item.fim}
            className={({ isActive }) => `${estilos.item} ${isActive ? estilos.ativo : ''}`}
          >
            {item.rotulo}
          </NavLink>
        ))}
      </nav>

      <footer className={estilos.rodape}>
        <p className={estilos.assinatura}>Secretaria escolar</p>
        <p className={estilos.usuario}>{escola.secretario}</p>
      </footer>
    </aside>
  )
}
