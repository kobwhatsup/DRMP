import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,ts,jsx,tsx}',
    ],
    exclude: [
      'node_modules/',
      'dist/',
      '.idea/',
      '.git/',
      '.cache/',
    ],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
});