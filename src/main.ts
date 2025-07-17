import * as d3 from 'd3'
import {
  Agent,
  Params,
  defaultParams,
  initializePopulation,
  nextGeneration,
} from './model'
import {
  prepareRasterArray,
  drawRasterCanvas,
} from './viz/raster'
import {
  drawLorenzCurve,
  drawGiniTimeSeries,
  computeGini,
  drawHistogram,
} from './viz/plots'

type FeatureKey = 'meanAllele' | 'env' | 'educationScore' | 'income' | 'parentIncome'
type SliderKey = 'geneEnv' | 'envNoise' | 'finWeight' | 'finNoise' | 'homGene' | 'homEnv'

// **Use deep‐clone on defaultParams** so homophily is always an object
let params: Params = {
  ...defaultParams,
  homophily: { ...defaultParams.homophily }
}

let population: Agent[] = []
let historyGini: number[] = []
let generation = 0
let isRunning = false
const frameDelay = 750 // ms between generations

// DOM refs (assumes index.html has these IDs)
const startButton    = document.getElementById('start-btn')    as HTMLButtonElement
const pauseButton    = document.getElementById('pause-btn')    as HTMLButtonElement
const resetButton    = document.getElementById('reset-btn')    as HTMLButtonElement
const featureSelect  = document.getElementById('feature-select') as HTMLSelectElement
const stepBtn       = document.getElementById('step-btn')      as HTMLButtonElement
const statusEl      = document.getElementById('status')        as HTMLElement

const sliderGeneEnv  = document.getElementById('slider-gene-env')  as HTMLInputElement
const labelGeneEnv   = document.getElementById('label-gene-env')   as HTMLElement
const sliderEnvNoise = document.getElementById('slider-env-noise')as HTMLInputElement
const labelEnvNoise  = document.getElementById('label-env-noise') as HTMLElement
const sliderFinWeight   = document.getElementById('slider-fin-weight')  as HTMLInputElement
const labelFinWeight    = document.getElementById('label-fin-weight')   as HTMLElement
const sliderFinNoise  = document.getElementById('slider-fin-noise')  as HTMLInputElement
const labelFinNoise   = document.getElementById('label-fin-noise')   as HTMLElement
const sliderHomGene  = document.getElementById('slider-hom-gene')as HTMLInputElement
const labelHomGene   = document.getElementById('label-hom-gene') as HTMLElement
const sliderHomEnv   = document.getElementById('slider-hom-env')  as HTMLInputElement
const labelHomEnv    = document.getElementById('label-hom-env')   as HTMLElement


const canvas = document.getElementById('raster') as HTMLCanvasElement
const ctx = canvas.getContext('2d')!
if (!ctx) throw new Error('Canvas 2D context not available')
canvas.width = 400
canvas.height = 400

const lorenzSvg = d3.select('#lorenz') as d3.Selection<SVGSVGElement, unknown, null, undefined>
const giniSvg   = d3.select('#gini')   as d3.Selection<SVGSVGElement, unknown, null, undefined>
const histSvg = d3.select('#histogram') as d3.Selection<SVGSVGElement, unknown, null, undefined>
const histTitle = document.getElementById('hist-title')     as HTMLElement

// Helpers
function computeGrid(n: number): { rows: number; cols: number } {
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)
  return { rows, cols }
}

function bindSlider(
  slider: HTMLInputElement,
  label: HTMLElement,
  type: SliderKey,
  setter: (v: number) => void
) {
  const update = () => {
    const v = parseFloat(slider.value)
    setter(v)

    switch (type) {
      case 'geneEnv':
        label.textContent = `Env ${((1 - v)*100).toFixed(0)}% / ${(v*100).toFixed(0)}% Gene`;
        break;
      case 'finWeight':
        label.textContent = `Parent wealth ${((1 - v)*100).toFixed(0)}% / ${(v*100).toFixed(0)}% Education`;
        break;
      case 'homEnv':
      case 'homGene':
        label.textContent = `Random ${((1 - v)*100).toFixed(0)}% / ${(v*100).toFixed(0)}% Homophily`;
        break;
      case 'envNoise':
      case 'finNoise':
        label.textContent = `Normal(0, ${v.toFixed(2)})`;
      default:
        break;
    }
    if (type === 'geneEnv'){
      
    } 

    
  }
  slider.addEventListener('input', update)
  update()
}

const colorScales: Record<FeatureKey, d3.ScaleSequential<string>> = {
  meanAllele:  d3.scaleSequential(d3.interpolateViridis),
  env:      d3.scaleSequential(d3.interpolatePlasma),
  educationScore: d3.scaleSequential(d3.interpolateInferno),
  income:   d3.scaleSequential(d3.interpolateCividis),
  parentIncome: d3.scaleSequential(d3.interpolateMagma),
}

// Core routines
function reset() {
  // **Deep-clone here too** 
  params = {
    ...defaultParams,
    homophily: { ...defaultParams.homophily }
  }
  population = initializePopulation(params)
  historyGini.length = 0
  generation = 0

  // seed an initial Gini so drawGiniTimeSeries never sees an empty array
  const initialWealth = population.map(a => a.income)
  historyGini.push(computeGini(initialWealth))
  
  draw()
}

function tick() {
  population = nextGeneration(population, params)
  const wealthArray = population.map(a => a.income)
  historyGini.push(computeGini(wealthArray))
  generation += 1
  draw()
  if (isRunning) setTimeout(tick, frameDelay)
}

function draw() {
  // 1) Raster
  const featureKey = featureSelect.value as FeatureKey
  const rawArr = prepareRasterArray(population, featureKey)
    
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const { rows, cols } = computeGrid(rawArr.length)
  const [minV, maxV] = d3.extent(rawArr) as [number, number]
  colorScales[featureKey].domain([minV, maxV])

  drawRasterCanvas(canvas, rawArr, rows, cols, colorScales[featureKey])

  // 2) Lorenz & Gini
  drawLorenzCurve(lorenzSvg, population)
  drawGiniTimeSeries(giniSvg, historyGini)

  // 3) Histogram
  histTitle.textContent = `Distribution of ${featureKey}`
  drawHistogram(
    histSvg, 
    rawArr, 
    20, 
    ['income', 'educationScore'].includes(featureKey) ? true : false
  )

  // 4) Status
  const latestG = historyGini[historyGini.length - 1] ?? 0
  statusEl.textContent = `Gen: ${generation} | Gini: ${latestG.toFixed(2)} | Pop: ${population.length} | Feature: ${featureKey}`
}

startButton.addEventListener('click', () => {
  if (!isRunning) { isRunning = true; tick() }
})
pauseButton.addEventListener('click', () => { isRunning = false })
resetButton.addEventListener('click', () => { isRunning = false; reset() })
stepBtn.addEventListener('click', () => { if (!isRunning) tick() })
featureSelect.addEventListener('change', draw)

// slider bindings
bindSlider(sliderGeneEnv, labelGeneEnv, 'geneEnv', v => params.geneEnvWeight    = v)
bindSlider(sliderEnvNoise, labelEnvNoise, 'envNoise', v => params.envNoiseStd        = v)
bindSlider(sliderFinWeight, labelFinWeight, 'finWeight', v => params.financeWeight     = v)
bindSlider(sliderFinNoise, labelFinNoise, 'finNoise', v => params.financeNoise      = v)
bindSlider(sliderHomGene, labelHomGene, 'homGene', v => params.homophily.gene    = v)
bindSlider(sliderHomEnv, labelHomEnv, 'homEnv', v => params.homophily.env     = v)

// feature dropdown
;(function initFeatures() {
  ;( ['meanAllele','env','educationScore','income','parentIncome'] as FeatureKey[] )
    .forEach(key => {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = key
      featureSelect.appendChild(opt)
    })
  featureSelect.value = 'income'
})()

// kick it off
reset()

