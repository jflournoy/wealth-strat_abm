// src/viz/plots.test.ts
import { describe, it, expect } from 'vitest'
import { computeLorenz, computeGini } from './plots'
import type { Agent } from '../model'

describe('Visualization Functions - plots.ts', () => {
  describe('computeLorenz', () => {
    it('should return points starting at (0,0)', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0, 0],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 100,
        parentWealth: 0,
        parents: null
      }]

      const lorenz = computeLorenz(agents)

      expect(lorenz[0]).toEqual([0, 0])
    })

    it('should return points ending at (1,1)', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0, 0],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 100,
        parentWealth: 0,
        parents: null
      }]

      const lorenz = computeLorenz(agents)

      expect(lorenz[lorenz.length - 1]).toEqual([1, 1])
    })

    it('should produce N+1 points for N agents', () => {
      const agents: Agent[] = Array(10).fill(null).map((_, i) => ({
        id: i,
        alleles: [0, 0] as [number, number],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: (i + 1) * 100,
        parentWealth: 0,
        parents: null
      }))

      const lorenz = computeLorenz(agents)

      // N agents + 1 point for (0,0)
      expect(lorenz).toHaveLength(11)
    })

    it('should produce diagonal line for perfect equality', () => {
      // All agents have equal wealth
      const agents: Agent[] = Array(5).fill(null).map((_, i) => ({
        id: i,
        alleles: [0, 0] as [number, number],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 100, // Same wealth for all
        parentWealth: 0,
        parents: null
      }))

      const lorenz = computeLorenz(agents)

      // For perfect equality, each point should be on the diagonal
      lorenz.forEach(([x, y]) => {
        expect(y).toBeCloseTo(x, 5)
      })
    })

    it('should sort agents by wealth before computing', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 300, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 100, parentWealth: 0, parents: null
        },
        {
          id: 2, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 200, parentWealth: 0, parents: null
        }
      ]

      const lorenz = computeLorenz(agents)

      // Should be monotonically increasing in both x and y
      for (let i = 1; i < lorenz.length; i++) {
        expect(lorenz[i][0]).toBeGreaterThanOrEqual(lorenz[i - 1][0])
        expect(lorenz[i][1]).toBeGreaterThanOrEqual(lorenz[i - 1][1])
      }
    })

    it('should handle extreme inequality', () => {
      // One agent has all the wealth
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 0, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 0, parentWealth: 0, parents: null
        },
        {
          id: 2, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 1000, parentWealth: 0, parents: null
        }
      ]

      const lorenz = computeLorenz(agents)

      // First two agents contribute 0% of wealth
      expect(lorenz[1][1]).toBe(0)
      expect(lorenz[2][1]).toBe(0)

      // Last agent has 100% of wealth
      expect(lorenz[3][1]).toBe(1)
    })

    it('should handle empty population gracefully', () => {
      const agents: Agent[] = []
      const lorenz = computeLorenz(agents)

      // Should at least have the starting point
      expect(lorenz).toHaveLength(1)
      expect(lorenz[0]).toEqual([0, 0])
    })
  })

  describe('computeGini', () => {
    it('should return 0 for perfect equality', () => {
      const wealth = [100, 100, 100, 100, 100]
      const gini = computeGini(wealth)

      expect(gini).toBeCloseTo(0, 2)
    })

    it('should return close to 1 for extreme inequality', () => {
      // One person has all the wealth
      const wealth = [0, 0, 0, 0, 10000]
      const gini = computeGini(wealth)

      // Gini should be high (close to 1)
      expect(gini).toBeGreaterThan(0.7)
    })

    it('should be between 0 and 1', () => {
      const wealth = [10, 50, 100, 200, 500]
      const gini = computeGini(wealth)

      expect(gini).toBeGreaterThanOrEqual(0)
      expect(gini).toBeLessThanOrEqual(1)
    })

    it('should increase with more inequality', () => {
      const equalWealth = [100, 100, 100, 100, 100]
      const moderateWealth = [50, 75, 100, 125, 150]
      const extremeWealth = [1, 1, 1, 1, 396]

      const giniEqual = computeGini(equalWealth)
      const giniModerate = computeGini(moderateWealth)
      const giniExtreme = computeGini(extremeWealth)

      expect(giniModerate).toBeGreaterThan(giniEqual)
      expect(giniExtreme).toBeGreaterThan(giniModerate)
    })

    it('should handle empty array', () => {
      const wealth: number[] = []
      const gini = computeGini(wealth)

      expect(gini).toBe(0)
    })

    it('should handle single value', () => {
      const wealth = [100]
      const gini = computeGini(wealth)

      // Single person = perfect equality = 0
      expect(gini).toBeCloseTo(0, 2)
    })

    it('should be invariant to scaling', () => {
      const wealth1 = [10, 20, 30, 40, 50]
      const wealth2 = [100, 200, 300, 400, 500]

      const gini1 = computeGini(wealth1)
      const gini2 = computeGini(wealth2)

      // Gini should be the same for proportional scaling
      expect(gini1).toBeCloseTo(gini2, 5)
    })

    it('should be invariant to order', () => {
      const wealth1 = [100, 200, 300, 400, 500]
      const wealth2 = [500, 200, 100, 400, 300]

      const gini1 = computeGini(wealth1)
      const gini2 = computeGini(wealth2)

      // Gini should not depend on order
      expect(gini1).toBeCloseTo(gini2, 5)
    })

    it('should match known Gini coefficient', () => {
      // For wealth [1, 2, 3, 4, 5], theoretical Gini ≈ 0.267
      const wealth = [1, 2, 3, 4, 5]
      const gini = computeGini(wealth)

      expect(gini).toBeCloseTo(0.267, 2)
    })
  })
})
