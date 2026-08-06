import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
	ABTextControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { useDeviceType } from '../../components/responsive';

import { resolveTypographyAttrs } from '../../components/typographyTargets';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveGridColumns,
	responsiveVarValue,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/testimonial' ];
const TEMPLATE = [
	[
		'axiom-blocks/testimonial',
		{
			quote: 'This is hands down the best plugin we have used — it saved our team hours every week.',
			name: 'Jane Cooper',
			role: 'Marketing Lead',
			company: 'Acme Inc',
			rating: 5,
			verified: true,
			sourcePlatform: 'google',
		},
	],
	[
		'axiom-blocks/testimonial',
		{
			quote: 'Beautifully designed and incredibly easy to set up. Support is responsive too.',
			name: 'Cody Fisher',
			role: 'Founder',
			company: 'Lumen',
			rating: 4.5,
		},
	],
	[
		'axiom-blocks/testimonial',
		{
			quote: 'A genuine time-saver. The carousel looks great on every device.',
			name: 'Esther Howard',
			role: 'Product Designer',
			rating: 5,
		},
	],
];

const TYPO_SHORT = {
	name: 'name',
	role: 'role',
	company: 'comp',
	quote: 'quote',
	mono: 'mono',
};

const TYPO_PROPS = [
	[ 'ff', 'FontFamily' ],
	[ 'fw', 'FontWeight' ],
	[ 'fs', 'FontSize' ],
	[ 'lh', 'LineHeight' ],
	[ 'ls', 'LetterSpacing' ],
	[ 'tt', 'TextTransform' ],
	[ 'td', 'TextDecoration' ],
	[ 'ta', 'TextAlign' ],
];

/* Carousel chrome — same path data the viewScript injects, so the editor
 * preview and the frontend draw identical arrows. */
const ARROW_PREV = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
);
const ARROW_NEXT = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
);

/* Mirrors visibleColumns() in assets/testimonials.js. That helper reads the
 * window width (≤600 ⇒ 1, ≤900 ⇒ max 2), which maps onto WP's device preview
 * widths (360 / 780). Like the frontend it reads the base `columns` attribute —
 * the carousel/marquee track is sized from `data-columns`, so the per-device
 * column overrides only affect the grid layout. */
function previewVisible( cols, device ) {
	if ( 'Mobile' === device ) {
		return 1;
	}
	const n = Math.max( 1, parseInt( cols, 10 ) || 3 );
	return 'Tablet' === device ? Math.min( n, 2 ) : n;
}

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

const CARD_BW = [
	'cardBorderTopWidth',
	'cardBorderRightWidth',
	'cardBorderBottomWidth',
	'cardBorderLeftWidth',
];
const CARD_RADIUS = [
	'cardRadiusTopLeft',
	'cardRadiusTopRight',
	'cardRadiusBottomRight',
	'cardRadiusBottomLeft',
];
const AVATAR_BW = [
	'avatarBorderTopWidth',
	'avatarBorderRightWidth',
	'avatarBorderBottomWidth',
	'avatarBorderLeftWidth',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. Card hover (background +
 * shadow + lift) is the Sable-style hover gap, built as P1 from new additive
 * attrs — the block shipped no hover attrs of its own. Name/Role/Company render
 * as three separate parts (the §25.1 author-grouping decision). The
 * Arrows/Dots `navColor` is NEW (the carousel/marquee chrome is built by the
 * viewScript, so it's frontend-only styling). Monogram carries the block-level
 * initials colors + typography that used to be a per-card range/select pair on
 * the child; the child's `avatarBg`/`avatarColor` stay as per-card overrides
 * (empty ⇒ the auto hue from the name). save() is dynamic (render.php) so
 * nothing changes in saved markup. */
const DESIGN = {
	block: 'testi',
	targets: [
		{
			noun: __( 'Card', 'axiom-blocks' ),
			states: [ 'hover' ],
			background: {
				full: true,
				prefix: 'card',
				colorKey: 'cardBg',
				overlay: false,
				statePrefix: { hover: 'cardHover' },
				stateColorKey: { hover: 'cardBgHover' },
			},
			border: {
				widthKeys: CARD_BW,
				legacyWidth: 'cardBorderWidth',
				styleKey: 'borderStyle',
				colorKey: 'cardBorderColor',
				max: 8,
			},
			radius: { keys: CARD_RADIUS, legacyRadius: 'cardRadius', max: 40 },
			shadow: { bind: 'cardShadowCustom' },
			size: {
				bind: 'cardMinHeight',
				label: __( 'Min height', 'axiom-blocks' ),
				responsive: true,
			},
			padding: { type: 'cardPadding', responsive: true },
			ranges: [
				{
					bind: 'hoverLift',
					label: __( 'Hover lift', 'axiom-blocks' ),
					min: 0,
					max: 24,
					default: 0,
				},
			],
		},
		{
			noun: __( 'Avatar', 'axiom-blocks' ),
			border: {
				widthKeys: AVATAR_BW,
				styleKey: 'avatarBorderStyle',
				colorKey: 'avatarBorderColor',
				max: 8,
			},
			ranges: [
				{
					bind: 'avatarSize',
					label: __( 'Size', 'axiom-blocks' ),
					min: 28,
					max: 96,
					default: 48,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Monogram', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Background', 'axiom-blocks' ),
					bind: 'monoBg',
				},
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'monoColor',
					fallback: '#fff',
				},
			],
			typography: 'mono',
		},
		{
			noun: __( 'Stars', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'ratingColor',
					fallback: '#fbbf24',
				},
			],
		},
		{
			noun: __( 'Icon (quote)', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'quoteIconColor',
					fallback: '#c4b5fd',
				},
			],
		},
		{
			noun: __( 'Arrows / Dots', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'navColor',
					fallback: '#7c3aed',
				},
			],
		},
		{
			noun: __( 'Quote', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'quoteColor',
					fallback: '#374151',
				},
			],
			typography: 'quote',
		},
		{
			noun: __( 'Name', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'nameColor',
					fallback: '#111827',
				},
			],
			typography: 'name',
		},
		{
			noun: __( 'Role', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'roleColor',
					fallback: '#6b7280',
				},
			],
			typography: 'role',
		},
		{
			noun: __( 'Company', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'companyColor',
				},
			],
			typography: 'company',
		},
	],
};

/* CSS vars for the wrapper — consumed by style.scss (loaded in editor AND
 * frontend) so the preview matches the render exactly. Flat card color (legacy
 * `cardBg`/`cardBgHover`, bgType empty) is emitted first so the editor matches
 * the frontend's Background::value() fallback; gradient/image (bgType set)
 * override it via getBackgroundVars. Per-side border widths and per-corner
 * radii fall back to the legacy single `cardBorderWidth`/`cardRadius` so old
 * blocks preview the same as the frontend's render.php fallback. */
export function getTestimonialsVars( attributes, device = 'Desktop' ) {
	const {
		columns,
		gap,
		cardBg,
		cardBgHover,
		cardBorderColor,
		cardBorderWidth,
		cardBorderTopWidth,
		cardBorderRightWidth,
		cardBorderBottomWidth,
		cardBorderLeftWidth,
		borderStyle,
		cardRadius,
		cardRadiusTopLeft,
		cardRadiusTopRight,
		cardRadiusBottomRight,
		cardRadiusBottomLeft,
		cardShadowCustom,
		cardShadowCustomHover,
		hoverLift,
		cardGap,
		cardPaddingTop,
		cardPaddingRight,
		cardPaddingBottom,
		cardPaddingLeft,
		avatarSize,
		avatarBorderColor,
		avatarBorderStyle,
		avatarBorderTopWidth,
		avatarBorderRightWidth,
		avatarBorderBottomWidth,
		avatarBorderLeftWidth,
		monoBg,
		monoColor,
		ratingColor,
		quoteIconColor,
		navColor,
		readMoreLines,
		marqueeSpeed,
		nameColor,
		roleColor,
		companyColor,
		quoteColor,
	} = attributes;
	const anyBw =
		cardBorderTopWidth ||
		cardBorderRightWidth ||
		cardBorderBottomWidth ||
		cardBorderLeftWidth ||
		cardBorderWidth;
	const anyAvatarBw =
		avatarBorderTopWidth ||
		avatarBorderRightWidth ||
		avatarBorderBottomWidth ||
		avatarBorderLeftWidth;
	const lift = parseInt( hoverLift, 10 ) || 0;
	const vars = {
		'--ab-tst-cols': columns || undefined,
		'--ab-tst-gap': gap || undefined,
		'--ab-tst-card-gap': cardGap || undefined,
		'--ab-tst-card-pt': cardPaddingTop || undefined,
		'--ab-tst-card-pr': cardPaddingRight || undefined,
		'--ab-tst-card-pb': cardPaddingBottom || undefined,
		'--ab-tst-card-pl': cardPaddingLeft || undefined,
		// Card background — flat color fallback, then gradient/image override.
		'--ab-tst-card-bg': cardBg || undefined,
		'--ab-tst-card-bg-h': attributes.cardHoverBgType
			? undefined
			: cardBgHover || undefined,
		...getBackgroundVars( attributes, {
			prefix: 'card',
			varPrefix: '--ab-tst-card',
			colorKey: 'cardBg',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'cardHover',
			varPrefix: '--ab-tst-card-h',
			varName: '--ab-tst-card-bg-h',
			colorKey: 'cardBgHover',
		} ),
		// Border — per-side widths fall back to the legacy single `cardBorderWidth`.
		'--ab-tst-card-bc': cardBorderColor || undefined,
		'--ab-tst-card-bs': anyBw
			? borderStyle || 'solid'
			: borderStyle || undefined,
		'--ab-tst-card-bw-top':
			cardBorderTopWidth || cardBorderWidth || undefined,
		'--ab-tst-card-bw-right':
			cardBorderRightWidth || cardBorderWidth || undefined,
		'--ab-tst-card-bw-bottom':
			cardBorderBottomWidth || cardBorderWidth || undefined,
		'--ab-tst-card-bw-left':
			cardBorderLeftWidth || cardBorderWidth || undefined,
		'--ab-tst-card-bw': cardBorderWidth || undefined,
		// Radius — per-corner falls back to the legacy single `cardRadius`.
		'--ab-tst-card-radius-tl': cardRadiusTopLeft || cardRadius || undefined,
		'--ab-tst-card-radius-tr':
			cardRadiusTopRight || cardRadius || undefined,
		'--ab-tst-card-radius-br':
			cardRadiusBottomRight || cardRadius || undefined,
		'--ab-tst-card-radius-bl':
			cardRadiusBottomLeft || cardRadius || undefined,
		'--ab-tst-card-radius': cardRadius || undefined,
		// Shadow (L4) — custom wins over the `.has-shadow` class (the class sets
		// the same var at class level, so the inline value always beats it).
		'--ab-tst-card-shadow': cardShadowCustom || undefined,
		'--ab-tst-card-shadow-h': cardShadowCustomHover || undefined,
		'--ab-tst-card-minh': responsiveVarValue(
			attributes,
			'cardMinHeight',
			device
		),
		// Hover lift — stored negative (upward); unset ⇒ no transform.
		'--ab-tst-lift': lift > 0 ? `-${ lift }px` : undefined,
		// Avatar — border + size. Unset ⇒ borderless (box-sizing keeps the ring
		// inside the size).
		'--ab-tst-avatar-size': avatarSize || undefined,
		'--ab-tst-avatar-bc': avatarBorderColor || undefined,
		'--ab-tst-avatar-bs': anyAvatarBw
			? avatarBorderStyle || 'solid'
			: avatarBorderStyle || undefined,
		'--ab-tst-avatar-bw-top': avatarBorderTopWidth || undefined,
		'--ab-tst-avatar-bw-right': avatarBorderRightWidth || undefined,
		'--ab-tst-avatar-bw-bottom': avatarBorderBottomWidth || undefined,
		'--ab-tst-avatar-bw-left': avatarBorderLeftWidth || undefined,
		// Monogram — block-level initials colors. A card's own avatarBg/avatarColor
		// is emitted inline by the child and wins; unset there ⇒ the auto hue.
		'--ab-tst-mono-bg': monoBg || undefined,
		'--ab-tst-mono-color': monoColor || undefined,
		'--ab-tst-rating': ratingColor || undefined,
		'--ab-tst-quote-icon': quoteIconColor || undefined,
		'--ab-tst-nav': navColor || undefined,
		'--ab-tst-clamp': readMoreLines || undefined,
		'--ab-tst-marquee-time': marqueeSpeed || undefined,
		'--ab-tst-name-color': nameColor || undefined,
		'--ab-tst-role-color': roleColor || undefined,
		'--ab-tst-comp-color': companyColor || undefined,
		'--ab-tst-quote-color': quoteColor || undefined,
	};
	Object.entries( TYPO_SHORT ).forEach( ( [ prefix, short ] ) => {
		TYPO_PROPS.forEach( ( [ css, suffix ] ) => {
			const val = attributes[ `${ prefix }${ suffix }` ];
			if ( val ) {
				vars[ `--ab-tst-${ short }-${ css }` ] = val;
			}
		} );
	} );
	return vars;
}

export function getTestimonialsClasses( attributes ) {
	const {
		layout,
		avatarPosition,
		avatarShape,
		stackOnMobile,
		cardShadow,
		showRating,
		showQuoteIcon,
		readMore,
	} = attributes;
	return [
		'ab-testimonials',
		`ab-testimonials--${ layout || 'grid' }`,
		`ab-testimonials--avatar-${ avatarPosition || 'top' }`,
		`ab-testimonials--shape-${ avatarShape || 'circle' }`,
		stackOnMobile ? 'is-stack-mobile' : '',
		cardShadow ? 'has-shadow' : '',
		showRating ? '' : 'no-rating',
		showQuoteIcon ? '' : 'no-quote-icon',
		readMore ? 'has-readmore' : '',
	].filter( Boolean );
}

function TestimonialsEdit( { attributes, setAttributes, clientId } ) {
	if ( ! isBlockEnabled( 'testimonials' ) ) {
		return <DisabledBlockMessage blockName="Testimonials" />;
	}

	const {
		layout,
		columns,
		stackOnMobile,
		autoplay,
		autoplaySpeed,
		loop,
		pauseOnHover,
		showArrows,
		showDots,
		slideSpeed,
		marqueeSpeed,
		marqueeReverse,
		marqueePauseOnHover,
		avatarPosition,
		avatarShape,
		showRating,
		showQuoteIcon,
		readMore,
		readMoreLines,
		reviewSchema,
		itemName,
	} = attributes;

	const device = useDeviceType();
	const cardCount = useSelect(
		( select ) => select( blockEditorStore ).getBlockCount( clientId ),
		[ clientId ]
	);

	/* Carousel / marquee preview. The viewScript only runs on the front end, so
	 * the canvas reproduces the DOM it builds — viewport > track > cards, plus
	 * the arrows and dots — from the same classes and the same conditions
	 * (initGroup bails under 2 cards, arrows need more cards than fit, dots
	 * disappear at a single page). Motion is the one thing left out: an
	 * animating marquee or a moving track can't be edited. */
	const isCarousel = 'carousel' === layout;
	const isMarquee = 'marquee' === layout;
	const isSlider = ( isCarousel || isMarquee ) && cardCount >= 2;
	const visible = previewVisible( columns, device );
	const dotCount = Math.max( 1, cardCount - visible + 1 );

	const blockProps = useBlockProps( {
		className: [
			...getTestimonialsClasses( attributes ),
			isSlider ? 'is-ready' : '',
			isSlider ? 'is-editor-preview' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--ab-tst-visible': visible,
			...getTestimonialsVars(
				resolveTypographyAttrs(
					attributes,
					Object.keys( TYPO_SHORT ),
					device
				),
				device
			),
			...useSpacingStyle( attributes ),
			gridTemplateColumns: responsiveGridColumns(
				attributes,
				'columns',
				device
			),
			'--ab-tst-gap': responsiveVarValue( attributes, 'gap', device ),
			'--ab-tst-card-gap': responsiveVarValue(
				attributes,
				'cardGap',
				device
			),
			'--ab-tst-avatar-size': responsiveVarValue(
				attributes,
				'avatarSize',
				device
			),
		},
	} );

	// In slider mode the cards live in the track, so the inner-blocks container
	// moves down with them; the grid keeps them on the wrapper itself.
	const innerBlocksProps = useInnerBlocksProps(
		isSlider ? { className: 'ab-testimonials__track' } : blockProps,
		{
			allowedBlocks: ALLOWED,
			template: TEMPLATE,
			templateLock: false,
			orientation: 'horizontal',
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	const leading = (
		<>
			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABSelectControl
					label={ __( 'Layout', 'axiom-blocks' ) }
					value={ layout || 'grid' }
					options={ [
						{
							label: __( 'Grid', 'axiom-blocks' ),
							value: 'grid',
						},
						{
							label: __( 'Carousel', 'axiom-blocks' ),
							value: 'carousel',
						},
						{
							label: __( 'Marquee', 'axiom-blocks' ),
							value: 'marquee',
						},
					] }
					onChange={ ( v ) => setAttributes( { layout: v } ) }
				/>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="columns"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABRangeControl
							label={
								'marquee' === layout
									? __( 'Cards in view', 'axiom-blocks' )
									: __( 'Columns', 'axiom-blocks' )
							}
							value={
								value !== '' && value != null
									? value
									: inherited ?? 3
							}
							onChange={ ( v ) => setValue( v ?? 1 ) }
							min={ 1 }
							max={ 5 }
							step={ 1 }
							unit=""
						/>
					) }
				</ABResponsive>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="gap"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABRangeControl
							label={ __( 'Gap', 'axiom-blocks' ) }
							value={ fromPx(
								value !== '' && value != null
									? value
									: inherited,
								24
							) }
							onChange={ ( v ) => setValue( toPx( v ) ) }
							min={ 0 }
							max={ 80 }
							step={ 1 }
							unit="px"
						/>
					) }
				</ABResponsive>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="cardGap"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABRangeControl
							label={ __( 'Card content gap', 'axiom-blocks' ) }
							help={ __(
								'Vertical spacing between the rating, quote and author inside each card.',
								'axiom-blocks'
							) }
							value={ fromPx(
								value !== '' && value != null
									? value
									: inherited,
								14
							) }
							onChange={ ( v ) => setValue( toPx( v ) ) }
							min={ 0 }
							max={ 48 }
							step={ 1 }
							unit="px"
						/>
					) }
				</ABResponsive>
				{ 'grid' === layout && (
					<ABToggleControl
						label={ __( 'Stack on mobile', 'axiom-blocks' ) }
						checked={ !! stackOnMobile }
						onChange={ ( v ) =>
							setAttributes( { stackOnMobile: v } )
						}
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Avatar', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Position', 'axiom-blocks' ) }
					value={ avatarPosition || 'top' }
					options={ [
						{
							label: __( 'Top', 'axiom-blocks' ),
							value: 'top',
						},
						{
							label: __( 'Left', 'axiom-blocks' ),
							value: 'left',
						},
					] }
					onChange={ ( v ) => setAttributes( { avatarPosition: v } ) }
				/>
				<ABSelectControl
					label={ __( 'Shape', 'axiom-blocks' ) }
					value={ avatarShape || 'circle' }
					options={ [
						{
							label: __( 'Circle', 'axiom-blocks' ),
							value: 'circle',
						},
						{
							label: __( 'Rounded', 'axiom-blocks' ),
							value: 'rounded',
						},
						{
							label: __( 'Square', 'axiom-blocks' ),
							value: 'square',
						},
					] }
					onChange={ ( v ) => setAttributes( { avatarShape: v } ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Content', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show rating', 'axiom-blocks' ) }
					checked={ !! showRating }
					onChange={ ( v ) => setAttributes( { showRating: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Show quote icon', 'axiom-blocks' ) }
					checked={ !! showQuoteIcon }
					onChange={ ( v ) => setAttributes( { showQuoteIcon: v } ) }
				/>
			</PanelBody>

			{ 'carousel' === layout && (
				<PanelBody
					title={ __( 'Carousel', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Autoplay', 'axiom-blocks' ) }
						checked={ !! autoplay }
						onChange={ ( v ) => setAttributes( { autoplay: v } ) }
					/>
					{ autoplay && (
						<ABRangeControl
							label={ __( 'Autoplay delay', 'axiom-blocks' ) }
							value={ autoplaySpeed ?? 4000 }
							onChange={ ( v ) =>
								setAttributes( {
									autoplaySpeed: v ?? 0,
								} )
							}
							min={ 1000 }
							max={ 10000 }
							step={ 250 }
							unit="ms"
						/>
					) }
					<ABRangeControl
						label={ __( 'Transition speed', 'axiom-blocks' ) }
						value={ slideSpeed ?? 500 }
						onChange={ ( v ) =>
							setAttributes( { slideSpeed: v ?? 0 } )
						}
						min={ 100 }
						max={ 1500 }
						step={ 50 }
						unit="ms"
					/>
					<ABToggleControl
						label={ __( 'Loop', 'axiom-blocks' ) }
						checked={ !! loop }
						onChange={ ( v ) => setAttributes( { loop: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Pause on hover', 'axiom-blocks' ) }
						checked={ !! pauseOnHover }
						onChange={ ( v ) =>
							setAttributes( { pauseOnHover: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Show arrows', 'axiom-blocks' ) }
						checked={ !! showArrows }
						onChange={ ( v ) => setAttributes( { showArrows: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Show dots', 'axiom-blocks' ) }
						checked={ !! showDots }
						onChange={ ( v ) => setAttributes( { showDots: v } ) }
					/>
				</PanelBody>
			) }

			{ 'marquee' === layout && (
				<PanelBody
					title={ __( 'Marquee', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABRangeControl
						label={ __( 'Scroll duration', 'axiom-blocks' ) }
						help={ __(
							'Seconds for one full loop. Lower = faster.',
							'axiom-blocks'
						) }
						value={ marqueeSpeed ?? 30 }
						onChange={ ( v ) =>
							setAttributes( { marqueeSpeed: v ?? 1 } )
						}
						min={ 5 }
						max={ 120 }
						step={ 1 }
						unit="s"
					/>
					<ABToggleControl
						label={ __( 'Reverse direction', 'axiom-blocks' ) }
						checked={ !! marqueeReverse }
						onChange={ ( v ) =>
							setAttributes( { marqueeReverse: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Pause on hover', 'axiom-blocks' ) }
						checked={ !! marqueePauseOnHover }
						onChange={ ( v ) =>
							setAttributes( { marqueePauseOnHover: v } )
						}
					/>
				</PanelBody>
			) }

			<PanelBody
				title={ __( 'Read more', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Clamp long quotes', 'axiom-blocks' ) }
					help={ __(
						'Truncate quotes past a line limit with a Read more toggle.',
						'axiom-blocks'
					) }
					checked={ !! readMore }
					onChange={ ( v ) => setAttributes( { readMore: v } ) }
				/>
				{ readMore && (
					<ABRangeControl
						label={ __( 'Lines', 'axiom-blocks' ) }
						value={ readMoreLines ?? 4 }
						onChange={ ( v ) =>
							setAttributes( { readMoreLines: v ?? 1 } )
						}
						min={ 2 }
						max={ 10 }
						step={ 1 }
						unit=""
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Review schema', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Output review schema', 'axiom-blocks' ) }
					help={ __(
						'Add schema.org Review + AggregateRating structured data. Use only for genuine customer reviews.',
						'axiom-blocks'
					) }
					checked={ !! reviewSchema }
					onChange={ ( v ) => setAttributes( { reviewSchema: v } ) }
				/>
				{ reviewSchema && (
					<ABTextControl
						label={ __( 'Product / service name', 'axiom-blocks' ) }
						help={ __(
							'What is being reviewed. Leave blank to use the site name.',
							'axiom-blocks'
						) }
						value={ itemName }
						onChange={ ( v ) => setAttributes( { itemName: v } ) }
					/>
				) }
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ leading }
			/>

			{ isSlider ? (
				<div { ...blockProps }>
					<div className="ab-testimonials__viewport">
						<div { ...innerBlocksProps } />
					</div>
					{ isCarousel && showArrows && cardCount > visible && (
						<>
							<span
								className="ab-testimonials__arrow ab-testimonials__arrow--prev"
								aria-hidden="true"
							>
								{ ARROW_PREV }
							</span>
							<span
								className="ab-testimonials__arrow ab-testimonials__arrow--next"
								aria-hidden="true"
							>
								{ ARROW_NEXT }
							</span>
						</>
					) }
					{ isCarousel && showDots && dotCount > 1 && (
						<div
							className="ab-testimonials__dots"
							aria-hidden="true"
						>
							{ Array.from( { length: dotCount } ).map(
								( _, i ) => (
									<span
										key={ i }
										className={
											'ab-testimonials__dot' +
											( 0 === i ? ' is-active' : '' )
										}
									/>
								)
							) }
						</div>
					) }
				</div>
			) : (
				<div { ...innerBlocksProps } />
			) }
		</>
	);
}

export const Testimonials = {
	name: 'axiom-blocks/testimonials',
	settings: {
		title: __( 'Testimonials', 'axiom-blocks' ),
		description: __(
			'Social-proof testimonials in a grid, carousel, or marquee with ratings, avatars, and review schema.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="testimonials" />,
		edit: TestimonialsEdit,
		save: () => <InnerBlocks.Content />,
	},
};
