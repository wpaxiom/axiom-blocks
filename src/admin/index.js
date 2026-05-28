/**
 * Axiom Blocks Admin Dashboard - React Entry Point
 */

import { render } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { Dashboard } from './components/Dashboard';
import './styles/admin.scss';

// Configure apiFetch with nonce for REST API authentication
if ( window.axiomBlocksData?.nonce ) {
	apiFetch.use(
		apiFetch.createNonceMiddleware( window.axiomBlocksData.nonce )
	);
}

// Mount React app when DOM is ready
document.addEventListener( 'DOMContentLoaded', () => {
	const root = document.getElementById( 'axiom-blocks-admin-root' );
	if ( root ) {
		render( <Dashboard />, root );
	}
} );
