// src/viz/raster.ts
// Raster visualization: prepare data and draw agents in an income-ordered grid on HTML Canvas.

import { Agent } from '../model'

type ColorScale = (value: number) => string

/**
 * Sorts agents by financialScore and extracts the chosen feature into a flat array.
 * @param pop - current generation population
 * @param featureKey - key of Agent to visualize ('meanAllele', 'env', 'educationScore', 'financialScore')
 */
export function prepareRasterArray(
  pop: Agent[],
  featureKey: keyof Pick<Agent, 'meanAllele' | 'env' | 'educationScore' | 'income' | 'parentIncome'>
): number[] {
  const sorted = [...pop].sort((a, b) => - a.income + b.income)
  let featureValues = sorted.map(agent => agent[featureKey] as number)
  if (['income', 'parentIncome'].includes(featureKey)) {
    featureValues = featureValues.map(v => Math.log10(v + 1))
  }
  return featureValues
}

/**
 * Draws the raster grid on a canvas element.
 * @param canvas - target HTMLCanvasElement
 * @param data - flat array of feature values (length <= rows*cols)
 * @param rows - number of grid rows
 * @param cols - number of grid columns
 * @param colorScale - function mapping feature value to CSS color
 */
export function drawRasterCanvas(
  canvas: HTMLCanvasElement,
  data: number[],
  rows: number,
  cols: number,
  colorScale: ColorScale,
  log: boolean = false,
): void {

  const ctx = canvas.getContext('2d')!
  const cw = canvas.width / cols
  const ch = canvas.height / rows
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  data.forEach((value, idx) => {
    const r = Math.floor(idx / cols)
    const c = idx % cols
    ctx.fillStyle = colorScale(value)
    ctx.fillRect(c * cw, r * ch, cw, ch)
  })
}
