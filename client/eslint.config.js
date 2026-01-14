// Configurație ESLint pentru proiect React
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Ignorăm fișierele generate automat
  globalIgnores(['dist']),

  {
    // Aplicăm regulile pe fișiere JS și JSX
    files: ['**/*.{js,jsx}'],

    extends: [
      js.configs.recommended,          // reguli JavaScript standard
      reactHooks.configs.flat.recommended, // reguli pentru React Hooks
      reactRefresh.configs.vite,       // suport Vite + React
    ],

    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },

    rules: {
      // Semnalăm variabilele nefolosite
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
