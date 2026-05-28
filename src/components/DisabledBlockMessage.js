/**
 * Disabled Block Message Component
 *
 * Shows a friendly message when a block is disabled from the dashboard.
 */
import { __ } from '@wordpress/i18n';

export function DisabledBlockMessage( { blockName } ) {
	return (
		<div
			style={ {
				padding: '16px',
				background: '#f6f7f7',
				border: '1px dashed #c3c4c7',
				borderRadius: '6px',
				textAlign: 'center',
			} }
		>
			<p
				style={ {
					alignItems: 'center',
					color: '#1d2327',
					display: 'flex',
					fontSize: '12px',
					fontWeight: '600',
					justifyContent: 'center',
					marginBottom: '0',
					gap: '6px',
				} }
			>
				<span>{ blockName }</span>
				<span>{ __( 'is disabled', 'axiom-blocks' ) }</span>
			</p>
			<p
				style={ {
					color: '#6b7280',
					fontSize: '11px',
					fontStyle: 'italic',
					margin: '8px 0 0',
				} }
			>
				{ __( 'Enable it from the ', 'axiom-blocks' ) }
				<a
					href="/wp-admin/admin.php?page=axiom-blocks-dashboard"
					target="_blank"
					rel="noopener"
					style={ { color: '#7c3aed' } }
				>
					{ __( 'Axiom Blocks Dashboard', 'axiom-blocks' ) }
				</a>
				{ __( ' to use this block.', 'axiom-blocks' ) }
			</p>
		</div>
	);
}

/**
 * Check if a block is enabled
 * @param {string} blockId - The block ID (e.g., 'advanced-section')
 * @return {boolean}
 */
export function isBlockEnabled( blockId ) {
	const settings = window.axiomBlocksSettings || {};
	const enabledBlocks = settings.enabledBlocks || {};
	return enabledBlocks[ blockId ] !== false;
}

/**
 * Get disabled block message if block is disabled
 * @param {string} blockId   - The block ID
 * @param {string} blockName - The display name for the block
 * @return {JSX.Element|null} - The disabled message or null if enabled
 */
export function getDisabledMessage( blockId, blockName ) {
	if ( ! isBlockEnabled( blockId ) ) {
		return <DisabledBlockMessage blockName={ blockName } />;
	}
	return null;
}
