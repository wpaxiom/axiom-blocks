/**
 * ShadowControl — shared design-layer box-shadow control (workspace form).
 *
 * Self-contained: renders its own ABEditPopover trigger (summary row) and a
 * popover workspace — preset pills (None/S/M/L/XL) + live preview + custom
 * offsets (X/Y/blur/spread) + color + inset. Storage contract is unchanged
 * from the original: a single resolved box-shadow STRING in one attribute, set
 * via `onChange(string)`; presets keep the exact same strings, so any value a
 * live block already saved still maps to its preset.
 *
 * The block emits the stored value into a CSS var consumed by style.scss
 * (`box-shadow: var(--…-shadow, none)`), so an unset value produces zero output.
 * Shadow colors are 8-digit hex (alpha) — safecss_filter_attr strips
 * rgba()/hsl() from inline values.
 */

import { __ } from '@wordpress/i18n';
import { ABRangeControl, ABColorControl, ABToggleControl } from './ABControls';
import { ABEditPopover } from './ABEditPopover';
import { StateTabs } from './StateTabs';

/* An explicit "no shadow", as opposed to an empty attribute. Empty means "let
 * the stylesheet paint whatever it ships"; on a part whose shipped look already
 * includes a shadow (pricing-table's Featured card) that made None a no-op. So
 * when there is a shipped default to override, None stores this literal and the
 * CSS var wins. Reset still clears the attribute back to the shipped look. */
const NONE = 'none';
const isNone = ( v ) => ! v || v === NONE;

/* value === the full box-shadow string. Keep colors as 8-digit hex. */
export const SHADOW_PRESETS = [
	{ label: __( 'None', 'axiom-blocks' ), value: '' },
	{ label: __( 'Small', 'axiom-blocks' ), value: '0 1px 2px 0 #0000000d' },
	{
		label: __( 'Medium', 'axiom-blocks' ),
		value: '0 4px 6px -1px #0000001a, 0 2px 4px -2px #0000001a',
	},
	{
		label: __( 'Large', 'axiom-blocks' ),
		value: '0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a',
	},
	{
		label: __( 'Extra large', 'axiom-blocks' ),
		value: '0 20px 25px -5px #0000001a, 0 8px 10px -6px #0000001a',
	},
];

const PRESET_TABS = [
	{ label: __( 'None', 'axiom-blocks' ), value: SHADOW_PRESETS[ 0 ].value },
	{ label: 'S', value: SHADOW_PRESETS[ 1 ].value },
	{ label: 'M', value: SHADOW_PRESETS[ 2 ].value },
	{ label: 'L', value: SHADOW_PRESETS[ 3 ].value },
	{ label: 'XL', value: SHADOW_PRESETS[ 4 ].value },
];

const CUSTOM_DEFAULT = {
	inset: false,
	x: 0,
	y: 4,
	blur: 14,
	spread: 0,
	color: '#12121729',
};

/* First layer → editable single-layer fields (presets are multi-layer; the
 * custom controls represent one layer, so editing any of them detaches to a
 * single-layer custom shadow). */
function parseShadow( value ) {
	if ( isNone( value ) ) {
		return { ...CUSTOM_DEFAULT };
	}
	const first = value.split( ',' )[ 0 ].trim();
	const inset = /(^|\s)inset(\s|$)/.test( first );
	const body = first.replace( 'inset', '' ).trim();
	const colorMatch = body.match( /#[0-9a-fA-F]{3,8}/ );
	const color = colorMatch ? colorMatch[ 0 ] : CUSTOM_DEFAULT.color;
	const nums = body
		.replace( /#[0-9a-fA-F]{3,8}/, '' )
		.trim()
		.split( /\s+/ )
		.map( ( t ) => parseInt( t, 10 ) );
	return {
		inset,
		x: nums[ 0 ] || 0,
		y: nums[ 1 ] || 0,
		blur: nums[ 2 ] || 0,
		spread: nums[ 3 ] || 0,
		color,
	};
}

function buildShadow( { inset, x, y, blur, spread, color } ) {
	return `${
		inset ? 'inset ' : ''
	}${ x }px ${ y }px ${ blur }px ${ spread }px ${ color }`;
}

function shadowSummary( value ) {
	if ( isNone( value ) ) {
		return __( 'None', 'axiom-blocks' );
	}
	const preset = SHADOW_PRESETS.find( ( p ) => p.value === value );
	return preset ? preset.label : __( 'Custom', 'axiom-blocks' );
}

const ShadowIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.6"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 20, height: 20, minWidth: 20, flexShrink: 0 } }
	>
		<rect x="4" y="4" width="13" height="13" rx="2" />
		<path d="M9 20h9a2 2 0 002-2V9" />
	</svg>
);

export function ShadowControl( {
	label = __( 'Shadow', 'axiom-blocks' ),
	value = '',
	onChange,
	defaultValue = '',
	defaultLabel = '',
} ) {
	// `defaultValue` is the shadow the stylesheet already paints while the
	// attribute is empty. It only renders — summary, preview and the workspace
	// fields start from what you can see — so Reset still clears to the shipped
	// look instead of stamping a copy of it into the attribute.
	const effective = value || defaultValue;
	// With a shipped default in play, the None pill has to write a real value to
	// beat it; without one, an empty attribute already means no shadow.
	const tabs = defaultValue
		? [ { ...PRESET_TABS[ 0 ], value: NONE }, ...PRESET_TABS.slice( 1 ) ]
		: PRESET_TABS;
	const presetActive =
		tabs.find( ( p ) => p.value === effective )?.value ?? null;
	const fields = parseShadow( effective );
	const setField = ( patch ) =>
		onChange( buildShadow( { ...fields, ...patch } ) );

	return (
		<ABEditPopover
			label={ label }
			title={ __( 'Box shadow', 'axiom-blocks' ) }
			glyph={ <ShadowIcon /> }
			summary={ shadowSummary( value ) }
			isDefault={ ! value }
			placeholder={
				defaultValue
					? defaultLabel || shadowSummary( defaultValue )
					: __( 'None', 'axiom-blocks' )
			}
			onReset={ value ? () => onChange( '' ) : undefined }
		>
			<StateTabs
				options={ tabs }
				value={ presetActive }
				onChange={ ( v ) => onChange( v ) }
			/>

			<div className="ab-shadow-preview">
				<div
					className="ab-shadow-preview__box"
					style={ { boxShadow: effective || 'none' } }
				/>
			</div>

			<ABRangeControl
				label={ __( 'Offset X', 'axiom-blocks' ) }
				value={ fields.x }
				onChange={ ( v ) => setField( { x: v } ) }
				min={ -50 }
				max={ 50 }
				unit="px"
			/>
			<ABRangeControl
				label={ __( 'Offset Y', 'axiom-blocks' ) }
				value={ fields.y }
				onChange={ ( v ) => setField( { y: v } ) }
				min={ -50 }
				max={ 50 }
				unit="px"
			/>
			<ABRangeControl
				label={ __( 'Blur', 'axiom-blocks' ) }
				value={ fields.blur }
				onChange={ ( v ) => setField( { blur: v } ) }
				min={ 0 }
				max={ 100 }
				unit="px"
			/>
			<ABRangeControl
				label={ __( 'Spread', 'axiom-blocks' ) }
				value={ fields.spread }
				onChange={ ( v ) => setField( { spread: v } ) }
				min={ -50 }
				max={ 50 }
				unit="px"
			/>
			<ABColorControl
				label={ __( 'Color', 'axiom-blocks' ) }
				color={ fields.color }
				onChange={ ( v ) =>
					setField( { color: v || CUSTOM_DEFAULT.color } )
				}
			/>
			<ABToggleControl
				label={ __( 'Inset shadow', 'axiom-blocks' ) }
				checked={ fields.inset }
				onChange={ ( v ) => setField( { inset: v } ) }
			/>
		</ABEditPopover>
	);
}
