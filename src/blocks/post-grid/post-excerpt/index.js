import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { ABRangeControl, ABTextControl } from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useTypographyStyle } from '../../../components/TypographyPanel';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const PLACEHOLDER = __(
	'The post excerpt appears here. Set its length, clamp it to a fixed number of lines, and style it like any other text part.',
	'axiom-blocks'
);

const DESIGN = {
	block: 'pc-excerpt',
	targets: [
		{
			noun: __( 'Text', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'excerptColor',
					fallback: '#4b5563',
				},
			],
			typography: '',
		},
	],
};

function PostExcerptEdit( { attributes, setAttributes, context } ) {
	const { excerptLength, indicator, clampLines, excerptColor } = attributes;
	const postId = context?.postId;
	const postType = context?.postType;

	const raw = useSelect(
		( select ) => {
			if ( ! postId || ! postType ) {
				return null;
			}
			const record = select( coreStore ).getEntityRecord(
				'postType',
				postType,
				postId
			);
			if ( ! record ) {
				return null;
			}
			const excerpt = record.excerpt?.raw || record.excerpt?.rendered;
			const body = record.content?.raw || '';
			return ( excerpt || body ).replace( /<[^>]*>/g, '' ).trim();
		},
		[ postId, postType ]
	);

	const typographyStyle = useTypographyStyle( attributes, '' );
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: [ 'ab-pc__excerpt', clampLines > 0 ? 'is-clamped' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...typographyStyle,
			...spacingStyle,
			'--ab-pc-excerpt-clamp': clampLines > 0 ? clampLines : undefined,
			color: excerptColor || undefined,
		},
	} );

	const source = raw || PLACEHOLDER;
	const words = source.split( /\s+/ );
	const text =
		words.length > ( excerptLength || 20 )
			? words.slice( 0, excerptLength || 20 ).join( ' ' ) +
			  ( indicator || '…' )
			: source;

	const leading = (
		<PanelBody title={ __( 'Excerpt', 'axiom-blocks' ) } initialOpen>
			<ABRangeControl
				label={ __( 'Length in words', 'axiom-blocks' ) }
				value={ excerptLength || 20 }
				onChange={ ( v ) => setAttributes( { excerptLength: v } ) }
				min={ 5 }
				max={ 100 }
				unit=""
			/>
			<ABTextControl
				label={ __( 'Trim indicator', 'axiom-blocks' ) }
				value={ indicator }
				onChange={ ( v ) => setAttributes( { indicator: v } ) }
			/>
			<ABRangeControl
				label={ __( 'Clamp to lines', 'axiom-blocks' ) }
				help={ __(
					'0 lets the excerpt run to its full length. Any other value keeps every card the same height.',
					'axiom-blocks'
				) }
				value={ clampLines || 0 }
				onChange={ ( v ) => setAttributes( { clampLines: v } ) }
				min={ 0 }
				max={ 10 }
				unit=""
			/>
		</PanelBody>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ leading }
			/>
			<p { ...blockProps }>{ text }</p>
		</>
	);
}

export const PostExcerpt = {
	name: 'axiom-blocks/post-excerpt',
	settings: {
		title: __( 'Post Excerpt', 'axiom-blocks' ),
		description: __(
			"The post's excerpt, inside a Post Card or any post template.",
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-excerpt" />,
		edit: PostExcerptEdit,
		save: () => null,
	},
};
