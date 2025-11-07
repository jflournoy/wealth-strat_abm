import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only run TypeScript tests in src/ directory
    // Exclude Node.js test runner files in test/ directory
    include: ['src/**/*.test.ts'],
    exclude: ['test/**/*.test.js', 'node_modules/**'],

    // Use node environment (tests don't need DOM)
    environment: 'node',

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
    },
  },
});
