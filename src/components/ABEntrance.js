/**
 * ABEntrance — universal scroll-in entrance animation control (L7-entrance).
 *
 * Injected into every Axiom block's Advanced group. Stores one string,
 * `abEntrance` (fade / fade-up / … / zoom-in). render_block
 * (inc/Blocks/Entrance.php) adds `ab-entrance ab-entrance-{type}` to the root;
 * the CSS lives in src/style.scss and is scroll-driven (`animation-timeline:
 * view()`), CSS-only, gated by `@supports` so unsupported browsers just show the
 * element. Empty ⇒ no class ⇒ zero output ⇒ back-compat. No editor canvas
 * preview (the reveal plays on the frontend as the block scrolls into view).
 */

import { __ } from '@wordpress/i18n';
import { ABSelectControl } from './ABControls';

const OPTIONS = [
	{ label: __( 'None', 'axiom-blocks' ), value: '' },
	{ label: __( 'Fade', 'axiom-blocks' ), value: 'fade' },
	{ label: __( 'Fade up', 'axiom-blocks' ), value: 'fade-up' },
	{ label: __( 'Fade down', 'axiom-blocks' ), value: 'fade-down' },
	{ label: __( 'Fade left', 'axiom-blocks' ), value: 'fade-left' },
	{ label: __( 'Fade right', 'axiom-blocks' ), value: 'fade-right' },
	{ label: __( 'Zoom in', 'axiom-blocks' ), value: 'zoom-in' },
];

export function ABEntrance( { attributes, setAttributes } ) {
	return (
		<ABSelectControl
			label={ __( 'Entrance animation', 'axiom-blocks' ) }
			help={ __(
				'Plays as the block scrolls into view. Respects reduced-motion.',
				'axiom-blocks'
			) }
			value={ attributes.abEntrance || '' }
			options={ OPTIONS }
			onChange={ ( v ) => setAttributes( { abEntrance: v } ) }
		/>
	);
}
