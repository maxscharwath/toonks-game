module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'next/core-web-vitals',
		'plugin:react/recommended',
		'xo',
	],
	overrides: [
		{
			extends: [
				'xo-typescript',
			],
			files: [
				'*.ts',
				'*.tsx',
			],
		},
	],
	parserOptions: {
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
	plugins: [
		'react',
	],
	rules: {
		'react/react-in-jsx-scope': 'off',
		'@typescript-eslint/keyword-spacing': 'off',
		'no-multi-assign': 'off',
		'@typescript-eslint/no-unsafe-call': 'off',
		'new-cap': 'off',
		'@typescript-eslint/naming-convention': 'off',
	},
};
