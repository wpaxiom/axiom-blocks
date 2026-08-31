import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABTextControl,
	ABRangeControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useTypographyStyle } from '../../../components/TypographyPanel';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const TYPES = [
	{ label: __( 'None', 'axiom-blocks' ), value: 'none' },
	{ label: __( 'Numbered', 'axiom-blocks' ), value: 'numbered' },
	{ label: __( 'Load more', 'axiom-blocks' ), value: 'loadmore' },
];

const ALIGN = [
	{ label: __( 'Left', 'axiom-blocks' ), value: 'left' },
	{ label: __( 'Center', 'axiom-blocks' ), value: 'center' },
	{ label: __( 'Right', 'axiom-blocks' ), value: 'right' },
];

const PAG_BW = [
	'pagBorderTopWidth',
	'pagBorderRightWidth',
	'pagBorderBottomWidth',
	'pagBorderLeftWidth',
];
const PAG_RADIUS = [
	'pagRadiusTopLeft',
	'pagRadiusTopRight',
	'pagRadiusBottomRight',
	'pagRadiusBottomLeft',
];

const DESIGN = {
	block: 'pg-pag',
	targets: [
		{
			noun: __( 'Links', 'axiom-blocks' ),
			states: [ 'hover', 'active' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'pagColor',
					fallback: '#374151',
				},
			],
			background: { bind: 'pagBg' },
			typography: '',
			border: {
				widthKeys: PAG_BW,
				styleKey: 'pagBorderStyle',
				colorKey: 'pagBorderColor',
				stateBind: {
					hover: 'pagBorderColorHover',
					active: 'pagBorderColorActive',
				},
				max: 8,
			},
			radius: { keys: PAG_RADIUS, max: 999 },
			padding: { type: 'pagPadding' },
			ranges: [
				{
					bind: 'pagGap',
					label: __( 'Gap', 'axiom-blocks' ),
					min: 0,
					max: 32,
					default: 8,
				},
			],
		},
	],
};

function PostPaginationEdit( { attributes, setAttributes } ) {
	const {
		paginationType,
		prevLabel,
		nextLabel,
		loadMoreLabel,
		midSize,
		pagAlign,
		pagColor,
		pagBg,
		pagGap,
	} = attributes;

	const typographyStyle = useTypographyStyle( attributes, '' );
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: `ab-pg__pagination ab-pg__pagination--${
			paginationType || 'numbered'
		}`,
		style: {
			...typographyStyle,
			...spacingStyle,
			'--ab-pg-pag-color': pagColor || undefined,
			'--ab-pg-pag-bg': pagBg || undefined,
			'--ab-pg-pag-gap': pagGap || undefined,
			'--ab-pg-pag-justify':
				{ left: 'flex-start', center: 'center', right: 'flex-end' }[
					pagAlign || 'center'
				] || 'center',
		},
	} );

	const leading = (
		<PanelBody title={ __( 'Pagination', 'axiom-blocks' ) } initialOpen>
			<ABSelectControl
				label={ __( 'Type', 'axiom-blocks' ) }
				value={ paginationType }
				options={ TYPES }
				onChange={ ( v ) => setAttributes( { paginationType: v } ) }
			/>
			{ paginationType === 'numbered' && (
				<>
					<ABTextControl
						label={ __( 'Previous label', 'axiom-blocks' ) }
						value={ prevLabel }
						onChange={ ( v ) => setAttributes( { prevLabel: v } ) }
					/>
					<ABTextControl
						label={ __( 'Next label', 'axiom-blocks' ) }
						value={ nextLabel }
						onChange={ ( v ) => setAttributes( { nextLabel: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Pages either side', 'axiom-blocks' ) }
						help={ __(
							'How many page numbers sit beside the current one.',
							'axiom-blocks'
						) }
						value={ midSize ?? 2 }
						onChange={ ( v ) => setAttributes( { midSize: v } ) }
						min={ 0 }
						max={ 5 }
						unit=""
					/>
				</>
			) }
			{ paginationType === 'loadmore' && (
				<ABTextControl
					label={ __( 'Button label', 'axiom-blocks' ) }
					value={ loadMoreLabel }
					onChange={ ( v ) => setAttributes( { loadMoreLabel: v } ) }
				/>
			) }
			<ABSelectControl
				label={ __( 'Alignment', 'axiom-blocks' ) }
				value={ pagAlign }
				options={ ALIGN }
				onChange={ ( v ) => setAttributes( { pagAlign: v } ) }
			/>
		</PanelBody>
	);

	// Clicks are suppressed in the canvas so the block stays stylable without
	// navigating the editor away.
	const preview =
		paginationType === 'loadmore' ? (
			<span className="ab-pg__loadmore">
				{ loadMoreLabel || __( 'Load more', 'axiom-blocks' ) }
			</span>
		) : (
			<>
				<span className="prev page-numbers">
					{ prevLabel || __( 'Previous', 'axiom-blocks' ) }
				</span>
				<span className="page-numbers current">1</span>
				<span className="page-numbers">2</span>
				<span className="page-numbers">3</span>
				<span className="next page-numbers">
					{ nextLabel || __( 'Next', 'axiom-blocks' ) }
				</span>
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
			<nav { ...blockProps }>
				{ paginationType === 'none' ? (
					<span className="ab-pg__pagination-off">
						{ __( 'Pagination is off.', 'axiom-blocks' ) }
					</span>
				) : (
					preview
				) }
			</nav>
		</>
	);
}

export const PostPagination = {
	name: 'axiom-blocks/post-pagination',
	settings: {
		title: __( 'Post Pagination', 'axiom-blocks' ),
		description: __(
			'Numbered pages or a Load more button for a Post Grid.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-pagination" />,
		edit: PostPaginationEdit,
		save: () => null,
	},
};
