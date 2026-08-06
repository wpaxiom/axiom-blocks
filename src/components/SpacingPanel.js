/**
 * SpacingPanel — Gutenberg InspectorControls panel for padding & margin.
 * Matches the design from the Axiom Blocks Design System handoff.
 * The linked/unlinked 4-value engine lives in LinkedBoxControl.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { useDeviceType, resolveResponsive } from './responsive';
import { LinkedBoxControl } from './LinkedBoxControl';

/* Shared attribute definitions — spread into each block's attributes object */
export const SPACING_ATTRS = {
	paddingTop: { type: 'string', default: '' },
	paddingRight: { type: 'string', default: '' },
	paddingBottom: { type: 'string', default: '' },
	paddingLeft: { type: 'string', default: '' },
	marginTop: { type: 'string', default: '' },
	marginRight: { type: 'string', default: '' },
	marginBottom: { type: 'string', default: '' },
	marginLeft: { type: 'string', default: '' },
};

/* Build a style object from block attributes for use in useBlockProps.
 * Uses CSS custom properties so the stylesheet (which uses --ab-padding-*) works.
 *
 * `device` resolves the value for the active WP preview device (cascade
 * Mobile → Tablet → Desktop). Defaults to Desktop, so existing callers that pass
 * only `attrs` are unchanged. */
/* Hook form: resolves spacing for the active WP preview device. Blocks spread
 * this into useBlockProps so the editor canvas previews the device's values. */
export function useSpacingStyle( attrs ) {
	const device = useDeviceType();
	return getSpacingStyle( attrs, device );
}

export function getSpacingStyle( attrs, device = 'Desktop' ) {
	const v = ( key ) => resolveResponsive( attrs, key, device ) || undefined;
	return {
		'--ab-padding-top': v( 'paddingTop' ),
		'--ab-padding-right': v( 'paddingRight' ),
		'--ab-padding-bottom': v( 'paddingBottom' ),
		'--ab-padding-left': v( 'paddingLeft' ),
		'--ab-margin-top': v( 'marginTop' ),
		'--ab-margin-right': v( 'marginRight' ),
		'--ab-margin-bottom': v( 'marginBottom' ),
		'--ab-margin-left': v( 'marginLeft' ),
		paddingTop: v( 'paddingTop' ),
		paddingRight: v( 'paddingRight' ),
		paddingBottom: v( 'paddingBottom' ),
		paddingLeft: v( 'paddingLeft' ),
		marginTop: v( 'marginTop' ),
		marginRight: v( 'marginRight' ),
		marginBottom: v( 'marginBottom' ),
		marginLeft: v( 'marginLeft' ),
	};
}

const SIDES = [
	{ key: 'top', label: 'TOP' },
	{ key: 'right', label: 'RIGHT' },
	{ key: 'bottom', label: 'BOTTOM' },
	{ key: 'left', label: 'LEFT' },
];

/* Stable ref callback — sets !important so WP admin CSS cannot override the size */
const applySvgSize = ( el ) => {
	if ( ! el ) return;
	el.style.setProperty( 'width', '20px', 'important' );
	el.style.setProperty( 'height', '20px', 'important' );
	el.style.setProperty( 'min-width', '20px', 'important' );
	el.style.setProperty( 'flex-shrink', '0', 'important' );
};

const BoxIcon = ( { type } ) => (
	<svg
		ref={ applySvgSize }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{ /padding/i.test( type ) ? (
			<>
				<rect
					x="3"
					y="3"
					width="18"
					height="18"
					rx="1.5"
					strokeDasharray="3 2"
				/>
				<rect x="8" y="8" width="8" height="8" rx="1" />
			</>
		) : (
			<>
				<rect
					x="1"
					y="1"
					width="22"
					height="22"
					rx="1.5"
					strokeDasharray="3 2"
				/>
				<rect x="5" y="5" width="14" height="14" rx="1" />
			</>
		) }
	</svg>
);

/* ── Single axis control (Padding or Margin) ────────────────────────────── */
export function SpacingControl( {
	label,
	type,
	attrs,
	onChange,
	defaults,
	responsive = false,
	device = 'Desktop',
	showDeviceSwitcher = false,
} ) {
	const keys = SIDES.map(
		( s ) => `${ type }${ s.key[ 0 ].toUpperCase() }${ s.key.slice( 1 ) }`
	);
	return (
		<LinkedBoxControl
			label={ label }
			keys={ keys }
			valueLabels={ SIDES.map( ( s ) => s.label ) }
			icon={ <BoxIcon type={ type } /> }
			attrs={ attrs }
			onChange={ onChange }
			defaults={ defaults }
			responsive={ responsive }
			device={ device }
			showDeviceSwitcher={ showDeviceSwitcher }
		/>
	);
}

/* ── Public panel component ─────────────────────────────────────────────── */
export function SpacingPanel( {
	attributes,
	setAttributes,
	responsive = true,
} ) {
	// Always read the device (hook must run unconditionally); only used when
	// `responsive` is on. Driven by WordPress's native top-bar device switcher.
	const device = useDeviceType();
	return (
		<PanelBody
			title={ __( 'Spacing', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<SpacingControl
				label="PADDING"
				type="padding"
				attrs={ attributes }
				onChange={ ( update ) => setAttributes( update ) }
				responsive={ responsive }
				device={ device }
				showDeviceSwitcher={ true }
			/>
			<div className="ab-sp-sep" />
			<SpacingControl
				label="MARGIN"
				type="margin"
				attrs={ attributes }
				onChange={ ( update ) => setAttributes( update ) }
				responsive={ responsive }
				device={ device }
				showDeviceSwitcher={ true }
			/>
		</PanelBody>
	);
}
