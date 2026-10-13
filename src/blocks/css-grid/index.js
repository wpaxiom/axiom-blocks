import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody, Notice } from '@wordpress/components';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import {
	ABRangeControl,
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABResponsive } from '../../components/ABResponsive';
import {
	useDeviceType,
	resolveResponsive,
	deviceKey,
} from '../../components/responsive';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import {
	safeTrackList,
	safeTrackToken,
	templateFor,
	trackCount,
} from './tracks';

const TEMPLATE = [ 1, 2, 3 ].map( ( n ) => [
	'axiom-blocks/grid-item',
	{},
	[ [ 'core/paragraph', { content: `Grid item ${ n }` } ] ],
] );
const BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const RADIUS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];
const DESIGN = {
	block: 'cg',
	targets: [
		{
			noun: __( 'Grid', 'axiom-blocks' ),
			background: { bind: 'backgroundColor' },
			border: {
				widthKeys: BW,
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 16,
			},
			radius: { keys: RADIUS, max: 64 },
			shadow: { bind: 'gridShadow' },
		},
	],
};
const MODES = [
	{ label: __( 'Equal columns', 'axiom-blocks' ), value: 'equal' },
	{ label: __( 'Auto fit', 'axiom-blocks' ), value: 'auto-fit' },
	{ label: __( 'Custom tracks', 'axiom-blocks' ), value: 'custom' },
];
const ALIGN = [ 'stretch', 'start', 'center', 'end' ].map( ( value ) => ( {
	label: value[ 0 ].toUpperCase() + value.slice( 1 ),
	value,
} ) );
const CONTENT_ALIGN = [
	'normal',
	'start',
	'center',
	'end',
	'space-between',
	'space-around',
	'space-evenly',
].map( ( value ) => ( { label: value.replace( '-', ' ' ), value } ) );

// Mirrors the frontend: Desktop derives its tracks from the mode, while each
// smaller device uses its own stored template (written by the mode controls)
// and otherwise inherits the next larger device.
function columnsFor( a, device ) {
	const desktop =
		templateFor(
			a.layoutMode || 'equal',
			a.columns,
			a.minColumnWidth,
			a.columnTemplate
		) || 'repeat(3, minmax(0, 1fr))';
	if ( device === 'Desktop' ) return desktop;
	const tablet = safeTrackList( a.columnTemplateTablet ) || desktop;
	if ( device === 'Tablet' ) return tablet;
	return safeTrackList( a.columnTemplateMobile ) || tablet;
}

function varsFor( a, device ) {
	return {
		'--ab-cg-cols': columnsFor( a, device ),
		'--ab-cg-rows':
			safeTrackList( resolveResponsive( a, 'rowTemplate', device ) ) ||
			'none',
		'--ab-cg-auto-cols': safeTrackToken(
			resolveResponsive( a, 'autoColumns', device )
		),
		'--ab-cg-auto-rows': safeTrackToken(
			resolveResponsive( a, 'autoRows', device )
		),
		'--ab-cg-flow': resolveResponsive( a, 'autoFlow', device ) || 'row',
		'--ab-cg-ji':
			resolveResponsive( a, 'justifyItems', device ) || 'stretch',
		'--ab-cg-ai': resolveResponsive( a, 'alignItems', device ) || 'stretch',
		'--ab-cg-jc':
			resolveResponsive( a, 'justifyContent', device ) || 'normal',
		'--ab-cg-ac':
			resolveResponsive( a, 'alignContent', device ) || 'normal',
		'--ab-cg-cg': resolveResponsive( a, 'columnGap', device ) || '0px',
		'--ab-cg-rg': resolveResponsive( a, 'rowGap', device ) || '0px',
		'--ab-cg-bg': a.backgroundColor || undefined,
		'--ab-cg-bs': a.borderStyle || undefined,
		'--ab-cg-bc': a.borderColor || undefined,
		'--ab-cg-bw-t': a.borderTopWidth || undefined,
		'--ab-cg-bw-r': a.borderRightWidth || undefined,
		'--ab-cg-bw-b': a.borderBottomWidth || undefined,
		'--ab-cg-bw-l': a.borderLeftWidth || undefined,
		'--ab-cg-r-tl': a.radiusTopLeft || undefined,
		'--ab-cg-r-tr': a.radiusTopRight || undefined,
		'--ab-cg-r-br': a.radiusBottomRight || undefined,
		'--ab-cg-r-bl': a.radiusBottomLeft || undefined,
		'--ab-cg-shadow': a.gridShadow || undefined,
	};
}

function CssGridEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'css-grid' ) )
		return <DisabledBlockMessage blockName="CSS Grid" />;
	const device = useDeviceType();
	const mode =
		resolveResponsive( attributes, 'layoutMode', device ) || 'equal';
	const currentTemplate =
		resolveResponsive( attributes, 'columnTemplate', device ) || '';
	const invalidCustom =
		mode === 'custom' &&
		currentTemplate &&
		! safeTrackList( currentTemplate );
	const setMode = ( value ) => {
		const update = { [ deviceKey( 'layoutMode', device ) ]: value };
		if ( value !== 'custom' )
			update[ deviceKey( 'columnTemplate', device ) ] = templateFor(
				value,
				resolveResponsive( attributes, 'columns', device ),
				resolveResponsive( attributes, 'minColumnWidth', device ),
				currentTemplate
			);
		setAttributes( update );
	};
	const blockProps = useBlockProps( {
		className: `ab-css-grid${ attributes.dense ? ' is-dense' : '' }${
			trackCount( columnsFor( attributes, device ) ) === 1
				? ' is-stacked'
				: ''
		}`,
		style: {
			...varsFor( attributes, device ),
			...useSpacingStyle( attributes ),
		},
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ 'axiom-blocks/grid-item' ],
		template: TEMPLATE,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );
	const settings = (
		<>
			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="layoutMode"
				>
					{ () => (
						<ABSelectControl
							label={ __( 'Mode', 'axiom-blocks' ) }
							value={ mode }
							options={ MODES }
							onChange={ setMode }
						/>
					) }
				</ABResponsive>
				{ mode === 'equal' && (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="columns"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Columns', 'axiom-blocks' ) }
								value={ value ?? inherited ?? 3 }
								min={ 1 }
								max={ 12 }
								unit=""
								onChange={ ( v ) => {
									const n = v || 1;
									setValue( n );
									setAttributes( {
										[ deviceKey(
											'columnTemplate',
											device
										) ]: templateFor( 'equal', n, '', '' ),
									} );
								} }
							/>
						) }
					</ABResponsive>
				) }
				{ mode === 'auto-fit' && (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="minColumnWidth"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABTextControl
								label={ __(
									'Minimum column width',
									'axiom-blocks'
								) }
								value={ value || inherited || '240px' }
								onChange={ ( v ) => {
									setValue( v );
									setAttributes( {
										[ deviceKey(
											'columnTemplate',
											device
										) ]: templateFor(
											'auto-fit',
											0,
											v,
											''
										),
									} );
								} }
								help={ __(
									'Use px, rem, em, %, vw, or vh.',
									'axiom-blocks'
								) }
							/>
						) }
					</ABResponsive>
				) }
				{ mode === 'custom' && (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="columnTemplate"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABTextControl
								label={ __( 'Column tracks', 'axiom-blocks' ) }
								value={ value || inherited || '' }
								onChange={ setValue }
								placeholder="2fr 1fr 240px"
								help={ __(
									'Space-separated safe track sizes.',
									'axiom-blocks'
								) }
							/>
						) }
					</ABResponsive>
				) }
				{ invalidCustom && (
					<Notice status="warning" isDismissible={ false }>
						{ __(
							'Invalid track list. The preview and frontend use the safe fallback.',
							'axiom-blocks'
						) }
					</Notice>
				) }
			</PanelBody>
			<PanelBody
				title={ __( 'Tracks', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="rowTemplate"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABTextControl
							label={ __( 'Row tracks', 'axiom-blocks' ) }
							value={ value || inherited || '' }
							onChange={ setValue }
							placeholder="auto 1fr"
						/>
					) }
				</ABResponsive>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="autoColumns"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABTextControl
							label={ __( 'Auto column size', 'axiom-blocks' ) }
							value={ value || inherited || 'auto' }
							onChange={ setValue }
						/>
					) }
				</ABResponsive>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="autoRows"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABTextControl
							label={ __( 'Auto row size', 'axiom-blocks' ) }
							value={ value || inherited || 'auto' }
							onChange={ setValue }
						/>
					) }
				</ABResponsive>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="autoFlow"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABSelectControl
							label={ __( 'Auto flow', 'axiom-blocks' ) }
							value={ value || inherited || 'row' }
							options={ [
								{ label: 'Row', value: 'row' },
								{ label: 'Column', value: 'column' },
							] }
							onChange={ setValue }
						/>
					) }
				</ABResponsive>
				<ABToggleControl
					label={ __( 'Dense packing', 'axiom-blocks' ) }
					checked={ attributes.dense }
					onChange={ ( dense ) => setAttributes( { dense } ) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Alignment', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				{ [
					[
						'justifyItems',
						__( 'Justify items', 'axiom-blocks' ),
						ALIGN,
					],
					[
						'alignItems',
						__( 'Align items', 'axiom-blocks' ),
						ALIGN,
					],
					[
						'justifyContent',
						__( 'Justify content', 'axiom-blocks' ),
						CONTENT_ALIGN,
					],
					[
						'alignContent',
						__( 'Align content', 'axiom-blocks' ),
						CONTENT_ALIGN,
					],
				].map( ( [ key, label, options ] ) => (
					<ABResponsive
						key={ key }
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey={ key }
					>
						{ ( { value, setValue, inherited } ) => (
							<ABSelectControl
								label={ label }
								value={ value || inherited }
								options={ options }
								onChange={ setValue }
							/>
						) }
					</ABResponsive>
				) ) }
			</PanelBody>
		</>
	);
	const gap = (
		<PanelBody title={ __( 'Gap', 'axiom-blocks' ) } initialOpen={ false }>
			{ [
				[ 'columnGap', __( 'Column gap', 'axiom-blocks' ) ],
				[ 'rowGap', __( 'Row gap', 'axiom-blocks' ) ],
			].map( ( [ key, label ] ) => (
				<ABResponsive
					key={ key }
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey={ key }
				>
					{ ( { value, setValue, inherited } ) => (
						<ABTextControl
							label={ label }
							value={ value || inherited || '0px' }
							onChange={ setValue }
						/>
					) }
				</ABResponsive>
			) ) }
		</PanelBody>
	);
	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ settings }
				trailing={ gap }
			/>
			<div { ...innerBlocksProps } />
		</>
	);
}

export const CssGrid = {
	name: 'axiom-blocks/css-grid',
	settings: {
		// New grids stack like Post Grid: 2 columns on tablet, 1 on mobile. Set as
		// explicit device values so every device's controls show what renders.
		variations: [
			{
				name: 'css-grid',
				isDefault: true,
				title: __( 'CSS Grid', 'axiom-blocks' ),
				scope: [ 'inserter' ],
				attributes: {
					layoutModeTablet: 'equal',
					columnsTablet: 2,
					columnTemplateTablet: 'repeat(2, minmax(0, 1fr))',
					layoutModeMobile: 'equal',
					columnsMobile: 1,
					columnTemplateMobile: 'repeat(1, minmax(0, 1fr))',
				},
			},
		],
		title: __( 'CSS Grid', 'axiom-blocks' ),
		description: __(
			'Responsive unequal CSS Grid layouts with explicit item placement.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="css-grid" />,
		edit: CssGridEdit,
		save: () => <InnerBlocks.Content />,
	},
};
