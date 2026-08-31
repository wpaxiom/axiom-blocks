import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const ALLOWED = null;

function PostCardEdit( { attributes } ) {
	const { cardRole } = attributes;
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: [ 'ab-pc', cardRole === 'featured' ? 'ab-pc--featured' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: spacingStyle,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		templateLock: false,
	} );

	return <div { ...innerBlocksProps } />;
}

export const PostCard = {
	name: 'axiom-blocks/post-card',
	settings: {
		title: __( 'Post Card', 'axiom-blocks' ),
		description: __(
			'The card template repeated for every post in a Post Grid. Holds any blocks.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-card" />,
		edit: PostCardEdit,
		save: () => <InnerBlocks.Content />,
	},
};
