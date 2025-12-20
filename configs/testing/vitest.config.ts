import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Global test APIs
    globals: true,

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Include/Exclude patterns
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'dist', 'build'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/*.d.ts',
        '**/types/**',
        '**/.next/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
      ],
      // Coverage thresholds (80% minimum as per testing-standards.md)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
        autoUpdate: false,
      },
    },

    // Test timeout
    testTimeout: 10000,

    // Watch mode
    watch: false,

    // Reporters
    reporters: process.env.CI ? ['verbose', 'junit'] : ['verbose'],
    outputFile: {
      junit: './test-results/junit.xml',
    },

    // Mock configuration
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },

  // Path resolution
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Define global constants for tests
  define: {
    'import.meta.env.VITE_TEST': true,
  },
});
