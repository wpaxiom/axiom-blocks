<?php
/**
 * Slider — frontend render.
 *
 * Slides render server-side as a plain track (first slide visible with JS off);
 * assets/content-slider.js upgrades it to a slide/fade/coverflow carousel.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a      = $attributes ?? array();
$axiom_blocks_slides = $block->parsed_block['innerBlocks'] ?? array();

if ( empty( $axiom_blocks_slides ) ) {
	return;
}

$axiom_blocks_effect = (string) ( $axiom_blocks_a['effect'] ?? 'slide' );
if ( ! in_array( $axiom_blocks_effect, array( 'slide', 'fade', 'coverflow' ), true ) ) {
	$axiom_blocks_effect = 'slide';
}

$axiom_blocks_per_view    = max( 1, (int) ( $axiom_blocks_a['slidesPerView'] ?? 1 ) );
$axiom_blocks_per_tablet  = max( 0, (int) ( $axiom_blocks_a['slidesPerViewTablet'] ?? 0 ) );
$axiom_blocks_per_mobile  = max( 0, (int) ( $axiom_blocks_a['slidesPerViewMobile'] ?? 0 ) );
$axiom_blocks_autoplay    = ! empty( $axiom_blocks_a['autoplay'] );
$axiom_blocks_autoplay_ms = max( 0, (int) ( $axiom_blocks_a['autoplaySpeed'] ?? 4000 ) );
$axiom_blocks_loop        = ! isset( $axiom_blocks_a['loop'] ) || ! empty( $axiom_blocks_a['loop'] );
$axiom_blocks_pause_hover = ! isset( $axiom_blocks_a['pauseOnHover'] ) || ! empty( $axiom_blocks_a['pauseOnHover'] );
$axiom_blocks_slide_ms    = max( 0, (int) ( $axiom_blocks_a['slideSpeed'] ?? 500 ) );
$axiom_blocks_draggable   = ! isset( $axiom_blocks_a['draggable'] ) || ! empty( $axiom_blocks_a['draggable'] );
$axiom_blocks_arrows      = ! isset( $axiom_blocks_a['showArrows'] ) || ! empty( $axiom_blocks_a['showArrows'] );
$axiom_blocks_dots        = ! isset( $axiom_blocks_a['showDots'] ) || ! empty( $axiom_blocks_a['showDots'] );
$axiom_blocks_lightbox    = ! empty( $axiom_blocks_a['lightbox'] );
$axiom_blocks_pause_btn   = ! isset( $axiom_blocks_a['showPauseButton'] ) || ! empty( $axiom_blocks_a['showPauseButton'] );
$axiom_blocks_adaptive    = ! empty( $axiom_blocks_a['adaptiveHeight'] );
$axiom_blocks_scroll      = max( 1, (int) ( $axiom_blocks_a['slidesToScroll'] ?? 1 ) );

$axiom_blocks_vertical = 'vertical' === ( $axiom_blocks_a['orientation'] ?? 'horizontal' ) && 'slide' === $axiom_blocks_effect;

$axiom_blocks_pag_type = (string) ( $axiom_blocks_a['paginationType'] ?? 'bullets' );
if ( ! in_array( $axiom_blocks_pag_type, array( 'bullets', 'fraction', 'progress' ), true ) ) {
	$axiom_blocks_pag_type = 'bullets';
}

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-slider-gap'          => 'gap',
	'--ab-slider-arrow-color'  => 'arrowColor',
	'--ab-slider-arrow-bg'     => 'arrowBg',
	'--ab-slider-arrow-offset' => 'arrowOffset',
	'--ab-slider-dot-color'    => 'dotColor',
	'--ab-slider-dot-active'   => 'dotActiveColor',
	'--ab-slider-pagination-gap' => 'paginationGap',
	'--ab-slider-dot-gap'      => 'dotGap',
	'--ab-slider-bc'           => 'borderColor',
	'--ab-slider-bw'           => 'borderWidth',
	'--ab-slider-radius'       => 'borderRadius',
	'--ab-slider-height'       => 'sliderHeight',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-slider',
	'ab-slider--' . $axiom_blocks_effect,
);
if ( $axiom_blocks_vertical ) {
	$axiom_blocks_classes[] = 'ab-slider--vertical';
}

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_merged_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_wrapper_style ), ';' ),
	)
);
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );
$axiom_blocks_id_attr            = $axiom_blocks_block_supports['id'] ?? '';
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	data-effect="<?php echo esc_attr( $axiom_blocks_effect ); ?>"
	<?php echo $axiom_blocks_vertical ? ' data-orientation="vertical"' : ''; ?>
	data-per-view="<?php echo esc_attr( (string) $axiom_blocks_per_view ); ?>"
	data-scroll="<?php echo esc_attr( (string) $axiom_blocks_scroll ); ?>"
	data-pagination="<?php echo esc_attr( $axiom_blocks_pag_type ); ?>"
	<?php echo $axiom_blocks_adaptive ? ' data-adaptive="1"' : ''; ?>
	<?php echo $axiom_blocks_per_tablet ? ' data-per-view-tablet="' . esc_attr( (string) $axiom_blocks_per_tablet ) . '"' : ''; ?>
	<?php echo $axiom_blocks_per_mobile ? ' data-per-view-mobile="' . esc_attr( (string) $axiom_blocks_per_mobile ) . '"' : ''; ?>
	data-slide-speed="<?php echo esc_attr( (string) $axiom_blocks_slide_ms ); ?>"
	<?php echo $axiom_blocks_autoplay ? ' data-autoplay="1" data-autoplay-speed="' . esc_attr( (string) $axiom_blocks_autoplay_ms ) . '"' : ''; ?>
	<?php echo $axiom_blocks_autoplay && $axiom_blocks_pause_btn ? ' data-pause-button="1"' : ''; ?>
	<?php echo $axiom_blocks_loop ? '' : ' data-loop="0"'; ?>
	<?php echo $axiom_blocks_pause_hover ? '' : ' data-pause-hover="0"'; ?>
	<?php echo $axiom_blocks_draggable ? '' : ' data-draggable="0"'; ?>
	<?php echo $axiom_blocks_arrows ? '' : ' data-arrows="0"'; ?>
	<?php echo $axiom_blocks_dots ? '' : ' data-dots="0"'; ?>
	<?php echo $axiom_blocks_lightbox ? ' data-lightbox="1"' : ''; ?>
>
	<div class="ab-slider__viewport">
		<div class="ab-slider__track">
			<?php
			foreach ( $axiom_blocks_slides as $axiom_blocks_slide ) :
				$axiom_blocks_slide_attrs = $axiom_blocks_slide['attrs'] ?? array();
				$axiom_blocks_align       = (string) ( $axiom_blocks_slide_attrs['contentAlign'] ?? 'center' );
				$axiom_blocks_valign      = (string) ( $axiom_blocks_slide_attrs['verticalAlign'] ?? 'center' );
				$axiom_blocks_bg          = (string) ( $axiom_blocks_slide_attrs['bgColor'] ?? '' );

				if ( ! in_array( $axiom_blocks_align, array( 'left', 'center', 'right' ), true ) ) {
					$axiom_blocks_align = 'center';
				}
				if ( ! in_array( $axiom_blocks_valign, array( 'top', 'center', 'bottom' ), true ) ) {
					$axiom_blocks_valign = 'center';
				}

				$axiom_blocks_slide_body = '';
				foreach ( ( $axiom_blocks_slide['innerBlocks'] ?? array() ) as $axiom_blocks_inner ) {
					$axiom_blocks_slide_body .= ( new WP_Block( $axiom_blocks_inner ) )->render();
				}

				$axiom_blocks_slide_class = 'ab-slide ab-slide--align-' . $axiom_blocks_align . ' ab-slide--valign-' . $axiom_blocks_valign;
				$axiom_blocks_slide_style = '' !== $axiom_blocks_bg ? safecss_filter_attr( 'background-color: ' . $axiom_blocks_bg ) : '';
				?>
				<div class="<?php echo esc_attr( $axiom_blocks_slide_class ); ?>"<?php echo '' !== $axiom_blocks_slide_style ? ' style="' . esc_attr( $axiom_blocks_slide_style ) . '"' : ''; ?>>
					<div class="ab-slide__content"><?php echo $axiom_blocks_slide_body; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render/save. ?></div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</div>
