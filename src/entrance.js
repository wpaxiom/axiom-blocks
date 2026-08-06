/**
 * Universal entrance-animation wiring (editor side).
 *
 * Injects `abEntrance` into every `axiom-blocks/*` block and adds the ABEntrance
 * control to their Advanced group. Mirrors the PHP render_block filter
 * (inc/Blocks/Entrance.php); the CSS-only reveal lives in style.scss. No editor
 * canvas preview.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { ABEntrance } from './components/ABEntrance';

const isTarget = ( name ) => !! name && name.indexOf( 'axiom-blocks/' ) === 0;

addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/entrance-attrs',
	( settings, name ) => {
		if ( ! isTarget( name ) ) {
			return settings;
		}
		const attrs = settings.attributes || {};
		if ( attrs.abEntrance ) {
			return settings;
		}
		return {
			...settings,
			attributes: {
				...attrs,
				abEntrance: { type: 'string', default: '' },
			},
		};
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
					<ABEntrance
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				</InspectorControls>
			</Fragment>
		);
	},
	'withEntranceControl'
);

addFilter( 'editor.BlockEdit', 'axiom-blocks/entrance-control', withControl );
