// src/model.test.ts
import { describe, it, expect } from 'vitest'
import {
  defaultParams,
  initializePopulation,
  computeEducationScore,
  computeFinancialScore,
  selectMatingPool,
  mate,
  nextGeneration,
  Agent,
  Params
} from './model'

// Helper to fix random for deterministic tests
function seedRandom(values: number[]) {
  let i = 0
  // @ts-ignore
  global.Math.random = () => values[i++ % values.length]
}

describe('Core model functions', () => {
  it('defaultParams returns valid defaults', () => {
    const p = defaultParams()
    expect(p.populationSize).toBeGreaterThan(0)
    expect(p.geneVsEnvWeight).toBeGreaterThanOrEqual(0)
    expect(p.geneVsEnvWeight).toBeLessThanOrEqual(1)
    expect(p.homophilyGene).toBeGreaterThanOrEqual(0)
    expect(p.homophilyEnv).toBeLessThanOrEqual(1)
  })

  it('initializePopulation creates correct number of agents with valid fields', () => {
    const p = defaultParams()
    p.populationSize = 10
    const pop = initializePopulation(p)
    expect(pop).toHaveLength(10)
    pop.forEach(agent => {
      expect(agent.alleles).toHaveLength(2)
      expect(agent.alleles[0]).toBeGreaterThanOrEqual(0)
      expect(agent.alleles[0]).toBeLessThanOrEqual(1)
      expect(agent.env).toBeGreaterThanOrEqual(0)
      expect(agent.env).toBeLessThanOrEqual(1)
      expect(agent.educationScore).toBe(0)
      expect(agent.financialScore).toBe(0)
    })
  })

  it('computeEducationScore respects geneVsEnvWeight', () => {
    const p = defaultParams()
    p.geneVsEnvWeight = 1
    const agent: Agent = { id: 0, alleles: [0.2, 0.8], env: 0.5, educationScore: 0, financialScore: 0 }
    const score = computeEducationScore(agent, p)
    expect(score).toBeCloseTo((0.2 + 0.8) / 2)
  })

  it('computeFinancialScore uses only education if no parents', () => {
    const p = defaultParams()
    p.eduToFinanceWeight = 0.7
    p.parentFinanceWeight = 0.3
    const agent: Agent = { id: 0, alleles: [0, 0], env: 0, educationScore: 0.6, financialScore: 0 }
    const fin = computeFinancialScore(agent, [], p)
    expect(fin).toBeCloseTo(0.7 * 0.6)
  })

  it('selectMatingPool returns N/2 pairs and uses homophily weighting', () => {
    // Create deterministic pop with two distinct agents
    const p = defaultParams()
    p.populationSize = 4
    const pop: Agent[] = [
      { id: 0, alleles: [0, 0], env: 0, educationScore: 0, financialScore: 0 },
      { id: 1, alleles: [1, 1], env: 1, educationScore: 0, financialScore: 0 },
      { id: 2, alleles: [0, 0], env: 0, educationScore: 0, financialScore: 0 },
      { id: 3, alleles: [1, 1], env: 1, educationScore: 0, financialScore: 0 }
    ]
    p.homophilyGene = 10 // strong homophily
    p.homophilyEnv = 10
    seedRandom([0.1, 0.9, 0.2, 0.8])
    const pairs = selectMatingPool(pop, p)
    expect(pairs).toHaveLength(2)
    pairs.forEach(([a, b]) => {
      // each pair should be similar
      expect(Math.abs(a.env - b.env)).toBeLessThan(0.5)
    })
  })

  it('mate produces two children with inherited alleles and env around parents average', () => {
    const p = defaultParams()
    p.envNoiseStd = 0
    p.envIntervention = 0
    const parentA: Agent = { id: 0, alleles: [0, 0], env: 0, educationScore: 0, financialScore: 10 }
    const parentB: Agent = { id: 1, alleles: [1, 1], env: 0, educationScore: 0, financialScore: 20 }
    parentA.financialScore = 10
    parentB.financialScore = 20
    const children = mate([parentA, parentB], p)
    expect(children).toHaveLength(2)
    children.forEach(child => {
      // allele should be either 0 or 1
      expect([0, 1]).toContain(child.alleles[0])
      expect([0, 1]).toContain(child.alleles[1])
      // env should equal average finance 15
      expect(child.env).toBeCloseTo((10 + 20) / 2)
    })
  })

  it('nextGeneration maintains population size and updates scores', () => {
    const p = defaultParams()
    p.populationSize = 6
    const pop = initializePopulation(p)
    // seed parents with simple finance for predictable env
    pop.forEach((a, i) => { a.financialScore = i })
    seedRandom(Array(pop.length * 2).fill(0.5))
    const next = nextGeneration(pop, p)
    expect(next).toHaveLength(6)
    next.forEach(agent => {
      expect(agent.educationScore).toBeGreaterThanOrEqual(0)
      expect(agent.financialScore).toBeGreaterThanOrEqual(0)
    })
  })
})
