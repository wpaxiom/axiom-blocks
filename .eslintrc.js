module.exports = {
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		// Stylistic rules we don't enforce in this codebase.
		'no-nested-ternary': 'off',
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-returns-description': 'off',
		// `x == null` is the standard idiom for "null or undefined" — allow it.
		eqeqeq: [ 'error', 'always', { null: 'ignore' } ],
		// The isBlockEnabled() early-return guards a value that is constant
		// per page load (read once from window.axiomBlocksSettings). Hook order
		// is stable across renders, so this is a safe pattern.
		'react-hooks/rules-of-hooks': 'off',
	},
	overrides: [
		{
			files: [ 'scripts/**/*.js' ],
			env: { node: true },
			rules: {
				'no-console': 'off',
				'@wordpress/no-unused-vars-before-return': 'off',
			},
		},
		{
			files: [ 'src/animations.js', 'src/**/assets/**/*.js' ],
			env: { browser: true },
			rules: {
				'no-console': 'off',
			},
		},
		{
			files: [ 'src/blocks/copy-to-clipboard/index.js' ],
			globals: { navigator: 'readonly' },
		},
		{
			files: [ 'src/blocks/trust-badges/badges.js' ],
			rules: {
				'import/no-unresolved': [
					'error',
					{ ignore: [ '\\.svg\\?url$' ] },
				],
			},
		},
		{
			files: [ 'src/components/StylesPanel.js' ],
			rules: {
				'@wordpress/no-unsafe-wp-apis': 'off',
			},
		},
	],
};
