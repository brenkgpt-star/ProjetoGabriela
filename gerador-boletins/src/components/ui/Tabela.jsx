import estilos from './Tabela.module.css'

export default function Tabela({ colunas, dados, aoClicarLinha }) {
  return (
    <div className={estilos.rolagem}>
      <table className={estilos.tabela}>
        <thead>
          <tr>
            {colunas.map((coluna) => (
              <th key={coluna.chave} style={{ textAlign: coluna.alinhamento ?? 'left' }}>
                {coluna.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, indice) => (
            <tr
              key={linha.id ?? indice}
              onClick={aoClicarLinha ? () => aoClicarLinha(linha) : undefined}
              className={aoClicarLinha ? estilos.clicavel : undefined}
            >
              {colunas.map((coluna) => (
                <td key={coluna.chave} style={{ textAlign: coluna.alinhamento ?? 'left' }}>
                  {coluna.renderizar ? coluna.renderizar(linha) : linha[coluna.chave]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
