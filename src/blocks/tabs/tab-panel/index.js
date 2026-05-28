import { __ } from '@wordpress/i18n';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';
import { BlockIcon } from '../../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../../components/DisabledBlockMessage';

function TabPanelEdit( { attributes, setAttributes, context, clientId } ) {
	if ( ! isBlockEnabled( 'tab-panel' ) ) {
		return <DisabledBlockMessage blockName="Tab Panel" />;
	}
	const { tabId } = attributes;
	const activeTab = context[ 'axiom-blocks/activeTab' ];
	const isActive = tabId && tabId === activeTab;

	// Self-assign a stable tabId if inserted without one (e.g., via the inserter).
	useEffect( () => {
		if ( ! tabId && clientId ) {
			setAttributes( { tabId: `tab-${ clientId.slice( 0, 8 ) }` } );
		}
	}, [ tabId, clientId, setAttributes ] );

	const blockProps = useBlockProps( {
		className: `axiom-blocks-tab-panel ${
			isActive ? 'is-active' : 'is-inactive'
		}`,
		'data-tab-id': tabId,
	} );

	return (
		<div { ...blockProps }>
			<InnerBlocks
				template={ [
					[
						'core/paragraph',
						{
							placeholder: __(
								'Add content to this tab…',
								'axiom-blocks'
							),
						},
					],
				] }
				templateLock={ false }
				renderAppender={
					isActive ? InnerBlocks.ButtonBlockAppender : false
				}
			/>
		</div>
	);
}

export const TabPanel = {
	name: 'axiom-blocks/tab-panel',
	settings: {
		title: __( 'Tab Panel', 'axiom-blocks' ),
		description: __( 'A panel inside the Tabs block.', 'axiom-blocks' ),
		icon: <BlockIcon slug="tab-panel" />,
		edit: TabPanelEdit,
		save: () => <InnerBlocks.Content />,
	},
};
