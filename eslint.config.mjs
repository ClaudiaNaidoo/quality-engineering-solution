import js from '@eslint/js';
import playwright from 'eslint-plugin-playwright';
import globals from 'globals';

const playwrightRecommended = playwright.configs['flat/recommended'];

export default [
  {
    ignores: [
      'node_modules/**',
      'playwright-report/**',
      'monocart-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'consistent-return': 'error',
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['tests/**/*.js'],
    ...playwrightRecommended,
    rules: {
      ...playwrightRecommended.rules,
      'playwright/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'assertCreateDoesNotSucceed',
            'assertSuccessfulLogin',
            'loginAndExpectError',
          ],
        },
      ],
    },
  },
];
