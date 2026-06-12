/**
 * Highlight RichText format for Advanced Heading.
 *
 * Wraps the selection in `<mark class="ab-ah-highlight">`. The colours are not
 * stored per-span — they are driven by the block-level highlightColor /
 * highlightBg attributes via CSS custom properties on the wrapper, so the saved
 * markup stays minimal and back-compat-stable. Do not change the tagName or
 * className: existing saved content depends on them.
 */

import { __ } from '@wordpress/i18n';
import { registerFormatType, toggleFormat } from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';

export const HIGHLIGHT_FORMAT = 'axiom-blocks/highlight';

const HighlightIcon = (
	<svg
		width="20"
		height="20"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M9 11l-4 4v3h3l4-4" />
		<path d="M13 7l4 4" />
		<path d="M11 13l6-6a2 2 0 012.8 0l.2.2a2 2 0 010 2.8l-6 6" />
		<line x1="4" y1="21" x2="14" y2="21" />
	</svg>
);

function HighlightEdit( { isActive, value, onChange } ) {
	return (
		<RichTextToolbarButton
			icon={ HighlightIcon }
			title={ __( 'Highlight', 'axiom-blocks' ) }
			isActive={ isActive }
			onClick={ () =>
				onChange( toggleFormat( value, { type: HIGHLIGHT_FORMAT } ) )
			}
		/>
	);
}

registerFormatType( HIGHLIGHT_FORMAT, {
	title: __( 'Highlight', 'axiom-blocks' ),
	tagName: 'mark',
	className: 'ab-ah-highlight',
	edit: HighlightEdit,
} );
