import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSpacingStyle } from '../../components/SpacingPanel';
import {
	ABRangeControl,
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { useDeviceType } from '../../components/responsive';
import { resolveTypographyAttrs } from '../../components/typographyTargets';
import { responsiveVarValue } from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

const ASPECT_RATIOS = [
	{ label: 'Auto (use before image)', value: 'auto' },
	{ label: '16 : 9', value: '16/9' },
	{ label: '4 : 3', value: '4/3' },
	{ label: '1 : 1', value: '1/1' },
	{ label: '3 : 4', value: '3/4' },
];

const BAS_BW_KEYS = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const BAS_RADIUS_KEYS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];
const LBL_RADIUS_KEYS = [
	'labelRadiusTopLeft',
	'labelRadiusTopRight',
	'labelRadiusBottomRight',
	'labelRadiusBottomLeft',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. handleColor/lineColor are the
 * only pre-existing style attrs (re-homed); everything else is additive. */
const DESIGN = {
	block: 'bas',
	targets: [
		{
			noun: __( 'Container', 'axiom-blocks' ),
			border: {
				widthKeys: BAS_BW_KEYS,
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 20,
			},
			radius: { keys: BAS_RADIUS_KEYS, max: 64 },
			shadow: { bind: 'containerShadow' },
			size: {
				bind: 'maxWidth',
				label: __( 'Max width', 'axiom-blocks' ),
				responsive: true,
			},
		},
		{
			noun: __( 'Labels', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'labelColor',
					fallback: '#ffffff',
				},
			],
			background: {
				bind: 'labelBg',
				label: __( 'Background', 'axiom-blocks' ),
				fallback: 'rgba(0, 0, 0, 0.6)',
			},
			typography: 'label',
			radius: { keys: LBL_RADIUS_KEYS, max: 40 },
		},
		{
			noun: __( 'Handle', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Handle', 'axiom-blocks' ),
					bind: 'handleColor',
					fallback: '#ffffff',
				},
				{
					label: __( 'Line', 'axiom-blocks' ),
					bind: 'lineColor',
					fallback: '#ffffff',
				},
			],
		},
	],
};

export function getBasVars( attributes ) {
	const {
		handleColor,
		lineColor,
		borderStyle,
		borderColor,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		containerShadow,
		maxWidth,
		labelColor,
		labelBg,
		labelRadiusTopLeft,
		labelRadiusTopRight,
		labelRadiusBottomRight,
		labelRadiusBottomLeft,
		labelFontFamily,
		labelFontWeight,
		labelFontSize,
		labelLineHeight,
		labelLetterSpacing,
		labelTextTransform,
		labelTextDecoration,
		labelTextAlign,
	} = attributes;
	return {
		'--handle-color': handleColor || undefined,
		'--line-color': lineColor || undefined,
		'--ab-bas-bs': borderStyle || undefined,
		'--ab-bas-bc': borderColor || undefined,
		'--ab-bas-bw-top': borderTopWidth || undefined,
		'--ab-bas-bw-right': borderRightWidth || undefined,
		'--ab-bas-bw-bottom': borderBottomWidth || undefined,
		'--ab-bas-bw-left': borderLeftWidth || undefined,
		'--ab-bas-radius-tl': radiusTopLeft || undefined,
		'--ab-bas-radius-tr': radiusTopRight || undefined,
		'--ab-bas-radius-br': radiusBottomRight || undefined,
		'--ab-bas-radius-bl': radiusBottomLeft || undefined,
		'--ab-bas-shadow': containerShadow || undefined,
		'--ab-bas-maxw': maxWidth || undefined,
		'--ab-bas-label-color': labelColor || undefined,
		'--ab-bas-label-bg': labelBg || undefined,
		'--ab-bas-label-radius-tl': labelRadiusTopLeft || undefined,
		'--ab-bas-label-radius-tr': labelRadiusTopRight || undefined,
		'--ab-bas-label-radius-br': labelRadiusBottomRight || undefined,
		'--ab-bas-label-radius-bl': labelRadiusBottomLeft || undefined,
		'--ab-bas-label-ff': labelFontFamily || undefined,
		'--ab-bas-label-fw': labelFontWeight || undefined,
		'--ab-bas-label-fs': labelFontSize || undefined,
		'--ab-bas-label-lh': labelLineHeight || undefined,
		'--ab-bas-label-ls': labelLetterSpacing || undefined,
		'--ab-bas-label-tt': labelTextTransform || undefined,
		'--ab-bas-label-td': labelTextDecoration || undefined,
		'--ab-bas-label-ta': labelTextAlign || undefined,
	};
}

function ImagePicker( { label, image, onSelect, onRemove } ) {
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ ( media ) =>
					onSelect( {
						id: media.id,
						url: media.url,
						alt: media.alt || '',
					} )
				}
				allowedTypes={ [ 'image' ] }
				value={ image?.id }
				render={ ( { open } ) => (
					<div className="ab-ctrl">
						<span className="ab-ctrl__label">{ label }</span>
						{ image?.url && (
							<img
								src={ image.url }
								alt={ image.alt || '' }
								className="ab-ctrl__media-preview"
							/>
						) }
						<div className="ab-btn-row">
							<button
								type="button"
								className="ab-btn ab-btn--secondary"
								onClick={ open }
							>
								{ image
									? __( 'Replace', 'axiom-blocks' )
									: __( 'Select image', 'axiom-blocks' ) }
							</button>
							{ image && (
								<button
									type="button"
									className="ab-btn ab-btn--danger"
									onClick={ onRemove }
								>
									{ __( 'Remove', 'axiom-blocks' ) }
								</button>
							) }
						</div>
					</div>
				) }
			/>
		</MediaUploadCheck>
	);
}

function BeforeAfterSliderEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'before-after-slider' ) ) {
		return <DisabledBlockMessage blockName="Before/After Slider" />;
	}
	const {
		beforeImage,
		afterImage,
		beforeLabel,
		afterLabel,
		showLabels,
		initialPosition,
		aspectRatio,
		orientation,
		interaction,
	} = attributes;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: 'axiom-blocks-bas',
		style: {
			...getBasVars(
				resolveTypographyAttrs( attributes, [ 'label' ], device )
			),
			...useSpacingStyle( attributes ),
			'--ab-bas-maxw': responsiveVarValue( attributes, 'maxWidth', device ),
		},
	} );

	const frameStyle = {
		'--slider-pos': `${ initialPosition }%`,
	};
	if ( aspectRatio !== 'auto' ) {
		frameStyle.aspectRatio = aspectRatio.replace( '/', ' / ' );
	}

	const frameClass =
		'axiom-blocks-bas__frame ' +
		( aspectRatio === 'auto' ? 'is-aspect-auto' : 'is-aspect-fixed' ) +
		( 'vertical' === orientation ? ' is-vertical' : '' );

	const hasImages = beforeImage?.url && afterImage?.url;

	const leading = (
		<>
			<PanelBody
				title={ __( 'Images', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ImagePicker
					label={ __( 'Before', 'axiom-blocks' ) }
					image={ beforeImage }
					onSelect={ ( img ) =>
						setAttributes( { beforeImage: img } )
					}
					onRemove={ () =>
						setAttributes( { beforeImage: null } )
					}
				/>
				<ImagePicker
					label={ __( 'After', 'axiom-blocks' ) }
					image={ afterImage }
					onSelect={ ( img ) =>
						setAttributes( { afterImage: img } )
					}
					onRemove={ () => setAttributes( { afterImage: null } ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Labels', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show labels', 'axiom-blocks' ) }
					checked={ showLabels }
					onChange={ ( v ) => setAttributes( { showLabels: v } ) }
				/>
				{ showLabels && (
					<>
						<ABTextControl
							label={ __( 'Before label', 'axiom-blocks' ) }
							value={ beforeLabel }
							onChange={ ( v ) =>
								setAttributes( { beforeLabel: v } )
							}
						/>
						<ABTextControl
							label={ __( 'After label', 'axiom-blocks' ) }
							value={ afterLabel }
							onChange={ ( v ) =>
								setAttributes( { afterLabel: v } )
							}
						/>
					</>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Behavior', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Orientation', 'axiom-blocks' ) }
					value={ orientation }
					options={ [
						{
							label: __( 'Horizontal', 'axiom-blocks' ),
							value: 'horizontal',
						},
						{
							label: __( 'Vertical', 'axiom-blocks' ),
							value: 'vertical',
						},
					] }
					onChange={ ( v ) => setAttributes( { orientation: v } ) }
				/>
				<ABSelectControl
					label={ __( 'Interaction', 'axiom-blocks' ) }
					value={ interaction }
					options={ [
						{
							label: __( 'Drag', 'axiom-blocks' ),
							value: 'drag',
						},
						{
							label: __( 'Hover', 'axiom-blocks' ),
							value: 'hover',
						},
					] }
					onChange={ ( v ) => setAttributes( { interaction: v } ) }
					help={ __(
						'Hover moves the handle as the pointer passes over the image; drag requires pressing and pulling.',
						'axiom-blocks'
					) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Slider', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABRangeControl
					label={ __( 'Initial position', 'axiom-blocks' ) }
					value={ initialPosition }
					onChange={ ( v ) =>
						setAttributes( { initialPosition: v } )
					}
					min={ 0 }
					max={ 100 }
					unit="%"
					help={ __(
						'Where the handle starts, as a percent from the left.',
						'axiom-blocks'
					) }
				/>
				<ABSelectControl
					label={ __( 'Aspect ratio', 'axiom-blocks' ) }
					value={ aspectRatio }
					options={ ASPECT_RATIOS }
					onChange={ ( v ) =>
						setAttributes( { aspectRatio: v } )
					}
				/>
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

			<div { ...blockProps }>
				{ ! hasImages ? (
					<div className="axiom-blocks-bas__placeholder">
						<p>
							{ __(
								'Select both a before and after image to start.',
								'axiom-blocks'
							) }
						</p>
					</div>
				) : (
					<>
						<div className={ frameClass } style={ frameStyle }>
							<img
								src={ afterImage.url }
								alt={ afterImage.alt || '' }
								className="axiom-blocks-bas__img axiom-blocks-bas__img--after"
								draggable={ false }
							/>
							<img
								src={ beforeImage.url }
								alt={ beforeImage.alt || '' }
								className="axiom-blocks-bas__img axiom-blocks-bas__img--before"
								draggable={ false }
							/>
							{ showLabels && (
								<>
									<span className="axiom-blocks-bas__label axiom-blocks-bas__label--before">
										{ beforeLabel }
									</span>
									<span className="axiom-blocks-bas__label axiom-blocks-bas__label--after">
										{ afterLabel }
									</span>
								</>
							) }
							<div
								className="axiom-blocks-bas__line"
								aria-hidden="true"
							/>
							<div
								className="axiom-blocks-bas__handle"
								aria-hidden="true"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="M9 6 L3 12 L9 18"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<path
										d="M15 6 L21 12 L15 18"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</div>
						</div>
					</>
				) }
			</div>
		</>
	);
}

export const BeforeAfterSlider = {
	name: 'axiom-blocks/before-after-slider',
	settings: {
		title: __( 'Before/After Slider', 'axiom-blocks' ),
		description: __( 'Drag to compare two images.', 'axiom-blocks' ),
		icon: <BlockIcon slug="before-after-slider" />,
		edit: BeforeAfterSliderEdit,
		save: ( { attributes } ) => {
			const {
				beforeImage,
				afterImage,
				beforeLabel,
				afterLabel,
				showLabels,
			} = attributes;
			const blockProps = useBlockProps.save( {
				className: 'axiom-blocks-bas',
			} );
			return (
				<div { ...blockProps }>
					<div className="axiom-blocks-bas__image-group">
						{ showLabels && (
							<div className="axiom-blocks-bas__label axiom-blocks-bas__label--before">
								{ beforeLabel }
							</div>
						) }
						{ beforeImage?.url && (
							<img
								src={ beforeImage.url }
								alt={ beforeImage.alt || '' }
								className="axiom-blocks-bas__img axiom-blocks-bas__img--before"
								style={ { maxWidth: '100%', height: 'auto' } }
							/>
						) }
					</div>
					<div className="axiom-blocks-bas__image-group">
						{ showLabels && (
							<div className="axiom-blocks-bas__label axiom-blocks-bas__label--after">
								{ afterLabel }
							</div>
						) }
						{ afterImage?.url && (
							<img
								src={ afterImage.url }
								alt={ afterImage.alt || '' }
								className="axiom-blocks-bas__img axiom-blocks-bas__img--after"
								style={ { maxWidth: '100%', height: 'auto' } }
							/>
						) }
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
