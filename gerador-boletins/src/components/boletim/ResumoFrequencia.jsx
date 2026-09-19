import { calcularMedia, calcularFrequencia, totalFaltas, situacaoFinal, calcularNotaNecessariaTri3 } from '@utils/calculos'
import { formatarNota, formatarPercentual } from '@utils/formatadores'
import { SITUACOES } from '@utils/constantes'
import estilos from './ResumoFrequencia.module.css'

export default function ResumoFrequencia({ boletim }) {
  const media = calcularMedia(boletim.notas)
  const frequencia = calcularFrequencia(boletim.notas)
  const situacao = situacaoFinal(boletim.notas)

  const metas = (boletim.notas ?? []).map((linha) => calcularNotaNecessariaTri3(linha))
  const aprovadas = metas.filter((m) => m.status === 'garantido' || m.status === 'concluido-aprovado').length
  const totalMaterias = (boletim.notas ?? []).length

  return (
    <section className={estilos.resumo}>
      <div className={estilos.bloco}>
        <span className={estilos.rotulo}>Media anual</span>
        <strong className={estilos.valorGrande}>{formatarNota(media)}</strong>
      </div>
      <div className={estilos.bloco}>
        <span className={estilos.rotulo}>Frequencia geral</span>
        <strong className={estilos.valor}>{formatarPercentual(frequencia)}</strong>
      </div>
      <div className={estilos.bloco}>
        <span className={estilos.rotulo}>Faltas totais</span>
        <strong className={estilos.valor}>{totalFaltas(boletim.notas)}</strong>
      </div>
      <div className={estilos.bloco}>
        <span className={estilos.rotulo}>Materias garantidas</span>
        <strong className={estilos.valor}>{aprovadas} de {totalMaterias}</strong>
      </div>
      <div className={estilos.bloco}>
        <span className={estilos.rotulo}>Situacao geral</span>
        <strong className={`${estilos.valor} ${estilos[situacao]}`}>{SITUACOES[situacao].rotulo}</strong>
      </div>
    </section>
  )
}
