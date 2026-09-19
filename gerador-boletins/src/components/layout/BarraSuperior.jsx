import { useBoletimContext } from '@hooks/useBoletimContext'
import estilos from './BarraSuperior.module.css'

export default function BarraSuperior() {
  const { escola } = useBoletimContext()

  return (
    <header className={`${estilos.barra} nao-imprimir`}>
      <p className={estilos.periodo}>
        Ano letivo {escola.anoLetivo} - boletim anual por trimestres
      </p>
    </header>
  )
}
