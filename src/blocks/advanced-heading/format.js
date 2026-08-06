/**
 * RichText formats for Advanced Heading.
 *
 * Both formats store their colors **per run** as static inline styles on the
 * span/mark, so one heading can mix colors ("multicolor"). Existing highlights
 * saved without inline colors keep reading the block-level highlightColor /
 * highlightBg vars (CSS `var()` fallback), so old content is unchanged. Do not
 * change the tagName or className: existing saved content depends on them.
 */

import { __ } from '@wordpress/i18n';
import {
	registerFormatType,
	applyFormat,
	removeFormat,
	useAnchor,
} from '@wordpress/rich-text';
import { RichTextToolbarButton } from '@wordpress/block-editor';
import { Popover } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { ABColorControl, ABSelectControl } from '../../components/ABControls';

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
		style={ { fill: 'none' } }
	>
		<path d="M9 11l-4 4v3h3l4-4" />
		<path d="M13 7l4 4" />
		<path d="M11 13l6-6a2 2 0 012.8 0l.2.2a2 2 0 010 2.8l-6 6" />
		<line x1="4" y1="21" x2="14" y2="21" />
	</svg>
);

function readHighlight( activeAttributes ) {
	const style = activeAttributes?.style || '';
	const color = style.match( /(?:^|;)\s*color:\s*([^;]+)/i );
	const bg = style.match( /background(?:-color)?:\s*([^;]+)/i );
	return {
		color: color ? color[ 1 ].trim() : '',
		bg: bg ? bg[ 1 ].trim() : '',
	};
}

function highlightStyle( { color, bg } ) {
	const parts = [];
	if ( bg ) {
		parts.push( `background: ${ bg }` );
	}
	if ( color ) {
		parts.push( `color: ${ color }` );
	}
	return parts.join( '; ' );
}

function HighlightPopover( { contentRef, current, onApply, onClose } ) {
	const anchor = useAnchor( {
		editableContentElement: contentRef?.current,
		settings: HIGHLIGHT_SETTINGS,
	} );
	return (
		<Popover
			anchor={ anchor }
			onClose={ onClose }
			placement="bottom"
			focusOnMount={ false }
			className="ab-ah-color-popover"
		>
			<div className="ab-ah-color-popover__inner">
				<ABColorControl
					label={ __( 'Highlight background', 'axiom-blocks' ) }
					color={ current.bg }
					onChange={ ( v ) => onApply( { ...current, bg: v } ) }
				/>
				<ABColorControl
					label={ __( 'Highlight text', 'axiom-blocks' ) }
					color={ current.color }
					onChange={ ( v ) => onApply( { ...current, color: v } ) }
				/>
			</div>
		</Popover>
	);
}

function HighlightEdit( {
	value,
	onChange,
	isActive,
	activeAttributes,
	contentRef,
} ) {
	const [ open, setOpen ] = useState( false );

	const apply = ( next ) => {
		const style = highlightStyle( next );
		onChange(
			style
				? applyFormat( value, {
						type: HIGHLIGHT_FORMAT,
						attributes: { style },
				  } )
				: removeFormat( value, HIGHLIGHT_FORMAT )
		);
	};

	return (
		<>
			<RichTextToolbarButton
				icon={ HighlightIcon }
				title={ __( 'Highlight', 'axiom-blocks' ) }
				isActive={ isActive }
				onClick={ () => setOpen( ( o ) => ! o ) }
			/>
			{ open && (
				<HighlightPopover
					contentRef={ contentRef }
					current={ readHighlight( activeAttributes ) }
					onApply={ apply }
					onClose={ () => setOpen( false ) }
				/>
			) }
		</>
	);
}

const HIGHLIGHT_SETTINGS = {
	title: __( 'Highlight', 'axiom-blocks' ),
	tagName: 'mark',
	className: 'ab-ah-highlight',
	attributes: { style: 'style' },
	edit: HighlightEdit,
};

registerFormatType( HIGHLIGHT_FORMAT, HIGHLIGHT_SETTINGS );

/**
 * Text Color format — per-run inline color so a single heading can mix colors
 * ("multicolor"). Unlike Highlight (one block-level color), each run stores its
 * own color inline on a `<span class="ab-ah-color" style="color:…">`, which
 * survives wp_kses_post + safecss on the frontend. Additive: existing content is
 * untouched.
 */
export const TEXT_COLOR_FORMAT = 'axiom-blocks/text-color';

const TextColorIcon = (
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
		style={ { fill: 'none' } }
	>
		<path d="M4 20h16" />
		<path d="m7 16 5-11 5 11" />
		<path d="M9.5 12h5" />
	</svg>
);

function readColor( activeAttributes ) {
	const match = ( activeAttributes?.style || '' ).match(
		/color:\s*([^;]+)/i
	);
	return match ? match[ 1 ].trim() : '';
}

function TextColorPopover( { contentRef, current, onApply, onClose } ) {
	const anchor = useAnchor( {
		editableContentElement: contentRef?.current,
		settings: TEXT_COLOR_SETTINGS,
	} );
	return (
		<Popover
			anchor={ anchor }
			onClose={ onClose }
			placement="bottom"
			focusOnMount={ false }
			className="ab-ah-color-popover"
		>
			<div className="ab-ah-color-popover__inner">
				<ABColorControl
					label={ __( 'Text Color', 'axiom-blocks' ) }
					color={ current }
					onChange={ onApply }
				/>
			</div>
		</Popover>
	);
}

function TextColorEdit( {
	value,
	onChange,
	isActive,
	activeAttributes,
	contentRef,
} ) {
	const [ open, setOpen ] = useState( false );

	const apply = ( color ) => {
		onChange(
			color
				? applyFormat( value, {
						type: TEXT_COLOR_FORMAT,
						attributes: { style: `color: ${ color }` },
				  } )
				: removeFormat( value, TEXT_COLOR_FORMAT )
		);
	};

	return (
		<>
			<RichTextToolbarButton
				icon={ TextColorIcon }
				title={ __( 'Text Color', 'axiom-blocks' ) }
				isActive={ isActive }
				onClick={ () => setOpen( ( o ) => ! o ) }
			/>
			{ open && (
				<TextColorPopover
					contentRef={ contentRef }
					current={ readColor( activeAttributes ) }
					onApply={ apply }
					onClose={ () => setOpen( false ) }
				/>
			) }
		</>
	);
}

const TEXT_COLOR_SETTINGS = {
	title: __( 'Text Color', 'axiom-blocks' ),
	tagName: 'span',
	className: 'ab-ah-color',
	attributes: { style: 'style' },
	edit: TextColorEdit,
};

registerFormatType( TEXT_COLOR_FORMAT, TEXT_COLOR_SETTINGS );

/**
 * Font Weight format — per-run inline weight (Light → Bold), so parts of a
 * heading/message can differ beyond core's single Bold. Stored inline
 * (`font-weight`), which survives wp_kses_post + safecss. Additive.
 */
export const FONT_WEIGHT_FORMAT = 'axiom-blocks/font-weight';

const WEIGHT_OPTIONS = [
	{ label: __( 'Default', 'axiom-blocks' ), value: '' },
	{ label: __( 'Light — 300', 'axiom-blocks' ), value: '300' },
	{ label: __( 'Regular — 400', 'axiom-blocks' ), value: '400' },
	{ label: __( 'Medium — 500', 'axiom-blocks' ), value: '500' },
	{ label: __( 'Semibold — 600', 'axiom-blocks' ), value: '600' },
	{ label: __( 'Bold — 700', 'axiom-blocks' ), value: '700' },
];

const WeightIcon = (
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
		style={ { fill: 'none' } }
	>
		<path d="M6 4h9a4 4 0 0 1 0 8H6z" />
		<path d="M6 12h11a4 4 0 0 1 0 8H6z" />
	</svg>
);

function readWeight( activeAttributes ) {
	const match = ( activeAttributes?.style || '' ).match(
		/font-weight:\s*(\d+)/i
	);
	return match ? match[ 1 ] : '';
}

function FontWeightPopover( { contentRef, current, onApply, onClose } ) {
	const anchor = useAnchor( {
		editableContentElement: contentRef?.current,
		settings: FONT_WEIGHT_SETTINGS,
	} );
	return (
		<Popover
			anchor={ anchor }
			onClose={ onClose }
			placement="bottom"
			focusOnMount={ false }
			className="ab-ah-color-popover"
		>
			<div className="ab-ah-color-popover__inner">
				<ABSelectControl
					label={ __( 'Font weight', 'axiom-blocks' ) }
					value={ current }
					options={ WEIGHT_OPTIONS }
					onChange={ onApply }
				/>
			</div>
		</Popover>
	);
}

function FontWeightEdit( {
	value,
	onChange,
	isActive,
	activeAttributes,
	contentRef,
} ) {
	const [ open, setOpen ] = useState( false );

	const apply = ( weight ) => {
		onChange(
			weight
				? applyFormat( value, {
						type: FONT_WEIGHT_FORMAT,
						attributes: { style: `font-weight: ${ weight }` },
				  } )
				: removeFormat( value, FONT_WEIGHT_FORMAT )
		);
	};

	return (
		<>
			<RichTextToolbarButton
				icon={ WeightIcon }
				title={ __( 'Font weight', 'axiom-blocks' ) }
				isActive={ isActive }
				onClick={ () => setOpen( ( o ) => ! o ) }
			/>
			{ open && (
				<FontWeightPopover
					contentRef={ contentRef }
					current={ readWeight( activeAttributes ) }
					onApply={ apply }
					onClose={ () => setOpen( false ) }
				/>
			) }
		</>
	);
}

const FONT_WEIGHT_SETTINGS = {
	title: __( 'Font weight', 'axiom-blocks' ),
	tagName: 'span',
	className: 'ab-ah-weight',
	attributes: { style: 'style' },
	edit: FontWeightEdit,
};

registerFormatType( FONT_WEIGHT_FORMAT, FONT_WEIGHT_SETTINGS );
