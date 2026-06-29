import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	ABRangeControl,
	ABSelectControl,
	ABColorControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
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
					<div className="axiom-blocks-media-control">
						<span className="axiom-blocks-media-control__label">
							{ label }
						</span>
						{ image?.url && (
							<img
								src={ image.url }
								alt={ image.alt || '' }
								className="axiom-blocks-media-control__preview"
							/>
						) }
						<div className="ab-btn-row axiom-blocks-media-control__buttons">
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
		handleColor,
		lineColor,
	} = attributes;

	const blockProps = useBlockProps( {
		className: 'axiom-blocks-bas',
		style: useSpacingStyle( attributes ),
	} );

	const frameStyle = {
		'--slider-pos': `${ initialPosition }%`,
		'--handle-color': handleColor,
		'--line-color': lineColor,
	};
	if ( aspectRatio !== 'auto' ) {
		frameStyle.aspectRatio = aspectRatio.replace( '/', ' / ' );
	}

	const frameClass =
		'axiom-blocks-bas__frame ' +
		( aspectRatio === 'auto' ? 'is-aspect-auto' : 'is-aspect-fixed' );

	const hasImages = beforeImage?.url && afterImage?.url;

	return (
		<>
			<InspectorControls>
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
					title={ __( 'Style', 'axiom-blocks' ) }
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
					<ABColorControl
						label={ __( 'Handle color', 'axiom-blocks' ) }
						color={ handleColor }
						defaultColor="#ffffff"
						onChange={ ( v ) =>
							setAttributes( { handleColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Line color', 'axiom-blocks' ) }
						color={ lineColor }
						defaultColor="#ffffff"
						onChange={ ( v ) => setAttributes( { lineColor: v } ) }
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

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
			const { beforeImage, afterImage, beforeLabel, afterLabel, showLabels } = attributes;
			const blockProps = useBlockProps.save( { className: 'axiom-blocks-bas' } );
			return (
				<div { ...blockProps }>
					<div className="axiom-blocks-bas__image-group">
						{ showLabels && (
							<div className="axiom-blocks-bas__label axiom-blocks-bas__label--before">{ beforeLabel }</div>
						) }
						{ beforeImage?.url && (
							<img src={ beforeImage.url } alt={ beforeImage.alt || '' } className="axiom-blocks-bas__img axiom-blocks-bas__img--before" style={ { maxWidth: '100%', height: 'auto' } } />
						) }
					</div>
					<div className="axiom-blocks-bas__image-group">
						{ showLabels && (
							<div className="axiom-blocks-bas__label axiom-blocks-bas__label--after">{ afterLabel }</div>
						) }
						{ afterImage?.url && (
							<img src={ afterImage.url } alt={ afterImage.alt || '' } className="axiom-blocks-bas__img axiom-blocks-bas__img--after" style={ { maxWidth: '100%', height: 'auto' } } />
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
