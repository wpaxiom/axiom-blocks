/**
 * Universal device-visibility wiring (editor side).
 *
 * Injects three boolean attributes (hideDesktop/hideTablet/hideMobile) into
 * every `axiom-blocks/*` block and adds the ABDeviceVisibility popover-row to
 * their native Advanced inspector group. Mirrors the PHP
 * register_block_type_args filter (inc/Blocks/DeviceVisibility.php) so the editor
 * can edit + save the values; the frontend hiding is done in PHP + the media
 * sheet in style.scss.
 *
 * The standalone Device Visibility block keeps its own showOn* controls, so it
 * is excluded here.
 */

import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { ABDeviceVisibility } from './components/ABDeviceVisibility';

const KEYS = [ 'hideDesktop', 'hideTablet', 'hideMobile' ];

const isTarget = ( name ) =>
	!! name &&
	name.indexOf( 'axiom-blocks/' ) === 0 &&
	name !== 'axiom-blocks/device-visibility';

addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/device-visibility-attrs',
	( settings, name ) => {
		if ( ! isTarget( name ) ) {
			return settings;
		}
		const attrs = settings.attributes || {};
		const extra = {};
		KEYS.forEach( ( key ) => {
			if ( ! attrs[ key ] ) {
				extra[ key ] = { type: 'boolean', default: false };
			}
		} );
		if ( ! Object.keys( extra ).length ) {
			return settings;
		}
		return { ...settings, attributes: { ...attrs, ...extra } };
	}
);

const withDeviceVisibility = createHigherOrderComponent(
	( BlockEdit ) => ( props ) => {
		if ( ! isTarget( props.name ) ) {
			return <BlockEdit { ...props } />;
		}
		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls group="advanced">
					<ABDeviceVisibility
						attributes={ props.attributes }
						setAttributes={ props.setAttributes }
					/>
				</InspectorControls>
			</Fragment>
		);
	},
	'withDeviceVisibility'
);

addFilter(
	'editor.BlockEdit',
	'axiom-blocks/device-visibility-control',
	withDeviceVisibility
);
