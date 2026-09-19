import { formatarData } from '@utils/formatadores'
import estilos from './CabecalhoEscola.module.css'

export default function CabecalhoEscola({ escola, boletim }) {
  return (
    <header className={estilos.cabecalho}>
      <div className={estilos.identificacao}>
        <h2 className={estilos.nome}>{escola.nome}</h2>
        <p className={estilos.endereco}>
          {escola.endereco} | {escola.telefone}
        </p>
      </div>

      <h1 className={estilos.tituloDocumento}>
        Boletim escolar - Ano letivo de {boletim.anoLetivo}
      </h1>

      <dl className={estilos.dados}>
        <div>
          <dt>Aluno</dt>
          <dd>{boletim.aluno?.nome}</dd>
        </div>
        <div>
          <dt>Matricula</dt>
          <dd>{boletim.aluno?.matricula}</dd>
        </div>
        <div>
          <dt>Turma</dt>
          <dd>
            {boletim.turma?.nome} - {boletim.turma?.turno}
          </dd>
        </div>
        <div>
          <dt>Emitido em</dt>
          <dd>{formatarData(boletim.emitidoEm)}</dd>
        </div>
      </dl>
    </header>
  )
}
