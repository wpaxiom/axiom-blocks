import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	ABSelectControl,
	ABToggleControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const SIZES = [
	{ label: __( 'Thumbnail', 'axiom-blocks' ), value: 'thumbnail' },
	{ label: __( 'Medium', 'axiom-blocks' ), value: 'medium' },
	{ label: __( 'Large', 'axiom-blocks' ), value: 'large' },
	{ label: __( 'Full', 'axiom-blocks' ), value: 'full' },
];

const RATIOS = [
	{ label: __( 'Original', 'axiom-blocks' ), value: 'auto' },
	{ label: '16:9', value: '16/9' },
	{ label: '4:3', value: '4/3' },
	{ label: '3:2', value: '3/2' },
	{ label: '1:1', value: '1/1' },
	{ label: '3:4', value: '3/4' },
	{ label: '9:16', value: '9/16' },
];

const SCALE = [
	{ label: __( 'Cover', 'axiom-blocks' ), value: 'cover' },
	{ label: __( 'Contain', 'axiom-blocks' ), value: 'contain' },
];

const IMG_BW = [
	'imgBorderTopWidth',
	'imgBorderRightWidth',
	'imgBorderBottomWidth',
	'imgBorderLeftWidth',
];
const IMG_RADIUS = [
	'imgRadiusTopLeft',
	'imgRadiusTopRight',
	'imgRadiusBottomRight',
	'imgRadiusBottomLeft',
];

const DESIGN = {
	block: 'pc-img',
	targets: [
		{
			noun: __( 'Image', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Overlay', 'axiom-blocks' ),
					bind: 'overlayColor',
				},
			],
			border: {
				widthKeys: IMG_BW,
				styleKey: 'imgBorderStyle',
				colorKey: 'imgBorderColor',
				max: 12,
			},
			radius: { keys: IMG_RADIUS, max: 64 },
			shadow: { bind: 'imgShadow' },
			size: {
				bind: 'height',
				label: __( 'Height', 'axiom-blocks' ),
				responsive: true,
			},
		},
	],
};

function FallbackPicker( { attributes, setAttributes } ) {
	const { fallbackId, fallbackUrl } = attributes;
	return (
		<MediaUploadCheck>
			<MediaUpload
				onSelect={ ( media ) =>
					setAttributes( {
						fallbackId: media.id,
						fallbackUrl: media.url,
						fallbackAlt: media.alt || '',
					} )
				}
				allowedTypes={ [ 'image' ] }
				value={ fallbackId }
				render={ ( { open } ) => (
					<div className="ab-ctrl">
						<span className="ab-ctrl__label">
							{ __( 'Fallback image', 'axiom-blocks' ) }
						</span>
						{ fallbackUrl && (
							<img
								src={ fallbackUrl }
								alt=""
								className="ab-ctrl__media-preview"
							/>
						) }
						<div className="ab-btn-row">
							<button
								type="button"
								className="ab-btn ab-btn--secondary"
								onClick={ open }
							>
								{ fallbackId
									? __( 'Replace', 'axiom-blocks' )
									: __( 'Select image', 'axiom-blocks' ) }
							</button>
							{ !! fallbackId && (
								<button
									type="button"
									className="ab-btn ab-btn--danger"
									onClick={ () =>
										setAttributes( {
											fallbackId: 0,
											fallbackUrl: '',
											fallbackAlt: '',
										} )
									}
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

function PostImageEdit( { attributes, setAttributes, context } ) {
	const {
		imageSize,
		aspectRatio,
		scaleMode,
		isLink,
		linkTarget,
		hideIfEmpty,
		fallbackUrl,
		height,
		overlayColor,
	} = attributes;
	const postId = context?.postId;
	const postType = context?.postType;

	const thumbUrl = useSelect(
		( select ) => {
			if ( ! postId || ! postType ) {
				return null;
			}
			const record = select( coreStore ).getEntityRecord(
				'postType',
				postType,
				postId,
				{ _embed: true }
			);
			const media = record?._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ];
			return media?.source_url || null;
		},
		[ postId, postType ]
	);

	const spacingStyle = useSpacingStyle( attributes );
	const preview = thumbUrl || fallbackUrl;

	const blockProps = useBlockProps( {
		className: [ 'ab-pc__media', overlayColor ? 'has-overlay' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...spacingStyle,
			'--ab-pc-img-ratio':
				aspectRatio && aspectRatio !== 'auto' ? aspectRatio : undefined,
			'--ab-pc-img-fit': scaleMode || 'cover',
			'--ab-pc-img-h': height || undefined,
			'--ab-pc-img-overlay': overlayColor || undefined,
		},
	} );

	const leading = (
		<PanelBody title={ __( 'Image', 'axiom-blocks' ) } initialOpen>
			<ABSelectControl
				label={ __( 'Size', 'axiom-blocks' ) }
				value={ imageSize }
				options={ SIZES }
				onChange={ ( v ) => setAttributes( { imageSize: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Aspect ratio', 'axiom-blocks' ) }
				value={ aspectRatio }
				options={ RATIOS }
				onChange={ ( v ) => setAttributes( { aspectRatio: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Scale', 'axiom-blocks' ) }
				value={ scaleMode }
				options={ SCALE }
				onChange={ ( v ) => setAttributes( { scaleMode: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Link to post', 'axiom-blocks' ) }
				checked={ !! isLink }
				onChange={ ( v ) => setAttributes( { isLink: v } ) }
			/>
			{ isLink && (
				<ABToggleControl
					label={ __( 'Open in new tab', 'axiom-blocks' ) }
					checked={ linkTarget === '_blank' }
					onChange={ ( v ) =>
						setAttributes( { linkTarget: v ? '_blank' : '' } )
					}
				/>
			) }
			<FallbackPicker
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>
			<ABToggleControl
				label={ __( 'Hide when no featured image', 'axiom-blocks' ) }
				help={ __(
					'Overrides the fallback: the card simply has no image.',
					'axiom-blocks'
				) }
				checked={ !! hideIfEmpty }
				onChange={ ( v ) => setAttributes( { hideIfEmpty: v } ) }
			/>
		</PanelBody>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ leading }
			/>
			<figure { ...blockProps }>
				{ preview ? (
					<img className="ab-pc__img" src={ preview } alt="" />
				) : (
					<span className="ab-pc__img-placeholder">
						{ __( 'Featured image', 'axiom-blocks' ) }
					</span>
				) }
			</figure>
		</>
	);
}

export const PostImage = {
	name: 'axiom-blocks/post-image',
	settings: {
		title: __( 'Post Image', 'axiom-blocks' ),
		description: __(
			"The post's featured image, with a fallback for posts that have none.",
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-image" />,
		edit: PostImageEdit,
		save: () => null,
	},
};
