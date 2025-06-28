import baseConfig from '@hono/eslint-config'
import tsParser from '@typescript-eslint/parser'

export default [
  // グローバルignoresを最初に配置
  {
    ignores: [
      '**/generated/**',
      '**/dist/**',
      '**/node_modules/**',
      '*.mjs',
      '*.js',
      '*.cjs',
      'worker-configuration.d.ts',
    ],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
        ecmaversion: 'latest',
        sourceType: 'module',
      },
    },
  },
]
