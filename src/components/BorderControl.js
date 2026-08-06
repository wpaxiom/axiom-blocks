/**
 * BorderControl — shared design-layer border control: per-side width
 * (linked/unlinked via LinkedBoxControl), style, and color.
 *
 * Attribute keys derive from an element `prefix` ('' → borderTopWidth…,
 * 'card' → cardBorderTopWidth…) or can be passed explicitly to bind legacy
 * names. Emitted CSS vars use the -bw-top / -bs / -bc forms: an inline custom
 * property must never contain the substring "border-width" (core's
 * `[style*=border-width]` rule would force border-style: solid).
 */

import { __ } from '@wordpress/i18n';
import { resolveResponsive } from './responsive';
import { LinkedBoxControl } from './LinkedBoxControl';
import { ABSelectControl, ABColorControl, ABRangeControl } from './ABControls';
import { ABEditPopover } from './ABEditPopover';
import { DeviceSwitcher } from './DeviceSwitcher';

const cap = ( s ) => s[ 0 ].toUpperCase() + s.slice( 1 );
const camel = ( prefix, key ) =>
	prefix ? `${ prefix }${ cap( key ) }` : key;

const SIDES = [ 'Top', 'Right', 'Bottom', 'Left' ];
const SIDE_LABELS = [ 'TOP', 'RIGHT', 'BOTTOM', 'LEFT' ];

const widthKeysFor = ( prefix ) =>
	SIDES.map( ( s ) => camel( prefix, `border${ s }Width` ) );

/* Shared attribute definitions — spread into a block's attributes object. */
export function borderAttrs( prefix = '' ) {
	const attrs = {};
	widthKeysFor( prefix ).forEach( ( k ) => {
		attrs[ k ] = { type: 'string', default: '' };
	} );
	attrs[ camel( prefix, 'borderStyle' ) ] = { type: 'string', default: '' };
	attrs[ camel( prefix, 'borderColor' ) ] = { type: 'string', default: '' };
	return attrs;
}

/* CSS-var object for the block wrapper / scoped styles. Unset values emit
 * nothing, so blocks that never touch the control produce zero output. */
export function getBorderVars(
	attrs,
	{ prefix = '', varPrefix, device = 'Desktop' }
) {
	const v = ( key ) =>
		resolveResponsive( attrs, camel( prefix, key ), device ) || undefined;
	const widths = SIDES.map( ( s ) => v( `border${ s }Width` ) );
	const hasWidth = widths.some( ( w ) => w !== undefined );
	return {
		[ `${ varPrefix }-bw-top` ]: widths[ 0 ],
		[ `${ varPrefix }-bw-right` ]: widths[ 1 ],
		[ `${ varPrefix }-bw-bottom` ]: widths[ 2 ],
		[ `${ varPrefix }-bw-left` ]: widths[ 3 ],
		[ `${ varPrefix }-bs` ]: hasWidth
			? v( 'borderStyle' ) || 'solid'
			: v( 'borderStyle' ),
		[ `${ varPrefix }-bc` ]: v( 'borderColor' ),
	};
}

const BorderIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 20, height: 20, minWidth: 20, flexShrink: 0 } }
	>
		<rect x="3" y="3" width="18" height="18" rx="1.5" />
		<path d="M3 16.5h18" strokeDasharray="3 2" />
	</svg>
);

const STYLE_OPTIONS = [
	{ label: __( 'Solid', 'axiom-blocks' ), value: 'solid' },
	{ label: __( 'Dashed', 'axiom-blocks' ), value: 'dashed' },
	{ label: __( 'Dotted', 'axiom-blocks' ), value: 'dotted' },
];

export function BorderControl( {
	label = __( 'Border', 'axiom-blocks' ),
	attrs,
	onChange,
	prefix = '',
	widthKeys,
	styleKey,
	colorKey,
	sides = true,
	styles = true,
	colorDefault = '',
	widthDefault = '',
	styleDefault = 'solid',
	min = 0,
	max = 20,
	responsive = false,
	device = 'Desktop',
	showDeviceSwitcher = false,
} ) {
	const wKeys = widthKeys || widthKeysFor( prefix );
	const sKey = styleKey || camel( prefix, 'borderStyle' );
	const cKey = colorKey || camel( prefix, 'borderColor' );

	const styleVal = attrs[ sKey ] || styleDefault || 'solid';
	const hasWidth = wKeys.some(
		( k ) => attrs[ k ] && ( parseInt( attrs[ k ], 10 ) || 0 ) > 0
	);
	const summary = hasWidth
		? `${ parseInt( attrs[ wKeys[ 0 ] ], 10 ) || 0 }px ${ styleVal }`
		: __( 'None', 'axiom-blocks' );
	// What the stylesheet paints while nothing is applied — the row would
	// otherwise read "None" on a block that visibly has a border. A per-side
	// default advertises its first painted side, not side 0, so a bottom-only
	// rule (tab bar) still reports a width instead of "None".
	const defaultWidth = Array.isArray( widthDefault )
		? widthDefault.reduce(
				( found, w ) => found || parseInt( w, 10 ) || 0,
				0
		  )
		: parseInt( widthDefault, 10 );
	const placeholder =
		defaultWidth > 0
			? `${ defaultWidth }px ${ styleVal }`
			: __( 'None', 'axiom-blocks' );

	const reset = () => {
		const update = {};
		wKeys.forEach( ( k ) => {
			update[ k ] = '';
		} );
		update[ sKey ] = '';
		update[ cKey ] = '';
		onChange( update );
	};

	return (
		<ABEditPopover
			label={ label }
			title={ __( 'Border', 'axiom-blocks' ) }
			glyph={ <BorderIcon /> }
			summary={ summary }
			isDefault={ ! hasWidth }
			placeholder={ placeholder }
			device={ showDeviceSwitcher ? <DeviceSwitcher compact /> : null }
			onReset={
				hasWidth || attrs[ sKey ] || attrs[ cKey ] ? reset : undefined
			}
		>
			{ styles && (
				<ABSelectControl
					label={ __( 'Style', 'axiom-blocks' ) }
					value={ styleVal }
					onChange={ ( v ) => onChange( { [ sKey ]: v } ) }
					options={ STYLE_OPTIONS }
				/>
			) }
			{ sides ? (
				<LinkedBoxControl
					label={ __( 'Width', 'axiom-blocks' ) }
					keys={ wKeys }
					valueLabels={ SIDE_LABELS }
					icon={ <BorderIcon /> }
					attrs={ attrs }
					onChange={ onChange }
					defaults={ widthDefault }
					min={ min }
					max={ max }
					responsive={ responsive }
					device={ device }
					showDeviceSwitcher={ false }
				/>
			) : (
				<ABRangeControl
					label={ __( 'Width', 'axiom-blocks' ) }
					value={ parseInt( attrs[ wKeys[ 0 ] ], 10 ) || 0 }
					onChange={ ( v ) => {
						const stored = v ? `${ v }px` : '';
						const update = {};
						wKeys.forEach( ( k ) => {
							update[ k ] = stored;
						} );
						onChange( update );
					} }
					min={ min }
					max={ max }
					unit="px"
				/>
			) }
			<ABColorControl
				label={ __( 'Color', 'axiom-blocks' ) }
				color={ attrs[ cKey ] || colorDefault }
				onChange={ ( v ) => onChange( { [ cKey ]: v || '' } ) }
			/>
		</ABEditPopover>
	);
}
