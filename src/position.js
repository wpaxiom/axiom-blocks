/**
 * Universal position wiring (editor side).
 *
 * Injects `abPosition` / `abZIndex` / `abOffset*` into every `axiom-blocks/*`
 * block, adds the ABPosition control to their Advanced group, and mirrors the
 * inline position styles onto the editor block so the positioning previews in
 * the canvas. Mirrors the PHP render_block filter (inc/Blocks/Position.php).
 *
 * For `absolute` the block wrapper stays in flow (`position: relative`) and
 * CSS custom properties carry the offset values so editor.scss can position
 * the block's children absolutely — identical to how the frontend PHP keeps
 * the block in flow and wraps children in `<div class="ab-position-inner">`.
 * For `relative/sticky/fixed`, position + offsets apply directly on the wrapper.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { ABPosition } from './components/ABPosition';

const isTarget = ( name ) => !! name && name.indexOf( 'axiom-blocks/' ) === 0;
const KEYS = [
	'abPosition',
	'abZIndex',
	'abOffsetTop',
	'abOffsetRight',
	'abOffsetBottom',
	'abOffsetLeft',
];

addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/position-attrs',
	( settings, name ) => {
		if ( ! isTarget( name ) ) {
			return settings;
		}
		const attrs = settings.attributes || {};
		const extra = {};
		KEYS.forEach( ( k ) => {
			if ( ! attrs[ k ] ) {
				extra[ k ] = { type: 'string', default: '' };
			}
		} );
		if ( ! Object.keys( extra ).length ) {
			return settings;
		}
		return { ...settings, attributes: { ...attrs, ...extra } };
	}
);

/* ── BlockEdit HOC: just adds the inspector control (no wrapper) ─────────── */
const withControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isTarget( props.name ) ) {
			return <BlockEdit { ...props } />;
		}
		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls group="advanced">
					<ABPosition
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				</InspectorControls>
			</Fragment>
		);
	},
	'withPositionControl'
);

addFilter( 'editor.BlockEdit', 'axiom-blocks/position-control', withControl );

const OFFSET_PROPS = [
	[ 'abOffsetTop', 'top' ],
	[ 'abOffsetRight', 'right' ],
	[ 'abOffsetBottom', 'bottom' ],
	[ 'abOffsetLeft', 'left' ],
];

/* ── BlockListBlock HOC: wrapper-level position / classes / CSS vars ─────── */
const num = ( v ) => parseInt( v, 10 ) || 0;

const withPreview = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes } = props;
		const position = isTarget( name ) ? attributes?.abPosition || '' : '';
		if ( ! position ) {
			return <BlockListBlock { ...props } />;
		}

		if ( position === 'absolute' ) {
			// Mirror frontend: the block wrapper anchors its children. In the
			// editor the wrapper keeps `position: relative` (stays in flow, no
			// jump-to-top) and uses relative offset values to visually position
			// itself — this is a preview; the frontend PHP achieves true absolute
			// positioning via an inner `<div class="ab-position-inner">` layer.
			// Unlike the old approach, we never set `position: absolute` on the
			// wrapper itself, so the editor layout never collapses.
			const style = { position: 'relative' };
			if ( attributes.abOffsetTop ) {
				style.top = attributes.abOffsetTop;
			}
			// left + right with position:relative shifts the block from its
			// normal position — only left is meaningful when both are set.
			if ( attributes.abOffsetLeft ) {
				style.left = attributes.abOffsetLeft;
			} else if ( ! attributes.abOffsetRight ) {
				// No horizontal offset at all — span full width (frontend
				// behaviour).
				style.left = 0;
				style.right = 0;
			}
			if ( attributes.abZIndex ) {
				style.zIndex = num( attributes.abZIndex );
			}
			return (
				<BlockListBlock
					{ ...props }
					className={ `${
						props.className || ''
					} ab-has-position ab-position-absolute ab-position-host`.trim() }
					wrapperProps={ {
						...props.wrapperProps,
						style: {
							...( props.wrapperProps?.style || {} ),
							...style,
						},
					} }
				/>
			);
		}

		// relative / sticky / fixed — apply position + offsets directly on the
		// block wrapper (same as frontend).
		const style = { position };
		OFFSET_PROPS.forEach( ( [ key, prop ] ) => {
			if ( attributes[ key ] ) {
				style[ prop ] = attributes[ key ];
			}
		} );
		if ( attributes.abZIndex ) {
			style.zIndex = num( attributes.abZIndex );
		}
		return (
			<BlockListBlock
				{ ...props }
				className={ `${
					props.className || ''
				} ab-has-position ab-position-${ position }`.trim() }
				wrapperProps={ {
					...props.wrapperProps,
					style: {
						...( props.wrapperProps?.style || {} ),
						...style,
					},
				} }
			/>
		);
	},
	'withPositionPreview'
);

addFilter(
	'editor.BlockListBlock',
	'axiom-blocks/position-preview',
	withPreview
);
