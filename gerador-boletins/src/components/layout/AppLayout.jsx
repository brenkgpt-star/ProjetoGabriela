import { Outlet } from 'react-router-dom'
import MenuLateral from './MenuLateral'
import BarraSuperior from './BarraSuperior'
import estilos from './AppLayout.module.css'

export default function AppLayout() {
  return (
    <div className={estilos.moldura}>
      <MenuLateral />
      <div className={estilos.coluna}>
        <BarraSuperior />
        <main className={estilos.conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
