import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	BlockContextProvider,
	// The only way to render a read-only block tree per post; core/post-template
	// uses this same export. CAN_PREVIEW below degrades to no previews at all if
	// it ever disappears, so the block cannot break on it.
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalUseBlockPreview as useBlockPreview,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { cloneBlock, createBlock } from '@wordpress/blocks';
import { useEffect, useMemo, memo } from '@wordpress/element';
import { PanelBody, Spinner } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { ABTokenControl } from '../../components/ABTokenControl';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { ABResponsive } from '../../components/ABResponsive';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const TEMPLATE = [
	[
		'axiom-blocks/post-card',
		{},
		[
			[ 'axiom-blocks/post-image', {} ],
			[ 'axiom-blocks/post-terms', {} ],
			[ 'axiom-blocks/post-title', {} ],
			[ 'axiom-blocks/post-meta', {} ],
			[ 'axiom-blocks/post-excerpt', {} ],
			[ 'axiom-blocks/post-read-more', {} ],
		],
	],
	[ 'axiom-blocks/post-pagination', {} ],
	[ 'axiom-blocks/post-no-results', {} ],
];

const ALLOWED = [
	'axiom-blocks/post-card',
	'axiom-blocks/post-pagination',
	'axiom-blocks/post-no-results',
];

// The editable template covers the first post; every other post renders as a
// read-only preview of that same template, so the canvas shows the row the
// front end will. Core's Query Loop does the same with the same hook.
const CAN_PREVIEW = typeof useBlockPreview === 'function';

function CardPreview( { blocks } ) {
	const previewProps = useBlockPreview( {
		blocks,
		props: { className: 'ab-pg__preview' },
	} );

	return <div { ...previewProps } />;
}

const MemoCardPreview = memo( CardPreview );

const ORDER = [
	{ label: __( 'Newest first', 'axiom-blocks' ), value: 'desc' },
	{ label: __( 'Oldest first', 'axiom-blocks' ), value: 'asc' },
];

const ORDER_BY = [
	{ label: __( 'Date', 'axiom-blocks' ), value: 'date' },
	{ label: __( 'Last modified', 'axiom-blocks' ), value: 'modified' },
	{ label: __( 'Title', 'axiom-blocks' ), value: 'title' },
	{ label: __( 'Menu order', 'axiom-blocks' ), value: 'menu_order' },
	{ label: __( 'Comment count', 'axiom-blocks' ), value: 'comment_count' },
	{ label: __( 'Random', 'axiom-blocks' ), value: 'rand' },
];

const LAYOUTS = [
	{ label: __( 'Grid', 'axiom-blocks' ), value: 'grid' },
	{ label: __( 'List', 'axiom-blocks' ), value: 'list' },
];

const FEATURED_SOURCE = [
	{ label: __( 'First result', 'axiom-blocks' ), value: 'first' },
	{ label: __( 'A specific post', 'axiom-blocks' ), value: 'specific' },
];

const STICKY = [
	{ label: __( 'Include', 'axiom-blocks' ), value: '' },
	{ label: __( 'Exclude', 'axiom-blocks' ), value: 'exclude' },
	{ label: __( 'Only sticky', 'axiom-blocks' ), value: 'only' },
];

const GRID_BW = [
	'gridBorderTopWidth',
	'gridBorderRightWidth',
	'gridBorderBottomWidth',
	'gridBorderLeftWidth',
];
const GRID_RADIUS = [
	'gridRadiusTopLeft',
	'gridRadiusTopRight',
	'gridRadiusBottomRight',
	'gridRadiusBottomLeft',
];

const DESIGN = {
	block: 'pg',
	targets: [
		{
			noun: __( 'Grid', 'axiom-blocks' ),
			background: { bind: 'gridBg' },
			border: {
				widthKeys: GRID_BW,
				styleKey: 'gridBorderStyle',
				colorKey: 'gridBorderColor',
				max: 12,
			},
			radius: { keys: GRID_RADIUS, max: 64 },
			shadow: { bind: 'gridShadow' },
			padding: { type: 'gridPadding', responsive: true },
		},
	],
};

function PostGridEdit( props ) {
	if ( ! isBlockEnabled( 'post-grid' ) ) {
		return <DisabledBlockMessage blockName="Post Grid" />;
	}
	return <PostGridInner { ...props } />;
}

function QueryPanel( { attributes, setAttributes } ) {
	const {
		postType,
		taxonomy,
		terms,
		excludeTerms,
		order,
		orderBy,
		postsPerPage,
		offset,
		excludeCurrent,
		sticky,
	} = attributes;

	const postTypes = useSelect(
		( select ) =>
			( select( coreStore ).getPostTypes( { per_page: -1 } ) || [] )
				.filter( ( t ) => t.viewable && t.slug !== 'attachment' )
				.map( ( t ) => ( { label: t.name, value: t.slug } ) ),
		[]
	);

	const taxonomies = useSelect(
		( select ) =>
			( select( coreStore ).getTaxonomies( { per_page: -1 } ) || [] )
				.filter( ( t ) => t.types?.includes( postType ) )
				.map( ( t ) => ( { label: t.name, value: t.slug } ) ),
		[ postType ]
	);

	const termOptions = useSelect(
		( select ) => {
			if ( ! taxonomy ) {
				return [];
			}
			const recs = select( coreStore ).getEntityRecords(
				'taxonomy',
				taxonomy,
				{ per_page: -1 }
			);
			return ( recs || [] ).map( ( t ) => ( {
				label: t.name,
				value: t.id,
			} ) );
		},
		[ taxonomy ]
	);

	return (
		<PanelBody title={ __( 'Query', 'axiom-blocks' ) } initialOpen>
			<ABSelectControl
				label={ __( 'Post type', 'axiom-blocks' ) }
				value={ postType }
				options={
					postTypes.length
						? postTypes
						: [
								{
									label: __( 'Posts', 'axiom-blocks' ),
									value: 'post',
								},
						  ]
				}
				onChange={ ( v ) =>
					setAttributes( {
						postType: v,
						taxonomy: '',
						terms: [],
						excludeTerms: [],
					} )
				}
			/>
			<ABSelectControl
				label={ __( 'Filter by taxonomy', 'axiom-blocks' ) }
				value={ taxonomy }
				options={ [
					{ label: __( 'None', 'axiom-blocks' ), value: '' },
					...taxonomies,
				] }
				onChange={ ( v ) =>
					setAttributes( {
						taxonomy: v,
						terms: [],
						excludeTerms: [],
					} )
				}
			/>
			{ !! taxonomy && (
				<>
					<ABTokenControl
						label={ __( 'Include terms', 'axiom-blocks' ) }
						value={ terms || [] }
						options={ termOptions }
						onChange={ ( v ) => setAttributes( { terms: v } ) }
					/>
					<ABTokenControl
						label={ __( 'Exclude terms', 'axiom-blocks' ) }
						value={ excludeTerms || [] }
						options={ termOptions }
						onChange={ ( v ) =>
							setAttributes( { excludeTerms: v } )
						}
					/>
				</>
			) }
			<ABSelectControl
				label={ __( 'Sort by', 'axiom-blocks' ) }
				value={ orderBy }
				options={ ORDER_BY }
				onChange={ ( v ) => setAttributes( { orderBy: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Direction', 'axiom-blocks' ) }
				value={ order }
				options={ ORDER }
				onChange={ ( v ) => setAttributes( { order: v } ) }
			/>
			<ABRangeControl
				label={ __( 'Posts to show', 'axiom-blocks' ) }
				value={ postsPerPage || 6 }
				onChange={ ( v ) => setAttributes( { postsPerPage: v } ) }
				min={ 1 }
				max={ 50 }
				unit=""
			/>
			<ABRangeControl
				label={ __( 'Skip first', 'axiom-blocks' ) }
				help={ __(
					'Useful when a featured block above already shows the newest posts.',
					'axiom-blocks'
				) }
				value={ offset || 0 }
				onChange={ ( v ) => setAttributes( { offset: v } ) }
				min={ 0 }
				max={ 20 }
				unit=""
			/>
			<ABSelectControl
				label={ __( 'Sticky posts', 'axiom-blocks' ) }
				value={ sticky }
				options={ STICKY }
				onChange={ ( v ) => setAttributes( { sticky: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Exclude the current post', 'axiom-blocks' ) }
				help={ __(
					'Stops a related-posts grid listing the post it sits on.',
					'axiom-blocks'
				) }
				checked={ !! excludeCurrent }
				onChange={ ( v ) => setAttributes( { excludeCurrent: v } ) }
			/>
		</PanelBody>
	);
}

/**
 * Featured panel. Enabling it inserts a SECOND post-card into the template,
 * cloned from the default one and marked cardRole: "featured", so the featured
 * card is a real block with the full capability stack rather than a state axis
 * (which could only carry colors, background, border and shadow).
 *
 * Disabling never deletes that card: the author's styling survives a toggle.
 *
 * @param {Object}   props               Component props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @param {string}   props.clientId      This block's client id.
 */
function FeaturedPanel( { attributes, setAttributes, clientId } ) {
	const {
		featuredEnabled,
		featuredSource,
		featuredPostId,
		featuredSpan,
		postType,
	} = attributes;

	const { cards, hasFeatured } = useSelect(
		( select ) => {
			const blocks =
				select( blockEditorStore ).getBlocks( clientId ) || [];
			const list = blocks.filter(
				( b ) => b.name === 'axiom-blocks/post-card'
			);
			return {
				cards: list,
				hasFeatured: list.some(
					( b ) => b.attributes?.cardRole === 'featured'
				),
			};
		},
		[ clientId ]
	);

	const { insertBlock } = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! featuredEnabled || hasFeatured ) {
			return;
		}
		const base = cards.find(
			( b ) => b.attributes?.cardRole !== 'featured'
		);
		const block = base
			? cloneBlock( base, { cardRole: 'featured' } )
			: createBlock( 'axiom-blocks/post-card', {
					cardRole: 'featured',
			  } );
		insertBlock( block, 0, clientId, false );
	}, [ featuredEnabled, hasFeatured, cards, clientId, insertBlock ] );

	const posts = useSelect(
		( select ) =>
			select( coreStore ).getEntityRecords(
				'postType',
				postType || 'post',
				{
					per_page: 50,
					status: 'publish',
					_fields: 'id,title',
				}
			) || [],
		[ postType ]
	);

	return (
		<PanelBody
			title={ __( 'Featured post', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABToggleControl
				label={ __( 'Feature one post', 'axiom-blocks' ) }
				help={ __(
					'Adds a second card to the template that you can style independently.',
					'axiom-blocks'
				) }
				checked={ !! featuredEnabled }
				onChange={ ( v ) => setAttributes( { featuredEnabled: v } ) }
			/>
			{ featuredEnabled && (
				<>
					<ABSelectControl
						label={ __( 'Which post', 'axiom-blocks' ) }
						value={ featuredSource }
						options={ FEATURED_SOURCE }
						onChange={ ( v ) =>
							setAttributes( { featuredSource: v } )
						}
					/>
					{ featuredSource === 'specific' && (
						<ABSelectControl
							label={ __( 'Post', 'axiom-blocks' ) }
							value={ String( featuredPostId || 0 ) }
							options={ [
								{
									label: __(
										'Choose a post',
										'axiom-blocks'
									),
									value: '0',
								},
								...posts.map( ( p ) => ( {
									label:
										p.title?.rendered ||
										__( '(no title)', 'axiom-blocks' ),
									value: String( p.id ),
								} ) ),
							] }
							onChange={ ( v ) =>
								setAttributes( {
									featuredPostId: parseInt( v, 10 ) || 0,
								} )
							}
						/>
					) }
					<ABRangeControl
						label={ __( 'Columns to span', 'axiom-blocks' ) }
						help={ __(
							'Clamped to the column count, so it never overflows the grid.',
							'axiom-blocks'
						) }
						value={ featuredSpan || 2 }
						onChange={ ( v ) =>
							setAttributes( { featuredSpan: v } )
						}
						min={ 1 }
						max={ 6 }
						unit=""
					/>
				</>
			) }
		</PanelBody>
	);
}

function LayoutPanel( { attributes, setAttributes } ) {
	const { layout, equalHeight } = attributes;

	return (
		<PanelBody
			title={ __( 'Layout', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABSelectControl
				label={ __( 'Layout', 'axiom-blocks' ) }
				value={ layout }
				options={ LAYOUTS }
				onChange={ ( v ) => setAttributes( { layout: v } ) }
			/>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="columns"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABRangeControl
						label={ __( 'Columns', 'axiom-blocks' ) }
						value={ value || inherited || 3 }
						onChange={ setValue }
						min={ 1 }
						max={ 6 }
						unit=""
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="columnGap"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABRangeControl
						label={ __( 'Column gap', 'axiom-blocks' ) }
						value={ parseInt( value || inherited, 10 ) || 24 }
						onChange={ ( v ) => setValue( `${ v }px` ) }
						min={ 0 }
						max={ 96 }
						unit="px"
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="rowGap"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABRangeControl
						label={ __( 'Row gap', 'axiom-blocks' ) }
						value={ parseInt( value || inherited, 10 ) || 24 }
						onChange={ ( v ) => setValue( `${ v }px` ) }
						min={ 0 }
						max={ 96 }
						unit="px"
					/>
				) }
			</ABResponsive>
			<ABToggleControl
				label={ __( 'Equal height cards', 'axiom-blocks' ) }
				checked={ !! equalHeight }
				onChange={ ( v ) => setAttributes( { equalHeight: v } ) }
			/>
		</PanelBody>
	);
}

function PostGridInner( { attributes, setAttributes, clientId } ) {
	const {
		postType,
		order,
		orderBy,
		postsPerPage,
		offset,
		columns,
		columnGap,
		rowGap,
		layout,
		equalHeight,
		featuredEnabled,
		featuredSpan,
	} = attributes;

	const { posts, resolved } = useSelect(
		( select ) => {
			const query = {
				per_page: Math.max( 1, Math.min( 100, postsPerPage || 6 ) ),
				offset: offset || 0,
				order: order || 'desc',
				orderby: orderBy || 'date',
				status: 'publish',
				_fields: 'id,type',
			};
			const args = [ 'postType', postType || 'post', query ];
			return {
				posts: select( coreStore ).getEntityRecords( ...args ),
				resolved: select( coreStore ).hasFinishedResolution(
					'getEntityRecords',
					args
				),
			};
		},
		[ postType, order, orderBy, postsPerPage, offset ]
	);

	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: [
			'ab-pg',
			`ab-pg--${ layout || 'grid' }`,
			equalHeight ? 'is-equal-height' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...spacingStyle,
			'--ab-pg-cols': Math.max( 1, columns || 3 ),
			'--ab-pg-col-gap': columnGap || undefined,
			'--ab-pg-row-gap': rowGap || undefined,
			'--ab-pg-feat-span': featuredEnabled
				? Math.min(
						Math.max( 1, featuredSpan || 2 ),
						Math.max( 1, columns || 3 )
				  )
				: undefined,
		},
	} );

	const { children: listChildren, ...listProps } = useInnerBlocksProps(
		{ className: 'ab-pg__list' },
		{
			template: TEMPLATE,
			allowedBlocks: ALLOWED,
			templateLock: false,
			renderAppender: false,
		}
	);

	const first = posts && posts.length ? posts[ 0 ] : null;

	const cardBlocks = useSelect(
		( select ) =>
			select( blockEditorStore )
				.getBlocks( clientId )
				.filter( ( b ) => b.name === 'axiom-blocks/post-card' ),
		[ clientId ]
	);

	const templateCard = cardBlocks.find(
		( b ) => b.attributes?.cardRole !== 'featured'
	);
	const previewBlocks = useMemo(
		() => ( templateCard ? [ templateCard ] : [] ),
		[ templateCard ]
	);
	const previewPosts =
		CAN_PREVIEW && templateCard && posts
			? posts.slice( cardBlocks.length )
			: [];

	const inspector = (
		<ABInspectorGroups
			attributes={ attributes }
			setAttributes={ setAttributes }
			design={ DESIGN }
			leading={
				<>
					<QueryPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
					<LayoutPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
					<FeaturedPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
						clientId={ clientId }
					/>
				</>
			}
		/>
	);

	if ( ! resolved ) {
		return (
			<>
				{ inspector }
				<div { ...blockProps }>
					<div className="ab-pg__loading">
						<Spinner />
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			{ inspector }
			<div { ...blockProps }>
				<BlockContextProvider
					value={ {
						postId: first ? first.id : null,
						postType: first ? first.type : postType || 'post',
					} }
				>
					<div { ...listProps }>
						{ listChildren }
						{ previewPosts.map( ( post ) => (
							<BlockContextProvider
								key={ post.id }
								value={ {
									postId: post.id,
									postType: post.type,
								} }
							>
								<MemoCardPreview blocks={ previewBlocks } />
							</BlockContextProvider>
						) ) }
					</div>
				</BlockContextProvider>
				{ ! first && (
					<p className="ab-pg__empty-note">
						{ __(
							'No posts match this query yet.',
							'axiom-blocks'
						) }
					</p>
				) }
			</div>
		</>
	);
}

export const PostGrid = {
	name: 'axiom-blocks/post-grid',
	settings: {
		title: __( 'Post Grid', 'axiom-blocks' ),
		description: __(
			'Show posts in a designed grid or list. Build the card from the blocks you want, style every part.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-grid" />,
		edit: PostGridEdit,
		save: () => <InnerBlocks.Content />,
	},
};
