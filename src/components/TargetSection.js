/**
 * TargetSection — renders one anatomy "part" (Container, Item, Header, …) as a
 * PanelBody whose contents are the fixed capability stack, driven entirely by a
 * declaration. The block stops hand-building style JSX; it describes each part
 * and this component renders the controls in the canonical order:
 *
 *   Alignment → Colors → Background → Typography → Border → Radius → Shadow →
 *   Padding → Size → Gap
 *
 * A part that doesn't opt into a capability simply omits it — no empty rows.
 * When a part is dual-kind (has both content and style, e.g. Icon), pass a
 * `content` node and the section shows a [Content | Style] switch.
 *
 * States (hover): a part declares `states: [ 'hover' ]` (and/or 'active'). A
 * StateTabs (Normal ‖ Hover ‖ …) then scopes the part's stateful rows — colors,
 * single-color background, and shadow — which edit the `${bind}${State}` variant
 * (e.g. `headerBg` → `headerBgHover`); a color row opts out with `static: true`.
 * Non-stateful capabilities (typography, border, radius, padding, size) render in
 * Normal only. The block registers the `${bind}Hover` attrs and emits a `-hover`
 * CSS var that a static `:hover` rule in its style.scss consumes
 * (`var(--x-hover, var(--x))`), so states never need a scoped stylesheet and never
 * combine with responsive.
 *
 * Every binding maps to an existing shipped attribute (no data change) or a new
 * additive one. Border/radius reproduce the legacy single-value → linked seed and
 * the "all longhands cleared ⇒ clear the legacy attr" behaviour so re-homing a
 * shipped block is byte-identical.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { ABColorControl, ABRangeControl } from './ABControls';
import { BorderControl } from './BorderControl';
import { RadiusControl } from './RadiusControl';
import { ShadowControl } from './ShadowControl';
import { SizeControl } from './SizeControl';
import { SizePanel } from './SizePanel';
import { BackgroundControl } from './BackgroundControl';
import { AlignControl } from './AlignControl';
import { SpacingControl } from './SpacingPanel';
import { TypographyPanel } from './TypographyPanel';
import { ABEditPopover } from './ABEditPopover';
import { StateTabs } from './StateTabs';
import { ABResponsive } from './ABResponsive';
import { resolveResponsive } from './responsive';

const UNIT_RE = /^-?[\d.]+\s*([a-z%]+)$/i;
const unitOf = ( v, fallback ) => {
	const m = UNIT_RE.exec( String( v ?? '' ).trim() );
	return m ? m[ 1 ].toLowerCase() : fallback;
};
const numOf = ( v, fallback ) => {
	if ( v === '' || v == null ) {
		return fallback;
	}
	const n = parseFloat( v );
	return isNaN( n ) ? fallback : n;
};
const withUnit = ( n, unit ) =>
	n === '' || n == null ? '' : `${ n }${ unit }`;

const cap = ( s ) => s[ 0 ].toUpperCase() + s.slice( 1 );
const tcamel = ( prefix, k ) => ( prefix ? `${ prefix }${ cap( k ) }` : k );

/* A `ranges` row. `units` opts the row into ABRangeControl's inline unit picker
 * and keeps whatever unit the stored value already carries — needed when a
 * shipped free-text size (e.g. `6rem`) is re-homed onto a range, which would
 * otherwise rewrite it to px the first time it's touched. `unitRange` gives each
 * unit its own min/max. Omit `units` and the row stays px-only, as before.
 *
 * `numeric` stores the bare number instead of a `<n><unit>` string — for shipped
 * `type: 'number'` attributes re-homed here, whose unit is applied downstream by
 * the block's var builder and the ResponsiveProps `format`. */
function RangeRow( { r, value, onChange } ) {
	const { units, numeric } = r;
	const unit = units ? unitOf( value, r.unit || 'px' ) : 'px';
	const bounds = ( r.unitRange && r.unitRange[ unit ] ) || [
		r.min ?? 0,
		r.max ?? 100,
	];
	const num = numOf( value, r.default ?? 0 );
	const emit = ( n, u ) => ( numeric ? n ?? 0 : withUnit( n, u ) );

	return (
		<ABRangeControl
			label={ r.label }
			value={ num }
			onChange={ ( v ) => onChange( emit( v, unit ) ) }
			min={ bounds[ 0 ] }
			max={ bounds[ 1 ] }
			step={ r.step ?? 1 }
			unit={ unit }
			units={ units }
			onUnitChange={
				units ? ( u ) => onChange( emit( num, u ) ) : undefined
			}
		/>
	);
}

const TypeGlyph = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 18, height: 18, minWidth: 18, flexShrink: 0 } }
	>
		<path d="M4 7V5h16v2M9 19h6M12 5v14" />
	</svg>
);

const typoSummary = ( attrs, prefix, device ) => {
	const size = resolveResponsive(
		attrs,
		tcamel( prefix, 'fontSize' ),
		device
	);
	const weight = resolveResponsive(
		attrs,
		tcamel( prefix, 'fontWeight' ),
		device
	);
	return [ size, weight ].filter( Boolean ).join( ' · ' );
};

/* Show the legacy single value as the linked value while the per-side/corner
 * longhands are unset — mirrors the CSS fallback chain in each block's scss. */
const seedLinked = ( attrs, keys, legacy ) => {
	if ( ! legacy || ! attrs[ legacy ] ) {
		return attrs;
	}
	const merged = { ...attrs };
	keys.forEach( ( k ) => {
		if ( ! merged[ k ] ) {
			merged[ k ] = attrs[ legacy ];
		}
	} );
	return merged;
};

function StyleStack( {
	target,
	attributes,
	setAttributes,
	device,
	state = 'normal',
} ) {
	const {
		align,
		colors,
		typography,
		background,
		border,
		radius,
		shadow,
		padding,
		size,
		ranges,
	} = target;

	// State axis: in a non-Normal state (hover/active) the stateful rows edit the
	// `${bind}${State}` variant; capabilities that don't take a state (typography,
	// border, radius, padding, size) render only in Normal. A color row can opt
	// out with `static: true`. States never combine with responsive.
	const isState = state !== 'normal';
	// Default variant naming is `${bind}${State}`; a declaration may override per
	// state (e.g. the shipped `activeHeaderColor`, which predates the convention)
	// via `stateBind: { active: 'activeHeaderColor' }`.
	const sk = ( bind, stateBind ) => {
		if ( ! isState ) {
			return bind;
		}
		if ( stateBind && stateBind[ state ] ) {
			return stateBind[ state ];
		}
		return `${ bind }${ cap( state ) }`;
	};

	// What the stylesheet paints while a capability is untouched. Rendered as the
	// row's placeholder / input placeholder only — never written to an attribute —
	// so a part whose shipped look includes a border or shadow stops reading
	// "None". A state (e.g. Featured) can override the base part's defaults.
	const borderDefaults =
		( isState && border?.stateDefaults?.[ state ] ) || {};
	const shadowDefaults =
		( isState && shadow?.stateDefaults?.[ state ] ) || {};

	const bgInsertEnd =
		background?.insertAfter != null
			? background.insertAfter + 1
			: colors?.length ?? 0;

	return (
		<>
			{ ! isState &&
				align &&
				( align.responsive ? (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey={ align.bind }
					>
						{ ( { value, setValue, inherited } ) => (
							<AlignControl
								label={ align.label }
								value={ value === '' ? inherited || '' : value }
								onChange={ setValue }
							/>
						) }
					</ABResponsive>
				) : (
					<AlignControl
						label={ align.label }
						value={ attributes[ align.bind ] }
						onChange={ ( v ) =>
							setAttributes( { [ align.bind ]: v } )
						}
					/>
				) ) }

			{ colors &&
				colors
					.slice( 0, bgInsertEnd )
					.map( ( row ) => {
						if ( isState && row.static ) {
							return null;
						}
						if ( row.stateOnly && ! isState ) {
							return null;
						}
						const key = row.static
							? row.bind
							: sk( row.bind, row.stateBind );
						return (
							<ABColorControl
								key={ row.bind }
								label={ row.label }
								color={ attributes[ key ] }
								fallbackColor={ row.fallback || '' }
								onChange={ ( v ) =>
									setAttributes( { [ key ]: v || '' } )
								}
							/>
						);
					} ) }

			{ background &&
				( background.full ? (
					<BackgroundControl
						label={
							background.label ||
							__( 'Background', 'axiom-blocks' )
						}
						attrs={ attributes }
						onChange={ ( update ) => setAttributes( update ) }
						prefix={
							isState && background.statePrefix?.[ state ]
								? background.statePrefix[ state ]
								: background.prefix || ''
						}
						colorKey={
							isState && background.stateColorKey?.[ state ]
								? background.stateColorKey[ state ]
								: background.colorKey
						}
						overlay={ background.overlay !== false }
						image={ background.image !== false }
					/>
				) : (
					<ABColorControl
						label={
							background.label ||
							__( 'Background', 'axiom-blocks' )
						}
						color={
							attributes[
								sk( background.bind, background.stateBind )
							]
						}
						fallbackColor={
							( isState &&
								background.stateFallback?.[ state ] ) ||
							background.fallback ||
							''
						}
						onChange={ ( v ) =>
							setAttributes( {
								[ sk(
									background.bind,
									background.stateBind
								) ]: v || '',
							} )
						}
					/>
				) ) }

			{ background?.insertAfter != null && colors &&
				colors
					.slice( bgInsertEnd )
					.map( ( row ) => {
						if ( isState && row.static ) {
							return null;
						}
						if ( row.stateOnly && ! isState ) {
							return null;
						}
						const key = row.static
							? row.bind
							: sk( row.bind, row.stateBind );
						return (
							<ABColorControl
								key={ row.bind }
								label={ row.label }
								color={ attributes[ key ] }
								fallbackColor={ row.fallback || '' }
								onChange={ ( v ) =>
									setAttributes( { [ key ]: v || '' } )
								}
							/>
						);
					} ) }

			{ ! isState &&
				typography !== undefined &&
				( Array.isArray( typography )
					? typography.map( ( t, i ) => (
							<ABEditPopover
								key={ i }
								label={ t.label || __( 'Typography', 'axiom-blocks' ) }
								title={ t.title || t.label || __( 'Typography', 'axiom-blocks' ) }
								glyph={ <TypeGlyph /> }
								summary={ typoSummary( attributes, t.prefix, device ) }
								isDefault={ ! typoSummary( attributes, t.prefix, device ) }
								placeholder={ __( 'Default', 'axiom-blocks' ) }
							>
								<TypographyPanel
									attributes={ attributes }
									setAttributes={ setAttributes }
									prefix={ t.prefix }
									responsive
									unwrapped
								/>
							</ABEditPopover>
					  ) )
					: ( typography && (
							<ABEditPopover
								label={ __( 'Typography', 'axiom-blocks' ) }
								title={ __( 'Typography', 'axiom-blocks' ) }
								glyph={ <TypeGlyph /> }
								summary={ typoSummary( attributes, typography, device ) }
								isDefault={
									! typoSummary( attributes, typography, device )
								}
								placeholder={ __( 'Default', 'axiom-blocks' ) }
							>
								<TypographyPanel
									attributes={ attributes }
									setAttributes={ setAttributes }
									prefix={ typography }
									responsive
									unwrapped
								/>
							</ABEditPopover>
					  ) ) ) }

			{ border && (
				<BorderControl
					label={ border.label || __( 'Border', 'axiom-blocks' ) }
					prefix={ border.prefix || '' }
					widthKeys={
						isState && border.stateWidthKeys?.[ state ]
							? border.stateWidthKeys[ state ]
							: border.widthKeys
					}
					styleKey={
						isState && border.stateStyleKey?.[ state ]
							? border.stateStyleKey[ state ]
							: border.styleKey
					}
					colorKey={
						isState && border.stateBind
							? sk( border.colorKey, border.stateBind )
							: border.colorKey
					}
					colorDefault={
						borderDefaults.color ?? border.colorDefault ?? ''
					}
					widthDefault={
						borderDefaults.width ?? border.widthDefault ?? ''
					}
					styleDefault={
						borderDefaults.style ?? border.styleDefault ?? 'solid'
					}
					max={ border.max ?? 20 }
					attrs={ seedLinked(
						attributes,
						isState && border.stateWidthKeys?.[ state ]
							? border.stateWidthKeys[ state ]
							: border.widthKeys,
						border.legacyWidth
					) }
					onChange={ ( update ) => {
						const cleared =
							border.legacyWidth &&
							border.widthKeys.every(
								( k ) =>
									( k in update
										? update[ k ]
										: attributes[ k ] ) === ''
							);
						setAttributes(
							cleared
								? { ...update, [ border.legacyWidth ]: '' }
								: update
						);
					} }
				/>
			) }

			{ ! isState && radius && (
				<RadiusControl
					prefix={ radius.prefix || '' }
					radiusKeys={ radius.keys }
					defaults={ radius.defaults }
					max={ radius.max ?? 64 }
					attrs={ seedLinked(
						attributes,
						radius.keys,
						radius.legacyRadius
					) }
					onChange={ ( update ) => {
						const cleared =
							radius.legacyRadius &&
							radius.keys.every(
								( k ) =>
									( k in update
										? update[ k ]
										: attributes[ k ] ) === ''
							);
						setAttributes(
							cleared
								? { ...update, [ radius.legacyRadius ]: '' }
								: update
						);
					} }
				/>
			) }

			{ shadow && (
				<ShadowControl
					value={ attributes[ sk( shadow.bind, shadow.stateBind ) ] }
					defaultValue={
						shadowDefaults.value ?? shadow.default ?? ''
					}
					defaultLabel={
						shadowDefaults.label ?? shadow.defaultLabel ?? ''
					}
					onChange={ ( v ) =>
						setAttributes( {
							[ sk( shadow.bind, shadow.stateBind ) ]: v,
						} )
					}
				/>
			) }

			{ ! isState && padding && (
				<SpacingControl
					label={ padding.label || __( 'Padding', 'axiom-blocks' ) }
					type={ padding.type }
					attrs={ attributes }
					onChange={ ( update ) => setAttributes( update ) }
					defaults={ padding.defaults }
					responsive={ !! padding.responsive }
					device={ device }
					showDeviceSwitcher={ !! padding.responsive }
				/>
			) }

			{ ! isState &&
				size &&
				( size.panel ? (
					<SizePanel
						label={ size.label || __( 'Size', 'axiom-blocks' ) }
						attrs={ attributes }
						onChange={ ( update ) => setAttributes( update ) }
						prefix={ size.prefix || '' }
					/>
				) : size.responsive ? (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey={ size.bind }
					>
						{ ( { value, setValue, inherited } ) => (
							<SizeControl
								label={ size.label }
								value={ value === '' ? inherited || '' : value }
								onChange={ setValue }
								defaultUnit={ size.defaultUnit }
							/>
						) }
					</ABResponsive>
				) : (
					<SizeControl
						label={ size.label }
						value={ attributes[ size.bind ] }
						onChange={ ( v ) =>
							setAttributes( { [ size.bind ]: v } )
						}
						defaultUnit={ size.defaultUnit }
					/>
				) ) }

			{ ! isState &&
				ranges &&
				ranges.map( ( r ) =>
					r.responsive ? (
						<ABResponsive
							key={ r.bind }
							attributes={ attributes }
							setAttributes={ setAttributes }
							attrKey={ r.bind }
						>
							{ ( { value, setValue, inherited } ) => (
								<RangeRow
									r={ r }
									value={
										value !== '' && value != null
											? value
											: inherited
									}
									onChange={ setValue }
								/>
							) }
						</ABResponsive>
					) : (
						<RangeRow
							key={ r.bind }
							r={ r }
							value={ attributes[ r.bind ] }
							onChange={ ( v ) =>
								setAttributes( { [ r.bind ]: v } )
							}
						/>
					)
				) }
		</>
	);
}

export function TargetSection( {
	target,
	attributes,
	setAttributes,
	device = 'Desktop',
	content = null,
	initialOpen = false,
} ) {
	const [ pane, setPane ] = useState( content ? 'content' : 'style' );
	const states = Array.isArray( target.states ) ? target.states : [];
	const [ state, setState ] = useState( 'normal' );
	// `normalLabel` renames the base tab for parts whose states aren't
	// interaction states — pricing-table's Cards switch is a content axis
	// (`[ Default ‖ Featured ]`), where "Normal" would read as a hover state.
	const stateOptions = [
		{
			value: 'normal',
			label: target.normalLabel || __( 'Normal', 'axiom-blocks' ),
		},
		...states.map( ( s ) => ( { value: s, label: cap( s ) } ) ),
	];

	const stack = (
		<>
			{ states.length > 0 && (
				<StateTabs
					options={ stateOptions }
					value={ state }
					onChange={ setState }
				/>
			) }
			<StyleStack
				target={ target }
				attributes={ attributes }
				setAttributes={ setAttributes }
				device={ device }
				state={ states.length ? state : 'normal' }
			/>
		</>
	);

	return (
		<PanelBody title={ target.noun } initialOpen={ initialOpen }>
			{ content ? (
				<>
					<div
						className="ab-part-switch"
						role="tablist"
						aria-label={ target.noun }
					>
						<button
							type="button"
							role="tab"
							aria-selected={ pane === 'content' }
							className={ `ab-part-switch__btn${
								pane === 'content' ? ' is-active' : ''
							}` }
							onClick={ () => setPane( 'content' ) }
						>
							{ __( 'Content', 'axiom-blocks' ) }
						</button>
						<button
							type="button"
							role="tab"
							aria-selected={ pane === 'style' }
							className={ `ab-part-switch__btn${
								pane === 'style' ? ' is-active' : ''
							}` }
							onClick={ () => setPane( 'style' ) }
						>
							{ __( 'Style', 'axiom-blocks' ) }
						</button>
					</div>
					{ pane === 'content' ? content : stack }
				</>
			) : (
				stack
			) }
		</PanelBody>
	);
}
