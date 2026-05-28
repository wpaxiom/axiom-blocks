/**
 * Webpack Config for Axiom Blocks
 * Supports multiple entry points: blocks and admin
 */

const defaultConfig = require( '@wordpress/scripts/config/webpack.config' );
const path = require( 'path' );

module.exports = {
	...defaultConfig,
	entry: {
		index: path.resolve( process.cwd(), 'src', 'index.js' ),
		admin: path.resolve( process.cwd(), 'src', 'admin', 'index.js' ),
	},
};
