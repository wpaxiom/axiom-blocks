import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABSubAccordion,
} from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	getTypographyStyle,
} from '../../components/TypographyPanel';
import { BlockIcon } from '../../blockIcons';
import { BADGE_GROUPS, BADGE_INDEX, BADGE_PRESETS, BadgeSvg } from './badges';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

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
		columns,
		alignment,
		gap,
		badgeSize,
		colorMode,
		iconColor,
		showCard,
		cardColor,
		cardRadius,
		showBorder,
		borderColor,
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
	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-trust-badges',
			`is-layout-${ layout }`,
			`is-align-${ alignment }`,
			`is-size-${ badgeSize }`,
			`is-color-${ colorMode }`,
			showCard ? 'has-card' : '',
			showBorder ? 'has-border' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--ab-tb-gap': `${ gap }px`,
			'--ab-tb-card-bg': showCard ? cardColor : 'transparent',
			'--ab-tb-card-radius': `${ cardRadius }px`,
			'--ab-tb-border': showBorder ? `1px solid ${ borderColor }` : '0',
			'--ab-tb-columns': layout === 'grid' ? columns : 'unset',
			'--ab-tb-icon-size': `${ px }px`,
			...getSpacingStyle( attributes ),
		},
	} );

	/* ── Typography styles ──────────────────────────────────────────────── */
	const headingTypoStyle = getTypographyStyle( attributes, 'heading' );
	const labelTypoStyle = getTypographyStyle( attributes, 'label' );

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

	return (
		<>
			<InspectorControls>
				{ /* ── Content ───────────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Content', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABToggleControl
						label={ __( 'Show heading', 'axiom-blocks' ) }
						checked={ headingShow }
						onChange={ ( v ) =>
							setAttributes( { headingShow: v } )
						}
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
							<ABSelectControl
								label={ __(
									'Heading alignment',
									'axiom-blocks'
								) }
								value={ headingAlign }
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
								onChange={ ( v ) =>
									setAttributes( { headingAlign: v } )
								}
							/>
						</>
					) }
				</PanelBody>

				{ /* ── Built-in badges ──────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Badges', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Preset', 'axiom-blocks' ) }
						value={ preset }
						options={ [
							{
								label: __(
									'Mixed (recommended)',
									'axiom-blocks'
								),
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
				</PanelBody>

				{ /* ── Custom badges (uploader repeater) ────────────────── */ }
				<PanelBody
					title={ __( 'Custom badges', 'axiom-blocks' ) }
					initialOpen={ false }
				>
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
				</PanelBody>

				{ /* ── Layout ───────────────────────────────────────────── */ }
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
						<ABRangeControl
							label={ __( 'Columns', 'axiom-blocks' ) }
							value={ columns }
							onChange={ ( v ) =>
								setAttributes( {
									columns: Math.max(
										2,
										Math.min( 6, v || 2 )
									),
								} )
							}
							min={ 2 }
							max={ 6 }
							step={ 1 }
							unit=""
						/>
					) }
					<ABSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={ alignment }
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
						onChange={ ( v ) => setAttributes( { alignment: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Gap', 'axiom-blocks' ) }
						value={ gap }
						onChange={ ( v ) => setAttributes( { gap: v ?? 0 } ) }
						min={ 0 }
						max={ 64 }
						step={ 1 }
						unit="px"
					/>
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

				{ /* ── Style ────────────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
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
					{ colorMode === 'mono' && (
						<ABColorControl
							label={ __( 'Icon color', 'axiom-blocks' ) }
							color={ iconColor }
							onChange={ ( v ) =>
								setAttributes( { iconColor: v } )
							}
						/>
					) }
					<ABToggleControl
						label={ __( 'Show card background', 'axiom-blocks' ) }
						checked={ showCard }
						onChange={ ( v ) => setAttributes( { showCard: v } ) }
					/>
					{ showCard && (
						<>
							<ABColorControl
								label={ __( 'Card color', 'axiom-blocks' ) }
								color={ cardColor }
								onChange={ ( v ) =>
									setAttributes( { cardColor: v } )
								}
							/>
							<ABRangeControl
								label={ __( 'Card radius', 'axiom-blocks' ) }
								value={ cardRadius }
								onChange={ ( v ) =>
									setAttributes( { cardRadius: v ?? 0 } )
								}
								min={ 0 }
								max={ 32 }
								step={ 1 }
								unit="px"
							/>
						</>
					) }
					<ABToggleControl
						label={ __( 'Show border', 'axiom-blocks' ) }
						checked={ showBorder }
						onChange={ ( v ) => setAttributes( { showBorder: v } ) }
					/>
					{ showBorder && (
						<ABColorControl
							label={ __( 'Border color', 'axiom-blocks' ) }
							color={ borderColor }
							onChange={ ( v ) =>
								setAttributes( { borderColor: v } )
							}
						/>
					) }
				</PanelBody>

				{ /* ── Typography ───────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion
							title={ __( 'Heading', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="heading"
								unwrapped
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'Badge label', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="label"
								unwrapped
							/>
						</ABSubAccordion>
					</div>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ headingShow && headingText && (
					<div
						className="axiom-blocks-trust-badges__heading"
						style={ {
							textAlign: headingAlign,
							...headingTypoStyle,
						} }
					>
						{ headingText }
					</div>
				) }
				<div className="axiom-blocks-trust-badges__list">
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
		save: () => null,
	},
};
