import eslint from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
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
            'prettier.config.js'
        ]
    },
    {
        files: ['srv/**/*.ts'],
        rules: {
            '@typescript-eslint/no-empty-function': 'off'
        }
    }
);