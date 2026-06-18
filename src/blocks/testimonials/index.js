import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABTextControl,
	ABSubAccordion,
} from '../../components/ABControls';
import {
	SpacingPanel,
	SpacingControl,
	getSpacingStyle,
} from '../../components/SpacingPanel';
import { TypographyPanel } from '../../components/TypographyPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/testimonial' ];
const TEMPLATE = [
	[
		'axiom-blocks/testimonial',
		{
			quote: 'This is hands down the best plugin we have used — it saved our team hours every week.',
			name: 'Jane Cooper',
			role: 'Marketing Lead',
			company: 'Acme Inc',
			rating: 5,
			verified: true,
			sourcePlatform: 'google',
		},
	],
	[
		'axiom-blocks/testimonial',
		{
			quote: 'Beautifully designed and incredibly easy to set up. Support is responsive too.',
			name: 'Cody Fisher',
			role: 'Founder',
			company: 'Lumen',
			rating: 4.5,
		},
	],
	[
		'axiom-blocks/testimonial',
		{
			quote: 'A genuine time-saver. The carousel looks great on every device.',
			name: 'Esther Howard',
			role: 'Product Designer',
			rating: 5,
		},
	],
];

const TYPO_GROUPS = [
	[ 'name', __( 'Name', 'axiom-blocks' ) ],
	[ 'role', __( 'Role', 'axiom-blocks' ) ],
	[ 'company', __( 'Company', 'axiom-blocks' ) ],
	[ 'quote', __( 'Quote', 'axiom-blocks' ) ],
];

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

const TYPO_PROPS = [
	[ 'ff', 'FontFamily' ],
	[ 'fw', 'FontWeight' ],
	[ 'fs', 'FontSize' ],
	[ 'lh', 'LineHeight' ],
	[ 'ls', 'LetterSpacing' ],
	[ 'tt', 'TextTransform' ],
	[ 'td', 'TextDecoration' ],
	[ 'ta', 'TextAlign' ],
];
const TYPO_SHORT = { name: 'name', role: 'role', company: 'comp', quote: 'quote' };

export function getTestimonialsVars( attributes ) {
	const vars = {
		'--ab-tst-cols': attributes.columns || undefined,
		'--ab-tst-gap': attributes.gap || undefined,
		'--ab-tst-card-bg': attributes.cardBg || undefined,
		'--ab-tst-card-bc': attributes.cardBorderColor || undefined,
		'--ab-tst-card-bw': attributes.cardBorderWidth || undefined,
		'--ab-tst-card-radius': attributes.cardRadius || undefined,
		'--ab-tst-card-pt': attributes.cardPaddingTop || undefined,
		'--ab-tst-card-pr': attributes.cardPaddingRight || undefined,
		'--ab-tst-card-pb': attributes.cardPaddingBottom || undefined,
		'--ab-tst-card-pl': attributes.cardPaddingLeft || undefined,
		'--ab-tst-avatar-size': attributes.avatarSize || undefined,
		'--ab-tst-rating': attributes.ratingColor || undefined,
		'--ab-tst-quote-icon': attributes.quoteIconColor || undefined,
		'--ab-tst-clamp': attributes.readMoreLines || undefined,
		'--ab-tst-marquee-time': attributes.marqueeSpeed || undefined,
		'--ab-tst-name-color': attributes.nameColor || undefined,
		'--ab-tst-role-color': attributes.roleColor || undefined,
		'--ab-tst-comp-color': attributes.companyColor || undefined,
		'--ab-tst-quote-color': attributes.quoteColor || undefined,
	};
	Object.entries( TYPO_SHORT ).forEach( ( [ prefix, short ] ) => {
		TYPO_PROPS.forEach( ( [ css, suffix ] ) => {
			const val = attributes[ `${ prefix }${ suffix }` ];
			if ( val ) {
				vars[ `--ab-tst-${ short }-${ css }` ] = val;
			}
		} );
	} );
	return vars;
}

export function getTestimonialsClasses( attributes ) {
	const {
		layout,
		avatarPosition,
		avatarShape,
		stackOnMobile,
		cardShadow,
		showRating,
		showQuoteIcon,
		readMore,
	} = attributes;
	return [
		'ab-testimonials',
		`ab-testimonials--${ layout || 'grid' }`,
		`ab-testimonials--avatar-${ avatarPosition || 'top' }`,
		`ab-testimonials--shape-${ avatarShape || 'circle' }`,
		stackOnMobile ? 'is-stack-mobile' : '',
		cardShadow ? 'has-shadow' : '',
		showRating ? '' : 'no-rating',
		showQuoteIcon ? '' : 'no-quote-icon',
		readMore ? 'has-readmore' : '',
	].filter( Boolean );
}

function TestimonialsEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'testimonials' ) ) {
		return <DisabledBlockMessage blockName="Testimonials" />;
	}

	const {
		layout,
		columns,
		gap,
		stackOnMobile,
		autoplay,
		autoplaySpeed,
		loop,
		pauseOnHover,
		showArrows,
		showDots,
		slideSpeed,
		marqueeSpeed,
		marqueeReverse,
		marqueePauseOnHover,
		cardBg,
		cardBorderColor,
		cardBorderWidth,
		cardRadius,
		cardShadow,
		avatarPosition,
		avatarShape,
		avatarSize,
		showRating,
		ratingColor,
		showQuoteIcon,
		quoteIconColor,
		readMore,
		readMoreLines,
		reviewSchema,
		itemName,
		nameColor,
		roleColor,
		companyColor,
		quoteColor,
	} = attributes;

	const blockProps = useBlockProps( {
		className: getTestimonialsClasses( attributes ).join( ' ' ),
		style: {
			...getTestimonialsVars( attributes ),
			...getSpacingStyle( attributes ),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Layout', 'axiom-blocks' ) }
						value={ layout || 'grid' }
						options={ [
							{
								label: __( 'Grid', 'axiom-blocks' ),
								value: 'grid',
							},
							{
								label: __( 'Carousel', 'axiom-blocks' ),
								value: 'carousel',
							},
							{
								label: __( 'Marquee', 'axiom-blocks' ),
								value: 'marquee',
							},
						] }
						onChange={ ( v ) => setAttributes( { layout: v } ) }
					/>
					<ABRangeControl
						label={
							'marquee' === layout
								? __( 'Cards in view', 'axiom-blocks' )
								: __( 'Columns', 'axiom-blocks' )
						}
						value={ columns ?? 3 }
						onChange={ ( v ) =>
							setAttributes( { columns: v ?? 1 } )
						}
						min={ 1 }
						max={ 5 }
						step={ 1 }
						unit=""
					/>
					<ABRangeControl
						label={ __( 'Gap', 'axiom-blocks' ) }
						value={ fromPx( gap, 24 ) }
						onChange={ ( v ) => setAttributes( { gap: toPx( v ) } ) }
						min={ 0 }
						max={ 80 }
						step={ 1 }
						unit="px"
					/>
					{ 'grid' === layout && (
						<ABToggleControl
							label={ __( 'Stack on mobile', 'axiom-blocks' ) }
							checked={ !! stackOnMobile }
							onChange={ ( v ) =>
								setAttributes( { stackOnMobile: v } )
							}
						/>
					) }
				</PanelBody>

				{ 'carousel' === layout && (
					<PanelBody
						title={ __( 'Carousel', 'axiom-blocks' ) }
						initialOpen={ false }
					>
						<ABToggleControl
							label={ __( 'Autoplay', 'axiom-blocks' ) }
							checked={ !! autoplay }
							onChange={ ( v ) =>
								setAttributes( { autoplay: v } )
							}
						/>
						{ autoplay && (
							<ABRangeControl
								label={ __(
									'Autoplay delay',
									'axiom-blocks'
								) }
								value={ autoplaySpeed ?? 4000 }
								onChange={ ( v ) =>
									setAttributes( {
										autoplaySpeed: v ?? 0,
									} )
								}
								min={ 1000 }
								max={ 10000 }
								step={ 250 }
								unit="ms"
							/>
						) }
						<ABRangeControl
							label={ __( 'Transition speed', 'axiom-blocks' ) }
							value={ slideSpeed ?? 500 }
							onChange={ ( v ) =>
								setAttributes( { slideSpeed: v ?? 0 } )
							}
							min={ 100 }
							max={ 1500 }
							step={ 50 }
							unit="ms"
						/>
						<ABToggleControl
							label={ __( 'Loop', 'axiom-blocks' ) }
							checked={ !! loop }
							onChange={ ( v ) => setAttributes( { loop: v } ) }
						/>
						<ABToggleControl
							label={ __( 'Pause on hover', 'axiom-blocks' ) }
							checked={ !! pauseOnHover }
							onChange={ ( v ) =>
								setAttributes( { pauseOnHover: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Show arrows', 'axiom-blocks' ) }
							checked={ !! showArrows }
							onChange={ ( v ) =>
								setAttributes( { showArrows: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Show dots', 'axiom-blocks' ) }
							checked={ !! showDots }
							onChange={ ( v ) =>
								setAttributes( { showDots: v } )
							}
						/>
					</PanelBody>
				) }

				{ 'marquee' === layout && (
					<PanelBody
						title={ __( 'Marquee', 'axiom-blocks' ) }
						initialOpen={ false }
					>
						<ABRangeControl
							label={ __( 'Scroll duration', 'axiom-blocks' ) }
							help={ __(
								'Seconds for one full loop. Lower = faster.',
								'axiom-blocks'
							) }
							value={ marqueeSpeed ?? 30 }
							onChange={ ( v ) =>
								setAttributes( { marqueeSpeed: v ?? 1 } )
							}
							min={ 5 }
							max={ 120 }
							step={ 1 }
							unit="s"
						/>
						<ABToggleControl
							label={ __( 'Reverse direction', 'axiom-blocks' ) }
							checked={ !! marqueeReverse }
							onChange={ ( v ) =>
								setAttributes( { marqueeReverse: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Pause on hover', 'axiom-blocks' ) }
							checked={ !! marqueePauseOnHover }
							onChange={ ( v ) =>
								setAttributes( { marqueePauseOnHover: v } )
							}
						/>
					</PanelBody>
				) }

				<PanelBody
					title={ __( 'Card', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ cardBg }
						onChange={ ( v ) => setAttributes( { cardBg: v } ) }
					/>
					<ABColorControl
						label={ __( 'Border', 'axiom-blocks' ) }
						color={ cardBorderColor }
						onChange={ ( v ) =>
							setAttributes( { cardBorderColor: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Border width', 'axiom-blocks' ) }
						value={ fromPx( cardBorderWidth, 1 ) }
						onChange={ ( v ) =>
							setAttributes( { cardBorderWidth: toPx( v ) } )
						}
						min={ 0 }
						max={ 6 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Corner radius', 'axiom-blocks' ) }
						value={ fromPx( cardRadius, 12 ) }
						onChange={ ( v ) =>
							setAttributes( { cardRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 40 }
						step={ 1 }
						unit="px"
					/>
					<ABToggleControl
						label={ __( 'Drop shadow', 'axiom-blocks' ) }
						checked={ !! cardShadow }
						onChange={ ( v ) =>
							setAttributes( { cardShadow: v } )
						}
					/>
					<SpacingControl
						label={ __( 'Padding', 'axiom-blocks' ) }
						type="cardPadding"
						attrs={ attributes }
						onChange={ ( update ) => setAttributes( update ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Avatar', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Position', 'axiom-blocks' ) }
						value={ avatarPosition || 'top' }
						options={ [
							{
								label: __( 'Top', 'axiom-blocks' ),
								value: 'top',
							},
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { avatarPosition: v } )
						}
					/>
					<ABSelectControl
						label={ __( 'Shape', 'axiom-blocks' ) }
						value={ avatarShape || 'circle' }
						options={ [
							{
								label: __( 'Circle', 'axiom-blocks' ),
								value: 'circle',
							},
							{
								label: __( 'Rounded', 'axiom-blocks' ),
								value: 'rounded',
							},
							{
								label: __( 'Square', 'axiom-blocks' ),
								value: 'square',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { avatarShape: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Size', 'axiom-blocks' ) }
						value={ fromPx( avatarSize, 48 ) }
						onChange={ ( v ) =>
							setAttributes( { avatarSize: toPx( v ) } )
						}
						min={ 28 }
						max={ 96 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Rating', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show rating', 'axiom-blocks' ) }
						checked={ !! showRating }
						onChange={ ( v ) =>
							setAttributes( { showRating: v } )
						}
					/>
					{ showRating && (
						<ABColorControl
							label={ __( 'Star colour', 'axiom-blocks' ) }
							color={ ratingColor }
							onChange={ ( v ) =>
								setAttributes( { ratingColor: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Quote icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show quote icon', 'axiom-blocks' ) }
						checked={ !! showQuoteIcon }
						onChange={ ( v ) =>
							setAttributes( { showQuoteIcon: v } )
						}
					/>
					{ showQuoteIcon && (
						<ABColorControl
							label={ __( 'Colour', 'axiom-blocks' ) }
							color={ quoteIconColor }
							onChange={ ( v ) =>
								setAttributes( { quoteIconColor: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Read more', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Clamp long quotes', 'axiom-blocks' ) }
						help={ __(
							'Truncate quotes past a line limit with a Read more toggle.',
							'axiom-blocks'
						) }
						checked={ !! readMore }
						onChange={ ( v ) => setAttributes( { readMore: v } ) }
					/>
					{ readMore && (
						<ABRangeControl
							label={ __( 'Lines', 'axiom-blocks' ) }
							value={ readMoreLines ?? 4 }
							onChange={ ( v ) =>
								setAttributes( { readMoreLines: v ?? 1 } )
							}
							min={ 2 }
							max={ 10 }
							step={ 1 }
							unit=""
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Review schema', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Output review schema', 'axiom-blocks' ) }
						help={ __(
							'Add schema.org Review + AggregateRating structured data. Use only for genuine customer reviews.',
							'axiom-blocks'
						) }
						checked={ !! reviewSchema }
						onChange={ ( v ) =>
							setAttributes( { reviewSchema: v } )
						}
					/>
					{ reviewSchema && (
						<ABTextControl
							label={ __(
								'Product / service name',
								'axiom-blocks'
							) }
							help={ __(
								'What is being reviewed. Leave blank to use the site name.',
								'axiom-blocks'
							) }
							value={ itemName }
							onChange={ ( v ) =>
								setAttributes( { itemName: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Text colours', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Name', 'axiom-blocks' ) }
						color={ nameColor }
						onChange={ ( v ) => setAttributes( { nameColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Role', 'axiom-blocks' ) }
						color={ roleColor }
						onChange={ ( v ) => setAttributes( { roleColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Company', 'axiom-blocks' ) }
						color={ companyColor }
						onChange={ ( v ) =>
							setAttributes( { companyColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Quote', 'axiom-blocks' ) }
						color={ quoteColor }
						onChange={ ( v ) => setAttributes( { quoteColor: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						{ TYPO_GROUPS.map( ( [ prefix, label ] ) => (
							<ABSubAccordion key={ prefix } title={ label }>
								<TypographyPanel
									attributes={ attributes }
									setAttributes={ setAttributes }
									prefix={ prefix }
									unwrapped
								/>
							</ABSubAccordion>
						) ) }
					</div>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export const Testimonials = {
	name: 'axiom-blocks/testimonials',
	settings: {
		title: __( 'Testimonials', 'axiom-blocks' ),
		description: __(
			'Social-proof testimonials in a grid, carousel, or marquee with ratings, avatars, and review schema.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="testimonials" />,
		edit: TestimonialsEdit,
		save: () => <InnerBlocks.Content />,
	},
};
