module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
    extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',

        'prettier/prettier': [
            'error',
            {
                printWidth: 80,
            },
        ],

        'no-console': 'error', // disallow the use of console.log
        semi: ['error', 'always'],
        'comma-spacing': ['error', { before: false, after: true }], // Enforce spacing after commas
        'keyword-spacing': ['error', { before: true, after: true }], // Enforce consistent spacing around keywords
        'no-multi-spaces': 'error', // Disallow multiple spaces
        'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }], // Allow only one empty line
        'eol-last': ['error', 'always'], // Enforce newline at the end of file
        'no-warning-comments': ['error', { terms: ['TODO'], location: 'anywhere' }], // disallow TODO comments
    },
};