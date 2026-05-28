import { __ } from '@wordpress/i18n';
import {
	PanelBody,
	__experimentalBoxControl as BoxControl,
} from '@wordpress/components';

/**
 * Shared attributes every block must declare in block.json to use StylesPanel.
 * Spread this into block.json manually (JSON can't import JS).
 *
 * {
 *   "paddingTop": { "type": "string", "default": "" },
 *   ...
 * }
 */
export const SPACING_ATTRIBUTES_KEYS = [
	'paddingTop',
	'paddingRight',
	'paddingBottom',
	'paddingLeft',
	'marginTop',
	'marginRight',
	'marginBottom',
	'marginLeft',
];

export function getSpacingStyle( attributes ) {
	const style = {};
	const map = {
		paddingTop: 'paddingTop',
		paddingRight: 'paddingRight',
		paddingBottom: 'paddingBottom',
		paddingLeft: 'paddingLeft',
		marginTop: 'marginTop',
		marginRight: 'marginRight',
		marginBottom: 'marginBottom',
		marginLeft: 'marginLeft',
	};
	for ( const key in map ) {
		const val = attributes[ key ];
		if ( val ) style[ map[ key ] ] = val;
	}
	return style;
}

export function StylesPanel( {
	attributes,
	setAttributes,
	initialOpen = false,
} ) {
	const padding = {
		top: attributes.paddingTop || undefined,
		right: attributes.paddingRight || undefined,
		bottom: attributes.paddingBottom || undefined,
		left: attributes.paddingLeft || undefined,
	};
	const margin = {
		top: attributes.marginTop || undefined,
		right: attributes.marginRight || undefined,
		bottom: attributes.marginBottom || undefined,
		left: attributes.marginLeft || undefined,
	};

	return (
		<PanelBody
			title={ __( 'Spacing', 'axiom-blocks' ) }
			initialOpen={ initialOpen }
		>
			<BoxControl
				label={ __( 'Padding', 'axiom-blocks' ) }
				values={ padding }
				onChange={ ( v ) =>
					setAttributes( {
						paddingTop: v?.top || '',
						paddingRight: v?.right || '',
						paddingBottom: v?.bottom || '',
						paddingLeft: v?.left || '',
					} )
				}
			/>
			<BoxControl
				label={ __( 'Margin', 'axiom-blocks' ) }
				values={ margin }
				onChange={ ( v ) =>
					setAttributes( {
						marginTop: v?.top || '',
						marginRight: v?.right || '',
						marginBottom: v?.bottom || '',
						marginLeft: v?.left || '',
					} )
				}
			/>
		</PanelBody>
	);
}
