<?php
/**
 * Pricing Table — frontend render (wrapper only; cards come from inner blocks).
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_columns         = max( 1, min( 4, (int) ( $axiom_blocks_a['columns'] ?? 3 ) ) );
$axiom_blocks_gap             = (int) ( $axiom_blocks_a['gap'] ?? 24 );
$axiom_blocks_card_style      = $axiom_blocks_a['cardStyle'] ?? 'bordered';
$axiom_blocks_accent          = $axiom_blocks_a['accentColor'] ?? '#7C3AED';
$axiom_blocks_feat_icon_style = $axiom_blocks_a['featureIconStyle'] ?? 'check';

$axiom_blocks_heading_show  = ! empty( $axiom_blocks_a['headingShow'] );
$axiom_blocks_heading_text  = (string) ( $axiom_blocks_a['headingText'] ?? '' );
$axiom_blocks_heading_align = $axiom_blocks_a['headingAlign'] ?? 'center';

$axiom_blocks_classes = array(
	'axiom-blocks-pricing-table',
	'is-card-' . sanitize_html_class( $axiom_blocks_card_style ),
	'is-feat-' . sanitize_html_class( $axiom_blocks_feat_icon_style ),
);

$axiom_blocks_style_parts  = array(
	'--ab-pt-columns: ' . $axiom_blocks_columns,
	'--ab-pt-gap: ' . $axiom_blocks_gap . 'px',
	'--ab-pt-accent: ' . $axiom_blocks_accent,
);
$axiom_blocks_inline_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_inline_style = Spacing::merge( $axiom_blocks_inline_style, $axiom_blocks_a );

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
		rtrim( trim( $axiom_blocks_inline_style ), ';' ),
	)
);
$axiom_blocks_style_attr         = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_heading_style = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'heading' ) );
// Legacy fallback: if no `headingTextAlign` is set, use the older `headingAlign`.
if ( false === stripos( $axiom_blocks_heading_style, 'text-align' ) ) {
	$axiom_blocks_sep            = ( '' !== $axiom_blocks_heading_style ) ? '; ' : '';
	$axiom_blocks_heading_style .= $axiom_blocks_sep . 'text-align: ' . sanitize_html_class( $axiom_blocks_heading_align );
}
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( $axiom_blocks_heading_show && '' !== $axiom_blocks_heading_text ) : ?>
		<div class="axiom-blocks-pricing-table__heading" style="<?php echo esc_attr( $axiom_blocks_heading_style ); ?>">
			<?php echo esc_html( $axiom_blocks_heading_text ); ?>
		</div>
	<?php endif; ?>

	<div class="axiom-blocks-pricing-table__grid">
		<?php echo wp_kses( $content, AllowedHtml::post_with_svg() ); ?>
	</div>
</div>
