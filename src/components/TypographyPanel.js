/**
 * TypographyPanel — Gutenberg InspectorControls panel for typography.
 * Figma-style controls in the Axiom Blocks Design System (purple #7C3AED, DM Sans).
 *
 * Pass a `prefix` to scope attributes — each block can mount multiple panels,
 * one per text element (e.g. heading, name, price, cta).
 */

import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useDeviceType, resolveResponsive } from './responsive';
import { DeviceSwitcher } from './DeviceSwitcher';

const KEYS = [
	'fontFamily',
	'fontWeight',
	'fontSize',
	'lineHeight',
	'letterSpacing',
	'textTransform',
	'textDecoration',
	'textAlign',
];

const camel = ( prefix, k ) =>
	prefix ? `${ prefix }${ k[ 0 ].toUpperCase() }${ k.slice( 1 ) }` : k;

/**
 * Build a `{ key: { type: 'string', default: '' } }` map for block.json.
 * Spread the result into your block's `attributes` object.
 *
 *   ...typographyAttrs('heading')  →  { headingFontFamily: ..., headingFontWeight: ..., ... }
 * @param prefix
 */
export function typographyAttrs( prefix = '' ) {
	return KEYS.reduce( ( acc, k ) => {
		acc[ camel( prefix, k ) ] = { type: 'string', default: '' };
		return acc;
	}, {} );
}

/**
 * Build a React inline-style object from block attributes.
 * Apply to the *element* you want styled, not necessarily the wrapper.
 * @param attrs
 * @param prefix
 */
export function getTypographyStyle( attrs, prefix = '' ) {
	return KEYS.reduce( ( acc, k ) => {
		const v = attrs[ camel( prefix, k ) ];
		if ( v ) acc[ k ] = v;
		return acc;
	}, {} );
}

/**
 * Hook form: resolves typography for the active WordPress preview device (cascade
 * Mobile → Tablet → Desktop). Blocks apply this to the styled element so the
 * editor canvas previews the device's values when the native device switch flips.
 * Falls back to the Desktop value, so it is a drop-in for getTypographyStyle.
 * @param attrs
 * @param prefix
 */
export function useTypographyStyle( attrs, prefix = '' ) {
	const device = useDeviceType();
	return KEYS.reduce( ( acc, k ) => {
		const v = resolveResponsive( attrs, camel( prefix, k ), device );
		if ( v ) acc[ k ] = v;
		return acc;
	}, {} );
}

/* ── Option lists ───────────────────────────────────────────────────────── */
// Family + weight lists are sourced from WordPress (theme.json + Font Library)
// — see useFontFamilies() / weightOptionsFor() inside the panel.

const WEIGHT_LABELS = {
	100: __( 'Thin', 'axiom-blocks' ),
	200: __( 'Extra Light', 'axiom-blocks' ),
	300: __( 'Light', 'axiom-blocks' ),
	400: __( 'Regular', 'axiom-blocks' ),
	500: __( 'Medium', 'axiom-blocks' ),
	600: __( 'Semi Bold', 'axiom-blocks' ),
	700: __( 'Bold', 'axiom-blocks' ),
	800: __( 'Extra Bold', 'axiom-blocks' ),
	900: __( 'Black', 'axiom-blocks' ),
};

const ALL_WEIGHTS = [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ];

const DEFAULT_WEIGHT_OPTIONS = [
	{ label: __( 'Default', 'axiom-blocks' ), value: '' },
	...ALL_WEIGHTS.map( ( w ) => ( {
		label: `${ w } ${ WEIGHT_LABELS[ w ] }`,
		value: String( w ),
	} ) ),
];

/**
 * Pull font families from WordPress (theme.json + Font Library + core defaults),
 * merged into a single deduplicated list.
 */
function useFontFamilies() {
	return useSelect( ( select ) => {
		const settings = select( 'core/block-editor' ).getSettings();
		const features =
			settings?.__experimentalFeatures?.typography?.fontFamilies;
		let list = [];
		if ( features && typeof features === 'object' ) {
			list = [
				...( features.default || [] ),
				...( features.theme || [] ),
				...( features.custom || [] ),
			];
		} else if ( Array.isArray( settings?.fontFamilies ) ) {
			list = settings.fontFamilies;
		}
		// Dedupe by fontFamily CSS value (last wins so custom overrides theme).
		const map = new Map();
		list.forEach( ( f ) => {
			if ( f?.fontFamily ) map.set( f.fontFamily, f );
		} );
		return Array.from( map.values() );
	}, [] );
}

/**
 * Build weight <option> list for a given family entry. If the family declares
 * fontFace[], only the loaded weights are offered. A "100 900" range (variable
 * font) expands to all 9 weights. Otherwise fall back to the standard 100–900.
 * @param family
 */
function weightOptionsFor( family ) {
	const faces = family?.fontFace;
	if ( ! Array.isArray( faces ) || faces.length === 0 ) {
		return DEFAULT_WEIGHT_OPTIONS;
	}

	const weights = new Set();
	faces.forEach( ( face ) => {
		const raw = String( face?.fontWeight ?? '' ).trim();
		if ( ! raw ) return;
		const parts = raw
			.split( /\s+/ )
			.map( ( p ) => parseInt( p, 10 ) )
			.filter( Number.isFinite );
		if ( parts.length === 2 ) {
			// Range, e.g. "100 900" — variable font; offer everything in between (rounded to 100s).
			const [ a, b ] = parts.sort( ( x, y ) => x - y );
			for ( let w = Math.ceil( a / 100 ) * 100; w <= b; w += 100 )
				weights.add( w );
		} else {
			parts.forEach( ( w ) => weights.add( w ) );
		}
	} );

	const sorted = Array.from( weights ).sort( ( a, b ) => a - b );
	if ( sorted.length === 0 ) return DEFAULT_WEIGHT_OPTIONS;

	return [
		{ label: __( 'Default', 'axiom-blocks' ), value: '' },
		...sorted.map( ( w ) => ( {
			label: `${ w } ${ WEIGHT_LABELS[ w ] || '' }`.trim(),
			value: String( w ),
		} ) ),
	];
}

/* ── Internal helpers ───────────────────────────────────────────────────── */
const stripUnit = ( v ) => {
	if ( v === '' || v == null ) return '';
	const m = String( v ).match( /^-?\d*\.?\d+/ );
	return m ? m[ 0 ] : '';
};

function NumPill( {
	value,
	onChange,
	unit,
	min,
	max,
	step,
	placeholder = '—',
	prefixIcon,
} ) {
	const num = stripUnit( value );
	const applied = num !== '';

	const handle = ( raw ) => {
		if ( raw === '' || raw == null ) return onChange( '' );
		const n = parseFloat( raw );
		if ( Number.isNaN( n ) ) return onChange( '' );
		onChange( unit ? `${ n }${ unit }` : `${ n }` );
	};

	const cls = [ 'ab-tp-num' ];
	if ( applied ) cls.push( 'is-applied' );
	if ( prefixIcon ) cls.push( 'has-prefix' );

	return (
		<div className={ cls.join( ' ' ) }>
			{ prefixIcon && (
				<span className="ab-tp-num__prefix">{ prefixIcon }</span>
			) }
			<input
				type="number"
				className="ab-tp-num__input"
				value={ num }
				onChange={ ( e ) => handle( e.target.value ) }
				min={ min }
				max={ max }
				step={ step }
				placeholder={ placeholder }
			/>
			{ unit && (
				<span className="ab-tp-num__unit">{ unit.toUpperCase() }</span>
			) }
		</div>
	);
}

function SelectPill( { value, onChange, options } ) {
	const [ open, setOpen ] = useState( false );
	const ref = useRef( null );
	const selectedLabel =
		options.find( ( o ) => ( o.value || '' ) === ( value || '' ) )?.label ??
		'';

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		const close = ( e ) => {
			if ( ref.current && ! ref.current.contains( e.target ) ) {
				setOpen( false );
			}
		};
		const onKey = ( e ) => e.key === 'Escape' && setOpen( false );
		document.addEventListener( 'mousedown', close );
		document.addEventListener( 'keydown', onKey );
		return () => {
			document.removeEventListener( 'mousedown', close );
			document.removeEventListener( 'keydown', onKey );
		};
	}, [ open ] );

	return (
		<div
			className={ `ab-tp-select${ value ? ' is-applied' : '' }${
				open ? ' is-open' : ''
			}` }
			ref={ ref }
		>
			<button
				type="button"
				className="ab-tp-select__el"
				onClick={ () => setOpen( ( v ) => ! v ) }
				aria-haspopup="listbox"
				aria-expanded={ open }
			>
				<span className="ab-tp-select__label">{ selectedLabel }</span>
			</button>
			<ChevronSvg />
			{ open && (
				<ul className="ab-tp-select__list" role="listbox">
					{ options.map( ( o ) => (
						<li key={ o.value || 'd' } role="none">
							<button
								type="button"
								role="option"
								aria-selected={
									( o.value || '' ) === ( value || '' )
								}
								className={ `ab-tp-select__opt${
									( o.value || '' ) === ( value || '' )
										? ' is-active'
										: ''
								}` }
								onClick={ () => {
									onChange( o.value );
									setOpen( false );
								} }
							>
								{ o.label }
							</button>
						</li>
					) ) }
				</ul>
			) }
		</div>
	);
}

function SegRow( { value, onChange, options, ariaLabel } ) {
	return (
		<div className="ab-tp-seg" role="radiogroup" aria-label={ ariaLabel }>
			{ options.map( ( opt ) => {
				const active = ( opt.value || '' ) === ( value || '' );
				return (
					<button
						key={ opt.value || 'default' }
						type="button"
						role="radio"
						aria-checked={ active }
						className={ `ab-tp-seg__btn${
							active ? ' is-active' : ''
						}` }
						title={ opt.title || '' }
						onClick={ () => onChange( opt.value ) }
					>
						{ opt.icon || (
							<span className="ab-tp-seg__txt">
								{ opt.label }
							</span>
						) }
					</button>
				);
			} ) }
		</div>
	);
}

function Field( { label, children } ) {
	return (
		<div className="ab-tp__field">
			<div className="ab-tp__field-label">{ label }</div>
			{ children }
		</div>
	);
}

/* ── Inline icons (24x24, currentColor) ─────────────────────────────────── */
const Svg = ( { children } ) => (
	<svg
		className="ab-tp-icon"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{ children }
	</svg>
);

const IconNone = () => (
	<Svg>
		<line x1="5" y1="19" x2="19" y2="5" />
	</Svg>
);
const IconLineH = () => (
	<svg
		className="ab-tp-icon"
		width="13"
		height="13"
		viewBox="0 0 14 14"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.4"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M2 2h10" />
		<path d="M2 12h10" />
		<path d="M5 9.5l2-5 2 5" />
		<path d="M5.7 7.5h2.6" />
	</svg>
);
const IconLetterS = () => (
	<svg
		className="ab-tp-icon"
		width="13"
		height="13"
		viewBox="0 0 14 14"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.4"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M2 2v10" />
		<path d="M12 2v10" />
		<path d="M5 9.5l2-5 2 5" />
		<path d="M5.7 7.5h2.6" />
	</svg>
);
const IconLeft = () => (
	<Svg>
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="3" y1="12" x2="15" y2="12" />
		<line x1="3" y1="18" x2="18" y2="18" />
	</Svg>
);
const IconCenter = () => (
	<Svg>
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="6" y1="12" x2="18" y2="12" />
		<line x1="4" y1="18" x2="20" y2="18" />
	</Svg>
);
const IconRight = () => (
	<Svg>
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="9" y1="12" x2="21" y2="12" />
		<line x1="6" y1="18" x2="21" y2="18" />
	</Svg>
);
const IconJust = () => (
	<Svg>
		<line x1="3" y1="6" x2="21" y2="6" />
		<line x1="3" y1="12" x2="21" y2="12" />
		<line x1="3" y1="18" x2="21" y2="18" />
	</Svg>
);
const IconUnder = () => (
	<Svg>
		<path d="M7 4v8a5 5 0 0010 0V4" />
		<line x1="5" y1="20" x2="19" y2="20" />
	</Svg>
);
const IconStrike = () => (
	<Svg>
		<line x1="4" y1="12" x2="20" y2="12" />
		<path d="M16 8a4 4 0 00-4-4 4 4 0 00-4 4" />
		<path d="M8 16a4 4 0 004 4 4 4 0 004-4" />
	</Svg>
);

const ChevronSvg = () => (
	<svg
		className="ab-tp-select__arrow"
		viewBox="0 0 10 6"
		fill="none"
		aria-hidden="true"
	>
		<path
			d="M1 1l4 4 4-4"
			stroke="currentColor"
			strokeWidth="1.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

/* ── Public panel ───────────────────────────────────────────────────────── */
/**
 * Typography panel.
 *
 * `unwrapped` returns just the inner controls (no PanelBody) so consumers can
 * embed it inside a custom collapsible — used by the pricing-plan typography
 * sub-accordion.
 * @param root0
 * @param root0.attributes
 * @param root0.setAttributes
 * @param root0.prefix
 * @param root0.title
 * @param root0.initialOpen
 * @param root0.unwrapped
 * @param root0.responsive
 */
export function TypographyPanel( {
	attributes,
	setAttributes,
	prefix = '',
	title,
	initialOpen = false,
	unwrapped = false,
	responsive = false,
} ) {
	// Hook runs unconditionally; only steers attribute keys when `responsive` is on.
	const device = useDeviceType();
	const perDevice = responsive && device !== 'Desktop';
	const attrKey = ( k ) =>
		perDevice ? `${ camel( prefix, k ) }${ device }` : camel( prefix, k );

	const get = ( k ) => attributes[ attrKey( k ) ] || '';
	const set = ( k, v ) => setAttributes( { [ attrKey( k ) ]: v } );

	// Value inherited from the larger device — shown as a placeholder so the
	// cascade is visible when the current device's value is empty.
	const inherited = ( k ) => {
		if ( ! perDevice ) return '';
		const parent = device === 'Mobile' ? 'Tablet' : 'Desktop';
		return (
			resolveResponsive( attributes, camel( prefix, k ), parent ) || ''
		);
	};

	const hasAny = KEYS.some( ( k ) => attributes[ attrKey( k ) ] );

	const reset = () => {
		const update = {};
		KEYS.forEach( ( k ) => {
			update[ attrKey( k ) ] = '';
		} );
		setAttributes( update );
	};

	const panelTitle = title || __( 'Typography', 'axiom-blocks' );

	const fontFamilies = useFontFamilies();
	const familyOptions = [
		{ label: __( 'Default', 'axiom-blocks' ), value: '' },
		...fontFamilies.map( ( f ) => ( {
			label: f.name || f.slug || f.fontFamily,
			value: f.fontFamily,
		} ) ),
	];

	// Weight options follow the *effective* family for the active device (the
	// device value, or whatever it inherits) so the list stays correct on Tablet/Mobile.
	const resolvedFamily = perDevice
		? resolveResponsive(
				attributes,
				camel( prefix, 'fontFamily' ),
				device
		  ) || ''
		: get( 'fontFamily' );
	const selectedFamily = fontFamilies.find(
		( f ) => f.fontFamily === resolvedFamily
	);
	const weightOptions = weightOptionsFor( selectedFamily );

	// If the user switches family and the previously selected weight isn't
	// available in the new family's fontFace list, drop it so the dropdown
	// doesn't show a stale value.
	const handleFamilyChange = ( v ) => {
		const next = fontFamilies.find( ( f ) => f.fontFamily === v );
		const allowed = weightOptionsFor( next ).map( ( o ) => o.value );
		const update = { [ attrKey( 'fontFamily' ) ]: v };
		const currentWeight = get( 'fontWeight' );
		if ( currentWeight && ! allowed.includes( currentWeight ) ) {
			update[ attrKey( 'fontWeight' ) ] = '';
		}
		setAttributes( update );
	};

	// Numeric pill placeholder: the inherited (cascade) value on Tablet/Mobile, else
	// the field's own default hint.
	const phNum = ( k, fallback ) => {
		const inh = stripUnit( inherited( k ) );
		return inh !== '' ? inh : fallback;
	};

	const barLabel = title || __( 'Typography', 'axiom-blocks' );

	const inner = (
		<div className="ab-tp">
			{ responsive && (
				<div className="ab-tp-bar">
					<span className="ab-tp-bar__label">{ barLabel }</span>
					<div className="ab-tp-bar__actions">
						{ hasAny && (
							<button
								type="button"
								className="ab-tp-bar__reset is-visible"
								onClick={ reset }
							>
								{ __( 'Reset', 'axiom-blocks' ) }
							</button>
						) }
						<DeviceSwitcher compact />
					</div>
				</div>
			) }

			{ /* Family — full width */ }
			<SelectPill
				value={ get( 'fontFamily' ) }
				onChange={ handleFamilyChange }
				options={ familyOptions }
			/>

			{ /* Weight + Size — paired */ }
			<div className="ab-tp__pair">
				<SelectPill
					value={ get( 'fontWeight' ) }
					onChange={ ( v ) => set( 'fontWeight', v ) }
					options={ weightOptions }
				/>
				<NumPill
					value={ get( 'fontSize' ) }
					onChange={ ( v ) => set( 'fontSize', v ) }
					unit="px"
					min={ 8 }
					max={ 128 }
					step={ 1 }
					placeholder={ phNum( 'fontSize', '—' ) }
				/>
			</div>

			{ /* Line height + Letter spacing — paired with above-labels */ }
			<div className="ab-tp__pair">
				<Field label={ __( 'Line height', 'axiom-blocks' ) }>
					<NumPill
						value={ get( 'lineHeight' ) }
						onChange={ ( v ) => set( 'lineHeight', v ) }
						min={ 0.8 }
						max={ 3 }
						step={ 0.05 }
						placeholder={ phNum(
							'lineHeight',
							__( 'Auto', 'axiom-blocks' )
						) }
						prefixIcon={ <IconLineH /> }
					/>
				</Field>
				<Field label={ __( 'Letter spacing', 'axiom-blocks' ) }>
					<NumPill
						value={ get( 'letterSpacing' ) }
						onChange={ ( v ) => set( 'letterSpacing', v ) }
						unit="em"
						min={ -0.1 }
						max={ 0.5 }
						step={ 0.01 }
						placeholder={ phNum( 'letterSpacing', '0' ) }
						prefixIcon={ <IconLetterS /> }
					/>
				</Field>
			</div>

			{ /* Alignment */ }
			<Field label={ __( 'Alignment', 'axiom-blocks' ) }>
				<SegRow
					value={ get( 'textAlign' ) }
					onChange={ ( v ) => set( 'textAlign', v ) }
					ariaLabel={ __( 'Alignment', 'axiom-blocks' ) }
					options={ [
						{
							value: '',
							title: __( 'Default', 'axiom-blocks' ),
							icon: <IconNone />,
						},
						{
							value: 'left',
							title: __( 'Left', 'axiom-blocks' ),
							icon: <IconLeft />,
						},
						{
							value: 'center',
							title: __( 'Center', 'axiom-blocks' ),
							icon: <IconCenter />,
						},
						{
							value: 'right',
							title: __( 'Right', 'axiom-blocks' ),
							icon: <IconRight />,
						},
						{
							value: 'justify',
							title: __( 'Justify', 'axiom-blocks' ),
							icon: <IconJust />,
						},
					] }
				/>
			</Field>

			{ /* Transform */ }
			<Field label={ __( 'Transform', 'axiom-blocks' ) }>
				<SegRow
					value={ get( 'textTransform' ) }
					onChange={ ( v ) => set( 'textTransform', v ) }
					ariaLabel={ __( 'Transform', 'axiom-blocks' ) }
					options={ [
						{
							value: '',
							title: __( 'Default', 'axiom-blocks' ),
							icon: <IconNone />,
						},
						{
							value: 'uppercase',
							title: __( 'Uppercase', 'axiom-blocks' ),
							label: 'AA',
						},
						{
							value: 'lowercase',
							title: __( 'Lowercase', 'axiom-blocks' ),
							label: 'aa',
						},
						{
							value: 'capitalize',
							title: __( 'Capitalize', 'axiom-blocks' ),
							label: 'Aa',
						},
					] }
				/>
			</Field>

			{ /* Decoration */ }
			<Field label={ __( 'Decoration', 'axiom-blocks' ) }>
				<SegRow
					value={ get( 'textDecoration' ) }
					onChange={ ( v ) => set( 'textDecoration', v ) }
					ariaLabel={ __( 'Decoration', 'axiom-blocks' ) }
					options={ [
						{
							value: '',
							title: __( 'Default', 'axiom-blocks' ),
							icon: <IconNone />,
						},
						{
							value: 'underline',
							title: __( 'Underline', 'axiom-blocks' ),
							icon: <IconUnder />,
						},
						{
							value: 'line-through',
							title: __( 'Strikethrough', 'axiom-blocks' ),
							icon: <IconStrike />,
						},
					] }
				/>
			</Field>
		</div>
	);

	if ( unwrapped ) {
		return inner;
	}

	return (
		<PanelBody title={ panelTitle } initialOpen={ initialOpen }>
			{ inner }
		</PanelBody>
	);
}
