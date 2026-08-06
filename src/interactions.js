/**
 * Universal hover-interaction wiring (editor side).
 *
 * Injects `abHoverLift` + `abTransition` into every `axiom-blocks/*` block,
 * adds the ABInteractions control to their Advanced group, and mirrors the
 * `.ab-has-hover` class + CSS vars onto the editor block so the lift previews in
 * the canvas. Mirrors the PHP render_block filter (inc/Blocks/Interactions.php);
 * the `:hover` rule itself lives in style.scss.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { ABInteractions } from './components/ABInteractions';

const isTarget = ( name ) => !! name && name.indexOf( 'axiom-blocks/' ) === 0;

addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/interaction-attrs',
	( settings, name ) => {
		if ( ! isTarget( name ) ) {
			return settings;
		}
		const attrs = settings.attributes || {};
		const extra = {};
		if ( ! attrs.abHoverLift ) {
			extra.abHoverLift = { type: 'string', default: '' };
		}
		if ( ! attrs.abTransition ) {
			extra.abTransition = { type: 'string', default: '' };
		}
		if ( ! Object.keys( extra ).length ) {
			return settings;
		}
		return { ...settings, attributes: { ...attrs, ...extra } };
	}
);

const withControl = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isTarget( props.name ) ) {
			return <BlockEdit { ...props } />;
		}
		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls group="advanced">
					<ABInteractions
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				</InspectorControls>
			</Fragment>
		);
	},
	'withInteractionControl'
);

addFilter(
	'editor.BlockEdit',
	'axiom-blocks/interaction-control',
	withControl
);

const withPreview = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { name, attributes } = props;
		const lift = isTarget( name )
			? parseInt( attributes?.abHoverLift, 10 ) || 0
			: 0;
		if ( ! lift ) {
			return <BlockListBlock { ...props } />;
		}
		const style = {
			'--ab-hover-lift': `-${ lift }px`,
			'--ab-hover-tr': attributes.abTransition || '0.25s',
		};
		return (
			<BlockListBlock
				{ ...props }
				className={ `${ props.className || '' } ab-has-hover`.trim() }
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
	'withInteractionPreview'
);

addFilter(
	'editor.BlockListBlock',
	'axiom-blocks/interaction-preview',
	withPreview
);
