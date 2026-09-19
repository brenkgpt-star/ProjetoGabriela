import { useBoletimContext } from '@hooks/useBoletimContext'
import { formatarNota } from '@utils/formatadores'
import {
  mediaDisciplina,
  situacaoPorNota,
  calcularNotaNecessariaTri3,
  calcularFaltasDisciplina,
  recuperacaoSubstituiu,
} from '@utils/calculos'
import { SITUACOES, TRIMESTRES } from '@utils/constantes'
import estilos from './TabelaNotas.module.css'

export default function TabelaNotas({ notas = [] }) {
  const { disciplinas } = useBoletimContext()

  return (
    <div className={estilos.envoltorio}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            <th className={estilos.colDisciplina}>Disciplina</th>
            {TRIMESTRES.flatMap((trimestre) => [
              <th key={`tri-${trimestre.valor}`} className={estilos.colTri}>
                {trimestre.curto}
              </th>,
              <th key={`rec-${trimestre.valor}`} className={`${estilos.colTri} ${estilos.colRec}`}>
                Rec {trimestre.valor}
              </th>,
            ])}
            <th className={estilos.colMedia}>Media</th>
            <th className={estilos.colMeta}>Meta 3o Tri</th>
            <th className={estilos.colFaltas}>Faltas / Saldo</th>
            <th className={estilos.colSituacao}>Situacao</th>
          </tr>
        </thead>
        <tbody>
          {notas.map((linha, indice) => {
            const disciplina = disciplinas.find((item) => item.id === linha.disciplinaId)
            const professor = disciplina?.professor ?? linha.professor
            const media = mediaDisciplina(linha)
            const semMedia = media === null
            const situacao = situacaoPorNota(media ?? 0)
            const metaTri3 = calcularNotaNecessariaTri3(linha)
            const faltasInfo = calcularFaltasDisciplina(linha, disciplina?.cargaHoraria)

            return (
              <tr key={linha.disciplinaId ?? indice}>
                <td className={estilos.colDisciplina}>
                  <div className={estilos.nomeDisciplina}>{disciplina?.nome ?? linha.disciplinaNome}</div>
                  {professor && <span className={estilos.professorSubtitulo}>Prof. {professor}</span>}
                </td>
                {TRIMESTRES.flatMap((trimestre) => {
                  const nota = linha[trimestre.campoNota]
                  const rec = linha[trimestre.campoRec]
                  const substituida = recuperacaoSubstituiu(nota, rec)
                  const temRec = rec !== null && rec !== undefined
                  return [
                    <td key={trimestre.campoNota} className={estilos.colTri}>
                      <span
                        className={[
                          nota === null || nota === undefined ? estilos.notaVazia : '',
                          substituida ? estilos.notaSubstituida : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        title={substituida ? `Substituida pela recuperacao (${formatarNota(rec)})` : undefined}
                      >
                        {formatarNota(nota)}
                      </span>
                    </td>,
                    <td key={trimestre.campoRec} className={`${estilos.colTri} ${estilos.colRec}`}>
                      <span
                        className={[
                          !temRec ? estilos.notaVazia : '',
                          substituida ? estilos.notaRecuperada : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        title={
                          substituida
                            ? `Recuperacao paralela substituiu o ${trimestre.curto}`
                            : temRec
                              ? 'Recuperacao paralela (nao superou a nota do trimestre)'
                              : 'Sem recuperacao paralela'
                        }
                      >
                        {formatarNota(rec)}
                      </span>
                    </td>,
                  ]
                })}
                <td className={`${estilos.colMedia} ${semMedia ? '' : estilos[situacao]}`}>
                  <strong>{formatarNota(media)}</strong>
                </td>
                <td className={estilos.colMeta}>
                  <span
                    className={`${estilos.tagMeta} ${estilos['meta_' + metaTri3.status]}`}
                    title={metaTri3.detalhe}
                  >
                    {metaTri3.texto}
                  </span>
                </td>
                <td className={estilos.colFaltas}>
                  <div className={estilos.celulaFaltas}>
                    <span className={estilos.numFaltas}>{linha.faltas ?? 0}</span>
                    <span
                      className={`${estilos.tagFaltas} ${estilos['faltas_' + faltasInfo.status]}`}
                      title={`Limite legal: ${faltasInfo.limite} faltas. ${faltasInfo.texto}`}
                    >
                      {faltasInfo.status === 'excedido'
                        ? `-${Math.abs(faltasInfo.restantes)}`
                        : `+${faltasInfo.restantes} restam`}
                    </span>
                  </div>
                </td>
                <td className={estilos.colSituacao}>
                  <span className={`${estilos.tagSituacao} ${estilos['sit_' + situacao]}`}>
                    {semMedia ? '--' : SITUACOES[situacao].rotulo}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className={estilos.legendaRec}>
        Media por disciplina usa a nota efetiva: vale o maior entre o trimestre e a recuperacao
        paralela (padrao SIGAA/IFC Concordia).
      </p>
    </div>
  )
}
