import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'https://katalinux.github.io/test-pw-playground/',
    trace: 'on-first-retry',
  },
});
