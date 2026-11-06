import { defineConfig, devices } from '@playwright/test'

// Drives the installed Brave browser (Chromium based) so no browser download is needed.
// SwiftShader flags make WebGL work in automated runs on machines without a usable GPU context.
const BRAVE = process.env.BRAVE_PATH || 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
const launchOptions = {
  executablePath: BRAVE,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
}

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://main.d20iokpmvk0ua7.amplifyapp.com',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
  },
  projects: [
    { name: 'desktop-brave', use: { ...devices['Desktop Chrome'], launchOptions, viewport: { width: 1280, height: 800 } } },
    { name: 'mobile-brave', use: { ...devices['Pixel 5'], launchOptions } },
  ],
})
