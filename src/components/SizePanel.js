/**
 * SizePanel — shared design-layer size control: Width / Max-width / Min-height,
 * each per-device. Self-contained — renders its own ABEditPopover trigger with
 * a device switcher in the header; composes the single-length SizeControl
 * primitive for each field.
 *
 * Attribute keys derive from an element `prefix` ('' → width…, 'card' →
 * cardWidth…); each field registers Desktop + Tablet + Mobile variants
 * (`sizeAttrs`). Values are CSS length strings; `getSizeVars` emits
 * `${varPrefix}-w / -mw / -mh` resolved for the active device, so an untouched
 * panel produces zero output.
 */

import { __ } from '@wordpress/i18n';
import { SizeControl } from './SizeControl';
import { ABEditPopover } from './ABEditPopover';
import { DeviceSwitcher } from './DeviceSwitcher';
import { useDeviceType, deviceKey, resolveResponsive } from './responsive';

const cap = ( s ) => s[ 0 ].toUpperCase() + s.slice( 1 );
const camel = ( prefix, key ) =>
	prefix ? `${ prefix }${ cap( key ) }` : key;

const FIELDS = [
	{ base: 'width', label: __( 'Width', 'axiom-blocks' ), unit: '%' },
	{ base: 'maxWidth', label: __( 'Max width', 'axiom-blocks' ), unit: 'rem' },
	{
		base: 'minHeight',
		label: __( 'Min height', 'axiom-blocks' ),
		unit: 'px',
	},
];

const SizeIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.6"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 20, height: 20, minWidth: 20, flexShrink: 0 } }
	>
		<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
	</svg>
);

/* Shared attribute definitions — Desktop + Tablet + Mobile per field. */
export function sizeAttrs( prefix = '' ) {
	const attrs = {};
	FIELDS.forEach( ( { base } ) => {
		[ '', 'Tablet', 'Mobile' ].forEach( ( sfx ) => {
			attrs[ camel( prefix, base ) + sfx ] = {
				type: 'string',
				default: '',
			};
		} );
	} );
	return attrs;
}

/* CSS-var object resolved for the active device. Unset ⇒ no var ⇒ zero output. */
export function getSizeVars(
	attrs,
	{ prefix = '', varPrefix, device = 'Desktop' }
) {
	const v = ( base ) =>
		resolveResponsive( attrs, camel( prefix, base ), device ) || undefined;
	return {
		[ `${ varPrefix }-w` ]: v( 'width' ),
		[ `${ varPrefix }-mw` ]: v( 'maxWidth' ),
		[ `${ varPrefix }-mh` ]: v( 'minHeight' ),
	};
}

function anySet( attrs, baseKey ) {
	return (
		!! attrs[ baseKey ] ||
		!! attrs[ `${ baseKey }Tablet` ] ||
		!! attrs[ `${ baseKey }Mobile` ]
	);
}

export function SizePanel( {
	label = __( 'Size', 'axiom-blocks' ),
	attrs,
	onChange,
	prefix = '',
} ) {
	const device = useDeviceType();
	const keyFor = ( base ) => camel( prefix, base );

	const wKey = keyFor( 'width' );
	const mwKey = keyFor( 'maxWidth' );
	const mhKey = keyFor( 'minHeight' );

	const isDefault =
		! anySet( attrs, wKey ) &&
		! anySet( attrs, mwKey ) &&
		! anySet( attrs, mhKey );

	const summaryVal = ( base ) =>
		resolveResponsive( attrs, keyFor( base ), device ) || '';
	const summary = `${
		summaryVal( 'width' ) || __( 'auto', 'axiom-blocks' )
	} · ${ summaryVal( 'maxWidth' ) || __( 'auto', 'axiom-blocks' ) }`;

	const reset = () => {
		const update = {};
		[ wKey, mwKey, mhKey ].forEach( ( base ) => {
			[ '', 'Tablet', 'Mobile' ].forEach( ( sfx ) => {
				update[ base + sfx ] = '';
			} );
		} );
		onChange( update );
	};

	return (
		<ABEditPopover
			label={ label }
			title={ label }
			glyph={ <SizeIcon /> }
			summary={ summary }
			isDefault={ isDefault }
			placeholder={ __( 'auto', 'axiom-blocks' ) }
			device={ <DeviceSwitcher compact /> }
			onReset={ isDefault ? undefined : reset }
		>
			{ FIELDS.map( ( { base, label: fieldLabel, unit } ) => {
				const dKey = deviceKey( keyFor( base ), device );
				const actual = attrs[ dKey ] ?? '';
				const inherited =
					resolveResponsive( attrs, keyFor( base ), device ) || '';
				return (
					<SizeControl
						key={ base }
						label={ fieldLabel }
						value={ actual === '' ? inherited : actual }
						onChange={ ( v ) => onChange( { [ dKey ]: v } ) }
						defaultUnit={ unit }
					/>
				);
			} ) }
		</ABEditPopover>
	);
}
