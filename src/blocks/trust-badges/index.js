import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import {
	useDeviceType,
	resolveResponsive,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveGridColumns,
	responsiveVarValue,
	responsiveAlignValue,
	ALIGN_FLEX_MAP,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import { BADGE_GROUPS, BADGE_INDEX, BADGE_PRESETS, BadgeSvg } from './badges';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

/* ── Inline icons (1.6px stroke, matches ABControls language) ───────────── */
const STROKE = {
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.6,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};
const IconPlus = () => (
	<svg viewBox="0 0 16 16" { ...STROKE }>
		<path d="M8 3.5v9M3.5 8h9" />
	</svg>
);
const IconTrash = () => (
	<svg viewBox="0 0 24 24" { ...STROKE }>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M3 6h18" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</svg>
);
const IconImage = () => (
	<svg viewBox="0 0 16 16" { ...STROKE }>
		<rect x="2.5" y="3" width="11" height="10" rx="1.5" />
		<circle cx="6" cy="6.5" r="1" />
		<path d="M3 11l3-3 4 4 2-2 1.5 1.5" />
	</svg>
);

const PIXEL_SIZES = { small: 32, medium: 48, large: 64 };

const newCustomId = () =>
	`custom-${ Math.random().toString( 36 ).slice( 2, 8 ) }`;

const TB_BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const TB_RADIUS = [
	'cardRadiusTopLeft',
	'cardRadiusTopRight',
	'cardRadiusBottomRight',
	'cardRadiusBottomLeft',
];

const CARD_COLOR_DEFAULT = '#ffffff';
const BORDER_COLOR_DEFAULT = '#e5e7eb';
const ICON_COLOR_DEFAULT = '#1e1e1e';

/* The shipped card background, resolved from the retired `showCard` toggle.
 *
 * `showCard`/`showBorder` existed because the shipped defaults are non-empty:
 * with `cardColor` defaulting to #ffffff there was no way to tell "no card" from
 * "white card", so a boolean carried the difference. The Styles rows make that
 * boolean redundant — but only if the new control writes somewhere else, because
 * the moment it writes `cardColor` the legacy reading is destroyed. So the
 * Background row binds a NEW `cardBg`, and `showCard` + `cardColor` stay as
 * read-only legacy inputs supplying this default. An untouched block resolves to
 * exactly what it painted before; clearing `cardBg` returns to it (the standard
 * Reset-to-shipped behavior); a transparent color removes the card. Same shape as
 * the Radius row advertising the legacy `cardRadius`. */
const shippedCardBg = ( { showCard, cardColor } ) =>
	showCard ? cardColor || CARD_COLOR_DEFAULT : 'transparent';

/* Whether a card is actually painted — drives `.has-card`, which carries the
 * shipped hover lift. Follows the resolved background, not the retired toggle. */
const hasCardBg = ( attributes ) =>
	'transparent' !== ( attributes.cardBg || shippedCardBg( attributes ) );
/* What style.scss paints on an untouched badge — advertised (never written) so
 * the rows stop reading "None" on a block that visibly has this spacing. */
const CARD_PADDING_DEFAULT = [ '8px', '12px', '8px', '12px' ];
const CARD_GAP_DEFAULT = 6;

/* Anatomy-as-declaration (locked doc §24). Four parts: the badge Card
 * (`__item` — the box that carries background/border/radius/padding), the Icon
 * glyph, the Heading and the badge Label.
 *
 * Built per-render so the rows can advertise what the stylesheet already paints
 * (never writing it): the Background swatch shows the legacy card color, the
 * Border width shows the legacy 1px rule, the Radius shows the legacy
 * `cardRadius`. The Icon part is present only in Monochrome mode, where
 * `iconColor` applies — brand mode renders the badges' own colored artwork, so a
 * color row there would do nothing. */
const designFor = ( attributes ) => {
	const { showBorder, colorMode, cardBg, cardRadius } = attributes;
	const shippedBg = shippedCardBg( attributes );

	return {
		block: 'tb',
		targets: [
			{
				noun: __( 'Card', 'axiom-blocks' ),
				states: [ 'hover' ],
				background: {
					bind: 'cardBg',
					stateBind: { hover: 'cardColorHover' },
					fallback: shippedBg,
					// An unset hover keeps the resting card background, which is
					// what the CSS fallback chain does.
					stateFallback: { hover: cardBg || shippedBg },
				},
				border: {
					widthKeys: TB_BW,
					styleKey: 'borderStyle',
					colorKey: 'borderColor',
					max: 6,
					// The retired "Show border" toggle survives as the shipped
					// 1px rule that `.has-border` paints — advertised, not written.
					widthDefault: showBorder ? '1px' : '',
					colorDefault: BORDER_COLOR_DEFAULT,
				},
				// No `legacyRadius`: the shipped `cardRadius` is a number attribute,
				// and the legacy path writes '' when every corner is cleared. It is
				// advertised as the default instead, so an untouched card keeps it and
				// any corner value overrides it.
				radius: { keys: TB_RADIUS, max: 40, defaults: cardRadius },
				shadow: { bind: 'cardShadow' },
				padding: {
					type: 'cardPadding',
					responsive: true,
					defaults: CARD_PADDING_DEFAULT,
				},
				ranges: [
					{
						bind: 'cardGap',
						label: __( 'Gap', 'axiom-blocks' ),
						min: 0,
						max: 40,
						default: CARD_GAP_DEFAULT,
						responsive: true,
						units: [ 'px', 'rem' ],
						unitRange: { px: [ 0, 40 ], rem: [ 0, 3 ] },
					},
				],
			},
			...( 'color' === colorMode
				? []
				: [
						{
							noun: __( 'Icon', 'axiom-blocks' ),
							colors: [
								{
									label: __( 'Color', 'axiom-blocks' ),
									bind: 'iconColor',
									fallback: ICON_COLOR_DEFAULT,
								},
							],
						},
				  ] ),
			{
				noun: __( 'Heading', 'axiom-blocks' ),
				colors: [
					{
						label: __( 'Text', 'axiom-blocks' ),
						bind: 'headingColor',
					},
				],
				typography: 'heading',
			},
			{
				noun: __( 'Label', 'axiom-blocks' ),
				colors: [
					{ label: __( 'Text', 'axiom-blocks' ), bind: 'labelColor' },
				],
				typography: 'label',
			},
		],
	};
};

/* Wrapper CSS vars. Mirrors the var map in render.php — keep the two in step.
 * An unset design-layer attribute emits nothing, so style.scss falls back to the
 * `*-def` / literal value carrying the shipped look. */
export function getTrustBadgesVars( attributes, device = 'Desktop' ) {
	const {
		layout,
		badgeSize,
		colorMode,
		iconColor,
		cardBg,
		cardColorHover,
		cardRadius,
		borderColor,
		borderStyle,
		cardShadow,
		cardShadowHover,
		headingColor,
		labelColor,
	} = attributes;
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'columns' ],
		device
	);
	const r = ( key ) =>
		resolveResponsive( attributes, key, device ) || undefined;
	const anyWidth = TB_BW.some( ( k ) => attributes[ k ] );

	return {
		'--ab-tb-gap': responsiveVarValue( attributes, 'gap', device, 'px' ),
		'--ab-tb-columns': layout === 'grid' ? resolved.columns : 'unset',
		'--ab-tb-icon-size': `${
			PIXEL_SIZES[ badgeSize ] || PIXEL_SIZES.medium
		}px`,
		'--ab-tb-icon-color':
			'color' === colorMode ? undefined : iconColor || undefined,
		// `cardBg` is the live control; the retired `showCard` toggle survives
		// only as the shipped fallback, so an untouched block paints exactly what
		// it did before.
		'--ab-tb-card-bg': cardBg || shippedCardBg( attributes ),
		'--ab-tb-card-bg-h': cardColorHover || undefined,
		'--ab-tb-card-radius': `${ cardRadius }px`,
		'--ab-tb-card-radius-tl': attributes.cardRadiusTopLeft || undefined,
		'--ab-tb-card-radius-tr': attributes.cardRadiusTopRight || undefined,
		'--ab-tb-card-radius-br': attributes.cardRadiusBottomRight || undefined,
		'--ab-tb-card-radius-bl': attributes.cardRadiusBottomLeft || undefined,
		// Widths are the live control; `.has-border` supplies the shipped 1px as
		// `--ab-tb-bw-def`, so an explicit 0px is what turns a legacy border off.
		'--ab-tb-bc': borderColor || BORDER_COLOR_DEFAULT,
		'--ab-tb-bs':
			anyWidth || borderStyle ? borderStyle || 'solid' : undefined,
		'--ab-tb-bw-top': attributes.borderTopWidth || undefined,
		'--ab-tb-bw-right': attributes.borderRightWidth || undefined,
		'--ab-tb-bw-bottom': attributes.borderBottomWidth || undefined,
		'--ab-tb-bw-left': attributes.borderLeftWidth || undefined,
		'--ab-tb-shadow': cardShadow || undefined,
		'--ab-tb-shadow-h': cardShadowHover || undefined,
		'--ab-tb-pt': r( 'cardPaddingTop' ),
		'--ab-tb-pr': r( 'cardPaddingRight' ),
		'--ab-tb-pb': r( 'cardPaddingBottom' ),
		'--ab-tb-pl': r( 'cardPaddingLeft' ),
		'--ab-tb-item-gap': r( 'cardGap' ),
		'--ab-tb-heading-color': headingColor || undefined,
		'--ab-tb-label-color': labelColor || undefined,
		// The shipped label is dimmed to 70%; a chosen color would inherit that
		// cap, so setting one restores full opacity.
		'--ab-tb-label-opacity': labelColor ? '1' : undefined,
	};
}

function TrustBadgesEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'trust-badges' ) ) {
		return <DisabledBlockMessage blockName="Trust Badges" />;
	}
	const {
		headingShow,
		headingText,
		headingAlign,
		preset,
		selectedBadges,
		customBadges,
		layout,
		badgeSize,
		colorMode,
		showBorder,
	} = attributes;

	const px = PIXEL_SIZES[ badgeSize ] || PIXEL_SIZES.medium;

	/* ── Badge selection ────────────────────────────────────────────────── */
	const toggleBadge = ( id ) => {
		const next = selectedBadges.includes( id )
			? selectedBadges.filter( ( x ) => x !== id )
			: [ ...selectedBadges, id ];
		setAttributes( { selectedBadges: next, preset: 'custom' } );
	};

	const applyPreset = ( key ) => {
		if ( key === 'custom' ) {
			setAttributes( { preset: 'custom' } );
			return;
		}
		const list = BADGE_PRESETS[ key ];
		if ( ! list ) return;
		setAttributes( { preset: key, selectedBadges: list } );
	};

	/* ── Custom badges ──────────────────────────────────────────────────── */
	const addCustom = () => {
		setAttributes( {
			customBadges: [
				...customBadges,
				{ id: newCustomId(), url: '', alt: '', link: '' },
			],
		} );
	};
	const updateCustom = ( id, patch ) => {
		setAttributes( {
			customBadges: customBadges.map( ( b ) =>
				b.id === id ? { ...b, ...patch } : b
			),
		} );
	};
	const removeCustom = ( id ) => {
		setAttributes( {
			customBadges: customBadges.filter( ( b ) => b.id !== id ),
		} );
	};

	/* ── Block wrapper ──────────────────────────────────────────────────── */
	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'columns', 'alignment' ],
		device
	);
	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-trust-badges',
			`is-layout-${ layout }`,
			`is-align-${ resolved.alignment }`,
			`is-size-${ badgeSize }`,
			`is-color-${ colorMode }`,
			hasCardBg( attributes ) ? 'has-card' : '',
			showBorder ? 'has-border' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...getTrustBadgesVars( attributes, device ),
			...useSpacingStyle( attributes ),
		},
	} );

	/* ── Typography styles ──────────────────────────────────────────────── */
	const headingTypoStyle = useTypographyStyle( attributes, 'heading' );
	const labelTypoStyle = useTypographyStyle( attributes, 'label' );

	/* ── Preview list = selected built-ins + customs ────────────────────── */
	const renderBadge = ( badge, key ) => {
		const inner = badge.custom ? (
			badge.url ? (
				<img
					src={ badge.url }
					alt={ badge.alt || '' }
					style={ { width: px, height: px, objectFit: 'contain' } }
				/>
			) : (
				<div className="ab-tb-empty">
					<IconImage />
				</div>
			)
		) : (
			<BadgeSvg id={ badge.id } size={ px } colorMode={ colorMode } />
		);
		return (
			<div className="axiom-blocks-trust-badges__item" key={ key }>
				{ inner }
				{ ( badge.custom
					? badge.alt
					: BADGE_INDEX[ badge.id ]?.label ) && (
					<span
						className="axiom-blocks-trust-badges__label"
						style={ labelTypoStyle }
					>
						{ badge.custom
							? badge.alt
							: BADGE_INDEX[ badge.id ]?.label }
					</span>
				) }
			</div>
		);
	};

	const leading = (
		<>
			{ /* Badges — which badges show and how they are drawn. The custom
			     uploader is the same question, so it lives here rather than in
			     a panel of its own. */ }
			<PanelBody
				title={ __( 'Badges', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABSelectControl
					label={ __( 'Preset', 'axiom-blocks' ) }
					value={ preset }
					options={ [
						{
							label: __( 'Mixed (recommended)', 'axiom-blocks' ),
							value: 'mixed',
						},
						{
							label: __( 'Payment only', 'axiom-blocks' ),
							value: 'payment',
						},
						{
							label: __( 'Security only', 'axiom-blocks' ),
							value: 'security',
						},
						{
							label: __( 'Service only', 'axiom-blocks' ),
							value: 'service',
						},
						{
							label: __( 'All built-in', 'axiom-blocks' ),
							value: 'all',
						},
						{
							label: __( 'Custom selection', 'axiom-blocks' ),
							value: 'custom',
						},
					] }
					onChange={ applyPreset }
				/>
				<ABSelectControl
					label={ __( 'Color mode', 'axiom-blocks' ) }
					value={ colorMode }
					options={ [
						{
							label: __( 'Brand colors', 'axiom-blocks' ),
							value: 'color',
						},
						{
							label: __( 'Monochrome', 'axiom-blocks' ),
							value: 'mono',
						},
					] }
					onChange={ ( v ) => setAttributes( { colorMode: v } ) }
				/>
				{ BADGE_GROUPS.map( ( group ) => (
					<div className="ab-tb-group" key={ group.id }>
						<div className="ab-tb-group__title">
							{ group.label }
						</div>
						{ group.badges.map( ( b ) => (
							<ABToggleControl
								key={ b.id }
								label={ b.label }
								checked={ selectedBadges.includes( b.id ) }
								onChange={ () => toggleBadge( b.id ) }
							/>
						) ) }
					</div>
				) ) }
				<div className="ab-tb-group">
					<div className="ab-tb-group__title">
						{ __( 'Custom badges', 'axiom-blocks' ) }
					</div>
					<div className="ab-tb-customs">
						{ customBadges.map( ( b, i ) => (
							<div className="ab-tb-custom" key={ b.id }>
								<div className="ab-tab-item">
									<span className="ab-tab-item__num">
										{ i + 1 }
									</span>
									<MediaUploadCheck>
										<MediaUpload
											onSelect={ ( media ) =>
												updateCustom( b.id, {
													url: media.url,
													alt: media.alt || b.alt,
												} )
											}
											allowedTypes={ [ 'image' ] }
											value={ b.id }
											render={ ( { open } ) => (
												<button
													type="button"
													className="ab-tb-thumb"
													onClick={ open }
													aria-label={ __(
														'Choose image',
														'axiom-blocks'
													) }
												>
													{ b.url ? (
														<img
															src={ b.url }
															alt=""
														/>
													) : (
														<IconImage />
													) }
												</button>
											) }
										/>
									</MediaUploadCheck>
									<input
										type="text"
										className="ab-tab-item__input"
										value={ b.alt || '' }
										onChange={ ( e ) =>
											updateCustom( b.id, {
												alt: e.target.value,
											} )
										}
										placeholder={ __(
											'Label / alt',
											'axiom-blocks'
										) }
									/>
									<button
										type="button"
										className="ab-tab-btn ab-tab-btn--danger"
										onClick={ () => removeCustom( b.id ) }
										aria-label={ __(
											'Remove badge',
											'axiom-blocks'
										) }
									>
										<IconTrash />
									</button>
								</div>
								<input
									type="url"
									className="ab-tb-link-input"
									value={ b.link || '' }
									onChange={ ( e ) =>
										updateCustom( b.id, {
											link: e.target.value,
										} )
									}
									placeholder={ __(
										'Optional link URL',
										'axiom-blocks'
									) }
								/>
							</div>
						) ) }
						<button
							type="button"
							className="ab-btn ab-btn--secondary ab-tb-add"
							onClick={ addCustom }
						>
							<IconPlus />
							<span>
								{ __( 'Add custom badge', 'axiom-blocks' ) }
							</span>
						</button>
						{ customBadges.some( ( b ) => b.url ) && (
							<p className="ab-tb-hint">
								{ __(
									'Tip: optional links and alt text are saved per badge.',
									'axiom-blocks'
								) }
							</p>
						) }
					</div>
				</div>
			</PanelBody>

			{ /* Heading — the block's single text element. */ }
			<PanelBody
				title={ __( 'Heading', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show heading', 'axiom-blocks' ) }
					checked={ headingShow }
					onChange={ ( v ) => setAttributes( { headingShow: v } ) }
				/>
				{ headingShow && (
					<>
						<ABTextControl
							label={ __( 'Heading text', 'axiom-blocks' ) }
							value={ headingText }
							onChange={ ( v ) =>
								setAttributes( { headingText: v } )
							}
						/>
						<ABResponsive
							attributes={ attributes }
							setAttributes={ setAttributes }
							attrKey="headingAlign"
						>
							{ ( { value, setValue, inherited } ) => (
								<ABSelectControl
									label={ __(
										'Heading alignment',
										'axiom-blocks'
									) }
									value={
										value !== '' && value != null
											? value
											: inherited ?? 'center'
									}
									options={ [
										{
											label: __( 'Left', 'axiom-blocks' ),
											value: 'left',
										},
										{
											label: __(
												'Center',
												'axiom-blocks'
											),
											value: 'center',
										},
										{
											label: __(
												'Right',
												'axiom-blocks'
											),
											value: 'right',
										},
									] }
									onChange={ setValue }
								/>
							) }
						</ABResponsive>
					</>
				) }
			</PanelBody>

			{ /* Layout — how the badge row is arranged. */ }
			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Layout', 'axiom-blocks' ) }
					value={ layout }
					options={ [
						{
							label: __( 'Horizontal row', 'axiom-blocks' ),
							value: 'horizontal',
						},
						{
							label: __( 'Grid', 'axiom-blocks' ),
							value: 'grid',
						},
					] }
					onChange={ ( v ) => setAttributes( { layout: v } ) }
				/>
				{ layout === 'grid' && (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="columns"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Columns', 'axiom-blocks' ) }
								value={
									value !== '' && value != null
										? value
										: inherited ?? 4
								}
								onChange={ ( v ) =>
									setValue(
										Math.max( 2, Math.min( 6, v || 2 ) )
									)
								}
								min={ 2 }
								max={ 6 }
								step={ 1 }
								unit=""
							/>
						) }
					</ABResponsive>
				) }
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="alignment"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABSelectControl
							label={ __( 'Alignment', 'axiom-blocks' ) }
							value={
								value !== '' && value != null
									? value
									: inherited ?? 'center'
							}
							options={ [
								{
									label: __( 'Left', 'axiom-blocks' ),
									value: 'left',
								},
								{
									label: __( 'Center', 'axiom-blocks' ),
									value: 'center',
								},
								{
									label: __( 'Right', 'axiom-blocks' ),
									value: 'right',
								},
							] }
							onChange={ setValue }
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
							value={
								value !== '' && value != null
									? value
									: inherited ?? 0
							}
							onChange={ ( v ) => setValue( v ?? 0 ) }
							min={ 0 }
							max={ 64 }
							step={ 1 }
							unit="px"
						/>
					) }
				</ABResponsive>
				<ABSelectControl
					label={ __( 'Badge size', 'axiom-blocks' ) }
					value={ badgeSize }
					options={ [
						{
							label: __( 'Small (32px)', 'axiom-blocks' ),
							value: 'small',
						},
						{
							label: __( 'Medium (48px)', 'axiom-blocks' ),
							value: 'medium',
						},
						{
							label: __( 'Large (64px)', 'axiom-blocks' ),
							value: 'large',
						},
					] }
					onChange={ ( v ) => setAttributes( { badgeSize: v } ) }
				/>
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ designFor( attributes ) }
				leading={ leading }
			/>

			<div { ...blockProps }>
				{ headingShow && headingText && (
					<div
						className="axiom-blocks-trust-badges__heading"
						style={ {
							textAlign:
								responsiveAlignValue(
									attributes,
									'headingAlign',
									device
								) ?? headingAlign,
							...headingTypoStyle,
						} }
					>
						{ headingText }
					</div>
				) }
				<div
					className="axiom-blocks-trust-badges__list"
					style={ {
						gridTemplateColumns: responsiveGridColumns(
							attributes,
							'columns',
							device
						),
						justifyContent: responsiveAlignValue(
							attributes,
							'alignment',
							device,
							ALIGN_FLEX_MAP
						),
					} }
				>
					{ selectedBadges.map( ( id ) =>
						BADGE_INDEX[ id ] ? renderBadge( { id }, id ) : null
					) }
					{ customBadges.map( ( b ) =>
						renderBadge( { ...b, custom: true }, b.id )
					) }
					{ ! selectedBadges.length && ! customBadges.length && (
						<p className="axiom-blocks-trust-badges__empty">
							{ __(
								'Select at least one badge from the inspector.',
								'axiom-blocks'
							) }
						</p>
					) }
				</div>
			</div>
		</>
	);
}

export const TrustBadges = {
	name: 'axiom-blocks/trust-badges',
	settings: {
		title: __( 'Trust Badges', 'axiom-blocks' ),
		description: __(
			'Payment, security, and service trust badges with presets.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="trust-badges" />,
		edit: TrustBadgesEdit,
		save: ( { attributes } ) => {
			const {
				headingShow,
				headingText,
				selectedBadges,
				customBadges,
				badgeSize,
				colorMode,
			} = attributes;
			const blockProps = useBlockProps.save( {
				className: 'axiom-blocks-trust-badges',
			} );
			const ids = Array.isArray( selectedBadges ) ? selectedBadges : [];
			const customs = Array.isArray( customBadges ) ? customBadges : [];
			const px = { small: 32, medium: 48, large: 64 }[ badgeSize ] || 48;
			return (
				<div { ...blockProps }>
					{ headingShow && headingText && (
						<div className="axiom-blocks-trust-badges__heading">
							{ headingText }
						</div>
					) }
					<div className="axiom-blocks-trust-badges__list">
						{ ids.map( ( id ) => {
							const badge = BADGE_INDEX[ id ];
							return badge ? (
								<div
									key={ id }
									className="axiom-blocks-trust-badges__item"
								>
									<BadgeSvg
										id={ id }
										size={ px }
										colorMode={ colorMode }
									/>
									<span className="axiom-blocks-trust-badges__label">
										{ badge.label }
									</span>
								</div>
							) : null;
						} ) }
						{ customs.map( ( b ) => (
							<div
								key={ b.id }
								className="axiom-blocks-trust-badges__item"
							>
								{ b.url && (
									<img
										src={ b.url }
										alt={ b.alt || '' }
										style={ {
											maxWidth: '100%',
											height: 'auto',
										} }
									/>
								) }
								{ b.alt && (
									<span className="axiom-blocks-trust-badges__label">
										{ b.alt }
									</span>
								) }
							</div>
						) ) }
					</div>
				</div>
			);
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
