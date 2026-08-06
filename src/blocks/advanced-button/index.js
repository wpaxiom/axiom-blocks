import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABSelectControl,
	ABToggleControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { useDeviceType, resolveResponsive } from '../../components/responsive';
import { responsiveVarValue } from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import { IconControl } from '../../components/IconControl';
import { useIconNode } from '../../components/useCustomIcons';
import metadata from './block.json';

export function getButtonClasses( attributes ) {
	const {
		stylePreset,
		sizePreset,
		iconOnly,
		hoverEffect,
	} = attributes;
	return [
		'ab-adv-btn',
		`ab-adv-btn--${ stylePreset || 'fill' }`,
		`ab-adv-btn--${ sizePreset || 'md' }`,
		iconOnly ? 'is-icon-only' : '',
		hoverEffect && 'none' !== hoverEffect
			? `ab-advfx-${ hoverEffect }`
			: '',
	].filter( Boolean );
}

export function getButtonVars( attributes ) {
	const {
		textColor,
		bgColor,
		borderColor,
		borderWidth,
		borderStyle,
		borderRadius,
		hoverTextColor,
		hoverBgColor,
		hoverBorderColor,
		hoverBorderTopWidth,
		hoverBorderRightWidth,
		hoverBorderBottomWidth,
		hoverBorderLeftWidth,
		hoverBorderStyle,
		iconSize,
		iconGap,
		iconColor,
		iconColorHover,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		buttonMinWidth,
		shadow,
		hoverShadow,
	} = attributes;
	return {
		'--ab-advbtn-color': textColor || undefined,
		'--ab-advbtn-bc': borderColor || undefined,
		'--ab-advbtn-h-color': hoverTextColor || undefined,
		'--ab-advbtn-h-bg': hoverBgColor || undefined,
		'--ab-advbtn-h-bc': hoverBorderColor || undefined,
		'--ab-advbtn-h-bw-top': hoverBorderTopWidth || undefined,
		'--ab-advbtn-h-bw-right': hoverBorderRightWidth || undefined,
		'--ab-advbtn-h-bw-bottom': hoverBorderBottomWidth || undefined,
		'--ab-advbtn-h-bw-left': hoverBorderLeftWidth || undefined,
		'--ab-advbtn-h-bs': ( hoverBorderTopWidth || hoverBorderRightWidth || hoverBorderBottomWidth || hoverBorderLeftWidth ) ? ( hoverBorderStyle || 'solid' ) : undefined,
		'--ab-advbtn-icon': iconSize || undefined,
		'--ab-advbtn-icon-color': iconColor || undefined,
		'--ab-advbtn-icon-h-color': iconColorHover || undefined,
		'--ab-advbtn-bs': borderWidth ? borderStyle || 'solid' : undefined,
		'--ab-advbtn-bw-top': borderTopWidth || borderWidth || undefined,
		'--ab-advbtn-bw-right': borderRightWidth || borderWidth || undefined,
		'--ab-advbtn-bw-bottom': borderBottomWidth || borderWidth || undefined,
		'--ab-advbtn-bw-left': borderLeftWidth || borderWidth || undefined,
		'--ab-advbtn-radius-tl': radiusTopLeft || borderRadius || undefined,
		'--ab-advbtn-radius-tr': radiusTopRight || borderRadius || undefined,
		'--ab-advbtn-radius-br': radiusBottomRight || borderRadius || undefined,
		'--ab-advbtn-radius-bl': radiusBottomLeft || borderRadius || undefined,
		'--ab-advbtn-minw': buttonMinWidth || undefined,
		'--ab-advbtn-shadow': resolveShadow( shadow ),
		'--ab-advbtn-h-shadow': resolveShadow( hoverShadow ),
		borderWidth: borderWidth || undefined,
		borderStyle: borderWidth ? borderStyle || 'solid' : undefined,
		borderRadius: borderRadius || undefined,
		gap: iconGap || undefined,
	};
}

const LEGACY_SHADOWS = {
	none: undefined,
	'': undefined,
	sm: '0 1px 3px rgba(16,24,40,0.18)',
	md: '0 4px 10px rgba(16,24,40,0.2)',
	lg: '0 10px 24px rgba(16,24,40,0.24)',
};
const resolveShadow = ( v ) =>
	v && v in LEGACY_SHADOWS ? LEGACY_SHADOWS[ v ] : v || undefined;

const BUTTON_TARGET = {
	noun: __( 'Button', 'axiom-blocks' ),
	states: [ 'hover' ],
	align: { bind: 'buttonAlign', responsive: true },
	colors: [
		{
			label: __( 'Text', 'axiom-blocks' ),
			bind: 'textColor',
			stateBind: { hover: 'hoverTextColor' },
		},
		{
			label: __( 'Sub-caption', 'axiom-blocks' ),
			bind: 'subCaptionColor',
		},
	],
	typography: [
		{ prefix: '' },
		{
			prefix: 'subCaption',
			label: __( 'Sub-caption', 'axiom-blocks' ),
		},
	],
	background: {
		full: true,
		statePrefix: { hover: 'hover' },
		insertAfter: 1,
	},
	border: {
		widthKeys: [
			'borderTopWidth',
			'borderRightWidth',
			'borderBottomWidth',
			'borderLeftWidth',
		],
		styleKey: 'borderStyle',
		colorKey: 'borderColor',
		stateBind: { hover: 'hoverBorderColor' },
		stateWidthKeys: {
			hover: [
				'hoverBorderTopWidth',
				'hoverBorderRightWidth',
				'hoverBorderBottomWidth',
				'hoverBorderLeftWidth',
			],
		},
		stateStyleKey: { hover: 'hoverBorderStyle' },
		legacyWidth: 'borderWidth',
		max: 10,
	},
	radius: {
		keys: [
			'radiusTopLeft',
			'radiusTopRight',
			'radiusBottomRight',
			'radiusBottomLeft',
		],
		legacyRadius: 'borderRadius',
		max: 60,
	},
	padding: {
		type: 'buttonPadding',
		responsive: true,
	},
	shadow: {
		bind: 'shadow',
		stateBind: { hover: 'hoverShadow' },
	},
	ranges: [
		{
			bind: 'buttonMinWidth',
			label: __( 'Min width', 'axiom-blocks' ),
			min: 0,
			max: 600,
		},
	],
};

const ICON_TARGET = {
	noun: __( 'Icon', 'axiom-blocks' ),
	states: [ 'hover' ],
	colors: [ { label: __( 'Color', 'axiom-blocks' ), bind: 'iconColor' } ],
	ranges: [
		{
			bind: 'iconSize',
			label: __( 'Size', 'axiom-blocks' ),
			min: 10,
			max: 48,
			default: 18,
			responsive: true,
		},
		{
			bind: 'iconGap',
			label: __( 'Gap', 'axiom-blocks' ),
			min: 0,
			max: 40,
			default: 8,
			responsive: true,
		},
	],
};

const getDesign = ( attributes ) => ( {
	block: 'advbtn',
	targets: attributes.icon
		? [ BUTTON_TARGET, ICON_TARGET ]
		: [ BUTTON_TARGET ],
} );

function AdvancedButtonEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'advanced-button' ) ) {
		return <DisabledBlockMessage blockName="Advanced Button" />;
	}
	const {
		text,
		subCaption,
		showSubCaption,
		url,
		opensInNewTab,
		relNoFollow,
		relSponsored,
		isDownload,
		htmlType,
		icon,
		iconPosition,
		iconOnly,
		stylePreset,
		sizePreset,
		textColor,
		bgColor,
		borderColor,
		borderWidth,
		borderStyle,
		borderRadius,
		hoverTextColor,
		hoverBgColor,
		hoverBorderColor,
		hoverBorderTopWidth,
		hoverBorderRightWidth,
		hoverBorderBottomWidth,
		hoverBorderLeftWidth,
		hoverBorderStyle,
		hoverEffect,
		shadow,
		hoverShadow,
	} = attributes;

	const resolveIcon = useIconNode();
	const iconSvg = icon ? resolveIcon( icon ) : null;

	const device = useDeviceType();
	const buttonAlign =
		resolveResponsive( attributes, 'buttonAlign', device ) || '';
	// Block Spacing (padding + margin) lives on the wrapper — space AROUND the
	// button; the button's own internal padding is `buttonPadding` (below).
	const wrapSpacing = useSpacingStyle( attributes );
	const blockProps = useBlockProps( {
		className: 'ab-adv-btn-wrap',
		style: {
			...wrapSpacing,
			...( [ 'left', 'center', 'right' ].includes( buttonAlign ) && {
				textAlign: buttonAlign,
			} ),
		},
	} );
	const buttonClassName = getButtonClasses( attributes ).join( ' ' );

	const subTypo = useTypographyStyle( attributes, 'subCaption' );
	const textStyle = useTypographyStyle( attributes );
	const r = ( key ) =>
		resolveResponsive( attributes, key, device ) || undefined;
	const btnPad = {
		paddingTop: r( 'buttonPaddingTop' ),
		paddingRight: r( 'buttonPaddingRight' ),
		paddingBottom: r( 'buttonPaddingBottom' ),
		paddingLeft: r( 'buttonPaddingLeft' ),
	};
	const buttonStyle = {
		...getButtonVars( attributes ),
		...getBackgroundVars( attributes, {
			prefix: '',
			varPrefix: '--ab-advbtn',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'hover',
			varPrefix: '--ab-advbtn-h',
		} ),
		...( btnPad.paddingTop && { paddingTop: btnPad.paddingTop } ),
		...( btnPad.paddingRight && { paddingRight: btnPad.paddingRight } ),
		...( btnPad.paddingBottom && { paddingBottom: btnPad.paddingBottom } ),
		...( btnPad.paddingLeft && { paddingLeft: btnPad.paddingLeft } ),
		'--ab-advbtn-sub-ff': subTypo.fontFamily || undefined,
		'--ab-advbtn-sub-fw': subTypo.fontWeight || undefined,
		'--ab-advbtn-sub-fs': subTypo.fontSize || undefined,
		'--ab-advbtn-sub-lh': subTypo.lineHeight || undefined,
		'--ab-advbtn-sub-ls': subTypo.letterSpacing || undefined,
		'--ab-advbtn-sub-tt': subTypo.textTransform || undefined,
		'--ab-advbtn-sub-td': subTypo.textDecoration || undefined,
		'--ab-advbtn-sub-ta': subTypo.textAlign || undefined,
		'--ab-advbtn-sub-color': attributes.subCaptionColor || undefined,
		'--ab-advbtn-sub-h-color': attributes.subCaptionColorHover || undefined,
		'--ab-advbtn-sub-op':
			attributes.subCaptionColor || attributes.subCaptionColorHover
				? 1
				: undefined,
		'--ab-advbtn-align':
			attributes.textAlign === 'left'
				? 'flex-start'
				: attributes.textAlign === 'right'
				? 'flex-end'
				: attributes.textAlign === 'center'
				? 'center'
				: undefined,
		'--ab-advbtn-ta': attributes.textAlign || undefined,
		'--ab-advbtn-icon': responsiveVarValue(
			attributes,
			'iconSize',
			device
		),
		gap: responsiveVarValue( attributes, 'iconGap', device ),
		...( 'full' === buttonAlign && { width: '100%' } ),
	};

	const leading = (
		<>
			<PanelBody
				title={ __( 'Button', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABToggleControl
					label={ __( 'Sub-caption', 'axiom-blocks' ) }
					checked={ !! showSubCaption }
					onChange={ ( v ) =>
						setAttributes( { showSubCaption: v } )
					}
					help={ __(
						'Adds a smaller second text line inside the button.',
						'axiom-blocks'
					) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Link', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Behaves as', 'axiom-blocks' ) }
					value={ htmlType }
					options={ [
						{
							label: __( 'Link', 'axiom-blocks' ),
							value: 'link',
						},
						{
							label: __(
								'Submit button (forms)',
								'axiom-blocks'
							),
							value: 'submit',
						},
					] }
					onChange={ ( v ) => setAttributes( { htmlType: v } ) }
				/>
				{ 'link' === htmlType && (
					<>
						<ABTextControl
							label={ __( 'URL', 'axiom-blocks' ) }
							value={ url }
							onChange={ ( v ) =>
								setAttributes( { url: v } )
							}
							placeholder="https://"
							type="url"
						/>
						<ABToggleControl
							label={ __(
								'Open in new tab',
								'axiom-blocks'
							) }
							checked={ !! opensInNewTab }
							onChange={ ( v ) =>
								setAttributes( { opensInNewTab: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'No-follow', 'axiom-blocks' ) }
							checked={ !! relNoFollow }
							onChange={ ( v ) =>
								setAttributes( { relNoFollow: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Sponsored', 'axiom-blocks' ) }
							checked={ !! relSponsored }
							onChange={ ( v ) =>
								setAttributes( { relSponsored: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Download', 'axiom-blocks' ) }
							checked={ !! isDownload }
							onChange={ ( v ) =>
								setAttributes( { isDownload: v } )
							}
							help={ __(
								'Prompts the browser to download the linked file.',
								'axiom-blocks'
							) }
						/>
					</>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Icon', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<IconControl
					value={ icon }
					onChange={ ( v ) => setAttributes( { icon: v } ) }
					clearable
				/>
				{ icon && (
					<>
						<ABSelectControl
							label={ __( 'Position', 'axiom-blocks' ) }
							value={ iconPosition }
							options={ [
								{
									label: __( 'Left', 'axiom-blocks' ),
									value: 'left',
								},
								{
									label: __( 'Right', 'axiom-blocks' ),
									value: 'right',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { iconPosition: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Icon only', 'axiom-blocks' ) }
							checked={ !! iconOnly }
							onChange={ ( v ) =>
								setAttributes( { iconOnly: v } )
							}
							help={ __(
								'Hides the label visually; it is kept for screen readers.',
								'axiom-blocks'
							) }
						/>
					</>
				) }
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ getDesign( attributes ) }
				leading={ leading }
			/>

			<div { ...blockProps }>
				<div className={ buttonClassName } style={ buttonStyle }>
					{ iconSvg && 'left' === iconPosition && (
						<span className="ab-adv-btn__icon">{ iconSvg }</span>
					) }
					<span
						className="ab-adv-btn__content"
						style={ {
							'--ab-advbtn-align':
								attributes.textAlign === 'left'
									? 'flex-start'
									: attributes.textAlign === 'right'
									? 'flex-end'
									: undefined,
							'--ab-advbtn-ta': attributes.textAlign || undefined,
						} }
					>
						<RichText
							tagName="span"
							className="ab-adv-btn__text"
							style={ textStyle }
							value={ text }
							onChange={ ( v ) => setAttributes( { text: v } ) }
							placeholder={ __(
								'Button label…',
								'axiom-blocks'
							) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
						{ showSubCaption && (
							<RichText
								tagName="span"
								className="ab-adv-btn__sub"
								value={ subCaption }
								onChange={ ( v ) =>
									setAttributes( { subCaption: v } )
								}
								placeholder={ __(
									'Sub-caption…',
									'axiom-blocks'
								) }
								allowedFormats={ [] }
							/>
						) }
					</span>
					{ iconSvg && 'right' === iconPosition && (
						<span className="ab-adv-btn__icon">{ iconSvg }</span>
					) }
				</div>
			</div>
		</>
	);
}

export const AdvancedButton = {
	name: 'axiom-blocks/advanced-button',
	settings: {
		title: __( 'Advanced Button', 'axiom-blocks' ),
		description: __(
			'Button with icons, hover states, sub-captions, and style presets.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="advanced-button" />,
		edit: AdvancedButtonEdit,
		save: ( { attributes } ) => {
			const {
				text,
				subCaption,
				showSubCaption,
				url,
				opensInNewTab,
				relNoFollow,
				relSponsored,
				isDownload,
				htmlType,
			} = attributes;
			const blockProps = useBlockProps.save( {
				className: 'ab-adv-btn-wrap',
			} );
			const content = (
				<span className="ab-adv-btn__content">
					<RichText.Content
						tagName="span"
						className="ab-adv-btn__text"
						value={ text }
					/>
					{ showSubCaption && subCaption && (
						<RichText.Content
							tagName="span"
							className="ab-adv-btn__sub"
							value={ subCaption }
						/>
					) }
				</span>
			);
			let inner;
			if ( 'submit' === htmlType ) {
				inner = (
					<button type="submit" className="ab-adv-btn">
						{ content }
					</button>
				);
			} else {
				const rel =
					[
						opensInNewTab && 'noopener noreferrer',
						relNoFollow && 'nofollow',
						relSponsored && 'sponsored',
					]
						.filter( Boolean )
						.join( ' ' ) || undefined;
				inner = (
					<a
						className="ab-adv-btn"
						href={ url || '#' }
						target={ opensInNewTab ? '_blank' : undefined }
						rel={ rel }
						download={ isDownload || undefined }
					>
						{ content }
					</a>
				);
			}
			return <div { ...blockProps }>{ inner }</div>;
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
