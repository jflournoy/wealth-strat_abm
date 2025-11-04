// src/viz/raster.test.ts
import { describe, it, expect } from 'vitest'
import { prepareRasterArray } from './raster'
import type { Agent } from '../model'

describe('Raster Visualization - raster.ts', () => {
  describe('prepareRasterArray', () => {
    it('should return array of same length as population', () => {
      const agents: Agent[] = Array(10).fill(null).map((_, i) => ({
        id: i,
        alleles: [0.5, 0.5] as [number, number],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: (i + 1) * 1000,
        parentWealth: 0,
        parents: null
      }))

      const result = prepareRasterArray(agents, 'wealth')

      expect(result).toHaveLength(10)
    })

    it('should sort by wealth in descending order', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 1000, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 5000, parentWealth: 0, parents: null
        },
        {
          id: 2, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 3000, parentWealth: 0, parents: null
        }
      ]

      const result = prepareRasterArray(agents, 'wealth')

      // Sort is descending by wealth: 5000, 3000, 1000
      // After log10: log10(5001), log10(3001), log10(1001)
      // First element should be highest
      expect(result[0]).toBeGreaterThan(result[1])
      expect(result[1]).toBeGreaterThan(result[2])
    })

    it('should extract meanAllele feature correctly', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0.2, 0.4], meanAllele: 0.3, env: 0, rawenv: 0,
          educationScore: 0, wealth: 5000, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0.6, 0.8], meanAllele: 0.7, env: 0, rawenv: 0,
          educationScore: 0, wealth: 3000, parentWealth: 0, parents: null
        }
      ]

      const result = prepareRasterArray(agents, 'meanAllele')

      // Sorted by wealth descending, so agent 0 first
      expect(result[0]).toBeCloseTo(0.3)
      expect(result[1]).toBeCloseTo(0.7)
    })

    it('should extract env feature correctly', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0.8, rawenv: 0.8,
          educationScore: 0, wealth: 5000, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0.2, rawenv: 0.2,
          educationScore: 0, wealth: 3000, parentWealth: 0, parents: null
        }
      ]

      const result = prepareRasterArray(agents, 'env')

      expect(result[0]).toBeCloseTo(0.8)
      expect(result[1]).toBeCloseTo(0.2)
    })

    it('should extract educationScore feature correctly', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0.9, wealth: 5000, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0.1, wealth: 3000, parentWealth: 0, parents: null
        }
      ]

      const result = prepareRasterArray(agents, 'educationScore')

      expect(result[0]).toBeCloseTo(0.9)
      expect(result[1]).toBeCloseTo(0.1)
    })

    it('should apply log10 transformation to wealth', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0, 0],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 1000,
        parentWealth: 0,
        parents: null
      }]

      const result = prepareRasterArray(agents, 'wealth')

      // log10(1000 + 1) ≈ 3.0004
      expect(result[0]).toBeCloseTo(Math.log10(1001), 3)
    })

    it('should apply log10 transformation to parentWealth', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0, 0],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 5000,
        parentWealth: 10000,
        parents: null
      }]

      const result = prepareRasterArray(agents, 'parentWealth')

      // log10(10000 + 1) ≈ 4.0004
      expect(result[0]).toBeCloseTo(Math.log10(10001), 3)
    })

    it('should not modify original agents array', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 1000, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0, 0], meanAllele: 0, env: 0, rawenv: 0,
          educationScore: 0, wealth: 2000, parentWealth: 0, parents: null
        }
      ]

      const originalOrder = agents.map(a => a.id)

      prepareRasterArray(agents, 'wealth')

      // Original array should be unchanged
      expect(agents.map(a => a.id)).toEqual(originalOrder)
    })

    it('should handle empty population', () => {
      const agents: Agent[] = []
      const result = prepareRasterArray(agents, 'wealth')

      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle single agent', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0.5, 0.5],
        meanAllele: 0.5,
        env: 0.5,
        rawenv: 0.5,
        educationScore: 0.5,
        wealth: 1000,
        parentWealth: 500,
        parents: null
      }]

      const result = prepareRasterArray(agents, 'meanAllele')

      expect(result).toHaveLength(1)
      expect(result[0]).toBeCloseTo(0.5)
    })

    it('should handle zero wealth with log transform', () => {
      const agents: Agent[] = [{
        id: 0,
        alleles: [0, 0],
        meanAllele: 0,
        env: 0,
        rawenv: 0,
        educationScore: 0,
        wealth: 0,
        parentWealth: 0,
        parents: null
      }]

      const result = prepareRasterArray(agents, 'wealth')

      // log10(0 + 1) = 0
      expect(result[0]).toBeCloseTo(0)
    })

    it('should preserve relative ordering within sorted result', () => {
      const agents: Agent[] = [
        {
          id: 0, alleles: [0.1, 0.1], meanAllele: 0.1, env: 0, rawenv: 0,
          educationScore: 0, wealth: 5000, parentWealth: 0, parents: null
        },
        {
          id: 1, alleles: [0.5, 0.5], meanAllele: 0.5, env: 0, rawenv: 0,
          educationScore: 0, wealth: 3000, parentWealth: 0, parents: null
        },
        {
          id: 2, alleles: [0.9, 0.9], meanAllele: 0.9, env: 0, rawenv: 0,
          educationScore: 0, wealth: 1000, parentWealth: 0, parents: null
        }
      ]

      const result = prepareRasterArray(agents, 'meanAllele')

      // After sorting by wealth (descending): 5000, 3000, 1000
      // meanAllele values: 0.1, 0.5, 0.9
      expect(result[0]).toBeCloseTo(0.1)
      expect(result[1]).toBeCloseTo(0.5)
      expect(result[2]).toBeCloseTo(0.9)
    })
  })
})
