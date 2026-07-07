// Flat ESLint config for Angular 20 + @angular-eslint
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const angularPlugin = require('@angular-eslint/eslint-plugin');
const angularTemplatePlugin = require('@angular-eslint/eslint-plugin-template');
const angularTemplateParser = require('@angular-eslint/template-parser');

module.exports = [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['tsconfig.json', 'tsconfig.lib.json', 'tsconfig.spec.json'],
        createDefaultProgram: true,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@angular-eslint': angularPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...angularPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@angular-eslint/prefer-standalone': 'off',
    },
  },
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplatePlugin,
    },
    rules: {
      ...angularTemplatePlugin.configs.recommended.rules,
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', 'test-app/**', 'out-tsc/**'],
  },
];
