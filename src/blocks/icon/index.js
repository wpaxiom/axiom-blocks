import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABTextControl,
	ABTextareaControl,
} from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import { IconPicker } from '../../components/IconPicker';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

/* Slider helpers: attributes store px strings ('' = inherit the CSS default). */
const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

export function getIconVars( attributes ) {
	const {
		iconSize,
		iconColor,
		iconHoverColor,
		rotation,
		bgColor,
		bgHoverColor,
		shapePadding,
		shapeRadius,
		borderColor,
		borderWidth,
		borderStyle,
	} = attributes;
	return {
		'--ab-icon-size': iconSize || undefined,
		'--ab-icon-color': iconColor || undefined,
		'--ab-icon-color-h': iconHoverColor || undefined,
		'--ab-icon-rotate': rotation ? `${ rotation }deg` : undefined,
		'--ab-icon-bg': bgColor || undefined,
		'--ab-icon-bg-h': bgHoverColor || undefined,
		'--ab-icon-pad': shapePadding || undefined,
		'--ab-icon-radius': shapeRadius || undefined,
		'--ab-icon-bc': borderColor || undefined,
		'--ab-icon-bw': borderWidth || undefined,
		'--ab-icon-bs': borderWidth ? borderStyle || 'solid' : undefined,
	};
}

function IconEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'icon' ) ) {
		return <DisabledBlockMessage blockName="Icon" />;
	}

	const {
		iconType,
		iconSlug,
		customSvg,
		iconLabel,
		iconSize,
		iconColor,
		iconHoverColor,
		rotation,
		iconAlign,
		shape,
		bgColor,
		bgHoverColor,
		shapePadding,
		shapeRadius,
		borderColor,
		borderWidth,
		borderStyle,
		url,
		opensInNewTab,
		relNoFollow,
		relSponsored,
	} = attributes;

	const blockProps = useBlockProps( {
		className: `ab-icon ab-icon--align-${ iconAlign }`,
		style: {
			...getIconVars( attributes ),
			...getSpacingStyle( attributes ),
		},
	} );

	const glyph =
		iconType === 'custom' ? (
			customSvg ? (
				<span
					className="ab-icon__glyph"
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={ { __html: customSvg } }
				/>
			) : (
				<span className="ab-icon__glyph ab-icon__glyph--empty">
					{ __( 'Paste SVG', 'axiom-blocks' ) }
				</span>
			)
		) : (
			<span className="ab-icon__glyph">
				{ ICON_LIBRARY[ iconSlug ] || ICON_LIBRARY.star }
			</span>
		);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Source', 'axiom-blocks' ) }
						value={ iconType }
						options={ [
							{
								label: __( 'Icon library', 'axiom-blocks' ),
								value: 'library',
							},
							{
								label: __( 'Custom SVG', 'axiom-blocks' ),
								value: 'custom',
							},
						] }
						onChange={ ( v ) => setAttributes( { iconType: v } ) }
					/>
					{ iconType === 'library' ? (
						<IconPicker
							value={ iconSlug }
							onChange={ ( v ) =>
								setAttributes( { iconSlug: v } )
							}
						/>
					) : (
						<ABTextareaControl
							label={ __( 'SVG markup', 'axiom-blocks' ) }
							value={ customSvg }
							onChange={ ( v ) =>
								setAttributes( { customSvg: v } )
							}
							rows={ 5 }
							placeholder="<svg …>…</svg>"
							help={ __(
								'Paste an <svg>. Use currentColor for fills/strokes so the colour controls apply.',
								'axiom-blocks'
							) }
						/>
					) }
					<ABTextControl
						label={ __( 'Accessible label', 'axiom-blocks' ) }
						value={ iconLabel }
						onChange={ ( v ) => setAttributes( { iconLabel: v } ) }
						help={ __(
							'Describes the icon for screen readers. Leave empty for a purely decorative icon.',
							'axiom-blocks'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABRangeControl
						label={ __( 'Size', 'axiom-blocks' ) }
						value={ fromPx( iconSize, 48 ) }
						onChange={ ( v ) =>
							setAttributes( { iconSize: toPx( v ) } )
						}
						min={ 12 }
						max={ 240 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Rotation', 'axiom-blocks' ) }
						value={ rotation || 0 }
						onChange={ ( v ) => setAttributes( { rotation: v } ) }
						min={ 0 }
						max={ 360 }
						step={ 1 }
						unit="°"
					/>
					<ABSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={ iconAlign }
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
						onChange={ ( v ) => setAttributes( { iconAlign: v } ) }
					/>
					<ABColorControl
						label={ __( 'Colour', 'axiom-blocks' ) }
						color={ iconColor }
						onChange={ ( v ) => setAttributes( { iconColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Hover colour', 'axiom-blocks' ) }
						color={ iconHoverColor }
						onChange={ ( v ) =>
							setAttributes( { iconHoverColor: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Shape & background', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Shape', 'axiom-blocks' ) }
						value={ shape }
						options={ [
							{
								label: __( 'None', 'axiom-blocks' ),
								value: 'none',
							},
							{
								label: __( 'Circle', 'axiom-blocks' ),
								value: 'circle',
							},
							{
								label: __( 'Square', 'axiom-blocks' ),
								value: 'square',
							},
							{
								label: __( 'Rounded', 'axiom-blocks' ),
								value: 'rounded',
							},
						] }
						onChange={ ( v ) => setAttributes( { shape: v } ) }
					/>
					{ shape !== 'none' && (
						<>
							<ABColorControl
								label={ __( 'Background', 'axiom-blocks' ) }
								color={ bgColor }
								onChange={ ( v ) =>
									setAttributes( { bgColor: v } )
								}
							/>
							<ABColorControl
								label={ __(
									'Hover background',
									'axiom-blocks'
								) }
								color={ bgHoverColor }
								onChange={ ( v ) =>
									setAttributes( { bgHoverColor: v } )
								}
							/>
							<ABRangeControl
								label={ __( 'Padding', 'axiom-blocks' ) }
								value={ fromPx( shapePadding, 16 ) }
								onChange={ ( v ) =>
									setAttributes( { shapePadding: toPx( v ) } )
								}
								min={ 0 }
								max={ 80 }
								step={ 1 }
								unit="px"
							/>
							{ shape === 'rounded' && (
								<ABRangeControl
									label={ __(
										'Corner radius',
										'axiom-blocks'
									) }
									value={ fromPx( shapeRadius, 12 ) }
									onChange={ ( v ) =>
										setAttributes( {
											shapeRadius: toPx( v ),
										} )
									}
									min={ 0 }
									max={ 60 }
									step={ 1 }
									unit="px"
								/>
							) }
							<ABRangeControl
								label={ __( 'Border width', 'axiom-blocks' ) }
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
								<>
									<ABColorControl
										label={ __(
											'Border colour',
											'axiom-blocks'
										) }
										color={ borderColor }
										onChange={ ( v ) =>
											setAttributes( { borderColor: v } )
										}
									/>
									<ABSelectControl
										label={ __(
											'Border style',
											'axiom-blocks'
										) }
										value={ borderStyle }
										options={ [
											{
												label: __(
													'Solid',
													'axiom-blocks'
												),
												value: 'solid',
											},
											{
												label: __(
													'Dashed',
													'axiom-blocks'
												),
												value: 'dashed',
											},
											{
												label: __(
													'Dotted',
													'axiom-blocks'
												),
												value: 'dotted',
											},
										] }
										onChange={ ( v ) =>
											setAttributes( { borderStyle: v } )
										}
									/>
								</>
							) }
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Link', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABTextControl
						label={ __( 'URL', 'axiom-blocks' ) }
						value={ url }
						onChange={ ( v ) => setAttributes( { url: v } ) }
						placeholder="https://"
						type="url"
					/>
					{ url && (
						<>
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
						</>
					) }
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<span className={ `ab-icon__box ab-icon--${ shape }` }>
					{ glyph }
				</span>
			</div>
		</>
	);
}

export const Icon = {
	name: 'axiom-blocks/icon',
	settings: {
		title: __( 'Icon', 'axiom-blocks' ),
		description: __(
			'Pick an icon from the library or paste your own SVG, then style its size, colour, shape, and link.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="icon" />,
		edit: IconEdit,
		save: () => null,
	},
};
