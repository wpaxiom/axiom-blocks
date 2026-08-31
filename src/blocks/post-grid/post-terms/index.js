import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
	ABTextControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useTypographyStyle } from '../../../components/TypographyPanel';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const CHIP_BW = [
	'chipBorderTopWidth',
	'chipBorderRightWidth',
	'chipBorderBottomWidth',
	'chipBorderLeftWidth',
];
const CHIP_RADIUS = [
	'chipRadiusTopLeft',
	'chipRadiusTopRight',
	'chipRadiusBottomRight',
	'chipRadiusBottomLeft',
];

const DESIGN = {
	block: 'pc-term',
	targets: [
		{
			noun: __( 'Chip', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'termColor',
					fallback: '#7c3aed',
				},
			],
			background: { bind: 'termBg' },
			typography: '',
			border: {
				widthKeys: CHIP_BW,
				styleKey: 'chipBorderStyle',
				colorKey: 'chipBorderColor',
				max: 8,
			},
			radius: { keys: CHIP_RADIUS, max: 999 },
			padding: { type: 'chipPadding' },
			ranges: [
				{
					bind: 'chipGap',
					label: __( 'Gap', 'axiom-blocks' ),
					min: 0,
					max: 32,
					default: 8,
				},
			],
		},
	],
};

function PostTermsEdit( { attributes, setAttributes, context } ) {
	const { taxonomy, limit, separator, isLink, termColor, termBg } =
		attributes;
	const postId = context?.postId;
	const postType = context?.postType;

	const taxonomies = useSelect(
		( select ) =>
			select( coreStore ).getTaxonomies( { per_page: -1 } ) || [],
		[]
	);

	const terms = useSelect(
		( select ) => {
			if ( ! postId || ! postType || ! taxonomy ) {
				return null;
			}
			const record = select( coreStore ).getEntityRecord(
				'postType',
				postType,
				postId
			);
			const ids = record?.[ taxonomy ];
			if ( ! ids || ! ids.length ) {
				return [];
			}
			const recs = select( coreStore ).getEntityRecords(
				'taxonomy',
				taxonomy,
				{ include: ids, per_page: -1 }
			);
			return recs ? recs.map( ( t ) => t.name ) : null;
		},
		[ postId, postType, taxonomy ]
	);

	const typographyStyle = useTypographyStyle( attributes, '' );
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: 'ab-pc__terms',
		style: {
			...typographyStyle,
			...spacingStyle,
			'--ab-pc-term-color': termColor || undefined,
			'--ab-pc-term-bg': termBg || undefined,
		},
	} );

	const options = ( taxonomies || [] )
		.filter( ( t ) => t.visibility?.public !== false )
		.map( ( t ) => ( { label: t.name, value: t.slug } ) );

	let shown = terms;
	if ( ! shown || ! shown.length ) {
		shown = [ __( 'Category', 'axiom-blocks' ) ];
	}
	if ( limit > 0 ) {
		shown = shown.slice( 0, limit );
	}

	const leading = (
		<PanelBody title={ __( 'Terms', 'axiom-blocks' ) } initialOpen>
			<ABSelectControl
				label={ __( 'Taxonomy', 'axiom-blocks' ) }
				value={ taxonomy }
				options={
					options.length
						? options
						: [
								{
									label: __( 'Categories', 'axiom-blocks' ),
									value: 'category',
								},
						  ]
				}
				onChange={ ( v ) => setAttributes( { taxonomy: v } ) }
			/>
			<ABRangeControl
				label={ __( 'Maximum terms', 'axiom-blocks' ) }
				help={ __( '0 shows every term.', 'axiom-blocks' ) }
				value={ limit || 0 }
				onChange={ ( v ) => setAttributes( { limit: v } ) }
				min={ 0 }
				max={ 10 }
				unit=""
			/>
			<ABTextControl
				label={ __( 'Separator', 'axiom-blocks' ) }
				help={ __(
					'Leave empty for chips; set a character for an inline list.',
					'axiom-blocks'
				) }
				value={ separator }
				onChange={ ( v ) => setAttributes( { separator: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Link to term archive', 'axiom-blocks' ) }
				checked={ !! isLink }
				onChange={ ( v ) => setAttributes( { isLink: v } ) }
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
			<div { ...blockProps }>
				{ shown.map( ( name, i ) => (
					<span key={ i } className="ab-pc__term">
						{ name }
					</span>
				) ) }
			</div>
		</>
	);
}

export const PostTerms = {
	name: 'axiom-blocks/post-terms',
	settings: {
		title: __( 'Post Terms', 'axiom-blocks' ),
		description: __(
			"The post's categories or tags, as styleable chips.",
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-terms" />,
		edit: PostTermsEdit,
		save: () => null,
	},
};
