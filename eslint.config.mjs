import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default defineConfig(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    prettier,
    {
        ignores: [
            'node_modules/**',
            '@cds-models/**',
            'gen/**',
            'dist/**',
            'coverage/**',
            '**/*.js',
            '**/*.mjs',
            '**/*.cjs'
        ]
    },
    {
        files: ['srv/**/*.ts', 'test/**/*.ts'],
        rules: {
            '@typescript-eslint/no-empty-function': 'off'
        }
    }
);