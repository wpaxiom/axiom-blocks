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
} from '../../components/ABControls';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { useDeviceType } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
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

	const resolveIcon = useIconNode();
	const iconSvg = icon ? resolveIcon( icon ) : null;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: 'ab-adv-btn-wrap',
	} );
	const buttonClassName = getButtonClasses( attributes ).join( ' ' );
	const buttonStyle = {
		...getButtonVars( attributes ),
		...useSpacingStyle( attributes ),
		...useTypographyStyle( attributes ),
		'--ab-advbtn-icon': responsiveVarValue(
			attributes,
			'iconSize',
			device
		),
	};

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
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="iconSize"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABRangeControl
										label={ __( 'Icon size', 'axiom-blocks' ) }
										value={ fromPx(
											value === '' ? inherited : value,
											18
										) }
										onChange={ ( v ) => setValue( toPx( v ) ) }
										min={ 10 }
										max={ 48 }
										step={ 1 }
										unit="px"
									/>
								) }
							</ABResponsive>
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
					<ABColorControl
						label={ __( 'Hover text', 'axiom-blocks' ) }
						color={ hoverTextColor }
						onChange={ ( v ) =>
							setAttributes( { hoverTextColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Hover background', 'axiom-blocks' ) }
						color={ hoverBgColor }
						onChange={ ( v ) =>
							setAttributes( { hoverBgColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Hover border', 'axiom-blocks' ) }
						color={ hoverBorderColor }
						onChange={ ( v ) =>
							setAttributes( { hoverBorderColor: v } )
						}
					/>
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
					responsive
				/>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div className={ buttonClassName } style={ buttonStyle }>
					{ iconSvg && 'left' === iconPosition && (
						<span className="ab-adv-btn__icon">{ iconSvg }</span>
					) }
					<span className="ab-adv-btn__content">
						<RichText
							tagName="span"
							className="ab-adv-btn__text"
							value={ text }
							onChange={ ( v ) =>
								setAttributes( { text: v } )
							}
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
