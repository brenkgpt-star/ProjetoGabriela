import GraficoProva from './GraficoProva'
import estilos from './FolhaProva.module.css'

const LETRAS = ['A', 'B', 'C', 'D']

// A folha segue o padrao de documento impresso: cabecalho, instrucoes,
// questoes e (separado) o gabarito para o professor.
export default function FolhaProva({ prova, escola, mostrarGabarito = false }) {
  const total = prova.questoes.reduce((soma, questao) => soma + (questao.valor ?? 1), 0)

  return (
    <>
      <article className={`${estilos.folha} folha-impressao bloco-prova`}>
        <header className={estilos.cabecalho}>
          <p className={estilos.escola}>{escola.nome}</p>
          <h2 className={estilos.titulo}>{prova.titulo}</h2>
          <p className={estilos.linhaInfo}>
            <span>
              Materia: <strong>{prova.materia}</strong>
            </span>
            {prova.turma && (
              <span>
                Turma: <strong>{prova.turma}</strong>
              </span>
            )}
            <span>
              Valor: <strong>{total.toFixed(1).replace('.', ',')}</strong>
            </span>
          </p>
          <p className={estilos.linhaInfo}>
            <span className={estilos.preencher}>
              Nome: <span className={estilos.traco} />
            </span>
            <span className={estilos.preencherCurto}>
              Data: <span className={estilos.traco} />
            </span>
          </p>
        </header>

        {prova.instrucoes && <p className={estilos.instrucoes}>{prova.instrucoes}</p>}

        {prova.conteudos?.length > 0 && (
          <p className={estilos.conteudos}>
            Conteudos: {prova.conteudos.join(' • ')}
          </p>
        )}

        <ol className={estilos.questoes}>
          {prova.questoes.map((questao, indice) => (
            <li key={indice} className={estilos.questao}>
              <p className={estilos.enunciado}>
                <strong>{indice + 1}. </strong>
                {questao.enunciado}
                <span className={estilos.valor}> ({(questao.valor ?? 1).toFixed(1).replace('.', ',')})</span>
              </p>
              {questao.grafico && <GraficoProva grafico={questao.grafico} />}
              <ol type="a" className={estilos.alternativas}>
                {questao.alternativas.map((texto, letra) => (
                  <li key={letra}>
                    <span className={estilos.marcador}>{LETRAS[letra].toLowerCase()})</span> {texto}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ol>
      </article>

      {mostrarGabarito && (
        <article className={`${estilos.folha} ${estilos.gabarito} folha-impressao bloco-gabarito`}>
          <h2 className={estilos.tituloGabarito}>Gabarito — uso do professor</h2>
          <p className={estilos.subGabarito}>
            {prova.titulo} • {prova.materia}
            {prova.turma ? ` • ${prova.turma}` : ''} — nao acompanha a impressao da prova.
          </p>
          <ol className={estilos.listaGabarito}>
            {prova.questoes.map((questao, indice) => (
              <li key={indice}>
                <strong>{indice + 1}.</strong> Letra {LETRAS[questao.resposta]}
              </li>
            ))}
          </ol>
        </article>
      )}
    </>
  )
}
