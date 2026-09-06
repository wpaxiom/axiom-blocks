/**
 * ABControls — Reusable styled sidebar controls for Axiom Blocks blocks.
 * Matches the Axiom Blocks Design System: WP-blue interactive, DM Sans font.
 */

import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { useSelect } from '@wordpress/data';
import { Dropdown } from '@wordpress/components';
import { colord } from 'colord';
import { Caret } from './Caret';
import { AxiomColorPicker } from './AxiomColorPicker';

/* Trigger label always reads as hex (6-digit opaque, 8-digit with alpha) — a
 * raw rgba()/hsl() string in the panel confuses users. */
function toHexLabel( str ) {
	const c = colord( str || '' );
	return c.isValid() && str ? c.toHex().toUpperCase() : '';
}

/* Normalize a units list (strings or { label, value }) into option objects. */
function normalizeUnits( units ) {
	if ( ! Array.isArray( units ) ) {
		return [];
	}
	return units.map( ( u ) =>
		typeof u === 'string'
			? { label: u, value: u }
			: { label: u.label ?? u.value, value: u.value }
	);
}

/* ── Range slider + number input ─────────────────────────────────────────── */
export function ABRangeControl( {
	label,
	value,
	onChange,
	min = 0,
	max = 100,
	step = 1,
	unit = '%',
	help,
	units,
	onUnitChange,
} ) {
	const num = parseFloat( value ) || 0;
	const clamped = Math.min( Math.max( num, min ), max );
	const pct = ( ( clamped - min ) / ( max - min ) ) * 100;

	// Opt-in: when a multi-unit list is supplied, the inline unit label becomes a
	// click-to-change picker (styled popover). Otherwise it's a static label.
	const unitList = normalizeUnits( units );
	const hasUnitMenu =
		unitList.length > 1 && typeof onUnitChange === 'function';

	const [ unitOpen, setUnitOpen ] = useState( false );
	const pxWrapRef = useRef( null );

	useEffect( () => {
		if ( ! unitOpen ) {
			return undefined;
		}
		const close = ( e ) => {
			if (
				pxWrapRef.current &&
				! pxWrapRef.current.contains( e.target )
			) {
				setUnitOpen( false );
			}
		};
		const onKey = ( e ) => e.key === 'Escape' && setUnitOpen( false );
		document.addEventListener( 'mousedown', close );
		document.addEventListener( 'keydown', onKey );
		return () => {
			document.removeEventListener( 'mousedown', close );
			document.removeEventListener( 'keydown', onKey );
		};
	}, [ unitOpen ] );

	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<div className="ab-ctrl__range-row">
				<div
					className={ `ab-ctrl__px-wrap${
						hasUnitMenu ? ' has-unit-menu' : ''
					}` }
					ref={ hasUnitMenu ? pxWrapRef : undefined }
				>
					<input
						type="number"
						className="ab-ctrl__px-input"
						value={ num === 0 ? '' : num }
						onChange={ ( e ) =>
							onChange( parseFloat( e.target.value ) || 0 )
						}
						min={ min }
						max={ max }
						step={ step }
						placeholder={ `${ Math.min(
							Math.max( 0, min ),
							max
						) }` }
					/>
					{ unit && ! hasUnitMenu && (
						<span className="ab-ctrl__unit">{ unit }</span>
					) }
					{ hasUnitMenu && (
						<>
							<button
								type="button"
								className="ab-ctrl__unit ab-ctrl__unit--menu"
								onClick={ () => setUnitOpen( ( v ) => ! v ) }
								aria-haspopup="listbox"
								aria-expanded={ unitOpen }
								aria-label={ __(
									'Change unit',
									'axiom-blocks'
								) }
							>
								{ unit }
							</button>
							{ unitOpen && (
								<ul
									className="ab-ctrl__unit-list"
									role="listbox"
								>
									{ unitList.map( ( u ) => (
										<li key={ u.value } role="none">
											<button
												type="button"
												role="option"
												aria-selected={
													u.value === unit
												}
												className={ `ab-ctrl__unit-opt${
													u.value === unit
														? ' is-active'
														: ''
												}` }
												onClick={ () => {
													onUnitChange( u.value );
													setUnitOpen( false );
												} }
											>
												{ u.label }
											</button>
										</li>
									) ) }
								</ul>
							) }
						</>
					) }
				</div>
				<input
					type="range"
					className="ab-ctrl__slider"
					min={ min }
					max={ max }
					step={ step }
					value={ clamped }
					onChange={ ( e ) =>
						onChange( parseFloat( e.target.value ) )
					}
					style={ { '--ab-pct': `${ pct }%` } }
				/>
			</div>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

/* ── Styled dropdown ─────────────────────────────────────────────────────── */
export function ABSelectControl( { label, value, onChange, options, help } ) {
	const selectedLabel =
		options.find( ( o ) => o.value === value )?.label ?? '';
	const [ open, setOpen ] = useState( false );
	const wrapRef = useRef( null );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		const close = ( e ) => {
			if ( wrapRef.current && ! wrapRef.current.contains( e.target ) ) {
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
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<div
				className={ `ab-ctrl__select-wrap${ open ? ' is-open' : '' }` }
				ref={ wrapRef }
			>
				<button
					type="button"
					className="ab-ctrl__select-display"
					onClick={ () => setOpen( ( v ) => ! v ) }
					aria-haspopup="listbox"
					aria-expanded={ open }
					aria-label={ label }
				>
					<span className="ab-ctrl__select-text">
						{ selectedLabel }
					</span>
					<Caret className="ab-ctrl__select-arrow" />
				</button>
				{ open && (
					<ul className="ab-ctrl__select-list" role="listbox">
						{ options.map( ( o ) => (
							<li key={ o.value } role="none">
								<button
									type="button"
									role="option"
									aria-selected={ o.value === value }
									className={ `ab-ctrl__select-opt${
										o.value === value ? ' is-active' : ''
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
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

/* ── Multi-select: pick several options, shown as removable chips ───────────
 * The scheme's answer to a token/tag field. Same value contract as a single
 * select except `value` is an array: `options` is [{ value, label }] and
 * onChange receives the picked values in order, untouched, so a control can be
 * swapped in over an existing attribute without changing what gets saved. */
export function ABMultiSelectControl( {
	label,
	value,
	onChange,
	options = [],
	help,
	placeholder = '',
	searchThreshold = 8,
} ) {
	const selected = Array.isArray( value ) ? value : [];
	const [ open, setOpen ] = useState( false );
	const [ query, setQuery ] = useState( '' );
	const wrapRef = useRef( null );

	useEffect( () => {
		if ( ! open ) {
			return undefined;
		}
		const close = ( e ) => {
			if ( wrapRef.current && ! wrapRef.current.contains( e.target ) ) {
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

	const same = ( a, b ) => String( a ) === String( b );
	const isPicked = ( v ) => selected.some( ( s ) => same( s, v ) );

	const toggle = ( v ) =>
		onChange(
			isPicked( v )
				? selected.filter( ( s ) => ! same( s, v ) )
				: [ ...selected, v ]
		);

	const chips = selected
		.map( ( v ) => ( {
			value: v,
			label: options.find( ( o ) => same( o.value, v ) )?.label,
		} ) )
		.filter( ( c ) => c.label );

	const needle = query.trim().toLowerCase();
	const visible = needle
		? options.filter(
				( o ) =>
					o.label.toLowerCase().includes( needle ) ||
					isPicked( o.value )
		  )
		: options;

	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<div
				className={ `ab-ctrl__multi-wrap${ open ? ' is-open' : '' }` }
				ref={ wrapRef }
			>
				<div
					className="ab-ctrl__multi-display"
					onClick={ () => setOpen( ( v ) => ! v ) }
					role="presentation"
				>
					{ chips.length ? (
						<span className="ab-ctrl__multi-chips">
							{ chips.map( ( c ) => (
								<span
									key={ String( c.value ) }
									className="ab-ctrl__multi-chip"
								>
									{ c.label }
									<button
										type="button"
										className="ab-ctrl__multi-chip-x"
										aria-label={
											__( 'Remove', 'axiom-blocks' ) +
											' ' +
											c.label
										}
										onClick={ ( e ) => {
											e.stopPropagation();
											toggle( c.value );
										} }
									>
										<RemoveGlyph />
									</button>
								</span>
							) ) }
						</span>
					) : (
						<span className="ab-ctrl__multi-placeholder">
							{ placeholder || __( 'Select…', 'axiom-blocks' ) }
						</span>
					) }
					<button
						type="button"
						className="ab-ctrl__multi-toggle"
						aria-haspopup="listbox"
						aria-expanded={ open }
						aria-label={ label }
						onClick={ ( e ) => {
							e.stopPropagation();
							setOpen( ( v ) => ! v );
						} }
					>
						<Caret className="ab-ctrl__select-arrow" />
					</button>
				</div>
				{ open && (
					<div className="ab-ctrl__multi-panel">
						{ options.length > searchThreshold && (
							<input
								type="search"
								className="ab-ctrl__multi-search"
								value={ query }
								placeholder={ __( 'Search…', 'axiom-blocks' ) }
								onChange={ ( e ) => setQuery( e.target.value ) }
							/>
						) }
						<ul
							className="ab-ctrl__multi-list"
							role="listbox"
							aria-multiselectable="true"
						>
							{ visible.map( ( o ) => (
								<li key={ String( o.value ) } role="none">
									<button
										type="button"
										role="option"
										aria-selected={ isPicked( o.value ) }
										className={ `ab-ctrl__multi-opt${
											isPicked( o.value )
												? ' is-active'
												: ''
										}` }
										onClick={ () => toggle( o.value ) }
									>
										<span className="ab-ctrl__multi-box">
											{ isPicked( o.value ) && (
												<CheckGlyph />
											) }
										</span>
										{ o.label }
									</button>
								</li>
							) ) }
							{ ! visible.length && (
								<li className="ab-ctrl__multi-empty">
									{ __( 'No matches', 'axiom-blocks' ) }
								</li>
							) }
						</ul>
					</div>
				) }
			</div>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

function CheckGlyph() {
	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="3.5"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M20 6 9 17l-5-5" />
		</svg>
	);
}

function RemoveGlyph() {
	return (
		<svg
			width="10"
			height="10"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M18 6 6 18M6 6l12 12" />
		</svg>
	);
}

/* ── Color: theme palette + full picker (hex/rgb/hsl + alpha) ─────────────────
 * Popover uses WP's ColorPalette (theme swatches, custom picker, clear) with a
 * swatch trigger styled to our scheme. Same props as before so every block that
 * uses ABColorControl keeps working — only the picker UI is richer now. */
export function ABColorControl( {
	label,
	color,
	onChange,
	enableReset = true,
	defaultColor = '',
	// Display-only rendered default: shown in the swatch/picker when `color` is
	// empty, WITHOUT setting the attribute — so the swatch reflects the real
	// default yet Reset visibility still keys off the raw (empty) value.
	fallbackColor = '',
} ) {
	// getSettings().colors = the theme palette, available since WP 6.0 (no
	// deprecation, unlike useSetting/useSettings which is 6.5+).
	const paletteColors = useSelect(
		( select ) => select( 'core/block-editor' ).getSettings().colors || [],
		[]
	);
	const showReset = enableReset && !! color && color !== defaultColor;
	const displayColor = color || fallbackColor;
	return (
		<div className="ab-ctrl">
			{ ( label || showReset ) && (
				<div className="ab-ctrl__label-row">
					{ label && (
						<span className="ab-ctrl__label">{ label }</span>
					) }
					{ showReset && (
						<button
							type="button"
							className="ab-ctrl__reset"
							onClick={ () => onChange( defaultColor ) }
						>
							{ __( 'Reset', 'axiom-blocks' ) }
						</button>
					) }
				</div>
			) }
			<Dropdown
				className="ab-ctrl__color-dropdown"
				contentClassName="ab-color-popover"
				popoverProps={ { placement: 'left-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<button
						type="button"
						className="ab-ctrl__color-wrap"
						onClick={ onToggle }
						aria-expanded={ isOpen }
					>
						<span className="ab-ctrl__color-hex">
							{ toHexLabel( color ) ||
								__( 'Default', 'axiom-blocks' ) }
						</span>
						<span
							className="ab-ctrl__color-swatch"
							style={ {
								background: displayColor || 'transparent',
							} }
						/>
					</button>
				) }
				renderContent={ () => (
					<AxiomColorPicker
						value={ displayColor }
						onChange={ ( v ) => onChange( v || '' ) }
						colors={ paletteColors }
					/>
				) }
			/>
		</div>
	);
}

/* ── Single-line text input ──────────────────────────────────────────────── */
export function ABTextControl( {
	label,
	value,
	onChange,
	help,
	placeholder = '',
	type = 'text',
	min,
	max,
} ) {
	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<input
				type={ type }
				className="ab-ctrl__text-input"
				value={ value ?? '' }
				onChange={ ( e ) => onChange( e.target.value ) }
				placeholder={ placeholder }
				min={ min }
				max={ max }
			/>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

/* ── Toggle switch ───────────────────────────────────────────────────────── */
export function ABToggleControl( {
	label,
	checked,
	onChange,
	help,
	disabled = false,
} ) {
	const id = useInstanceId( ABToggleControl, 'ab-toggle' );
	return (
		<div className="ab-toggle">
			<label htmlFor={ id } className="ab-toggle__row">
				<span className="ab-toggle__switch">
					<input
						id={ id }
						type="checkbox"
						className="ab-toggle__input"
						checked={ !! checked }
						disabled={ disabled }
						onChange={ ( e ) => onChange( e.target.checked ) }
					/>
					<span className="ab-toggle__track" aria-hidden="true" />
					<span className="ab-toggle__thumb" aria-hidden="true" />
				</span>
				{ label && <span className="ab-toggle__label">{ label }</span> }
			</label>
			{ help && <p className="ab-toggle__help">{ help }</p> }
		</div>
	);
}

/* ── Multi-line textarea ─────────────────────────────────────────────────── */
export function ABTextareaControl( {
	label,
	value,
	onChange,
	help,
	placeholder = '',
	rows = 4,
} ) {
	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<textarea
				className="ab-ctrl__textarea"
				value={ value ?? '' }
				onChange={ ( e ) => onChange( e.target.value ) }
				placeholder={ placeholder }
				rows={ rows }
			/>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}

/* ── Lightweight collapsible row for grouping nested settings ────────────────
   Visual styling matches the tab-block repeater (light border, purple
   #7C3AED on focus/open). Use inside a <PanelBody> when you want to expose
   sub-sections without resorting to nested PanelBody (which looks unpolished).

   Stacking several straight into a PanelBody is fine — the row carries its own
   spacing. The optional `ab-sub-acc-list` wrapper only adds flex column flow. */
export function ABSubAccordion( { title, children, defaultOpen = false } ) {
	const [ isOpen, setIsOpen ] = useState( defaultOpen );
	return (
		<div className={ `ab-sub-acc${ isOpen ? ' is-open' : '' }` }>
			<button
				type="button"
				className="ab-sub-acc__head"
				onClick={ () => setIsOpen( ( v ) => ! v ) }
				aria-expanded={ isOpen }
			>
				<span className="ab-sub-acc__title">{ title }</span>
				<Caret className="ab-sub-acc__chev" />
			</button>
			{ isOpen && <div className="ab-sub-acc__body">{ children }</div> }
		</div>
	);
}
