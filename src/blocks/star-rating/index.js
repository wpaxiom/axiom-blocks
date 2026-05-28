import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	BSRangeControl,
	BSSelectControl,
	BSTextControl,
	BSColorControl,
	BSToggleControl,
} from '../BSControls';
import { TypographyPanel, getTypographyStyle } from '../TypographyPanel';
import { SpacingPanel, getSpacingStyle } from '../SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

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
		starSize,
		filledColor,
		emptyColor,
		precision,
		showValue,
		showCount,
		reviewCount,
		countLabel,
		textColor,
		alignment,
	} = attributes;

	const blockProps = useBlockProps( {
		className: `axiom-blocks-star-rating axiom-blocks-star-rating--align-${ alignment }`,
		style: getSpacingStyle( attributes ),
	} );

	const normalized = clampRating( rating, maxStars, precision );
	const fillPercent = ( normalized / maxStars ) * 100;

	const stars = Array.from( { length: maxStars } );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Rating', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<BSSelectControl
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
					<BSRangeControl
						label={ __( 'Rating', 'axiom-blocks' ) }
						value={ rating }
						onChange={ ( v ) =>
							setAttributes( { rating: v ?? 0 } )
						}
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
					<BSRangeControl
						label={ __( 'Max Stars', 'axiom-blocks' ) }
						value={ maxStars }
						onChange={ ( v ) =>
							setAttributes( { maxStars: v ?? 5 } )
						}
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
					<BSToggleControl
						label={ __( 'Show numeric value', 'axiom-blocks' ) }
						checked={ showValue }
						onChange={ ( v ) => setAttributes( { showValue: v } ) }
					/>
					<BSToggleControl
						label={ __( 'Show review count', 'axiom-blocks' ) }
						checked={ showCount }
						onChange={ ( v ) => setAttributes( { showCount: v } ) }
					/>
					{ showCount && (
						<>
							<BSTextControl
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
							<BSTextControl
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
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={ alignment }
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
						onChange={ ( v ) => setAttributes( { alignment: v } ) }
					/>
					<BSTextControl
						label={ __( 'Star size', 'axiom-blocks' ) }
						value={ starSize }
						onChange={ ( v ) => setAttributes( { starSize: v } ) }
						help={ __( 'e.g. 20px, 1.5rem', 'axiom-blocks' ) }
					/>
					<BSColorControl
						label={ __( 'Filled color', 'axiom-blocks' ) }
						color={ filledColor }
						onChange={ ( c ) =>
							setAttributes( { filledColor: c } )
						}
					/>
					<BSColorControl
						label={ __( 'Empty color', 'axiom-blocks' ) }
						color={ emptyColor }
						onChange={ ( c ) => setAttributes( { emptyColor: c } ) }
					/>
					{ ( showValue || showCount ) && (
						<BSColorControl
							label={ __( 'Text color', 'axiom-blocks' ) }
							color={ textColor }
							onChange={ ( c ) =>
								setAttributes( { textColor: c } )
							}
						/>
					) }
				</PanelBody>

				{ ( showValue || showCount ) && (
					<TypographyPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
						prefix="meta"
						title={ __( 'Meta typography', 'axiom-blocks' ) }
					/>
				) }

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

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
								size={ starSize }
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
								size={ starSize }
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
							...getTypographyStyle( attributes, 'meta' ),
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
		save: () => null,
	},
};
