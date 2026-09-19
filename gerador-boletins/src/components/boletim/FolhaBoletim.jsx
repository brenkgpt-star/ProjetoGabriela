import CabecalhoEscola from './CabecalhoEscola'
import TabelaNotas from './TabelaNotas'
import ResumoFrequencia from './ResumoFrequencia'
import estilos from './FolhaBoletim.module.css'

// A folha imita o documento impresso que a secretaria entrega ao responsavel.
export default function FolhaBoletim({ boletim, escola }) {
  return (
    <article className={`${estilos.folha} folha-impressao`}>
      <CabecalhoEscola escola={escola} boletim={boletim} />
      <TabelaNotas notas={boletim.notas} />
      <ResumoFrequencia boletim={boletim} />

      <section className={estilos.observacoes}>
        <h3 className={estilos.rotuloSecao}>Observacoes do conselho</h3>
        <p className={estilos.textoObservacao}>
          {boletim.observacoes || 'Sem registros para este periodo.'}
        </p>
      </section>

      <footer className={estilos.assinaturas}>
        <div className={estilos.linhaAssinatura}>
          <span>{escola.diretora}</span>
          <small>Direcao</small>
        </div>
        <div className={estilos.linhaAssinatura}>
          <span>{boletim.turma?.regente}</span>
          <small>Professor regente</small>
        </div>
        <div className={estilos.linhaAssinatura}>
          <span>{boletim.aluno?.responsavel}</span>
          <small>Responsavel</small>
        </div>
      </footer>
    </article>
  )
}
