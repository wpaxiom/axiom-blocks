/**
 * Universal child-order wiring (editor side) — L6 reorder.
 *
 * Injects `abOrder` / `abOrderTablet` / `abOrderMobile` into every `axiom-blocks/*`
 * block and adds the ABChildOrder control to the Advanced group ONLY when the
 * block's immediate parent is a flex/grid Advanced Section (so it stays hidden
 * everywhere else). Mirrors inc/Blocks/ChildOrder.php (frontend `order` CSS) and
 * previews the order on the editor canvas.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { InspectorControls, store as blockEditorStore } from '@wordpress/block-editor';
import { ABChildOrder } from './components/ABChildOrder';
import { useDeviceType, resolveResponsive } from './components/responsive';

const isTarget = ( name ) => !! name && name.indexOf( 'axiom-blocks/' ) === 0;
const KEYS = [ 'abOrder', 'abOrderTablet', 'abOrderMobile' ];

addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/child-order-attrs',
	( settings, name ) => {
		if ( ! isTarget( name ) ) {
			return settings;
		}
		const attrs = settings.attributes || {};
		const extra = {};
		KEYS.forEach( ( k ) => {
			if ( ! attrs[ k ] ) {
				extra[ k ] = { type: 'number' };
			}
		} );
		if ( ! Object.keys( extra ).length ) {
			return settings;
		}
		return { ...settings, attributes: { ...attrs, ...extra } };
	}
);

const withControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		const inLayoutSection = useSelect(
			( select ) => {
				if ( ! isTarget( props.name ) ) {
					return false;
				}
				const { getBlockParents, getBlockName, getBlockAttributes } =
					select( blockEditorStore );
				const parents = getBlockParents( props.clientId, true );
				const parent = parents[ 0 ];
				if (
					! parent ||
					getBlockName( parent ) !== 'axiom-blocks/advanced-section'
				) {
					return false;
				}
				const lt = getBlockAttributes( parent )?.layoutType;
				return lt === 'flex' || lt === 'grid';
			},
			[ props.clientId, props.name ]
		);

		if ( ! inLayoutSection ) {
			return <BlockEdit { ...props } />;
		}
		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls group="advanced">
					<ABChildOrder
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				</InspectorControls>
			</Fragment>
		);
	},
	'withChildOrderControl'
);

addFilter( 'editor.BlockEdit', 'axiom-blocks/child-order-control', withControl );

const withPreview = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const device = useDeviceType();
		const { name, attributes } = props;
		const order = isTarget( name )
			? resolveResponsive( attributes, 'abOrder', device )
			: '';
		if ( order === '' || order == null ) {
			return <BlockListBlock { ...props } />;
		}
		return (
			<BlockListBlock
				{ ...props }
				wrapperProps={ {
					...props.wrapperProps,
					style: {
						...( props.wrapperProps?.style || {} ),
						order,
					},
				} }
			/>
		);
	},
	'withChildOrderPreview'
);

addFilter( 'editor.BlockListBlock', 'axiom-blocks/child-order-preview', withPreview );
