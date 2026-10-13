import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import {
	ABRangeControl,
	ABSelectControl,
} from '../../../components/ABControls';
import { ABResponsive } from '../../../components/ABResponsive';
import {
	useDeviceType,
	resolveResponsive,
} from '../../../components/responsive';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../../components/DisabledBlockMessage';

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
	block: 'gi',
	targets: [
		{
			noun: __( 'Item', 'axiom-blocks' ),
			background: { bind: 'backgroundColor' },
			border: {
				widthKeys: BW,
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 16,
			},
			radius: { keys: RADIUS, max: 64 },
			shadow: { bind: 'itemShadow' },
			size: {
				bind: 'minHeight',
				label: __( 'Min height', 'axiom-blocks' ),
				responsive: true,
				defaultUnit: 'px',
			},
		},
	],
};
const SELF = [ 'auto', 'stretch', 'start', 'center', 'end' ].map(
	( value ) => ( {
		label: value[ 0 ].toUpperCase() + value.slice( 1 ),
		value,
	} )
);

function itemVars( a, device ) {
	const n = ( key, fallback = 0 ) =>
		Number( resolveResponsive( a, key, device ) ) || fallback;
	const colStart = n( 'columnStart' );
	const rowStart = n( 'rowStart' );
	return {
		'--ab-gi-col': `${ colStart ? colStart + ' / ' : '' }span ${ Math.max(
			1,
			n( 'columnSpan', 1 )
		) }`,
		'--ab-gi-row': `${ rowStart ? rowStart + ' / ' : '' }span ${ Math.max(
			1,
			n( 'rowSpan', 1 )
		) }`,
		'--ab-gi-order': n( 'itemOrder' ),
		'--ab-gi-js': resolveResponsive( a, 'justifySelf', device ) || 'auto',
		'--ab-gi-as': resolveResponsive( a, 'alignSelf', device ) || 'auto',
		'--ab-gi-minh':
			resolveResponsive( a, 'minHeight', device ) || undefined,
		'--ab-gi-bg': a.backgroundColor || undefined,
		'--ab-gi-bs': a.borderStyle || undefined,
		'--ab-gi-bc': a.borderColor || undefined,
		'--ab-gi-bw-t': a.borderTopWidth || undefined,
		'--ab-gi-bw-r': a.borderRightWidth || undefined,
		'--ab-gi-bw-b': a.borderBottomWidth || undefined,
		'--ab-gi-bw-l': a.borderLeftWidth || undefined,
		'--ab-gi-r-tl': a.radiusTopLeft || undefined,
		'--ab-gi-r-tr': a.radiusTopRight || undefined,
		'--ab-gi-r-br': a.radiusBottomRight || undefined,
		'--ab-gi-r-bl': a.radiusBottomLeft || undefined,
		'--ab-gi-shadow': a.itemShadow || undefined,
	};
}

function GridItemEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'css-grid' ) )
		return <DisabledBlockMessage blockName="Grid Item" />;
	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: 'ab-grid-item',
		style: {
			...itemVars( attributes, device ),
			...useSpacingStyle( attributes ),
		},
	} );
	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );
	const settings = (
		<>
			<PanelBody
				title={ __( 'Placement', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				{ [
					[
						'columnStart',
						__( 'Column start', 'axiom-blocks' ),
						0,
						24,
					],
					[
						'columnSpan',
						__( 'Column span', 'axiom-blocks' ),
						1,
						24,
					],
					[ 'rowStart', __( 'Row start', 'axiom-blocks' ), 0, 24 ],
					[ 'rowSpan', __( 'Row span', 'axiom-blocks' ), 1, 24 ],
					[ 'itemOrder', __( 'Order', 'axiom-blocks' ), -24, 24 ],
				].map( ( [ key, label, min, max ] ) => (
					<ABResponsive
						key={ key }
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey={ key }
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ label }
								value={ value ?? inherited ?? 0 }
								min={ min }
								max={ max }
								unit=""
								onChange={ ( v ) => setValue( v ?? 0 ) }
							/>
						) }
					</ABResponsive>
				) ) }
			</PanelBody>
			<PanelBody
				title={ __( 'Alignment', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				{ [
					[ 'justifySelf', __( 'Justify self', 'axiom-blocks' ) ],
					[ 'alignSelf', __( 'Align self', 'axiom-blocks' ) ],
				].map( ( [ key, label ] ) => (
					<ABResponsive
						key={ key }
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey={ key }
					>
						{ ( { value, setValue, inherited } ) => (
							<ABSelectControl
								label={ label }
								value={ value || inherited || 'auto' }
								options={ SELF }
								onChange={ setValue }
							/>
						) }
					</ABResponsive>
				) ) }
			</PanelBody>
		</>
	);
	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ settings }
			/>
			<div { ...innerBlocksProps } />
		</>
	);
}

export const GridItem = {
	name: 'axiom-blocks/grid-item',
	settings: {
		title: __( 'Grid Item', 'axiom-blocks' ),
		description: __(
			'Place nested blocks inside an Axiom CSS Grid.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="grid-item" />,
		edit: GridItemEdit,
		save: () => <InnerBlocks.Content />,
	},
};
