<?php
/**
 * Pricing Plan — frontend render.
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
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_name          = (string) ( $axiom_blocks_a['name'] ?? '' );
$axiom_blocks_badge         = (string) ( $axiom_blocks_a['badge'] ?? '' );
$axiom_blocks_currency      = (string) ( $axiom_blocks_a['currency'] ?? '' );
$axiom_blocks_price         = (string) ( $axiom_blocks_a['price'] ?? '' );
$axiom_blocks_period        = (string) ( $axiom_blocks_a['period'] ?? '' );
$axiom_blocks_show_currency = ! isset( $axiom_blocks_a['showCurrency'] ) || ! empty( $axiom_blocks_a['showCurrency'] );
$axiom_blocks_show_period   = ! isset( $axiom_blocks_a['showPeriod'] ) || ! empty( $axiom_blocks_a['showPeriod'] );
$axiom_blocks_description   = (string) ( $axiom_blocks_a['description'] ?? '' );
$axiom_blocks_is_highlight  = ! empty( $axiom_blocks_a['isHighlight'] );
$axiom_blocks_features      = is_array( $axiom_blocks_a['features'] ?? null ) ? $axiom_blocks_a['features'] : array();

$axiom_blocks_cta_label   = (string) ( $axiom_blocks_a['ctaLabel'] ?? '' );
$axiom_blocks_cta_url     = (string) ( $axiom_blocks_a['ctaUrl'] ?? '' );
$axiom_blocks_cta_new_tab = ! empty( $axiom_blocks_a['ctaNewTab'] );

$axiom_blocks_feat_icon_style = 'check';
if ( isset( $block ) && is_object( $block ) && isset( $block->context['axiom-blocks/featureIconStyle'] ) ) {
	$axiom_blocks_feat_icon_style = (string) $block->context['axiom-blocks/featureIconStyle'];
}

$axiom_blocks_plan_classes = array( 'ab-pt-plan' );
if ( $axiom_blocks_is_highlight ) {
	$axiom_blocks_plan_classes[] = 'is-highlight';
}

$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_plan_classes[] = $axiom_blocks_a['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_plan_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_plan_classes ) ) );

$axiom_blocks_style_attr = safecss_filter_attr( rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_name_style    = Typography::inline_style( $axiom_blocks_a, 'name' );
$axiom_blocks_price_style   = Typography::inline_style( $axiom_blocks_a, 'price' );
$axiom_blocks_desc_style    = Typography::inline_style( $axiom_blocks_a, 'desc' );
$axiom_blocks_feature_style = Typography::inline_style( $axiom_blocks_a, 'feature' );
$axiom_blocks_cta_style     = Typography::inline_style( $axiom_blocks_a, 'cta' );
?>
<article <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( '' !== $axiom_blocks_badge ) : ?>
		<div class="ab-pt-plan__badge"><?php echo esc_html( $axiom_blocks_badge ); ?></div>
	<?php endif; ?>

	<?php if ( '' !== $axiom_blocks_name ) : ?>
		<h3 class="ab-pt-plan__name"<?php echo '' !== $axiom_blocks_name_style ? ' style="' . esc_attr( $axiom_blocks_name_style ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_name ); ?></h3>
	<?php endif; ?>

	<div class="ab-pt-plan__price"<?php echo '' !== $axiom_blocks_price_style ? ' style="' . esc_attr( $axiom_blocks_price_style ) . '"' : ''; ?>>
		<?php if ( $axiom_blocks_show_currency && '' !== $axiom_blocks_currency ) : ?>
			<span class="ab-pt-plan__currency"><?php echo esc_html( $axiom_blocks_currency ); ?></span>
		<?php endif; ?>
		<?php if ( '' !== $axiom_blocks_price ) : ?>
			<span class="ab-pt-plan__amount"><?php echo esc_html( $axiom_blocks_price ); ?></span>
		<?php endif; ?>
		<?php if ( $axiom_blocks_show_period && '' !== $axiom_blocks_period ) : ?>
			<span class="ab-pt-plan__period"><?php echo esc_html( $axiom_blocks_period ); ?></span>
		<?php endif; ?>
	</div>

	<?php if ( '' !== $axiom_blocks_description ) : ?>
		<p class="ab-pt-plan__desc"<?php echo '' !== $axiom_blocks_desc_style ? ' style="' . esc_attr( $axiom_blocks_desc_style ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_description ); ?></p>
	<?php endif; ?>

	<?php if ( ! empty( $axiom_blocks_features ) ) : ?>
		<ul class="ab-pt-plan__features">
			<?php
			foreach ( $axiom_blocks_features as $axiom_blocks_f ) :
				$axiom_blocks_included = ! empty( $axiom_blocks_f['included'] );
				$axiom_blocks_text     = (string) ( $axiom_blocks_f['text'] ?? '' );
				if ( '' === $axiom_blocks_text ) {
					continue;
				}
				$axiom_blocks_f_classes = array( 'ab-pt-feat', $axiom_blocks_included ? 'is-included' : 'is-excluded' );

				if ( 'dot' === $axiom_blocks_feat_icon_style ) {
					$axiom_blocks_icon_svg = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">'
						. '<circle cx="10" cy="10" r="3" fill="currentColor"/></svg>';
				} elseif ( $axiom_blocks_included ) {
					$axiom_blocks_icon_svg = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"'
						. ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
						. '<path d="M4 10.5l3.5 3.5L16 6"/></svg>';
				} else {
					$axiom_blocks_icon_svg = '<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor"'
						. ' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
						. '<path d="M5 5l10 10M15 5L5 15"/></svg>';
				}
				?>
				<li class="<?php echo esc_attr( implode( ' ', $axiom_blocks_f_classes ) ); ?>">
					<span class="ab-pt-feat__icon">
						<?php echo wp_kses( $axiom_blocks_icon_svg, AllowedHtml::svg() ); ?>
					</span>
					<span class="ab-pt-feat__text"<?php echo '' !== $axiom_blocks_feature_style ? ' style="' . esc_attr( $axiom_blocks_feature_style ) . '"' : ''; ?>><?php echo wp_kses_post( $axiom_blocks_text ); ?></span>
				</li>
			<?php endforeach; ?>
		</ul>
	<?php endif; ?>

	<?php
	if ( '' !== $axiom_blocks_cta_label ) :
		$axiom_blocks_href = '' !== $axiom_blocks_cta_url ? $axiom_blocks_cta_url : '#';
		?>
		<div class="ab-pt-plan__cta-area">
			<a class="ab-pt-plan__cta" href="<?php echo esc_url( $axiom_blocks_href ); ?>"<?php echo $axiom_blocks_cta_new_tab ? ' rel="noopener noreferrer" target="_blank"' : ''; ?><?php echo '' !== $axiom_blocks_cta_style ? ' style="' . esc_attr( $axiom_blocks_cta_style ) . '"' : ''; ?>>
				<?php echo esc_html( $axiom_blocks_cta_label ); ?>
			</a>
		</div>
	<?php endif; ?>
</article>
