// Catalogo de graficos em SVG/tabela para questoes (foco inicial em termologia:
// curvas de aquecimento, escalas termometricas, calorimetria).
// Tudo vetorial: nitido na tela e na impressao, sem imagem externa.

function Moldura({ titulo, unidade, children, largura = 420, altura = 230 }) {
  return (
    <figure style={{ margin: '8px 0', maxWidth: largura }}>
      {(titulo || unidade) && (
        <figcaption style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 4 }}>
          {titulo}
          {unidade ? ` (${unidade})` : ''}
        </figcaption>
      )}
      <svg viewBox={`0 0 ${largura} ${altura}`} width="100%" role="img" aria-label={titulo || 'Grafico da questao'}>
        {children}
      </svg>
    </figure>
  )
}

function Eixos({ margem, largura, altura, teto }) {
  const baseY = altura - margem.fundo
  return (
    <g>
      <line x1={margem.esquerda} y1={margem.topo} x2={margem.esquerda} y2={baseY} stroke="#000" strokeWidth="1.5" />
      <line x1={margem.esquerda} y1={baseY} x2={largura - margem.direita} y2={baseY} stroke="#000" strokeWidth="1.5" />
      {[0.5, 1].map((fator) => {
        const y = margem.topo + (altura - margem.topo - margem.fundo) * (1 - fator)
        return (
          <g key={fator}>
            <line
              x1={margem.esquerda}
              y1={y}
              x2={largura - margem.direita}
              y2={y}
              stroke="#94a3b8"
              strokeWidth="0.75"
              strokeDasharray="4 3"
            />
            <text x={margem.esquerda - 6} y={y + 4} fontSize="10" textAnchor="end">
              {(teto * fator).toFixed(teto * fator < 10 ? 1 : 0).replace('.', ',')}
            </text>
          </g>
        )
      })}
    </g>
  )
}

function BarrasLinha({ grafico }) {
  const largura = 420
  const altura = 220
  const margem = { esquerda: 44, direita: 12, topo: 28, fundo: 44 }
  const areaLargura = largura - margem.esquerda - margem.direita
  const areaAltura = altura - margem.topo - margem.fundo
  const maximo = Math.max(...grafico.valores, 0)
  const teto = maximo === 0 ? 1 : maximo * 1.15
  const n = grafico.valores.length
  const passo = areaLargura / n
  const paraX = (indice) => margem.esquerda + passo * indice + passo / 2
  const paraY = (valor) => margem.topo + areaAltura - (valor / teto) * areaAltura
  const baseY = margem.topo + areaAltura
  const pontos = grafico.valores.map((valor, indice) => `${paraX(indice)},${paraY(valor)}`).join(' ')

  return (
    <Moldura titulo={grafico.titulo} unidade={grafico.unidade} largura={largura} altura={altura}>
      <Eixos margem={margem} largura={largura} altura={altura} teto={teto} />
      {grafico.tipo === 'linha' && <polyline points={pontos} fill="none" stroke="#1d4ed8" strokeWidth="2.5" />}
      {grafico.valores.map((valor, indice) => (
        <g key={indice}>
          {grafico.tipo === 'barras' && (
            <rect
              x={paraX(indice) - passo * 0.3}
              y={paraY(valor)}
              width={passo * 0.6}
              height={Math.max(1, baseY - paraY(valor))}
              fill="#334155"
            />
          )}
          {grafico.tipo === 'linha' && <circle cx={paraX(indice)} cy={paraY(valor)} r="4" fill="#1d4ed8" />}
          <text x={paraX(indice)} y={baseY + 16} fontSize="10" textAnchor="middle">
            {grafico.rotulos[indice]}
          </text>
          <text x={paraX(indice)} y={paraY(valor) - 6} fontSize="10" fontWeight="600" textAnchor="middle">
            {String(valor).replace('.', ',')}
          </text>
        </g>
      ))}
    </Moldura>
  )
}

// Curva de aquecimento/resfriamento (termologia): destaca os patamares de
// fusao/ebulicao (trechos de temperatura constante) com faixa tracejada.
function Aquecimento({ grafico }) {
  const largura = 420
  const altura = 230
  const margem = { esquerda: 44, direita: 12, topo: 28, fundo: 52 }
  const areaLargura = largura - margem.esquerda - margem.direita
  const areaAltura = altura - margem.topo - margem.fundo
  const minimo = Math.min(...grafico.valores, 0)
  const maximo = Math.max(...grafico.valores, 0)
  const teto = maximo === 0 ? 1 : maximo * 1.15
  const piso = minimo < 0 ? minimo * 1.15 : 0
  const n = grafico.valores.length
  const passo = areaLargura / Math.max(1, n - 1)
  const paraX = (indice) => margem.esquerda + passo * indice
  const paraY = (valor) => margem.topo + areaAltura - ((valor - piso) / (teto - piso)) * areaAltura
  const baseY = margem.topo + areaAltura
  const pontos = grafico.valores.map((valor, indice) => `${paraX(indice)},${paraY(valor)}`).join(' ')

  // Trechos de temperatura constante = mudanca de estado fisico.
  const patamares = []
  let inicio = 0
  for (let i = 1; i <= n; i += 1) {
    if (i === n || grafico.valores[i] !== grafico.valores[inicio]) {
      if (i - inicio >= 2) patamares.push({ de: inicio, ate: i - 1, temp: grafico.valores[inicio] })
      inicio = i
    }
  }

  return (
    <Moldura titulo={grafico.titulo} unidade={grafico.unidade} largura={largura} altura={altura}>
      <Eixos margem={margem} largura={largura} altura={altura} teto={teto} />
      {patamares.map((patamar, indice) => (
        <g key={indice}>
          <rect
            x={paraX(patamar.de)}
            y={paraY(patamar.temp) - 12}
            width={Math.max(2, paraX(patamar.ate) - paraX(patamar.de))}
            height={24}
            fill="none"
            stroke="#b45309"
            strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <text
            x={(paraX(patamar.de) + paraX(patamar.ate)) / 2}
            y={paraY(patamar.temp) - 16}
            fontSize="10"
            fontWeight="600"
            textAnchor="middle"
            fill="#92400e"
          >
            {String(patamar.temp).replace('.', ',')}°
          </text>
        </g>
      ))}
      <polyline points={pontos} fill="none" stroke="#b91c1c" strokeWidth="2.5" />
      {grafico.valores.map((valor, indice) => (
        <g key={indice}>
          <circle cx={paraX(indice)} cy={paraY(valor)} r="3.5" fill="#b91c1c" />
          <text x={paraX(indice)} y={baseY + 16} fontSize="10" textAnchor="middle">
            {grafico.rotulos[indice]}
          </text>
        </g>
      ))}
    </Moldura>
  )
}

// Escalas termometricas lado a lado (Celsius, Fahrenheit, Kelvin) com
// marcas de correspondencia alinhadas.
function Escalas({ grafico }) {
  const largura = 420
  const altura = 240
  const topo = 30
  const base = 200
  const eixos = [
    { x: 90, simbolo: '°C', chave: 'c' },
    { x: 210, simbolo: '°F', chave: 'f' },
    { x: 330, simbolo: 'K', chave: 'k' },
  ]
  const valoresC = grafico.marcas.map((marca) => Number(marca.c))
  const min = Math.min(...valoresC)
  const max = Math.max(...valoresC)
  const paraY = (c) => (max === min ? (topo + base) / 2 : base - ((c - min) / (max - min)) * (base - topo))

  return (
    <Moldura titulo={grafico.titulo} unidade={grafico.unidade} largura={largura} altura={altura}>
      {eixos.map((eixo) => (
        <g key={eixo.chave}>
          <line x1={eixo.x} y1={topo - 8} x2={eixo.x} y2={base + 8} stroke="#000" strokeWidth="2" />
          <text x={eixo.x} y={18} fontSize="12" fontWeight="700" textAnchor="middle">
            {eixo.simbolo}
          </text>
        </g>
      ))}
      {grafico.marcas.map((marca, indice) => {
        const y = paraY(Number(marca.c))
        return (
          <g key={indice}>
            <line x1={70} y1={y} x2={350} y2={y} stroke="#94a3b8" strokeWidth="0.75" strokeDasharray="4 3" />
            {eixos.map((eixo) => (
              <g key={eixo.chave}>
                <line x1={eixo.x - 8} y1={y} x2={eixo.x + 8} y2={y} stroke="#000" strokeWidth="2" />
                <text x={eixo.x} y={y - 7} fontSize="11" fontWeight="600" textAnchor="middle">
                  {String(marca[eixo.chave]).replace('.', ',')}
                </text>
              </g>
            ))}
          </g>
        )
      })}
    </Moldura>
  )
}

// Grafico de setores (pizza) com percentuais na legenda.
function Pizza({ grafico }) {
  const tamanho = 220
  const centro = tamanho / 2
  const raio = 85
  const total = grafico.valores.reduce((soma, valor) => soma + valor, 0) || 1
  const tons = ['#1e3a5f', '#475569', '#94a3b8', '#cbd5e1', '#0f766e', '#b45309', '#b91c1c', '#6d28d9']
  let angulo = -Math.PI / 2
  const fatias = grafico.valores.map((valor, indice) => {
    const fracao = valor / total
    const inicio = angulo
    angulo += fracao * Math.PI * 2
    const x1 = centro + raio * Math.cos(inicio)
    const y1 = centro + raio * Math.sin(inicio)
    const x2 = centro + raio * Math.cos(angulo)
    const y2 = centro + raio * Math.sin(angulo)
    return { indice, valor, fracao, d: `M ${centro} ${centro} L ${x1} ${y1} A ${raio} ${raio} 0 ${fracao > 0.5 ? 1 : 0} 1 ${x2} ${y2} Z` }
  })

  return (
    <figure style={{ margin: '8px 0', maxWidth: 420 }}>
      {grafico.titulo && (
        <figcaption style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 4 }}>
          {grafico.titulo}
        </figcaption>
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <svg viewBox={`0 0 ${tamanho} ${tamanho}`} width={tamanho} role="img" aria-label={grafico.titulo || 'Grafico de setores'}>
          {fatias.map((fatia) => (
            <path key={fatia.indice} d={fatia.d} fill={tons[fatia.indice % tons.length]} stroke="#fff" strokeWidth="2" />
          ))}
        </svg>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', fontSize: 12 }}>
          {fatias.map((fatia) => (
            <li key={fatia.indice} style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  background: tons[fatia.indice % tons.length],
                  marginRight: 6,
                }}
              />
              {grafico.rotulos[fatia.indice]} — {(fatia.fracao * 100).toFixed(1).replace('.', ',')}%
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

// Ciclo termodinamico (p x V e similares): poligono fechado com vertices
// rotulados (A, B, C, D), setas no sentido do ciclo e area interna sombreada.
// Com "suave": true, os trechos saem curvos (isotermas/adiabaticas).
function Ciclo({ grafico }) {
  const largura = 420
  const altura = 250
  const margem = { esquerda: 52, direita: 16, topo: 24, fundo: 48 }
  const xs = grafico.pontos.map((ponto) => ponto.x)
  const ys = grafico.pontos.map((ponto) => ponto.y)
  let minX = Math.min(...xs)
  let maxX = Math.max(...xs)
  let minY = Math.min(...ys)
  let maxY = Math.max(...ys)
  if (maxX === minX) maxX = minX + 1
  if (maxY === minY) maxY = minY + 1
  const folgaX = (maxX - minX) * 0.15
  const folgaY = (maxY - minY) * 0.15
  minX -= folgaX
  maxX += folgaX
  minY -= folgaY
  maxY += folgaY
  const paraX = (x) => margem.esquerda + ((x - minX) / (maxX - minX)) * (largura - margem.esquerda - margem.direita)
  const paraY = (y) => margem.topo + (1 - (y - minY) / (maxY - minY)) * (altura - margem.topo - margem.fundo)
  const baseY = altura - margem.fundo
  const px = grafico.pontos.map((ponto) => ({ x: paraX(ponto.x), y: paraY(ponto.y), rotulo: ponto.rotulo }))

  const n = px.length
  let contorno = ''
  if (grafico.suave) {
    contorno = `M ${px[0].x} ${px[0].y}`
    for (let i = 0; i < n; i += 1) {
      const p0 = px[(i - 1 + n) % n]
      const p1 = px[i]
      const p2 = px[(i + 1) % n]
      const p3 = px[(i + 2) % n]
      const c1x = p1.x + (p2.x - p0.x) / 6
      const c1y = p1.y + (p2.y - p0.y) / 6
      const c2x = p2.x - (p3.x - p1.x) / 6
      const c2y = p2.y - (p3.y - p1.y) / 6
      contorno += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
    }
    contorno += ' Z'
  } else {
    contorno = `M ${px.map((ponto) => `${ponto.x} ${ponto.y}`).join(' L ')} Z`
  }

  // Seta no meio de cada trecho, apontando o sentido do ciclo.
  const setas = px.map((ponto, indice) => {
    const proximo = px[(indice + 1) % n]
    const meioX = (ponto.x + proximo.x) / 2
    const meioY = (ponto.y + proximo.y) / 2
    const angulo = (Math.atan2(proximo.y - ponto.y, proximo.x - ponto.x) * 180) / Math.PI
    return { x: meioX, y: meioY, angulo, chave: indice }
  })

  return (
    <Moldura titulo={grafico.titulo} unidade={grafico.unidade} largura={largura} altura={altura}>
      <line x1={margem.esquerda} y1={margem.topo - 6} x2={margem.esquerda} y2={baseY} stroke="#000" strokeWidth="1.5" />
      <line x1={margem.esquerda} y1={baseY} x2={largura - margem.direita + 6} y2={baseY} stroke="#000" strokeWidth="1.5" />
      <polygon
        points={`${margem.esquerda - 5},${margem.topo - 6} ${margem.esquerda + 5},${margem.topo - 6} ${margem.esquerda},${margem.topo - 14}`}
        fill="#000"
      />
      <polygon
        points={`${largura - margem.direita + 6},${baseY - 5} ${largura - margem.direita + 6},${baseY + 5} ${largura - margem.direita + 14},${baseY}`}
        fill="#000"
      />
      <text x={margem.esquerda - 10} y={margem.topo - 16} fontSize="12" fontWeight="700" textAnchor="middle">
        {grafico.eixoY || 'p'}
      </text>
      <text x={largura - margem.direita + 16} y={baseY + 4} fontSize="12" fontWeight="700" textAnchor="start">
        {grafico.eixoX || 'V'}
      </text>
      <path d={contorno} fill="#f1f5f9" stroke="#b91c1c" strokeWidth="2.5" />
      {setas.map((seta) => (
        <polygon
          key={seta.chave}
          points="-7,-4 7,0 -7,4"
          transform={`translate(${seta.x} ${seta.y}) rotate(${seta.angulo})`}
          fill="#b91c1c"
        />
      ))}
      {px.map((ponto, indice) => (
        <g key={indice}>
          <circle cx={ponto.x} cy={ponto.y} r="4" fill="#000" />
          <text x={ponto.x + 8} y={ponto.y - 8} fontSize="12" fontWeight="700">
            {ponto.rotulo || ''}
          </text>
        </g>
      ))}
    </Moldura>
  )
}

// Tabela de dados (calor especifico, medicoes, etc.).
function TabelaDados({ grafico }) {
  return (
    <figure style={{ margin: '8px 0', maxWidth: 480 }}>
      {grafico.titulo && (
        <figcaption style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', marginBottom: 4 }}>
          {grafico.titulo}
        </figcaption>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {grafico.colunas.map((coluna, indice) => (
              <th
                key={indice}
                style={{ border: '1px solid #000', padding: '4px 8px', background: '#f1f5f9', textAlign: 'center' }}
              >
                {coluna}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grafico.linhas.map((linha, i) => (
            <tr key={i}>
              {linha.map((celula, j) => (
                <td key={j} style={{ border: '1px solid #000', padding: '4px 8px', textAlign: 'center' }}>
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

export default function GraficoProva({ grafico }) {
  if (!grafico) return null
  switch (grafico.tipo) {
    case 'linha':
    case 'barras':
      return <BarrasLinha grafico={grafico} />
    case 'aquecimento':
      return <Aquecimento grafico={grafico} />
    case 'ciclo':
      return <Ciclo grafico={grafico} />
    case 'escalas':
      return <Escalas grafico={grafico} />
    case 'pizza':
      return <Pizza grafico={grafico} />
    case 'tabela':
      return <TabelaDados grafico={grafico} />
    default:
      return null
  }
}
