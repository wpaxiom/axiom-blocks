import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const BOX_BW = [
	'boxBorderTopWidth',
	'boxBorderRightWidth',
	'boxBorderBottomWidth',
	'boxBorderLeftWidth',
];
const BOX_RADIUS = [
	'boxRadiusTopLeft',
	'boxRadiusTopRight',
	'boxRadiusBottomRight',
	'boxRadiusBottomLeft',
];

const TEMPLATE = [
	[ 'core/paragraph', { content: __( 'No posts found.', 'axiom-blocks' ) } ],
];

// Wrapper part: box capabilities only, never Typography. The inner blocks own
// their own text, which is the standing rule for InnerBlocks hosts.
const DESIGN = {
	block: 'pg-nr',
	targets: [
		{
			noun: __( 'Box', 'axiom-blocks' ),
			background: { bind: 'boxBg' },
			border: {
				widthKeys: BOX_BW,
				styleKey: 'boxBorderStyle',
				colorKey: 'boxBorderColor',
				max: 12,
			},
			radius: { keys: BOX_RADIUS, max: 64 },
			shadow: { bind: 'boxShadow' },
			padding: { type: 'boxPadding' },
		},
	],
};

function PostNoResultsEdit( { attributes, setAttributes } ) {
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: 'ab-pg__no-results',
		style: spacingStyle,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
			/>
			<div { ...innerBlocksProps } />
		</>
	);
}

export const PostNoResults = {
	name: 'axiom-blocks/post-no-results',
	settings: {
		title: __( 'No Results', 'axiom-blocks' ),
		description: __(
			'Shown inside a Post Grid when the query returns nothing. Holds any blocks.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-no-results" />,
		edit: PostNoResultsEdit,
		save: () => <InnerBlocks.Content />,
	},
};
