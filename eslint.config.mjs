// @ts-check
import eslint from '@eslint/js'
import pluginTs from '@typescript-eslint/eslint-plugin'
import parserTs from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
import jsoncParser from 'jsonc-eslint-parser'

import { withNuxt } from './.nuxt/eslint.config.mjs'

export default withNuxt([{
  name: 'essentials',
  // Enable typescript-eslint strict type checking
  languageOptions: {
    parserOptions: {
      projectService: true,
      project: ['./tsconfig.json', './server/tsconfig.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    // Relax recommended Typescript rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' }],
    'no-unused-vars': 'off',

    // Relax strict Typescript rules (if enabled, see strictTypeChecked below)
    // '@typescript-eslint/no-explicit-any': 'warn', // or 'off'
    // '@typescript-eslint/no-misused-spread': 'off',
    // '@typescript-eslint/no-non-null-assertion': 'off',
    // '@typescript-eslint/no-unnecessary-condition': 'off',
    // '@typescript-eslint/no-unsafe-assignment': 'off',
    // '@typescript-eslint/no-unsafe-argument': 'off',
    // '@typescript-eslint/no-unsafe-call': 'off',
    // '@typescript-eslint/no-unsafe-member-access': 'off',
    // '@typescript-eslint/no-unsafe-return': 'off',

    // Relax style rules
    '@stylistic/arrow-parens': ['error', 'always'], // Always keep parentheses around arrow function parameters
    '@stylistic/brace-style': 'off', // Allow same-line else/catch blocks
    '@stylistic/max-statements-per-line': 'off',
    '@stylistic/quotes': ['error', 'single', { avoidEscape: true }], // Use single quotes but allow double quotes when they contain single quotes
    'import/order': 'off', // Disable enforcing import order
    'vue/attributes-order': 'off', // Disable enforcing attribute order in Vue templates
    'vue/max-attributes-per-line': 'off', // Disable breaking attributes into multiple lines
    'vue/singleline-html-element-content-newline': 'off', // Allow content on same line as tags
    'vue/multi-word-component-names': 'off', // Allow single-word component names like "General"

    // Enable TypeScript strict rules to match VS Code behavior
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
  },
}, {
  name: 'jsonc-eslint-parser',
  files: ['*.json', '*.json5'],
  languageOptions: {
    parser: jsoncParser,
    parserOptions: {
      jsonSyntax: 'JSON5',
    },
  },
}])
  .prepend({
    name: 'essentials-ignore-migrations',
    ignores: [
      'server/database/migrations/',
    ],
  })

  // Below this line enables type checking by eslint - this has a significant performance impact
  // @ts-ignore
  .replace('nuxt/typescript/setup', {
    name: 'nuxt/typescript/setup',
    plugins: { '@typescript-eslint': pluginTs },
  })
  .replace('nuxt/typescript/rules', {
    name: 'nuxt/typescript/rules',
    files: ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: parserTs,
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...tseslint.config(
        eslint.configs.recommended,
        // tseslint.configs.strictTypeChecked,
        tseslint.configs.stylisticTypeChecked,
      ).map((c) => c.rules).reduce((a, b) => ({ ...a, ...b }), {}),

      // These rules require type checking
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', {
        disallowTypeAnnotations: false,
        prefer: 'type-imports',
      }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

      // Stricter rules
      // '@typescript-eslint/strict-boolean-expressions': 'error',
    },
  })
