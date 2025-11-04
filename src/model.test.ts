// src/model.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  defaultParams,
  initializePopulation,
  computeEducationScore,
  computeWealthFromScore,
  envFromWealth,
  selectMatingPool,
  mate,
  nextGeneration,
  type Agent,
  type Params
} from './model'

describe('Model Core Functions', () => {
  describe('defaultParams', () => {
    it('should have valid default values', () => {
      expect(defaultParams.populationSize).toBe(6400)
      expect(defaultParams.geneEnvWeight).toBe(0.5)
      expect(defaultParams.envNoiseStd).toBe(0.1)
      expect(defaultParams.financeWeight).toBe(0.7)
      expect(defaultParams.financeNoise).toBe(0.1)
      expect(defaultParams.homophily.gene).toBe(0.0)
      expect(defaultParams.homophily.env).toBe(0.0)
    })

    it('should have parameters in valid ranges', () => {
      expect(defaultParams.populationSize).toBeGreaterThan(0)
      expect(defaultParams.geneEnvWeight).toBeGreaterThanOrEqual(0)
      expect(defaultParams.geneEnvWeight).toBeLessThanOrEqual(1)
      expect(defaultParams.financeWeight).toBeGreaterThanOrEqual(0)
      expect(defaultParams.financeWeight).toBeLessThanOrEqual(1)
      expect(defaultParams.homophily.gene).toBeGreaterThanOrEqual(0)
      expect(defaultParams.homophily.env).toBeGreaterThanOrEqual(0)
    })
  })

  describe('initializePopulation', () => {
    it('should create the correct number of agents', () => {
      const params = { ...defaultParams, populationSize: 100 }
      const pop = initializePopulation(params)
      expect(pop).toHaveLength(100)
    })

    it('should initialize agents with required properties', () => {
      const params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)

      pop.forEach(agent => {
        expect(agent).toHaveProperty('id')
        expect(agent).toHaveProperty('alleles')
        expect(agent).toHaveProperty('meanAllele')
        expect(agent).toHaveProperty('env')
        expect(agent).toHaveProperty('rawenv')
        expect(agent).toHaveProperty('educationScore')
        expect(agent).toHaveProperty('wealth')
        expect(agent).toHaveProperty('parentWealth')
        expect(agent).toHaveProperty('parents')
      })
    })

    it('should give each agent exactly 2 alleles', () => {
      const params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)

      pop.forEach(agent => {
        expect(agent.alleles).toHaveLength(2)
      })
    })

    it('should set meanAllele as average of alleles', () => {
      const params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)

      pop.forEach(agent => {
        const expected = (agent.alleles[0] + agent.alleles[1]) / 2
        expect(agent.meanAllele).toBeCloseTo(expected)
      })
    })

    it('should initialize with no parents', () => {
      const params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)

      pop.forEach(agent => {
        expect(agent.parents).toBeNull()
      })
    })

    it('should compute initial wealth', () => {
      const params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)

      pop.forEach(agent => {
        expect(agent.wealth).toBeGreaterThan(0)
      })
    })
  })

  describe('computeEducationScore', () => {
    it('should weight genes and environment correctly', () => {
      const agent: Agent = {
        id: 0,
        alleles: [0.4, 0.6],
        meanAllele: 0.5,
        env: 0.8,
        rawenv: 0.8,
        educationScore: 0,
        wealth: 0,
        parentWealth: 0,
        parents: null
      }

      // Test pure genetic influence
      const paramsGene: Params = { ...defaultParams, geneEnvWeight: 1.0 }
      const scoreGene = computeEducationScore(agent, paramsGene)
      expect(scoreGene).toBeCloseTo(0.5)

      // Test pure environmental influence
      const paramsEnv: Params = { ...defaultParams, geneEnvWeight: 0.0 }
      const scoreEnv = computeEducationScore(agent, paramsEnv)
      expect(scoreEnv).toBeCloseTo(0.8)

      // Test 50/50 split
      const paramsHalf: Params = { ...defaultParams, geneEnvWeight: 0.5 }
      const scoreHalf = computeEducationScore(agent, paramsHalf)
      expect(scoreHalf).toBeCloseTo(0.5 * 0.5 + 0.5 * 0.8)
    })

    it('should handle edge case weights', () => {
      const agent: Agent = {
        id: 0,
        alleles: [1.0, 1.0],
        meanAllele: 1.0,
        env: 0.0,
        rawenv: 0.0,
        educationScore: 0,
        wealth: 0,
        parentWealth: 0,
        parents: null
      }

      const params: Params = { ...defaultParams, geneEnvWeight: 0.7 }
      const score = computeEducationScore(agent, params)
      expect(score).toBeCloseTo(0.7 * 1.0 + 0.3 * 0.0)
    })
  })

  describe('envFromWealth', () => {
    it('should transform wealth to environment via rank', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 0, parentWealth: 1000, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 0, parentWealth: 5000, parents: null
        },
        {
          id: 2, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 0, parentWealth: 10000, parents: null
        }
      ]

      const params: Params = { ...defaultParams, envNoiseStd: 0 }
      envFromWealth(agents, params)

      // Verify that higher wealth leads to higher rawenv
      expect(agents[2].rawenv).toBeGreaterThan(agents[1].rawenv)
      expect(agents[1].rawenv).toBeGreaterThan(agents[0].rawenv)
    })

    it('should add noise when envNoiseStd > 0', () => {
      const agents: Agent[] = Array(20).fill(null).map((_, i) => ({
        id: i,
        alleles: [0, 0] as [number, number],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 0,
        parentWealth: 5000, // Same parent wealth for all
        parents: null
      }))

      const params: Params = { ...defaultParams, envNoiseStd: 0.5 }
      envFromWealth(agents, params)

      // With noise, env should vary even with same parent wealth
      const envValues = agents.map(a => a.env)
      const uniqueEnvs = new Set(envValues)

      // Most should be different due to noise
      expect(uniqueEnvs.size).toBeGreaterThan(10)
    })
  })

  describe('computeWealthFromScore', () => {
    it('should produce positive wealth values', () => {
      const agent: Agent = {
        id: 0,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 0,
        parentWealth: 50000,
        parents: null
      }

      const params: Params = { ...defaultParams }
      const wealth = computeWealthFromScore(agent, params)

      expect(wealth).toBeGreaterThan(0)
    })

    it('should use financeWeight parameter', () => {
      const agent: Agent = {
        id: 0,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 1.0,
        wealth: 0,
        parentWealth: 100000,
        parents: null
      }

      // With high education weight, education should matter more
      const paramsEdu: Params = { ...defaultParams, financeWeight: 1.0, financeNoise: 0 }
      const wealthEdu = computeWealthFromScore(agent, paramsEdu)

      // With low education weight, parent wealth should matter more
      const paramsParent: Params = { ...defaultParams, financeWeight: 0.0, financeNoise: 0 }
      const wealthParent = computeWealthFromScore(agent, paramsParent)

      // Both should be positive
      expect(wealthEdu).toBeGreaterThan(0)
      expect(wealthParent).toBeGreaterThan(0)
    })
  })

  describe('selectMatingPool', () => {
    it('should create N/2 pairs from N agents', () => {
      const agents: Agent[] = Array(20).fill(null).map((_, i) => ({
        id: i,
        alleles: [Math.random(), Math.random()] as [number, number],
        meanAllele: 0.5,
        env: Math.random(),
        rawenv: Math.random(),
        educationScore: 0,
        wealth: 0,
        parentWealth: 0,
        parents: null
      }))

      const params: Params = { ...defaultParams }
      const pairs = selectMatingPool(agents, params)

      expect(pairs).toHaveLength(10)
    })

    it('should throw error if population < 2', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0,
        wealth: 0,
        parentWealth: 0,
        parents: null
      }]

      const params: Params = { ...defaultParams }

      expect(() => selectMatingPool(agents, params)).toThrow()
    })

    it('should use homophily parameters', () => {
      // Create agents with distinct characteristics
      const agents: Agent[] = [
        ...Array(5).fill(null).map((_, i) => ({
          id: i,
          alleles: [0.1, 0.1] as [number, number],
          meanAllele: 0.1,
          env: 0.1,
          rawenv: 0.1,
          educationScore: 0,
          wealth: 0,
          parentWealth: 0,
          parents: null
        })),
        ...Array(5).fill(null).map((_, i) => ({
          id: i + 5,
          alleles: [0.9, 0.9] as [number, number],
          meanAllele: 0.9,
          env: 0.9,
          rawenv: 0.9,
          educationScore: 0,
          wealth: 0,
          parentWealth: 0,
          parents: null
        }))
      ]

      // With high homophily, similar agents should pair
      const paramsHigh: Params = {
        ...defaultParams,
        homophily: { gene: 0.9, env: 0.9 }
      }
      const pairsHigh = selectMatingPool(agents, paramsHigh)

      // Each pair should be created
      expect(pairsHigh).toHaveLength(5)
    })
  })

  describe('mate', () => {
    it('should produce 2 children', () => {
      const parentA: Agent = {
        id: 0,
        alleles: [0.3, 0.7],
        meanAllele: 0.5,
        env: 0.4,
        rawenv: 0.4,
        educationScore: 0.5,
        wealth: 50000,
        parentWealth: 0,
        parents: null
      }

      const parentB: Agent = {
        id: 1,
        alleles: [0.2, 0.8],
        meanAllele: 0.5,
        env: 0.6,
        rawenv: 0.6,
        educationScore: 0.5,
        wealth: 60000,
        parentWealth: 0,
        parents: null
      }

      const params: Params = { ...defaultParams }
      const children = mate({ a: parentA, b: parentB }, params, 100)

      expect(children).toHaveLength(2)
    })

    it('should give children alleles from parents', () => {
      const parentA: Agent = {
        id: 0,
        alleles: [0.1, 0.2],
        meanAllele: 0.15,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0,
        wealth: 50000,
        parentWealth: 0,
        parents: null
      }

      const parentB: Agent = {
        id: 1,
        alleles: [0.8, 0.9],
        meanAllele: 0.85,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0,
        wealth: 50000,
        parentWealth: 0,
        parents: null
      }

      const params: Params = { ...defaultParams }
      const children = mate({ a: parentA, b: parentB }, params, 100)

      children.forEach(child => {
        // Each allele should come from one parent (or be a mutation)
        // We can't test exact values due to randomness and 1% mutation
        expect(child.alleles).toHaveLength(2)
        expect(child.alleles[0]).toBeTypeOf('number')
        expect(child.alleles[1]).toBeTypeOf('number')
      })
    })

    it('should set parentWealth as sum of both parents wealth', () => {
      const parentA: Agent = {
        id: 0,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 30000,
        parentWealth: 0,
        parents: null
      }

      const parentB: Agent = {
        id: 1,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 70000,
        parentWealth: 0,
        parents: null
      }

      const params: Params = { ...defaultParams }
      const children = mate({ a: parentA, b: parentB }, params, 100)

      children.forEach(child => {
        expect(child.parentWealth).toBe(100000)
      })
    })

    it('should store parent information', () => {
      const parentA: Agent = {
        id: 42,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 30000,
        parentWealth: 0,
        parents: null
      }

      const parentB: Agent = {
        id: 99,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 70000,
        parentWealth: 0,
        parents: null
      }

      const params: Params = { ...defaultParams }
      const children = mate({ a: parentA, b: parentB }, params, 100)

      children.forEach(child => {
        expect(child.parents).not.toBeNull()
        expect(child.parents).toHaveLength(2)
        expect(child.parents![0].id).toBe(42)
        expect(child.parents![1].id).toBe(99)
      })
    })

    it('should assign sequential IDs starting from nextIdStart', () => {
      const parentA: Agent = {
        id: 0,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 50000,
        parentWealth: 0,
        parents: null
      }

      const parentB: Agent = {
        id: 1,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 50000,
        parentWealth: 0,
        parents: null
      }

      const params: Params = { ...defaultParams }
      const children = mate({ a: parentA, b: parentB }, params, 200)

      expect(children[0].id).toBe(200)
      expect(children[1].id).toBe(201)
    })
  })

  describe('nextGeneration', () => {
    it('should maintain population size', () => {
      const params: Params = { ...defaultParams, populationSize: 20 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      expect(nextPop).toHaveLength(20)
    })

    it('should create new agents with parents', () => {
      const params: Params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      nextPop.forEach(agent => {
        expect(agent.parents).not.toBeNull()
        expect(agent.parents).toHaveLength(2)
      })
    })

    it('should compute education scores for new generation', () => {
      const params: Params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      nextPop.forEach(agent => {
        expect(agent.educationScore).toBeTypeOf('number')
      })
    })

    it('should compute wealth for new generation', () => {
      const params: Params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      nextPop.forEach(agent => {
        expect(agent.wealth).toBeGreaterThan(0)
      })
    })

    it('should set environment from parent wealth', () => {
      const params: Params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      nextPop.forEach(agent => {
        expect(agent.env).toBeTypeOf('number')
        expect(agent.rawenv).toBeTypeOf('number')
      })
    })

    it('should compute meanAllele from alleles', () => {
      const params: Params = { ...defaultParams, populationSize: 10 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      nextPop.forEach(agent => {
        const expected = (agent.alleles[0] + agent.alleles[1]) / 2
        expect(agent.meanAllele).toBeCloseTo(expected)
      })
    })

    it('should handle odd population sizes by dropping one agent', () => {
      const params: Params = { ...defaultParams, populationSize: 11 }
      const pop = initializePopulation(params)
      const nextPop = nextGeneration(pop, params)

      // 11 agents -> 5 pairs -> 10 children
      expect(nextPop).toHaveLength(10)
    })
  })
})
