module.exports = {
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:react/recommended',
    'xo',
    'plugin:storybook/recommended',
    'plugin:tailwindcss/recommended'
  ],
  overrides: [{
    extends: ['xo-typescript'],
    files: ['*.ts', '*.tsx']
  }],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react','tailwindcss'],
  rules: {
    '@typescript-eslint/keyword-spacing': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assigment': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    'new-cap': 'off'
  }
};
