// src/viz/plots.ts
import * as d3 from 'd3'
import { Agent } from '../model'

/**
 * Compute the Lorenz curve points for a given population.
 * Returns an array of [cumulative population proportion, cumulative wealth proportion].
 */
export function computeLorenz(pop: Agent[]): [number, number][] {
  const sorted = [...pop].sort((a, b) => a.wealth - b.wealth)
  const N = sorted.length
  const totalWealth = d3.sum(sorted, d => d.wealth) || 0
  let cumWealth = 0

  // start at (0,0)
  const points: [number, number][] = [[0, 0]]

  sorted.forEach((d, i) => {
    cumWealth += d.wealth
    points.push([
      (i + 1) / N,
      totalWealth > 0 ? cumWealth / totalWealth : 0
    ])
  })

  return points
}

/**
 * Compute the Gini coefficient from an array of wealth values.
 * Gini = 1 - 2 * ∫₀¹ L(p) dp, approximated via the trapezoid rule on the Lorenz curve.
 */
export function computeGini(wealth: number[]): number {
  const N = wealth.length
  if (N === 0) return 0

  // reuse computeLorenz but only need the y-values
  const lorenz = computeLorenz(
    wealth.map(w => ({ wealth: w } as Agent))
  )

  // trapezoidal integration
  let area = 0
  for (let i = 1; i < lorenz.length; i++) {
    const [x0, y0] = lorenz[i - 1]
    const [x1, y1] = lorenz[i]
    area += ((y0 + y1) / 2) * (x1 - x0)
  }

  return 1 - 2 * area
}

/**
 * Draw a Lorenz curve into the given SVG element.
 * Assumes svg has explicit width & height attributes.
 */
export function drawLorenzCurve(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  pop: Agent[]
) {
  const width  = +svg.attr('width')
  const height = +svg.attr('height')
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  // clear previous
  svg.selectAll('*').remove()

  // compute data
  const data = computeLorenz(pop)

  // scales
  const x = d3.scaleLinear().domain([0, 1]).range([0, innerW])
  const y = d3.scaleLinear().domain([0, 1]).range([innerH, 0])

  // container
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // equality line
  g.append('line')
    .attr('x1', x(0)).attr('y1', y(0))
    .attr('x2', x(1)).attr('y2', y(1))
    .attr('stroke', '#999')
    .attr('stroke-dasharray', '4,4')

  // Lorenz curve
  const lineGen = d3.line<[number, number]>()
    .x(d => x(d[0]))
    .y(d => y(d[1]))

  g.append('path')
    .datum(data)
    .attr('d', lineGen as any)
    .attr('fill', 'none')
    .attr('stroke', 'tomato')
    .attr('stroke-width', 2)

  // axes
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(5))

  g.append('g')
    .call(d3.axisLeft(y).ticks(5))
}

/**
 * Draw a time series of Gini coefficients into the given SVG.
 * Assumes svg has explicit width & height attributes.
 */
export function drawGiniTimeSeries(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  history: number[]
) {
  const width  = +svg.attr('width')
  const height = +svg.attr('height')
  const margin = { top: 20, right: 20, bottom: 30, left: 40 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  svg.selectAll('*').remove()

  // scales: x = generation index, y = Gini [0,1]
  const x = d3.scaleLinear()
    .domain([0, Math.max(1, history.length - 1)])
    .range([0, innerW])

  const y = d3.scaleLinear()
    .domain([0, 1])
    .range([innerH, 0])

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // line generator
  const lineGen = d3.line<number>()
    .x((d, i) => x(i))
    .y(d => y(d))

  g.append('path')
    .datum(history)
    .attr('d', lineGen as any)
    .attr('fill', 'none')
    .attr('stroke', 'steelblue')
    .attr('stroke-width', 2)

  // axes
  g.append('g')
    .attr('transform', `translate(0,${innerH})`)
    .call(d3.axisBottom(x).ticks(5))

  g.append('g')
    .call(d3.axisLeft(y).ticks(5))
}

/** 
 * Draw a histogram of `data` into `svg`, with `binsCount` bins 
 */
export function drawHistogram(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  data: number[],
  binsCount = 20,
  log10 = false,
) {
  const width  = +svg.attr('width');
  const height = +svg.attr('height');
  const margin = { top: 20, right: 20, bottom: 75, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  svg.selectAll('*').remove();

  // X scale based on data extent
  
  const x = d3.scaleLinear()
    .domain(d3.extent(data) as [number, number])
    .nice()
    .range([0, innerW]);

  // Bin the data
  const bins = d3.bin<number>()
    .domain(x.domain() as [number, number])
    .thresholds(binsCount)
    (data);

  // Y scale on counts
  const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length) as number])
    .nice()
    .range([innerH, 0]);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Bars
  g.selectAll('rect')
    .data(bins)
    .enter().append('rect')
      .attr('x', d => x(d.x0 as number) + 1)
      .attr('y', d => y(d.length))
      .attr('width', d => Math.max(0, x(d.x1 as number) - x(d.x0 as number) - 1))
      .attr('height', d => innerH - y(d.length))
      .attr('fill', 'steelblue');
  if(log10) {
    // X axis
    const min = d3.min(data);
    const max = d3.max(data);
    const tickValues = d3.range(1, 15)
      .filter(d => d > min && d < max);
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x)
        .tickValues(tickValues)
        .tickFormat(d => d3.format(",")(Math.pow(10, d)))
      );
    g
    .selectAll("text")             // select the tick labels
      .attr("text-anchor", "end")  // anchor them at the end so they don’t overlap the tick line
      .attr("transform", "rotate(-45)")  // rotate by −45°
      .attr("dx", "-0.8em")        // shift them left a bit
      .attr("dy", "0.15em");       // shift them down a bit so they sit nicely
    } else {
    // X axis
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x).ticks(5));
  }


  // Y axis
  g.append('g')
    .call(d3.axisLeft(y).ticks(5));
}
