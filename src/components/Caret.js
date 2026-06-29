/**
 * Caret — the single down-chevron used by every select-like trigger
 * (ABSelectControl, ABSubAccordion, IconControl). One glyph, one size, one
 * colour so the inspector never shows mismatched carets. Colour comes from
 * `currentColor`; size/colour are set per-consumer via the passed className
 * (defaults to 12×12 / #9ca3af in editor.scss `.ab-caret`).
 */

export function Caret( { className = '' } ) {
	return (
		<svg
			className={ `ab-caret${ className ? ' ' + className : '' }` }
			viewBox="0 0 16 16"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
		>
			<path d="M4 6l4 4 4-4" />
		</svg>
	);
}
