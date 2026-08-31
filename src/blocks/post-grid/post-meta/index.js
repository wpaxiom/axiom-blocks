import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import {
	ABToggleControl,
	ABTextControl,
	ABRangeControl,
	ABSubAccordion,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useTypographyStyle } from '../../../components/TypographyPanel';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { ICON_LIBRARY } from '../../../components/iconLibrary';
import { BlockIcon } from '../../../blockIcons';

/* Fixed glyph per field — this is a default set, not a picker, so it does not
 * go through IconControl. Slugs verified present in the shared library. */
const FIELD_ICONS = {
	author: 'user',
	date: 'calendar',
	updated: 'refresh-cw',
	comments: 'message-circle',
	readTime: 'clock',
};

const DESIGN = {
	block: 'pc-meta',
	targets: [
		{
			noun: __( 'Meta', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Author', 'axiom-blocks' ),
					bind: 'authorColor',
					fallback: '#6b7280',
				},
				{
					label: __( 'Date', 'axiom-blocks' ),
					bind: 'dateColor',
					fallback: '#6b7280',
				},
				{
					label: __( 'Comments', 'axiom-blocks' ),
					bind: 'commentsColor',
					fallback: '#6b7280',
				},
				{
					label: __( 'Separator', 'axiom-blocks' ),
					bind: 'separatorColor',
					fallback: '#9ca3af',
					static: true,
				},
				{
					label: __( 'Icon', 'axiom-blocks' ),
					bind: 'metaIconColor',
					fallback: '#9ca3af',
				},
			],
			typography: '',
			ranges: [
				{
					bind: 'iconSize',
					label: __( 'Icon size', 'axiom-blocks' ),
					min: 8,
					max: 32,
					default: 14,
					responsive: true,
				},
				{
					bind: 'itemGap',
					label: __( 'Gap', 'axiom-blocks' ),
					min: 0,
					max: 32,
					default: 12,
				},
			],
		},
	],
};

function PostMetaEdit( { attributes, setAttributes, context } ) {
	const {
		showAuthor,
		showDate,
		showUpdated,
		showComments,
		showReadTime,
		authorLabel,
		dateLabel,
		updatedLabel,
		commentsLabel,
		readTimeLabel,
		wordsPerMinute,
		showAvatar,
		avatarSize,
		authorLink,
		showIcons,
		separator,
		itemGap,
		iconSize,
	} = attributes;
	const postId = context?.postId;
	const postType = context?.postType;

	const authorName = useSelect(
		( select ) => {
			if ( ! postId || ! postType ) {
				return null;
			}
			const record = select( coreStore ).getEntityRecord(
				'postType',
				postType,
				postId
			);
			if ( ! record?.author ) {
				return null;
			}
			const user = select( coreStore ).getEntityRecord(
				'root',
				'user',
				record.author
			);
			return user?.name || null;
		},
		[ postId, postType ]
	);

	const typographyStyle = useTypographyStyle( attributes, '' );
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: [ 'ab-pc__meta', showIcons ? 'has-icons' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...typographyStyle,
			...spacingStyle,
			'--ab-pc-meta-gap': itemGap || undefined,
			'--ab-pc-meta-icon-size': iconSize || undefined,
			'--ab-pc-meta-avatar-size': avatarSize || undefined,
		},
	} );

	const items = [];
	if ( showAuthor ) {
		items.push( {
			key: 'author',
			label: authorLabel,
			value: authorName || __( 'Author name', 'axiom-blocks' ),
		} );
	}
	if ( showDate ) {
		items.push( {
			key: 'date',
			label: dateLabel,
			value: __( 'January 1, 2026', 'axiom-blocks' ),
		} );
	}
	if ( showUpdated ) {
		items.push( {
			key: 'updated',
			label: updatedLabel,
			value: __( 'February 3, 2026', 'axiom-blocks' ),
		} );
	}
	if ( showComments ) {
		items.push( {
			key: 'comments',
			label: commentsLabel,
			value: __( '4 comments', 'axiom-blocks' ),
		} );
	}
	if ( showReadTime ) {
		items.push( {
			key: 'readTime',
			label: readTimeLabel,
			value: __( '6 min read', 'axiom-blocks' ),
		} );
	}

	const leading = (
		<PanelBody title={ __( 'Fields', 'axiom-blocks' ) } initialOpen>
			<ABSubAccordion title={ __( 'Author', 'axiom-blocks' ) }>
				<ABToggleControl
					label={ __( 'Show author', 'axiom-blocks' ) }
					checked={ !! showAuthor }
					onChange={ ( v ) => setAttributes( { showAuthor: v } ) }
				/>
				{ showAuthor && (
					<>
						<ABTextControl
							label={ __( 'Label', 'axiom-blocks' ) }
							help={ __( 'For example "By".', 'axiom-blocks' ) }
							value={ authorLabel }
							onChange={ ( v ) =>
								setAttributes( { authorLabel: v } )
							}
						/>
						<ABToggleControl
							label={ __(
								'Link to author archive',
								'axiom-blocks'
							) }
							checked={ !! authorLink }
							onChange={ ( v ) =>
								setAttributes( { authorLink: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Show avatar', 'axiom-blocks' ) }
							checked={ !! showAvatar }
							onChange={ ( v ) =>
								setAttributes( { showAvatar: v } )
							}
						/>
						{ showAvatar && (
							<ABRangeControl
								label={ __( 'Avatar size', 'axiom-blocks' ) }
								value={ parseInt( avatarSize, 10 ) || 20 }
								onChange={ ( v ) =>
									setAttributes( { avatarSize: `${ v }px` } )
								}
								min={ 12 }
								max={ 64 }
								unit="px"
							/>
						) }
					</>
				) }
			</ABSubAccordion>

			<ABSubAccordion title={ __( 'Dates', 'axiom-blocks' ) }>
				<ABToggleControl
					label={ __( 'Show published date', 'axiom-blocks' ) }
					checked={ !! showDate }
					onChange={ ( v ) => setAttributes( { showDate: v } ) }
				/>
				{ showDate && (
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						help={ __( 'For example "on".', 'axiom-blocks' ) }
						value={ dateLabel }
						onChange={ ( v ) => setAttributes( { dateLabel: v } ) }
					/>
				) }
				<ABToggleControl
					label={ __( 'Show updated date', 'axiom-blocks' ) }
					help={ __(
						'Only appears when the post was edited after publishing.',
						'axiom-blocks'
					) }
					checked={ !! showUpdated }
					onChange={ ( v ) => setAttributes( { showUpdated: v } ) }
				/>
				{ showUpdated && (
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						value={ updatedLabel }
						onChange={ ( v ) =>
							setAttributes( { updatedLabel: v } )
						}
					/>
				) }
			</ABSubAccordion>

			<ABSubAccordion title={ __( 'Comments', 'axiom-blocks' ) }>
				<ABToggleControl
					label={ __( 'Show comment count', 'axiom-blocks' ) }
					checked={ !! showComments }
					onChange={ ( v ) => setAttributes( { showComments: v } ) }
				/>
				{ showComments && (
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						value={ commentsLabel }
						onChange={ ( v ) =>
							setAttributes( { commentsLabel: v } )
						}
					/>
				) }
			</ABSubAccordion>

			<ABSubAccordion title={ __( 'Read time', 'axiom-blocks' ) }>
				<ABToggleControl
					label={ __( 'Show read time', 'axiom-blocks' ) }
					checked={ !! showReadTime }
					onChange={ ( v ) => setAttributes( { showReadTime: v } ) }
				/>
				{ showReadTime && (
					<>
						<ABTextControl
							label={ __( 'Label', 'axiom-blocks' ) }
							value={ readTimeLabel }
							onChange={ ( v ) =>
								setAttributes( { readTimeLabel: v } )
							}
						/>
						<ABRangeControl
							label={ __( 'Words per minute', 'axiom-blocks' ) }
							value={ wordsPerMinute || 200 }
							onChange={ ( v ) =>
								setAttributes( { wordsPerMinute: v } )
							}
							min={ 100 }
							max={ 400 }
							step={ 10 }
							unit=""
						/>
					</>
				) }
			</ABSubAccordion>

			<ABToggleControl
				label={ __( 'Show icons', 'axiom-blocks' ) }
				checked={ !! showIcons }
				onChange={ ( v ) => setAttributes( { showIcons: v } ) }
			/>
			<ABTextControl
				label={ __( 'Separator', 'axiom-blocks' ) }
				value={ separator }
				onChange={ ( v ) => setAttributes( { separator: v } ) }
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
			<div { ...blockProps }>
				{ items.length === 0 && (
					<span className="ab-pc__meta-empty">
						{ __( 'No meta fields switched on.', 'axiom-blocks' ) }
					</span>
				) }
				{ items.map( ( item, i ) => (
					<span key={ item.key }>
						<span
							className={ `ab-pc__meta-item ab-pc__meta-item--${ item.key }` }
						>
							{ showIcons && (
								<span
									className="ab-pc__meta-icon"
									aria-hidden="true"
								>
									{ ICON_LIBRARY[ FIELD_ICONS[ item.key ] ] }
								</span>
							) }
							{ item.label && (
								<span className="ab-pc__meta-label">
									{ item.label }{ ' ' }
								</span>
							) }
							<span className="ab-pc__meta-value">
								{ item.value }
							</span>
						</span>
						{ separator && i < items.length - 1 && (
							<span
								className="ab-pc__meta-sep"
								aria-hidden="true"
							>
								{ separator }
							</span>
						) }
					</span>
				) ) }
			</div>
		</>
	);
}

export const PostMeta = {
	name: 'axiom-blocks/post-meta',
	settings: {
		title: __( 'Post Meta', 'axiom-blocks' ),
		description: __(
			'Author, date, comment count and read time, each with its own label and color.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-meta" />,
		edit: PostMetaEdit,
		save: () => null,
	},
};
