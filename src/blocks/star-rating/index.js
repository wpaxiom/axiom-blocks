import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABRangeControl,
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import {
	useDeviceType,
	resolveResponsive,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveAlignValue,
	ALIGN_FLEX_MAP,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

const FILLED_DEFAULT = '#fbbf24';
const EMPTY_DEFAULT = '#e5e7eb';
const TEXT_DEFAULT = '#4b5563';

/* Anatomy-as-declaration — two parts: the Stars row and the Labels (meta) text.
 *
 * ⚠️ The audit's "Silence test": there is deliberately NO border / radius /
 * shadow / size key here. A star row should not grow a box just because the
 * capability stack exists — this block is the proof that the system only renders
 * what a part actually declares. Do not add them.
 *
 * Pure re-home: every binding is a shipped attribute, no new attrs, no new vars,
 * render.php and style.scss are untouched. Static — no states, ever. */
const designFor = ( { showValue, showCount } ) => ( {
	block: 'star',
	targets: [
		{
			noun: __( 'Stars', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Filled', 'axiom-blocks' ),
					bind: 'filledColor',
					fallback: FILLED_DEFAULT,
				},
				{
					label: __( 'Empty', 'axiom-blocks' ),
					bind: 'emptyColor',
					fallback: EMPTY_DEFAULT,
				},
			],
			ranges: [
				{
					bind: 'starSize',
					label: __( 'Size', 'axiom-blocks' ),
					min: 10,
					max: 80,
					default: 20,
					responsive: true,
				},
			],
		},
		// The meta row only renders when there is something to show, so its part
		// section follows it — matching the shipped panel's conditional rows.
		...( showValue || showCount
			? [
					{
						noun: __( 'Labels', 'axiom-blocks' ),
						colors: [
							{
								label: __( 'Text', 'axiom-blocks' ),
								bind: 'textColor',
								fallback: TEXT_DEFAULT,
							},
						],
						typography: 'meta',
					},
			  ]
			: [] ),
	],
} );

/* Star size stores a px string ('' = inherit). */
const StarSVG = ( { size, color } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill={ color }
		aria-hidden="true"
		style={ { display: 'block', flexShrink: 0 } }
	>
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
	</svg>
);

function clampRating( value, max, precision ) {
	const v = Math.max( 0, Math.min( max, Number( value ) || 0 ) );
	if ( precision === 'full' ) return Math.round( v );
	if ( precision === 'half' ) return Math.round( v * 2 ) / 2;
	return v;
}

function StarRatingEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'star-rating' ) ) {
		return <DisabledBlockMessage blockName="Star Rating" />;
	}
	const {
		rating,
		maxStars,
		filledColor,
		emptyColor,
		precision,
		showValue,
		showCount,
		reviewCount,
		countLabel,
		textColor,
	} = attributes;

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'alignment' ],
		device
	);
	// Active device's star size (cascade) for the canvas preview.
	const resolvedStarSize =
		resolveResponsive( attributes, 'starSize', device ) || '20px';
	const blockProps = useBlockProps( {
		className: `axiom-blocks-star-rating axiom-blocks-star-rating--align-${ resolved.alignment }`,
		style: {
			...useSpacingStyle( attributes ),
			justifyContent: responsiveAlignValue(
				attributes,
				'alignment',
				device,
				ALIGN_FLEX_MAP
			),
		},
	} );

	// Hook must run unconditionally; used below only when meta is shown.
	const metaTypoStyle = useTypographyStyle( attributes, 'meta' );

	const normalized = clampRating( rating, maxStars, precision );
	const fillPercent = ( normalized / maxStars ) * 100;

	const stars = Array.from( { length: maxStars } );

	const leading = (
		<>
			<PanelBody
				title={ __( 'Rating', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABSelectControl
					label={ __( 'Precision', 'axiom-blocks' ) }
					value={ precision }
					options={ [
						{
							label: __( 'Full stars only', 'axiom-blocks' ),
							value: 'full',
						},
						{
							label: __( 'Half stars', 'axiom-blocks' ),
							value: 'half',
						},
						{
							label: __( 'Any fraction', 'axiom-blocks' ),
							value: 'any',
						},
					] }
					onChange={ ( v ) => setAttributes( { precision: v } ) }
				/>
				<ABRangeControl
					label={ __( 'Rating', 'axiom-blocks' ) }
					value={ rating }
					onChange={ ( v ) => setAttributes( { rating: v ?? 0 } ) }
					min={ 0 }
					max={ maxStars }
					step={
						precision === 'full'
							? 1
							: precision === 'half'
							? 0.5
							: 0.1
					}
					unit=""
				/>
				<ABRangeControl
					label={ __( 'Max Stars', 'axiom-blocks' ) }
					value={ maxStars }
					onChange={ ( v ) => setAttributes( { maxStars: v ?? 5 } ) }
					min={ 3 }
					max={ 10 }
					step={ 1 }
					unit=""
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Labels', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show numeric value', 'axiom-blocks' ) }
					checked={ showValue }
					onChange={ ( v ) => setAttributes( { showValue: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Show review count', 'axiom-blocks' ) }
					checked={ showCount }
					onChange={ ( v ) => setAttributes( { showCount: v } ) }
				/>
				{ showCount && (
					<>
						<ABTextControl
							label={ __( 'Review count', 'axiom-blocks' ) }
							type="number"
							value={ String( reviewCount ?? 0 ) }
							onChange={ ( v ) =>
								setAttributes( {
									reviewCount: parseInt( v, 10 ) || 0,
								} )
							}
							min={ 0 }
						/>
						<ABTextControl
							label={ __( 'Count label', 'axiom-blocks' ) }
							value={ countLabel }
							onChange={ ( v ) =>
								setAttributes( { countLabel: v } )
							}
							help={ __(
								'e.g. "reviews", "ratings"',
								'axiom-blocks'
							) }
						/>
					</>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="alignment"
				>
					{ ( { value, setValue, inherited } ) => (
						<ABSelectControl
							label={ __( 'Alignment', 'axiom-blocks' ) }
							value={
								value !== '' && value != null
									? value
									: inherited ?? 'left'
							}
							options={ [
								{
									label: __( 'Left', 'axiom-blocks' ),
									value: 'left',
								},
								{
									label: __( 'Center', 'axiom-blocks' ),
									value: 'center',
								},
								{
									label: __( 'Right', 'axiom-blocks' ),
									value: 'right',
								},
							] }
							onChange={ setValue }
							help={ __(
								'Aligns the whole row — stars and labels together.',
								'axiom-blocks'
							) }
						/>
					) }
				</ABResponsive>
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ designFor( attributes ) }
				leading={ leading }
			/>

			<div { ...blockProps }>
				<div
					className="axiom-blocks-star-rating__stars"
					role="img"
					aria-label={
						__( 'Rating', 'axiom-blocks' ) +
						`: ${ normalized } / ${ maxStars }`
					}
				>
					<div className="axiom-blocks-star-rating__row axiom-blocks-star-rating__row--empty">
						{ stars.map( ( _, i ) => (
							<StarSVG
								key={ i }
								size={ resolvedStarSize }
								color={ emptyColor }
							/>
						) ) }
					</div>
					<div
						className="axiom-blocks-star-rating__row axiom-blocks-star-rating__row--filled"
						style={ { width: `${ fillPercent }%` } }
					>
						{ stars.map( ( _, i ) => (
							<StarSVG
								key={ i }
								size={ resolvedStarSize }
								color={ filledColor }
							/>
						) ) }
					</div>
				</div>

				{ ( showValue || showCount ) && (
					<div
						className="axiom-blocks-star-rating__meta"
						style={ {
							color: textColor,
							...metaTypoStyle,
						} }
					>
						{ showValue && (
							<span className="axiom-blocks-star-rating__value">
								{ normalized.toFixed(
									precision === 'full' ? 0 : 1
								) }
							</span>
						) }
						{ showCount && (
							<span className="axiom-blocks-star-rating__count">
								({ reviewCount.toLocaleString() } { countLabel }
								)
							</span>
						) }
					</div>
				) }
			</div>
		</>
	);
}

export const StarRating = {
	name: 'axiom-blocks/star-rating',
	settings: {
		title: __( 'Star Rating', 'axiom-blocks' ),
		description: __(
			'Display a 5-star rating with optional value and review count.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="star-rating" />,
		edit: StarRatingEdit,
		save: ( { attributes } ) => {
			const {
				rating,
				maxStars,
				precision,
				showCount,
				reviewCount,
				countLabel,
			} = attributes;
			const blockProps = useBlockProps.save( {
				className: 'axiom-blocks-star-rating',
			} );
			const normalized = clampRating( rating, maxStars, precision );
			const display =
				precision === 'full'
					? Math.round( normalized ).toString()
					: normalized.toFixed( 1 );
			return (
				<div { ...blockProps }>
					<span className="axiom-blocks-star-rating__value">
						{ display }
					</span>
					{ showCount && (
						<span className="axiom-blocks-star-rating__count">
							({ Number( reviewCount ).toLocaleString() }{ ' ' }
							{ countLabel })
						</span>
					) }
				</div>
			);
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
