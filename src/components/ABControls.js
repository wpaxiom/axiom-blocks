/**
 * ABControls — Reusable styled sidebar controls for Axiom Blocks blocks.
 * Matches the Axiom Blocks Design System: WP-blue interactive, DM Sans font.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';

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
} ) {
	const num = parseFloat( value ) || 0;
	const clamped = Math.min( Math.max( num, min ), max );
	const pct = ( ( clamped - min ) / ( max - min ) ) * 100;

	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<div className="ab-ctrl__range-row">
				<div className="ab-ctrl__px-wrap">
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
						placeholder={ `${ min }` }
					/>
					{ unit && <span className="ab-ctrl__unit">{ unit }</span> }
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
export function ABSelectControl( { label, value, onChange, options } ) {
	const selectedLabel =
		options.find( ( o ) => o.value === value )?.label ?? '';
	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<div className="ab-ctrl__select-wrap">
				{ /* Native select is invisible but fully interactive (click/keyboard) */ }
				<select
					className="ab-ctrl__select"
					value={ value }
					onChange={ ( e ) => onChange( e.target.value ) }
					aria-label={ label }
				>
					{ options.map( ( o ) => (
						<option key={ o.value } value={ o.value }>
							{ o.label }
						</option>
					) ) }
				</select>
				{ /* Visual display — pointer-events:none lets clicks pass to native select */ }
				<div className="ab-ctrl__select-display" aria-hidden="true">
					<span className="ab-ctrl__select-text">
						{ selectedLabel }
					</span>
					<svg
						className="ab-ctrl__select-arrow"
						viewBox="0 0 10 6"
						fill="none"
					>
						<path
							d="M1 1l4 4 4-4"
							stroke="currentColor"
							strokeWidth="1.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			</div>
		</div>
	);
}

/* ── Color swatch + native color picker ──────────────────────────────────── */
export function ABColorControl( {
	label,
	color,
	onChange,
	enableReset = true,
} ) {
	const id = useInstanceId( ABColorControl, 'ab-color' );
	const showReset = enableReset && !! color;
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
							onClick={ () => onChange( '' ) }
						>
							{ __( 'Reset', 'axiom-blocks' ) }
						</button>
					) }
				</div>
			) }
			<label htmlFor={ id } className="ab-ctrl__color-wrap">
				<span className="ab-ctrl__color-hex">
					{ color || __( 'Default', 'axiom-blocks' ) }
				</span>
				<span
					className="ab-ctrl__color-swatch"
					style={ { background: color } }
				/>
				<input
					id={ id }
					type="color"
					className="ab-ctrl__color-input"
					value={ color || '#ffffff' }
					onChange={ ( e ) => onChange( e.target.value ) }
				/>
			</label>
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

   Group multiple in a parent `<div className="ab-sub-acc-list">…</div>` so
   the gap-based spacing kicks in. */
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
				<svg
					viewBox="0 0 16 16"
					width="12"
					height="12"
					className="ab-sub-acc__chev"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
					aria-hidden="true"
				>
					<path d="M4 6l4 4 4-4" />
				</svg>
			</button>
			{ isOpen && <div className="ab-sub-acc__body">{ children }</div> }
		</div>
	);
}
