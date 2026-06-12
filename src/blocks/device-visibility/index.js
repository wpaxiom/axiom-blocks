/**
 * Device Visibility Block
 * Show or hide any block on desktop, tablet, or mobile
 */

import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, Notice } from '@wordpress/components';
import { ABToggleControl } from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

import './editor.scss';

/**
 * Block metadata
 */
export const DeviceVisibility = {
	name: 'axiom-blocks/device-visibility',
	settings: {
		title: __( 'Device Visibility', 'axiom-blocks' ),
		description: __(
			'Show or hide any block on desktop, tablet, or mobile.',
			'axiom-blocks'
		),
		category: 'axiom-blocks',
		icon: <BlockIcon slug="device-visibility" />,
		keywords: [
			__( 'visibility', 'axiom-blocks' ),
			__( 'responsive', 'axiom-blocks' ),
			__( 'mobile', 'axiom-blocks' ),
			__( 'desktop', 'axiom-blocks' ),
		],
		supports: {
			html: false,
			anchor: true,
			align: [ 'wide', 'full' ],
		},

		/**
		 * Edit component
		 * @param root0
		 * @param root0.attributes
		 * @param root0.setAttributes
		 */
		edit: function EditComponent( { attributes, setAttributes } ) {
			if ( ! isBlockEnabled( 'device-visibility' ) ) {
				return <DisabledBlockMessage blockName="Device Visibility" />;
			}
			const { showOnDesktop, showOnTablet, showOnMobile } = attributes;

			const blockProps = useBlockProps( {
				className: `wp-block-axiom-blocks-device-visibility
                    ${
						showOnDesktop
							? 'is-visible-desktop'
							: 'is-hidden-desktop'
					}
                    ${ showOnTablet ? 'is-visible-tablet' : 'is-hidden-tablet' }
                    ${ showOnMobile ? 'is-visible-mobile' : 'is-hidden-mobile' }
                `,
				style: getSpacingStyle( attributes ),
			} );

			// Check if all devices are hidden
			const allHidden =
				! showOnDesktop && ! showOnTablet && ! showOnMobile;

			return (
				<>
					<InspectorControls>
						<PanelBody
							title={ __(
								'Visibility Settings',
								'axiom-blocks'
							) }
							initialOpen={ true }
						>
							{ allHidden && (
								<Notice
									status="warning"
									isDismissible={ false }
									className="axiom-blocks-notice"
								>
									{ __(
										'Warning: This block is hidden on all devices.',
										'axiom-blocks'
									) }
								</Notice>
							) }
							<ABToggleControl
								label={ __(
									'Show on Desktop',
									'axiom-blocks'
								) }
								checked={ showOnDesktop }
								onChange={ ( value ) =>
									setAttributes( { showOnDesktop: value } )
								}
								help={ __(
									'Show this content on desktop screens (1025px and above)',
									'axiom-blocks'
								) }
							/>
							<ABToggleControl
								label={ __( 'Show on Tablet', 'axiom-blocks' ) }
								checked={ showOnTablet }
								onChange={ ( value ) =>
									setAttributes( { showOnTablet: value } )
								}
								help={ __(
									'Show this content on tablet screens (768px - 1024px)',
									'axiom-blocks'
								) }
							/>
							<ABToggleControl
								label={ __( 'Show on Mobile', 'axiom-blocks' ) }
								checked={ showOnMobile }
								onChange={ ( value ) =>
									setAttributes( { showOnMobile: value } )
								}
								help={ __(
									'Show this content on mobile screens (below 768px)',
									'axiom-blocks'
								) }
							/>
						</PanelBody>

						<SpacingPanel
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</InspectorControls>

					<div { ...blockProps }>
						<div className="axiom-blocks-visibility-label">
							<span className="axiom-blocks-visibility-icon">
								{ showOnDesktop && showOnTablet && showOnMobile
									? __(
											'Visible on all devices',
											'axiom-blocks'
									  )
									: __( 'Visibility: ', 'axiom-blocks' ) +
									  [
											showOnDesktop &&
												__( 'Desktop', 'axiom-blocks' ),
											showOnTablet &&
												__( 'Tablet', 'axiom-blocks' ),
											showOnMobile &&
												__( 'Mobile', 'axiom-blocks' ),
									  ]
											.filter( Boolean )
											.join( ', ' ) }
							</span>
						</div>
						<InnerBlocks />
					</div>
				</>
			);
		},

		/**
		 * Save component
		 * Uses server-side rendering (dynamic block)
		 */
		save: function SaveComponent() {
			return <InnerBlocks.Content />;
		},
	},
};
