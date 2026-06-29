<?php
/**
 * Star Rating Block - Server-side Render
 *
 * @package AxiomBlocks
 * @var array $attributes Block attributes.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_rating       = isset( $attributes['rating'] ) ? (float) $attributes['rating'] : 4.5;
$axiom_blocks_max_stars    = isset( $attributes['maxStars'] ) ? (int) $attributes['maxStars'] : 5;
$axiom_blocks_star_size    = $attributes['starSize'] ?? '20px';
$axiom_blocks_filled_color = $attributes['filledColor'] ?? '#fbbf24';
$axiom_blocks_empty_color  = $attributes['emptyColor'] ?? '#e5e7eb';
$axiom_blocks_precision    = $attributes['precision'] ?? 'half';
$axiom_blocks_show_value   = ! empty( $attributes['showValue'] );
$axiom_blocks_show_count   = ! empty( $attributes['showCount'] );
$axiom_blocks_review_count = isset( $attributes['reviewCount'] ) ? (int) $attributes['reviewCount'] : 0;
$axiom_blocks_count_label  = $attributes['countLabel'] ?? 'reviews';
$axiom_blocks_text_color   = $attributes['textColor'] ?? '#4b5563';
$axiom_blocks_alignment    = $attributes['alignment'] ?? 'left';

$axiom_blocks_max_stars = max( 3, min( 10, $axiom_blocks_max_stars ) );

if ( 'full' === $axiom_blocks_precision ) {
	$axiom_blocks_normalized = (float) round( $axiom_blocks_rating );
} elseif ( 'half' === $axiom_blocks_precision ) {
	$axiom_blocks_normalized = round( $axiom_blocks_rating * 2 ) / 2;
} else {
	$axiom_blocks_normalized = $axiom_blocks_rating;
}
$axiom_blocks_normalized = max( 0, min( $axiom_blocks_max_stars, $axiom_blocks_normalized ) );

$axiom_blocks_fill_percent = ( $axiom_blocks_max_stars > 0 ) ? ( $axiom_blocks_normalized / $axiom_blocks_max_stars ) * 100 : 0;

$axiom_blocks_star_svg = static function ( $axiom_blocks_color ) use ( $axiom_blocks_star_size ) {
	return sprintf(
		'<svg width="%1$s" height="%1$s" viewBox="0 0 24 24" fill="%2$s" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
		esc_attr( $axiom_blocks_star_size ),
		esc_attr( $axiom_blocks_color )
	);
};

$axiom_blocks_empty_stars  = str_repeat( $axiom_blocks_star_svg( $axiom_blocks_empty_color ), $axiom_blocks_max_stars );
$axiom_blocks_filled_stars = str_repeat( $axiom_blocks_star_svg( $axiom_blocks_filled_color ), $axiom_blocks_max_stars );

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array(
	'axiom-blocks-star-rating',
	'axiom-blocks-star-rating--align-' . sanitize_html_class( $axiom_blocks_alignment ),
);
if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( ';', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_value_display = ( 'full' === $axiom_blocks_precision )
	? number_format( $axiom_blocks_normalized, 0 )
	: number_format( $axiom_blocks_normalized, 1 );

$axiom_blocks_aria_label = sprintf(
	/* translators: 1: rating value, 2: max stars */
	__( 'Rating: %1$s out of %2$s', 'axiom-blocks' ),
	$axiom_blocks_value_display,
	$axiom_blocks_max_stars
);
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<div class="axiom-blocks-star-rating__stars" role="img" aria-label="<?php echo esc_attr( $axiom_blocks_aria_label ); ?>">
		<div class="axiom-blocks-star-rating__row axiom-blocks-star-rating__row--empty">
			<?php echo wp_kses( $axiom_blocks_empty_stars, AllowedHtml::svg() ); ?>
		</div>
		<div class="axiom-blocks-star-rating__row axiom-blocks-star-rating__row--filled" style="width: <?php echo esc_attr( $axiom_blocks_fill_percent ); ?>%;">
			<?php echo wp_kses( $axiom_blocks_filled_stars, AllowedHtml::svg() ); ?>
		</div>
	</div>

	<?php
	if ( $axiom_blocks_show_value || $axiom_blocks_show_count ) :
		$axiom_blocks_meta_typo  = safecss_filter_attr( Typography::inline_style( $attributes, 'meta' ) );
		$axiom_blocks_meta_style = 'color: ' . $axiom_blocks_text_color . ';';
		if ( '' !== $axiom_blocks_meta_typo ) {
			$axiom_blocks_meta_style .= $axiom_blocks_meta_typo . ';';
		}
		?>
		<div class="axiom-blocks-star-rating__meta" style="<?php echo esc_attr( $axiom_blocks_meta_style ); ?>">
			<?php if ( $axiom_blocks_show_value ) : ?>
				<span class="axiom-blocks-star-rating__value"><?php echo esc_html( $axiom_blocks_value_display ); ?></span>
			<?php endif; ?>
			<?php if ( $axiom_blocks_show_count ) : ?>
				<span class="axiom-blocks-star-rating__count">(<?php echo esc_html( number_format_i18n( $axiom_blocks_review_count ) ); ?> <?php echo esc_html( $axiom_blocks_count_label ); ?>)</span>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>
