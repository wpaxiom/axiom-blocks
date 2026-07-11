/**
 * AxiomColorPicker — our-scheme colour picker.
 *
 * Ports the BlockSuite Design System "Color Picker" (colorpicker/picker.jsx +
 * picker.css) into a functional control: HSV canvas + hue/alpha sliders,
 * segmented Hex/RGB/HSL, theme palette, recent colours, eyedropper, clear.
 * HSV is the internal source of truth (so greyscale drags don't lose hue);
 * colord handles parsing the incoming value string and formatting output —
 * hex when opaque, rgba() when translucent. Used inside ABColorControl.
 */

import { __ } from '@wordpress/i18n';
import { useState, useEffect, useRef, useCallback } from '@wordpress/element';
import { colord } from 'colord';

const RECENTS_KEY = 'axiomBlocksRecentColors';
const FALLBACK_HSV = { h: 262, s: 0.76, v: 0.93 };
const SEG = [ 'HEX', 'RGB', 'HSL' ];

/* ── colour math (from the design) ───────────────────────────────────────── */
function hsvToRgb( h, s, v ) {
	h = ( ( h % 360 ) + 360 ) % 360;
	const c = v * s;
	const x = c * ( 1 - Math.abs( ( ( h / 60 ) % 2 ) - 1 ) );
	const m = v - c;
	let r = 0,
		g = 0,
		b = 0;
	if ( h < 60 ) {
		r = c;
		g = x;
	} else if ( h < 120 ) {
		r = x;
		g = c;
	} else if ( h < 180 ) {
		g = c;
		b = x;
	} else if ( h < 240 ) {
		g = x;
		b = c;
	} else if ( h < 300 ) {
		r = x;
		b = c;
	} else {
		r = c;
		b = x;
	}
	return [
		Math.round( ( r + m ) * 255 ),
		Math.round( ( g + m ) * 255 ),
		Math.round( ( b + m ) * 255 ),
	];
}

/* ── recents (localStorage) ──────────────────────────────────────────────── */
function readRecents() {
	try {
		const arr = JSON.parse(
			window.localStorage.getItem( RECENTS_KEY ) || '[]'
		);
		return Array.isArray( arr ) ? arr.slice( 0, 8 ) : [];
	} catch ( e ) {
		return [];
	}
}
function writeRecent( str ) {
	if ( ! str ) {
		return readRecents();
	}
	try {
		const next = [
			str,
			...readRecents().filter(
				( c ) => c.toLowerCase() !== str.toLowerCase()
			),
		].slice( 0, 8 );
		window.localStorage.setItem( RECENTS_KEY, JSON.stringify( next ) );
		return next;
	} catch ( e ) {
		return readRecents();
	}
}

/* ── drag hook (from the design) ─────────────────────────────────────────── */
function useDrag( onMove ) {
	const ref = useRef( null );
	const compute = useCallback(
		( clientX, clientY ) => {
			const el = ref.current;
			if ( ! el ) {
				return;
			}
			const rect = el.getBoundingClientRect();
			const x = Math.min(
				1,
				Math.max( 0, ( clientX - rect.left ) / rect.width )
			);
			const y = Math.min(
				1,
				Math.max( 0, ( clientY - rect.top ) / rect.height )
			);
			onMove( x, y );
		},
		[ onMove ]
	);
	const onDown = useCallback(
		( e ) => {
			e.preventDefault();
			compute( e.clientX, e.clientY );
			const move = ( ev ) => compute( ev.clientX, ev.clientY );
			const up = () => {
				window.removeEventListener( 'pointermove', move );
				window.removeEventListener( 'pointerup', up );
			};
			window.addEventListener( 'pointermove', move );
			window.addEventListener( 'pointerup', up );
		},
		[ compute ]
	);
	return [ ref, onDown ];
}

/* ── field: local-state, commit on blur/Enter ────────────────────────────── */
function Field( {
	label,
	value,
	onCommit,
	isHex = false,
	min = 0,
	max = 255,
} ) {
	const [ local, setLocal ] = useState( String( value ) );
	const [ focused, setFocused ] = useState( false );
	useEffect( () => {
		if ( ! focused ) {
			setLocal( String( value ) );
		}
	}, [ value, focused ] );

	/* Numeric fields: ↑/↓ step by 1 (×10 with Shift) and commit live. */
	const onKeyDown = ( e ) => {
		if ( e.key === 'Enter' ) {
			e.target.blur();
			return;
		}
		if ( isHex || ( e.key !== 'ArrowUp' && e.key !== 'ArrowDown' ) ) {
			return;
		}
		e.preventDefault();
		const step = ( e.shiftKey ? 10 : 1 ) * ( e.key === 'ArrowUp' ? 1 : -1 );
		const cur = parseInt( local, 10 );
		const next = Math.max(
			min,
			Math.min( max, ( isNaN( cur ) ? 0 : cur ) + step )
		);
		setLocal( String( next ) );
		onCommit( String( next ), true );
	};

	return (
		<div className={ `axcp-field${ isHex ? ' is-hex' : '' }` }>
			<div className={ `axcp-field__box${ focused ? ' is-focus' : '' }` }>
				{ isHex && <span className="axcp-field__hash">#</span> }
				<input
					value={ local }
					spellCheck={ false }
					inputMode={ isHex ? 'text' : 'numeric' }
					onFocus={ () => setFocused( true ) }
					onChange={ ( e ) => {
						setLocal( e.target.value );
						if ( isHex ) {
							onCommit( e.target.value, false );
						}
					} }
					onBlur={ () => {
						setFocused( false );
						onCommit( local, true );
					} }
					onKeyDown={ onKeyDown }
				/>
			</div>
			<span className="axcp-field__lbl">{ label }</span>
		</div>
	);
}

function EyedropperIcon() {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M18.5 2.5a2.1 2.1 0 0 1 3 3l-8 8-3-3 8-8Z" />
			<path d="M14.5 7.5 5 17a3 3 0 0 0-.8 1.5L3.5 21l2.5-.7A3 3 0 0 0 7.5 19.5L17 10" />
		</svg>
	);
}

export function AxiomColorPicker( { value, onChange, colors = [] } ) {
	const [ hsv, setHsv ] = useState( () => {
		const c = colord( value || '' );
		if ( c.isValid() && value ) {
			const h = c.toHsv();
			return { h: h.h, s: h.s / 100, v: h.v / 100 };
		}
		return FALLBACK_HSV;
	} );
	const [ a, setA ] = useState( () => {
		const c = colord( value || '' );
		return c.isValid() && value ? c.alpha() : 1;
	} );
	// Always open on HEX (the friendly default). Format-follows-tab still
	// applies once the user deliberately switches to RGB/HSL and edits.
	const [ mode, setMode ] = useState( 'HEX' );
	const [ recents, setRecents ] = useState( readRecents );

	const [ rr, gg, bb ] = hsvToRgb( hsv.h, hsv.s, hsv.v );
	const hueRgb = hsvToRgb( hsv.h, 1, 1 );
	const derivedHex = colord( { r: rr, g: gg, b: bb } ).toHex();

	/* Canonical output is always HEX — the tabs are just equivalent views of the
	 * same colour. Alpha can't live in a 6-digit hex, so a translucent colour
	 * falls back to rgba() (the only lossless CSS form here). */
	const emit = ( nextHsv, nextA ) => {
		const [ r, g, b ] = hsvToRgb( nextHsv.h, nextHsv.s, nextHsv.v );
		const out =
			nextA < 1
				? colord( { r, g, b, a: nextA } ).toRgbString()
				: colord( { r, g, b } ).toHex();
		onChange( out );
	};

	/* Re-sync internal HSV when the value changes from outside (theme swatch,
	 * reset, sibling control) — guarded so our own emits don't loop. */
	useEffect( () => {
		const c = colord( value || '' );
		if ( ! value || ! c.isValid() ) {
			return;
		}
		const sameHex = c.toHex() === derivedHex;
		const sameAlpha = Math.abs( c.alpha() - a ) < 0.005;
		if ( sameHex && sameAlpha ) {
			return;
		}
		const h = c.toHsv();
		setHsv( { h: h.h, s: h.s / 100, v: h.v / 100 } );
		setA( c.alpha() );
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ value ] );

	const updateHsv = ( partial ) => {
		const next = { ...hsv, ...partial };
		setHsv( next );
		emit( next, a );
	};
	const updateAlpha = ( next ) => {
		setA( next );
		emit( hsv, next );
	};

	const [ svRef, svDown ] = useDrag( ( x, y ) =>
		updateHsv( { s: x, v: 1 - y } )
	);
	const [ hueRef, hueDown ] = useDrag( ( x ) => updateHsv( { h: x * 360 } ) );
	const [ alphaRef, alphaDown ] = useDrag( ( x ) => updateAlpha( x ) );

	const commitColor = ( str, remember ) => {
		onChange( str );
		if ( remember ) {
			setRecents( writeRecent( str ) );
		}
	};

	async function pickEyeDropper() {
		try {
			// eslint-disable-next-line no-undef
			const res = await new window.EyeDropper().open();
			commitColor( res.sRGBHex, true );
		} catch ( e ) {
			// cancelled
		}
	}

	/* ── field values + commit handlers per mode ─────────────────────────── */
	const alphaPct = Math.round( a * 100 );
	const rgb = { r: rr, g: gg, b: bb };
	const hsl = colord( rgb ).toHsl();
	const hexStr = derivedHex.replace( '#', '' ).toUpperCase();

	const setFromColord = ( c, keepAlpha ) => {
		const h = c.toHsv();
		const next = { h: h.h, s: h.s / 100, v: h.v / 100 };
		setHsv( next );
		emit( next, keepAlpha ? a : c.alpha() );
	};

	const onHex = ( raw ) => {
		const v = raw.replace( /[^0-9a-fA-F]/g, '' ).slice( 0, 8 );
		if ( [ 3, 4, 6, 8 ].includes( v.length ) ) {
			const c = colord( '#' + v );
			if ( c.isValid() ) {
				const keepsAlpha = v.length === 3 || v.length === 6;
				setFromColord( c, keepsAlpha );
			}
		}
	};
	const onAlphaField = ( raw ) => {
		const n = Math.max( 0, Math.min( 100, parseInt( raw, 10 ) || 0 ) );
		updateAlpha( n / 100 );
	};
	const onRgbField = ( key, raw ) => {
		const n = Math.max( 0, Math.min( 255, parseInt( raw, 10 ) || 0 ) );
		setFromColord( colord( { ...rgb, [ key ]: n } ), true );
	};
	const onHslField = ( key, raw, max ) => {
		const n = Math.max( 0, Math.min( max, parseInt( raw, 10 ) || 0 ) );
		setFromColord( colord( { ...hsl, [ key ]: n } ), true );
	};

	return (
		<div className="axcp">
			{ /* SV canvas */ }
			<div
				className="axcp-sv"
				ref={ svRef }
				onPointerDown={ svDown }
				style={ {
					background: `rgb(${ hueRgb[ 0 ] },${ hueRgb[ 1 ] },${ hueRgb[ 2 ] })`,
				} }
			>
				<div className="axcp-sv__white" />
				<div className="axcp-sv__black" />
				<div
					className="axcp-sv__knob"
					style={ {
						left: `${ hsv.s * 100 }%`,
						top: `${ ( 1 - hsv.v ) * 100 }%`,
						background: `rgb(${ rr },${ gg },${ bb })`,
					} }
				/>
			</div>

			{ /* sliders */ }
			<div className="axcp-sliders">
				<div
					className="axcp-slider axcp-slider--hue"
					ref={ hueRef }
					onPointerDown={ hueDown }
				>
					<div
						className="axcp-slider__thumb"
						style={ {
							left: `${ ( hsv.h / 360 ) * 100 }%`,
							background: `rgb(${ hueRgb[ 0 ] },${ hueRgb[ 1 ] },${ hueRgb[ 2 ] })`,
						} }
					/>
				</div>
				<div
					className="axcp-slider axcp-slider--alpha"
					ref={ alphaRef }
					onPointerDown={ alphaDown }
				>
					<div
						className="axcp-slider__fill"
						style={ {
							background: `linear-gradient(to right, rgba(${ rr },${ gg },${ bb },0), rgb(${ rr },${ gg },${ bb }))`,
						} }
					/>
					<div
						className="axcp-slider__thumb"
						style={ {
							left: `${ a * 100 }%`,
							background: `rgba(${ rr },${ gg },${ bb },${ a })`,
						} }
					/>
				</div>
			</div>

			{ /* segmented Hex / RGB / HSL */ }
			<div className="axcp-seg">
				{ SEG.map( ( s ) => (
					<button
						key={ s }
						type="button"
						className={ mode === s ? 'is-active' : '' }
						onClick={ () => setMode( s ) }
					>
						{ s }
					</button>
				) ) }
			</div>

			{ /* fields */ }
			<div className="axcp-fields">
				{ mode === 'HEX' && (
					<>
						<Field
							label="HEX"
							isHex
							value={ hexStr }
							onCommit={ ( v ) => onHex( v ) }
						/>
						<Field
							label="A%"
							value={ alphaPct }
							min={ 0 }
							max={ 100 }
							onCommit={ ( v ) => onAlphaField( v ) }
						/>
					</>
				) }
				{ mode === 'RGB' && (
					<>
						<Field label="R" value={ rr } min={ 0 } max={ 255 } onCommit={ ( v ) => onRgbField( 'r', v ) } />
						<Field label="G" value={ gg } min={ 0 } max={ 255 } onCommit={ ( v ) => onRgbField( 'g', v ) } />
						<Field label="B" value={ bb } min={ 0 } max={ 255 } onCommit={ ( v ) => onRgbField( 'b', v ) } />
						<Field label="A%" value={ alphaPct } min={ 0 } max={ 100 } onCommit={ ( v ) => onAlphaField( v ) } />
					</>
				) }
				{ mode === 'HSL' && (
					<>
						<Field label="H" value={ hsl.h } min={ 0 } max={ 360 } onCommit={ ( v ) => onHslField( 'h', v, 360 ) } />
						<Field label="S%" value={ hsl.s } min={ 0 } max={ 100 } onCommit={ ( v ) => onHslField( 's', v, 100 ) } />
						<Field label="L%" value={ hsl.l } min={ 0 } max={ 100 } onCommit={ ( v ) => onHslField( 'l', v, 100 ) } />
						<Field label="A%" value={ alphaPct } min={ 0 } max={ 100 } onCommit={ ( v ) => onAlphaField( v ) } />
					</>
				) }
			</div>

			{ /* theme */ }
			{ colors.length > 0 && (
				<div className="axcp-section">
					<div className="axcp-section__title">
						{ __( 'Theme', 'axiom-blocks' ) }
					</div>
					<div className="axcp-swatches">
						{ colors.map( ( t ) => {
							const valid = colord( t.color ).isValid();
							const selected =
								!! value &&
								valid &&
								colord( value ).toHex() ===
									colord( t.color ).toHex();
							const translucent =
								valid && colord( t.color ).alpha() < 1;
							return (
								<button
									key={ t.slug || t.color }
									type="button"
									title={ t.name || t.color }
									className={ `axcp-swatch${
										translucent ? ' is-alpha' : ''
									}${ selected ? ' is-selected' : '' }` }
									style={ { '--sw': t.color } }
									onClick={ () =>
										commitColor( t.color, true )
									}
								/>
							);
						} ) }
					</div>
				</div>
			) }

			{ /* recent */ }
			{ recents.length > 0 && (
				<div className="axcp-section">
					<div className="axcp-section__title">
						{ __( 'Recent', 'axiom-blocks' ) }
					</div>
					<div className="axcp-swatches">
						{ recents.map( ( c ) => {
							const translucent =
								colord( c ).isValid() && colord( c ).alpha() < 1;
							const selected =
								!! value &&
								colord( value ).toHex() === colord( c ).toHex();
							return (
								<button
									key={ c }
									type="button"
									title={ c }
									className={ `axcp-swatch${
										translucent ? ' is-alpha' : ''
									}${ selected ? ' is-selected' : '' }` }
									style={ { '--sw': c } }
									onClick={ () => commitColor( c, false ) }
								/>
							);
						} ) }
					</div>
				</div>
			) }

			<div className="axcp-divider" />

			{ /* footer */ }
			<div className="axcp-footer">
				{ typeof window !== 'undefined' && 'EyeDropper' in window && (
					<button
						type="button"
						className="axcp-icon-btn"
						title={ __( 'Pick from screen', 'axiom-blocks' ) }
						onClick={ pickEyeDropper }
					>
						<EyedropperIcon />
					</button>
				) }
				<button
					type="button"
					className="axcp-clear-btn"
					onClick={ () => onChange( '' ) }
				>
					{ __( 'Clear', 'axiom-blocks' ) }
				</button>
			</div>
		</div>
	);
}
