import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useTypographyStyle } from '../../../components/TypographyPanel';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';

const TAGS = [
	{ label: 'H1', value: 'h1' },
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
	{ label: 'P', value: 'p' },
];

const DESIGN = {
	block: 'pc-title',
	targets: [
		{
			noun: __( 'Title', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'titleColor',
					fallback: '#111827',
				},
			],
			typography: '',
		},
	],
};

function PostTitleEdit( { attributes, setAttributes, context } ) {
	const { tagName, isLink, linkTarget, cropWords, titleColor } = attributes;
	const postId = context?.postId;
	const postType = context?.postType;

	const rawTitle = useSelect(
		( select ) => {
			if ( ! postId || ! postType ) {
				return null;
			}
			const record = select( coreStore ).getEntityRecord(
				'postType',
				postType,
				postId
			);
			return record?.title?.rendered ?? record?.title ?? null;
		},
		[ postId, postType ]
	);

	const typographyStyle = useTypographyStyle( attributes, '' );
	const spacingStyle = useSpacingStyle( attributes );

	const Tag = tagName || 'h3';
	const blockProps = useBlockProps( {
		className: 'ab-pc__title',
		style: {
			...typographyStyle,
			...spacingStyle,
			'--ab-pc-title-color': titleColor || undefined,
			color: titleColor || undefined,
		},
	} );

	let label = rawTitle;
	if ( ! label ) {
		label = __( 'Post title', 'axiom-blocks' );
	} else if ( cropWords > 0 ) {
		const words = label.split( /\s+/ );
		if ( words.length > cropWords ) {
			label = words.slice( 0, cropWords ).join( ' ' ) + '…';
		}
	}

	const leading = (
		<PanelBody title={ __( 'Title', 'axiom-blocks' ) } initialOpen>
			<ABSelectControl
				label={ __( 'Tag', 'axiom-blocks' ) }
				value={ tagName }
				options={ TAGS }
				onChange={ ( v ) => setAttributes( { tagName: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Link to post', 'axiom-blocks' ) }
				checked={ !! isLink }
				onChange={ ( v ) => setAttributes( { isLink: v } ) }
			/>
			{ isLink && (
				<ABToggleControl
					label={ __( 'Open in new tab', 'axiom-blocks' ) }
					checked={ linkTarget === '_blank' }
					onChange={ ( v ) =>
						setAttributes( { linkTarget: v ? '_blank' : '' } )
					}
				/>
			) }
			<ABRangeControl
				label={ __( 'Crop after words', 'axiom-blocks' ) }
				help={ __( '0 keeps the full title.', 'axiom-blocks' ) }
				value={ cropWords || 0 }
				onChange={ ( v ) => setAttributes( { cropWords: v } ) }
				min={ 0 }
				max={ 30 }
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
			<Tag { ...blockProps }>{ label }</Tag>
		</>
	);
}

export const PostTitle = {
	name: 'axiom-blocks/post-title',
	settings: {
		title: __( 'Post Title', 'axiom-blocks' ),
		description: __(
			"The post's title, inside a Post Card or any post template.",
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-title" />,
		edit: PostTitleEdit,
		save: () => null,
	},
};
