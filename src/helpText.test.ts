// src/helpText.test.ts
import { describe, it, expect } from 'vitest'
import { helpSections, type HelpSection } from './helpText'

describe('Help Text Structure', () => {
  describe('helpSections', () => {
    it('should be an array', () => {
      expect(Array.isArray(helpSections)).toBe(true)
    })

    it('should have at least one section', () => {
      expect(helpSections.length).toBeGreaterThan(0)
    })

    it('should have all required properties for each section', () => {
      helpSections.forEach(section => {
        expect(section).toHaveProperty('id')
        expect(section).toHaveProperty('title')
        expect(section).toHaveProperty('content')
      })
    })

    it('should have unique IDs', () => {
      const ids = helpSections.map(s => s.id)
      const uniqueIds = new Set(ids)

      expect(uniqueIds.size).toBe(ids.length)
    })

    it('should have non-empty IDs', () => {
      helpSections.forEach(section => {
        expect(section.id).toBeTruthy()
        expect(section.id.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty titles', () => {
      helpSections.forEach(section => {
        expect(section.title).toBeTruthy()
        expect(section.title.length).toBeGreaterThan(0)
      })
    })

    it('should have non-empty content', () => {
      helpSections.forEach(section => {
        expect(section.content).toBeTruthy()
        expect(section.content.length).toBeGreaterThan(0)
      })
    })

    it('should have specific expected sections', () => {
      const expectedIds = ['intro', 'model', 'plots', 'philosophy', 'extensions', 'thepoint']
      const actualIds = helpSections.map(s => s.id)

      expectedIds.forEach(id => {
        expect(actualIds).toContain(id)
      })
    })

    it('should have intro as first section', () => {
      expect(helpSections[0].id).toBe('intro')
    })

    it('should have HTML content in sections', () => {
      helpSections.forEach(section => {
        // Content should contain some HTML tags
        const hasHtmlTags = /<[^>]+>/.test(section.content)
        expect(hasHtmlTags).toBe(true)
      })
    })
  })

  describe('HelpSection type', () => {
    it('should accept valid help section objects', () => {
      const validSection: HelpSection = {
        id: 'test',
        title: 'Test Section',
        content: '<p>Test content</p>'
      }

      expect(validSection.id).toBe('test')
      expect(validSection.title).toBe('Test Section')
      expect(validSection.content).toBe('<p>Test content</p>')
    })
  })

  describe('Content validation', () => {
    it('should have model section with key concepts', () => {
      const modelSection = helpSections.find(s => s.id === 'model')

      expect(modelSection).toBeDefined()
      expect(modelSection!.content).toContain('Genes')
      expect(modelSection!.content).toContain('Environment')
      expect(modelSection!.content).toContain('Education')
      expect(modelSection!.content).toContain('Wealth')
    })

    it('should have plots section describing visualizations', () => {
      const plotsSection = helpSections.find(s => s.id === 'plots')

      expect(plotsSection).toBeDefined()
      expect(plotsSection!.content).toContain('Lorenz')
      expect(plotsSection!.content).toContain('Gini')
      expect(plotsSection!.content).toContain('Histogram')
    })

    it('should have philosophy section with presets', () => {
      const philosophySection = helpSections.find(s => s.id === 'philosophy')

      expect(philosophySection).toBeDefined()
      expect(philosophySection!.content).toContain('Meritocracy')
      expect(philosophySection!.content).toContain('Aristocracy')
    })

    it('should have extensions section with ideas', () => {
      const extensionsSection = helpSections.find(s => s.id === 'extensions')

      expect(extensionsSection).toBeDefined()
      // Should mention some policy ideas
      expect(extensionsSection!.content.length).toBeGreaterThan(100)
    })

    it('should have intro section with overview', () => {
      const introSection = helpSections.find(s => s.id === 'intro')

      expect(introSection).toBeDefined()
      expect(introSection!.content).toContain('generation')
    })

    it('should have well-formed HTML structure', () => {
      helpSections.forEach(section => {
        // Content should be valid HTML-like strings
        expect(section.content).toBeTypeOf('string')

        // Should not have obvious HTML errors like unclosed tags
        // Check for balanced ul/ol tags specifically
        const openUls = (section.content.match(/<ul[^>]*>/g) || []).length
        const closeUls = (section.content.match(/<\/ul>/g) || []).length
        const openOls = (section.content.match(/<ol[^>]*>/g) || []).length
        const closeOls = (section.content.match(/<\/ol>/g) || []).length

        // List container tags should be balanced
        expect(openUls).toBe(closeUls)
        expect(openOls).toBe(closeOls)
      })
    })

    it('should have reasonable content length', () => {
      helpSections.forEach(section => {
        // Each section should have substantial content (at least 50 chars)
        expect(section.content.length).toBeGreaterThan(50)

        // But not excessively long (less than 10000 chars)
        expect(section.content.length).toBeLessThan(10000)
      })
    })
  })
})
