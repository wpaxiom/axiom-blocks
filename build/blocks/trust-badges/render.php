<?php
/**
 * Trust Badges — frontend render.
 *
 * @package AxiomBlocks\Blocks
 * @var array $attributes
 * @var string $content
 * @var WP_Block $block
 */

declare(strict_types=1);

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/badges.php';

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;
use function AxiomBlocks\Blocks\TrustBadges\get_badges;
use function AxiomBlocks\Blocks\TrustBadges\get_badge_image_url;
use function AxiomBlocks\Blocks\TrustBadges\render_badge_svg;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_pixel_sizes = array(
	'small'  => 32,
	'medium' => 48,
	'large'  => 64,
);
$axiom_blocks_badge_size  = $axiom_blocks_a['badgeSize'] ?? 'medium';
$axiom_blocks_px          = $axiom_blocks_pixel_sizes[ $axiom_blocks_badge_size ] ?? 48;

$axiom_blocks_layout                 = $axiom_blocks_a['layout'] ?? 'horizontal';
$axiom_blocks_axiom_blocks_alignment = $axiom_blocks_a['alignment'] ?? 'center';
$axiom_blocks_columns                = (int) ( $axiom_blocks_a['columns'] ?? 4 );
$axiom_blocks_gap                    = (int) ( $axiom_blocks_a['gap'] ?? 16 );
$axiom_blocks_color_mode             = $axiom_blocks_a['colorMode'] ?? 'color';
$axiom_blocks_icon_color             = $axiom_blocks_a['iconColor'] ?? '#1e1e1e';
$axiom_blocks_show_card              = ! empty( $axiom_blocks_a['showCard'] );
$axiom_blocks_card_color             = $axiom_blocks_a['cardColor'] ?? '#ffffff';
$axiom_blocks_card_radius            = (int) ( $axiom_blocks_a['cardRadius'] ?? 8 );
$axiom_blocks_show_border            = ! empty( $axiom_blocks_a['showBorder'] );
$axiom_blocks_border_col             = $axiom_blocks_a['borderColor'] ?? '#e5e7eb';

$axiom_blocks_selected_ids  = is_array( $axiom_blocks_a['selectedBadges'] ?? null ) ? $axiom_blocks_a['selectedBadges'] : array();
$axiom_blocks_custom_badges = is_array( $axiom_blocks_a['customBadges'] ?? null ) ? $axiom_blocks_a['customBadges'] : array();
$axiom_blocks_has_any       = ! empty( $axiom_blocks_selected_ids ) || ! empty( $axiom_blocks_custom_badges );

if ( ! $axiom_blocks_has_any ) {
	return;
}

$axiom_blocks_classes = array(
	'axiom-blocks-trust-badges',
	'is-layout-' . sanitize_html_class( $axiom_blocks_layout ),
	'is-align-' . sanitize_html_class( $axiom_blocks_axiom_blocks_alignment ),
	'is-size-' . sanitize_html_class( $axiom_blocks_badge_size ),
	'is-color-' . sanitize_html_class( $axiom_blocks_color_mode ),
);
if ( $axiom_blocks_show_card ) {
	$axiom_blocks_classes[] = 'has-card';
}
if ( $axiom_blocks_show_border ) {
	$axiom_blocks_classes[] = 'has-border';
}

$axiom_blocks_css_vars = array(
	'--ab-tb-gap'         => $axiom_blocks_gap . 'px',
	'--ab-tb-card-bg'     => $axiom_blocks_show_card ? $axiom_blocks_card_color : 'transparent',
	'--ab-tb-card-radius' => $axiom_blocks_card_radius . 'px',
	'--ab-tb-border'      => $axiom_blocks_show_border ? '1px solid ' . $axiom_blocks_border_col : '0',
	'--ab-tb-columns'     => 'grid' === $axiom_blocks_layout ? (string) max( 2, min( 6, $axiom_blocks_columns ) ) : 'unset',
	'--ab-tb-icon-size'   => $axiom_blocks_px . 'px',
);
if ( 'color' !== $axiom_blocks_color_mode ) {
	$axiom_blocks_css_vars['--ab-tb-icon-color'] = $axiom_blocks_icon_color;
}

$axiom_blocks_var_decls = array();
foreach ( $axiom_blocks_css_vars as $axiom_blocks_k => $axiom_blocks_v ) {
	$axiom_blocks_var_decls[] = $axiom_blocks_k . ': ' . $axiom_blocks_v;
}

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $axiom_blocks_a );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		implode( '; ', $axiom_blocks_var_decls ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( '; ', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_badge_lib = get_badges();

$axiom_blocks_heading_typo = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'heading' ) );
$axiom_blocks_label_typo   = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'label' ) );

$axiom_blocks_heading_align = (string) ( $axiom_blocks_a['headingAlign'] ?? 'center' );
$axiom_blocks_heading_style = 'text-align: ' . sanitize_html_class( $axiom_blocks_heading_align );
if ( '' !== $axiom_blocks_heading_typo ) {
	$axiom_blocks_heading_style .= '; ' . $axiom_blocks_heading_typo;
}
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( ! empty( $axiom_blocks_a['headingShow'] ) && ! empty( $axiom_blocks_a['headingText'] ) ) : ?>
		<div class="axiom-blocks-trust-badges__heading" style="<?php echo esc_attr( $axiom_blocks_heading_style ); ?>">
			<?php echo esc_html( $axiom_blocks_a['headingText'] ); ?>
		</div>
	<?php endif; ?>

	<div class="axiom-blocks-trust-badges__list">
		<?php
		foreach ( $axiom_blocks_selected_ids as $axiom_blocks_badge_id ) :
			if ( ! isset( $axiom_blocks_badge_lib[ $axiom_blocks_badge_id ] ) ) {
				continue;
			}
			$axiom_blocks_badge     = $axiom_blocks_badge_lib[ $axiom_blocks_badge_id ];
			$axiom_blocks_badge_url = ! empty( $axiom_blocks_badge['file'] )
				? get_badge_image_url( $axiom_blocks_badge_id, $axiom_blocks_color_mode )
				: '';
			?>
			<div class="axiom-blocks-trust-badges__item">
				<?php if ( '' !== $axiom_blocks_badge_url ) : ?>
					<img
						src="<?php echo esc_url( $axiom_blocks_badge_url ); ?>"
						width="<?php echo (int) $axiom_blocks_px; ?>"
						height="<?php echo (int) $axiom_blocks_px; ?>"
						alt="<?php echo esc_attr( $axiom_blocks_badge['label'] ); ?>"
						loading="lazy"
						decoding="async"
					/>
				<?php else : ?>
					<?php echo wp_kses( render_badge_svg( $axiom_blocks_badge_id, $axiom_blocks_px ), AllowedHtml::svg() ); ?>
				<?php endif; ?>
				<span class="axiom-blocks-trust-badges__label"<?php echo '' !== $axiom_blocks_label_typo ? ' style="' . esc_attr( $axiom_blocks_label_typo ) . '"' : ''; ?>>
					<?php echo esc_html( $axiom_blocks_badge['label'] ); ?>
				</span>
			</div>
		<?php endforeach; ?>

		<?php
		foreach ( $axiom_blocks_custom_badges as $axiom_blocks_b ) :
			$axiom_blocks_url = isset( $axiom_blocks_b['url'] ) ? (string) $axiom_blocks_b['url'] : '';
			$axiom_blocks_alt = isset( $axiom_blocks_b['alt'] ) ? (string) $axiom_blocks_b['alt'] : '';
			$axiom_blocks_lnk = isset( $axiom_blocks_b['link'] ) ? (string) $axiom_blocks_b['link'] : '';
			if ( '' === $axiom_blocks_url ) {
				continue;
			}
			$axiom_blocks_img_style = sprintf(
				'width: %1$dpx; height: %1$dpx; object-fit: contain;',
				(int) $axiom_blocks_px
			);
			?>
			<div class="axiom-blocks-trust-badges__item">
				<?php if ( '' !== $axiom_blocks_lnk ) : ?>
					<a href="<?php echo esc_url( $axiom_blocks_lnk ); ?>" rel="noopener noreferrer" target="_blank">
						<img
							src="<?php echo esc_url( $axiom_blocks_url ); ?>"
							alt="<?php echo esc_attr( $axiom_blocks_alt ); ?>"
							style="<?php echo esc_attr( $axiom_blocks_img_style ); ?>"
						/>
					</a>
				<?php else : ?>
					<img
						src="<?php echo esc_url( $axiom_blocks_url ); ?>"
						alt="<?php echo esc_attr( $axiom_blocks_alt ); ?>"
						style="<?php echo esc_attr( $axiom_blocks_img_style ); ?>"
					/>
				<?php endif; ?>
				<?php if ( '' !== $axiom_blocks_alt ) : ?>
					<span class="axiom-blocks-trust-badges__label"<?php echo '' !== $axiom_blocks_label_typo ? ' style="' . esc_attr( $axiom_blocks_label_typo ) . '"' : ''; ?>><?php echo esc_html( $axiom_blocks_alt ); ?></span>
				<?php endif; ?>
			</div>
		<?php endforeach; ?>
	</div>
</div>
