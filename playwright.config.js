import path from 'node:path';
import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';

const outputDir =
  process.env.PLAYWRIGHT_OUTPUT_DIR ??
  (process.env.CI ? 'test-results' : path.join(os.tmpdir(), 'pw-quality-engineering-solution'));

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  outputDir,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporters: console + Playwright HTML + Monocart (aggregated dashboard). */
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    [
      'monocart-reporter',
      {
        name: 'Quality Engineering Solution',
        outputFile: 'monocart-report/index.html',
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Capture screenshots for failed tests. */
    screenshot: 'only-on-failure',
  },

  /* UI: tests/ui/** — API: tests/api/** (paths relative to testDir) */
  projects: [
    {
      name: 'ui',
      testMatch: 'ui/**/*.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testMatch: 'ui/**/*.spec.js',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testMatch: 'ui/**/*.spec.js',
      use: { ...devices['Desktop Safari'] },
    },

    {
      name: 'api',
      testMatch: 'api/**/*.spec.js',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://restful-booker.herokuapp.com',
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

