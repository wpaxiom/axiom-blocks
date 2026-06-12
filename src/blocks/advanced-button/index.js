import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
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
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { BUTTON_ICONS, BUTTON_ICON_OPTIONS } from './icons';

/* Slider helpers: attributes store px strings ('' = inherit the preset). */
const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

export function getButtonClasses( attributes ) {
	const {
		stylePreset,
		sizePreset,
		iconOnly,
		hoverEffect,
		shadow,
		hoverShadow,
	} = attributes;
	return [
		'ab-adv-btn',
		`ab-adv-btn--${ stylePreset || 'fill' }`,
		`ab-adv-btn--${ sizePreset || 'md' }`,
		iconOnly ? 'is-icon-only' : '',
		hoverEffect && 'none' !== hoverEffect
			? `ab-advfx-${ hoverEffect }`
			: '',
		shadow && 'none' !== shadow ? `ab-advsh-${ shadow }` : '',
		hoverShadow ? `ab-advsh-h-${ hoverShadow }` : '',
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
		iconSize,
		iconGap,
	} = attributes;
	return {
		'--ab-advbtn-color': textColor || undefined,
		'--ab-advbtn-bg': bgColor || undefined,
		'--ab-advbtn-bc': borderColor || undefined,
		'--ab-advbtn-h-color': hoverTextColor || undefined,
		'--ab-advbtn-h-bg': hoverBgColor || undefined,
		'--ab-advbtn-h-bc': hoverBorderColor || undefined,
		'--ab-advbtn-icon': iconSize || undefined,
		borderWidth: borderWidth || undefined,
		borderStyle: borderWidth ? borderStyle || 'solid' : undefined,
		borderRadius: borderRadius || undefined,
		gap: iconGap || undefined,
	};
}

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
		iconSize,
		iconGap,
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
		hoverEffect,
		shadow,
		hoverShadow,
	} = attributes;

	const iconSvg = icon && BUTTON_ICONS[ icon ] ? BUTTON_ICONS[ icon ] : null;

	const blockProps = useBlockProps( {
		className: getButtonClasses( attributes ).join( ' ' ),
		style: {
			...getButtonVars( attributes ),
			...getSpacingStyle( attributes ),
			...getTypographyStyle( attributes ),
		},
	} );

	const shadowOptions = ( withInherit ) => [
		...( withInherit
			? [ { label: __( 'Keep normal', 'axiom-blocks' ), value: '' } ]
			: [] ),
		{ label: __( 'None', 'axiom-blocks' ), value: 'none' },
		{ label: __( 'Small', 'axiom-blocks' ), value: 'sm' },
		{ label: __( 'Medium', 'axiom-blocks' ), value: 'md' },
		{ label: __( 'Large', 'axiom-blocks' ), value: 'lg' },
	];

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Button', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Style', 'axiom-blocks' ) }
						value={ stylePreset }
						options={ [
							{
								label: __( 'Fill', 'axiom-blocks' ),
								value: 'fill',
							},
							{
								label: __( 'Outline', 'axiom-blocks' ),
								value: 'outline',
							},
							{
								label: __( 'Text only', 'axiom-blocks' ),
								value: 'text',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { stylePreset: v } )
						}
					/>
					<ABSelectControl
						label={ __( 'Size', 'axiom-blocks' ) }
						value={ sizePreset }
						options={ [
							{
								label: __( 'Small', 'axiom-blocks' ),
								value: 'sm',
							},
							{
								label: __( 'Medium', 'axiom-blocks' ),
								value: 'md',
							},
							{
								label: __( 'Large', 'axiom-blocks' ),
								value: 'lg',
							},
						] }
						onChange={ ( v ) => setAttributes( { sizePreset: v } ) }
					/>
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
					<ABSelectControl
						label={ __( 'Icon', 'axiom-blocks' ) }
						value={ icon }
						options={ BUTTON_ICON_OPTIONS }
						onChange={ ( v ) => setAttributes( { icon: v } ) }
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
							<ABRangeControl
								label={ __( 'Icon size', 'axiom-blocks' ) }
								value={ fromPx( iconSize, 18 ) }
								onChange={ ( v ) =>
									setAttributes( { iconSize: toPx( v ) } )
								}
								min={ 10 }
								max={ 48 }
								step={ 1 }
								unit="px"
							/>
							<ABRangeControl
								label={ __( 'Gap', 'axiom-blocks' ) }
								value={ fromPx( iconGap, 8 ) }
								onChange={ ( v ) =>
									setAttributes( { iconGap: toPx( v ) } )
								}
								min={ 0 }
								max={ 40 }
								step={ 1 }
								unit="px"
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

				<PanelBody
					title={ __( 'Colors & hover', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion
							title={ __( 'Normal', 'axiom-blocks' ) }
							defaultOpen
						>
							<ABColorControl
								label={ __( 'Text', 'axiom-blocks' ) }
								color={ textColor }
								onChange={ ( v ) =>
									setAttributes( { textColor: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Background', 'axiom-blocks' ) }
								color={ bgColor }
								onChange={ ( v ) =>
									setAttributes( { bgColor: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Border', 'axiom-blocks' ) }
								color={ borderColor }
								onChange={ ( v ) =>
									setAttributes( { borderColor: v } )
								}
							/>
						</ABSubAccordion>
						<ABSubAccordion title={ __( 'Hover', 'axiom-blocks' ) }>
							<ABColorControl
								label={ __( 'Text', 'axiom-blocks' ) }
								color={ hoverTextColor }
								onChange={ ( v ) =>
									setAttributes( { hoverTextColor: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Background', 'axiom-blocks' ) }
								color={ hoverBgColor }
								onChange={ ( v ) =>
									setAttributes( { hoverBgColor: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Border', 'axiom-blocks' ) }
								color={ hoverBorderColor }
								onChange={ ( v ) =>
									setAttributes( { hoverBorderColor: v } )
								}
							/>
						</ABSubAccordion>
					</div>
					<ABSelectControl
						label={ __( 'Hover effect', 'axiom-blocks' ) }
						value={ hoverEffect }
						options={ [
							{
								label: __( 'None', 'axiom-blocks' ),
								value: 'none',
							},
							{
								label: __( 'Grow', 'axiom-blocks' ),
								value: 'grow',
							},
							{
								label: __( 'Shrink', 'axiom-blocks' ),
								value: 'shrink',
							},
							{
								label: __( 'Float', 'axiom-blocks' ),
								value: 'float',
							},
							{
								label: __( 'Sink', 'axiom-blocks' ),
								value: 'sink',
							},
							{
								label: __( 'Pulse', 'axiom-blocks' ),
								value: 'pulse',
							},
							{
								label: __( 'Shine', 'axiom-blocks' ),
								value: 'shine',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { hoverEffect: v } )
						}
					/>
					<ABSelectControl
						label={ __( 'Shadow', 'axiom-blocks' ) }
						value={ shadow }
						options={ shadowOptions( false ) }
						onChange={ ( v ) => setAttributes( { shadow: v } ) }
					/>
					<ABSelectControl
						label={ __( 'Hover shadow', 'axiom-blocks' ) }
						value={ hoverShadow }
						options={ shadowOptions( true ) }
						onChange={ ( v ) =>
							setAttributes( { hoverShadow: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Border', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABRangeControl
						label={ __( 'Width', 'axiom-blocks' ) }
						value={ fromPx( borderWidth, 0 ) }
						onChange={ ( v ) =>
							setAttributes( {
								borderWidth: v ? toPx( v ) : '',
							} )
						}
						min={ 0 }
						max={ 10 }
						step={ 1 }
						unit="px"
					/>
					{ borderWidth && (
						<ABSelectControl
							label={ __( 'Style', 'axiom-blocks' ) }
							value={ borderStyle }
							options={ [
								{
									label: __( 'Solid', 'axiom-blocks' ),
									value: 'solid',
								},
								{
									label: __( 'Dashed', 'axiom-blocks' ),
									value: 'dashed',
								},
								{
									label: __( 'Dotted', 'axiom-blocks' ),
									value: 'dotted',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { borderStyle: v } )
							}
						/>
					) }
					<ABRangeControl
						label={ __( 'Radius', 'axiom-blocks' ) }
						value={ fromPx( borderRadius, 8 ) }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 60 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<TypographyPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ iconSvg && 'left' === iconPosition && (
					<span className="ab-adv-btn__icon">{ iconSvg }</span>
				) }
				<span className="ab-adv-btn__content">
					<RichText
						tagName="span"
						className="ab-adv-btn__text"
						value={ text }
						onChange={ ( v ) => setAttributes( { text: v } ) }
						placeholder={ __( 'Button label…', 'axiom-blocks' ) }
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
							placeholder={ __( 'Sub-caption…', 'axiom-blocks' ) }
							allowedFormats={ [] }
						/>
					) }
				</span>
				{ iconSvg && 'right' === iconPosition && (
					<span className="ab-adv-btn__icon">{ iconSvg }</span>
				) }
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
		save: () => null,
	},
};
