import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import importPlugin from 'eslint-plugin-import'
import prettier from 'eslint-config-prettier'

import jsoncPlugin from 'eslint-plugin-jsonc'
import jsoncParser from 'jsonc-eslint-parser'
import ymlPlugin from 'eslint-plugin-yml'
import yamlParser from 'yaml-eslint-parser'

import { defineConfig } from 'eslint/config'

export default defineConfig([
  // Ignores (flat config replaces .eslintignore)
  {
    ignores: ['dist/**', 'node_modules/**'],
  },

  // ----------------------------
  // JS/TS/TSX/JSX (recommended)
  // ----------------------------
  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      import: importPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    settings: {
      react: { version: 'detect' },
      'import/resolver': { typescript: true },
    },
    rules: {
      // React hooks (recommended)
      ...reactHooks.configs.recommended.rules,

      // React Refresh (recommended for Vite React)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Practical TS/JS defaults
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-unused-vars': 'off',

      // Import hygiene
      'import/no-cycle': 'error',

      // Console control (recommended-ish for apps; adjust if too strict)
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },

  // React recommended config (must come after plugins are declared)
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: { react },
    rules: {
      ...react.configs.recommended.rules,
      // New JSX transform (React 17+)
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },

  // Import plugin recommended configs
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: { import: importPlugin },
    rules: {
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
    },
  },

  // Prettier last to disable formatting-related rules that conflict
  prettier,

  // ----------------------------
  // JSON / JSONC
  // ----------------------------
  {
    files: ['**/*.{json,jsonc}'],
    languageOptions: {
      parser: jsoncParser,
    },
    plugins: {
      jsonc: jsoncPlugin,
    },
    rules: {
      ...jsoncPlugin.configs['recommended-with-jsonc'].rules,
    },
  },

  // ----------------------------
  // YAML
  // ----------------------------
  {
    files: ['**/*.{yml,yaml}'],
    languageOptions: {
      parser: yamlParser,
    },
    plugins: {
      yml: ymlPlugin,
    },
    rules: {
      ...ymlPlugin.configs.recommended.rules,
    },
  },
])