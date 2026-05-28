/**
 * Header Component
 * Dashboard header with logo and version
 */

import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/components';

export function Header() {
	// Get version from localized data or fallback
	const version = window.axiomBlocksData?.version || '1.0.0';

	return (
		<div className="axiom-blocks-header-react">
			<div className="axiom-blocks-branding">
				<Icon icon="grid-view" className="axiom-blocks-logo" />
				<h1>{ __( 'Axiom Blocks', 'axiom-blocks' ) }</h1>
			</div>
			<span className="axiom-blocks-version-badge">
				{ __( 'Version', 'axiom-blocks' ) } { version }
			</span>
		</div>
	);
}
