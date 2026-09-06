import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	ABSelectControl,
	ABToggleControl,
	ABTextControl,
} from '../../components/ABControls';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { ABResponsive } from '../../components/ABResponsive';
import { SizeControl } from '../../components/SizeControl';
import {
	useDeviceType,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { BlockIcon } from '../../blockIcons';
import { barVars } from './shared';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const TEMPLATE = [
	[ 'axiom-blocks/post-filter-search', {} ],
	[ 'axiom-blocks/post-filter-taxonomy', {} ],
	[ 'axiom-blocks/post-filter-sort', {} ],
	[ 'axiom-blocks/post-filter-reset', {} ],
];

const ALLOWED = [
	'axiom-blocks/post-filter-search',
	'axiom-blocks/post-filter-taxonomy',
	'axiom-blocks/post-filter-sort',
	'axiom-blocks/post-filter-reset',
];

const BAR_BW = [
	'barBorderTopWidth',
	'barBorderRightWidth',
	'barBorderBottomWidth',
	'barBorderLeftWidth',
];
const BAR_RADIUS = [
	'barRadiusTopLeft',
	'barRadiusTopRight',
	'barRadiusBottomRight',
	'barRadiusBottomLeft',
];

const DESIGN = {
	block: 'pf',
	targets: [
		{
			noun: __( 'Bar', 'axiom-blocks' ),
			background: { bind: 'barBg' },
			border: {
				widthKeys: BAR_BW,
				styleKey: 'barBorderStyle',
				colorKey: 'barBorderColor',
				max: 12,
			},
			radius: { keys: BAR_RADIUS, max: 64 },
			shadow: { bind: 'barShadow' },
			padding: { type: 'barPadding', responsive: true },
		},
		{
			// Field labels are painted from the bar so one style covers every
			// control, rather than each child repeating the rows.
			noun: __( 'Label', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'labelColor' },
			],
			typography: 'label',
		},
		{
			noun: __( 'Result count', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'countColor' },
			],
			typography: 'count',
		},
	],
};

const DIRECTIONS = [
	{ label: __( 'Row', 'axiom-blocks' ), value: 'row' },
	{ label: __( 'Column', 'axiom-blocks' ), value: 'column' },
];

const ALIGNMENTS = [
	{ label: __( 'Default', 'axiom-blocks' ), value: '' },
	{ label: __( 'Start', 'axiom-blocks' ), value: 'flex-start' },
	{ label: __( 'Center', 'axiom-blocks' ), value: 'center' },
	{ label: __( 'End', 'axiom-blocks' ), value: 'flex-end' },
	{ label: __( 'Stretch', 'axiom-blocks' ), value: 'stretch' },
];

function PostFilterEdit( props ) {
	if ( ! isBlockEnabled( 'post-filter' ) ) {
		return <DisabledBlockMessage blockName="Post Filter" />;
	}
	return <PostFilterInner { ...props } />;
}

function SettingsPanel( { attributes, setAttributes } ) {
	const { targetAnchor, taxonomy, showCount, label, resetToBase } =
		attributes;

	const anchors = useSelect( ( select ) => {
		const blocks = select( 'core/block-editor' ).getBlocks();
		return ( blocks || [] )
			.filter(
				( b ) =>
					b.name === 'axiom-blocks/post-grid' && b.attributes.anchor
			)
			.map( ( b ) => ( {
				label: __( 'Post Grid ', 'axiom-blocks' ) + b.attributes.anchor,
				value: b.attributes.anchor,
			} ) );
	}, [] );

	const taxonomies = useSelect(
		( select ) =>
			( select( coreStore ).getTaxonomies( { per_page: -1 } ) || [] )
				.filter( ( t ) => t.types?.includes( 'post' ) )
				.map( ( t ) => ( { label: t.name, value: t.slug } ) ),
		[]
	);

	return (
		<PanelBody title={ __( 'Filter', 'axiom-blocks' ) } initialOpen>
			<ABSelectControl
				label={ __( 'Target Post Grid', 'axiom-blocks' ) }
				help={ __(
					'Pick the Post Grid this bar filters, by its anchor. The grid and the bar share a taxonomy.',
					'axiom-blocks'
				) }
				value={ targetAnchor }
				options={ [
					{
						label: __( 'Select a grid…', 'axiom-blocks' ),
						value: '',
					},
					...( anchors || [] ),
				] }
				onChange={ ( v ) => setAttributes( { targetAnchor: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Taxonomy', 'axiom-blocks' ) }
				help={ __(
					'The taxonomy the Taxonomy Filter exposes. Set it to the same taxonomy the target Post Grid uses.',
					'axiom-blocks'
				) }
				value={ taxonomy }
				options={ [
					{ label: __( 'None', 'axiom-blocks' ), value: '' },
					...( taxonomies || [] ),
				] }
				onChange={ ( v ) => setAttributes( { taxonomy: v } ) }
			/>
			<ABTextControl
				label={ __( 'Accessible label', 'axiom-blocks' ) }
				help={ __(
					'A short label read out by screen readers for the form.',
					'axiom-blocks'
				) }
				value={ label }
				onChange={ ( v ) => setAttributes( { label: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Show result count', 'axiom-blocks' ) }
				help={ __(
					'Shows how many posts the current filter returns. Adds a small delay while the grid counts.',
					'axiom-blocks'
				) }
				checked={ showCount }
				onChange={ ( v ) => setAttributes( { showCount: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Reset clears to the full grid', 'axiom-blocks' ) }
				checked={ resetToBase }
				onChange={ ( v ) => setAttributes( { resetToBase: v } ) }
			/>
		</PanelBody>
	);
}

function LayoutPanel( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Bar Layout', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="direction"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABSelectControl
						label={ __( 'Direction', 'axiom-blocks' ) }
						value={ value || inherited || 'row' }
						options={ DIRECTIONS }
						onChange={ setValue }
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="fieldGap"
			>
				{ ( { value, setValue, inherited } ) => (
					<SizeControl
						label={ __( 'Gap', 'axiom-blocks' ) }
						value={ value === '' ? inherited || '' : value }
						onChange={ setValue }
						defaultUnit="px"
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="fieldRowGap"
			>
				{ ( { value, setValue, inherited } ) => (
					<SizeControl
						label={ __( 'Row gap', 'axiom-blocks' ) }
						value={ value === '' ? inherited || '' : value }
						onChange={ setValue }
						defaultUnit="px"
					/>
				) }
			</ABResponsive>
			<ABSelectControl
				label={ __( 'Field alignment', 'axiom-blocks' ) }
				value={ attributes.alignItems }
				options={ ALIGNMENTS }
				onChange={ ( v ) => setAttributes( { alignItems: v } ) }
			/>
		</PanelBody>
	);
}

function PostFilterInner( props ) {
	const { attributes, setAttributes } = props;

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'direction', 'fieldGap', 'fieldRowGap' ],
		device
	);

	const blockProps = useBlockProps( {
		className: 'ab-pf is-editor',
		style: barVars( resolved ),
	} );

	const innerProps = useInnerBlocksProps(
		{ className: 'ab-pf__fields' },
		{ template: TEMPLATE, allowedBlocks: ALLOWED, templateLock: false }
	);

	const inspector = (
		<ABInspectorGroups
			attributes={ attributes }
			setAttributes={ setAttributes }
			design={ DESIGN }
			leading={
				<>
					<SettingsPanel { ...{ attributes, setAttributes } } />
					<LayoutPanel { ...{ attributes, setAttributes } } />
				</>
			}
		/>
	);

	return (
		<>
			{ inspector }
			<form { ...blockProps } onSubmit={ ( e ) => e.preventDefault() }>
				<div { ...innerProps } />
			</form>
		</>
	);
}

export const PostFilter = {
	name: 'axiom-blocks/post-filter',
	settings: {
		title: __( 'Post Filter', 'axiom-blocks' ),
		description: __(
			'Filter a Post Grid by search, taxonomy, and sort. Results always come back server-side from validated tokens.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-filter" />,
		edit: PostFilterEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: 'ab-pf',
				style: barVars( attributes ),
			} );
			return (
				<form { ...blockProps }>
					<div className="ab-pf__fields">
						<InnerBlocks.Content />
					</div>
				</form>
			);
		},
	},
};
