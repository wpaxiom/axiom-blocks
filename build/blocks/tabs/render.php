<?php
/**
 * Tabs Block — server-side render.
 *
 * @package AxiomBlocks
 * @var array    $attributes Block attributes.
 * @var string   $content    Rendered inner blocks (panels).
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;
use AxiomBlocks\Blocks\UIIcons;

$axiom_blocks_tab_style       = $attributes['tabStyle'] ?? 'default';
$axiom_blocks_tab_orientation = $attributes['tabOrientation'] ?? 'horizontal';
$axiom_blocks_tab_alignment   = $attributes['tabAlignment'] ?? 'left';
$axiom_blocks_full_width      = ! empty( $attributes['fullWidthTabs'] );
$axiom_blocks_active_tab      = $attributes['activeTab'] ?? '';
$axiom_blocks_active_color    = $attributes['activeColor'] ?? '';
$axiom_blocks_inactive_color  = $attributes['inactiveColor'] ?? '';
$axiom_blocks_bar_bg          = $attributes['backgroundColor'] ?? '';
$axiom_blocks_content_bg      = $attributes['contentBackgroundColor'] ?? '';
$axiom_blocks_content_gap     = isset( $attributes['contentGap'] ) ? (float) $attributes['contentGap'] : 0;

$axiom_blocks_panels = $block->parsed_block['innerBlocks'] ?? array();

$axiom_blocks_panel_ids              = array_map( fn( $axiom_blocks_p ) => $axiom_blocks_p['attrs']['tabId'] ?? '', $axiom_blocks_panels );
$axiom_blocks_resolved_from_fallback = false;
if ( ! in_array( $axiom_blocks_active_tab, $axiom_blocks_panel_ids, true ) && ! empty( $axiom_blocks_panel_ids ) ) {
	$axiom_blocks_active_tab             = $axiom_blocks_panel_ids[0];
	$axiom_blocks_resolved_from_fallback = true;
}

$axiom_blocks_classes = array(
	'axiom-blocks-tabs',
	'axiom-blocks-tabs--' . sanitize_html_class( $axiom_blocks_tab_style ),
	'axiom-blocks-tab--' . sanitize_html_class( $axiom_blocks_tab_orientation ),
);
if ( 'vertical' !== $axiom_blocks_tab_orientation ) {
	$axiom_blocks_classes[] = 'axiom-blocks-tab--align-' . sanitize_html_class( $axiom_blocks_tab_alignment );
}
if ( $axiom_blocks_full_width ) {
	$axiom_blocks_classes[] = 'is-full-width';
}

$axiom_blocks_justify = 'vertical' === $axiom_blocks_tab_orientation
	? ''
	: ( array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	)[ $axiom_blocks_tab_alignment ] ?? 'flex-start' );

$axiom_blocks_style_vars = array();
if ( $axiom_blocks_active_color ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-active: ' . $axiom_blocks_active_color;
}
if ( $axiom_blocks_inactive_color ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-inactive: ' . $axiom_blocks_inactive_color;
}
if ( $axiom_blocks_bar_bg ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-bg: ' . $axiom_blocks_bar_bg;
}
if ( $axiom_blocks_content_bg ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tab-content-bg: ' . $axiom_blocks_content_bg;
}
if ( $axiom_blocks_content_gap > 0 ) {
	$axiom_blocks_style_vars[] = '--axiom-blocks-tabs-content-gap: ' . $axiom_blocks_content_gap . 'px';
}

$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

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
		implode( '; ', $axiom_blocks_style_vars ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( '; ', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_label_typo = Typography::inline_style( $attributes, 'label' );
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?> data-active-tab="<?php echo esc_attr( $axiom_blocks_active_tab ); ?>">
	<div
		class="axiom-blocks-tabs__list"
		role="tablist"
		<?php echo '' !== $axiom_blocks_justify ? 'style="justify-content: ' . esc_attr( $axiom_blocks_justify ) . '"' : ''; ?>
	>
		<?php
		foreach ( $axiom_blocks_panels as $axiom_blocks_panel ) :
			$axiom_blocks_tab_id    = $axiom_blocks_panel['attrs']['tabId'] ?? '';
			$axiom_blocks_label     = $axiom_blocks_panel['attrs']['label'] ?? __( 'Tab', 'axiom-blocks' );
			$axiom_blocks_icon_slug = $axiom_blocks_panel['attrs']['iconSlug'] ?? '';
			$axiom_blocks_icon_url  = $axiom_blocks_panel['attrs']['iconUrl'] ?? '';
			$axiom_blocks_icon_alt  = $axiom_blocks_panel['attrs']['iconAlt'] ?? '';
			$axiom_blocks_is_active = $axiom_blocks_tab_id === $axiom_blocks_active_tab;

			$axiom_blocks_icon_markup = '';
			if ( '' !== $axiom_blocks_icon_slug && UIIcons::has( $axiom_blocks_icon_slug ) ) {
				$axiom_blocks_icon_markup = UIIcons::svg( $axiom_blocks_icon_slug );
			} elseif ( '' !== $axiom_blocks_icon_url ) {
				$axiom_blocks_icon_markup = sprintf(
					'<img src="%s" alt="%s" class="axiom-blocks-tabs__icon-img" />',
					esc_url( $axiom_blocks_icon_url ),
					esc_attr( $axiom_blocks_icon_alt )
				);
			}
			?>
			<button
				type="button"
				class="axiom-blocks-tabs__tab <?php echo esc_attr( $axiom_blocks_is_active ? 'is-active' : '' ); ?>"
				role="tab"
				aria-selected="<?php echo esc_attr( $axiom_blocks_is_active ? 'true' : 'false' ); ?>"
				aria-controls="axiom-blocks-panel-<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
				id="axiom-blocks-tab-<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
				data-tab="<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
			>
				<?php if ( '' !== $axiom_blocks_icon_markup ) : ?>
					<span class="axiom-blocks-tabs__icon"><?php echo wp_kses( $axiom_blocks_icon_markup, AllowedHtml::post_with_svg() ); ?></span>
				<?php endif; ?>
				<span class="axiom-blocks-tabs__label"<?php echo '' !== $axiom_blocks_label_typo ? ' style="' . esc_attr( $axiom_blocks_label_typo ) . '"' : ''; ?>><?php echo esc_html( $axiom_blocks_label ); ?></span>
			</button>
		<?php endforeach; ?>
	</div>
	<div class="axiom-blocks-tabs__content">
		<?php
		if ( $axiom_blocks_resolved_from_fallback && ! empty( $axiom_blocks_panels ) ) {
			foreach ( $axiom_blocks_panels as $axiom_blocks_panel ) {
				$axiom_blocks_panel_block = new WP_Block(
					$axiom_blocks_panel,
					array( 'axiom-blocks/activeTab' => $axiom_blocks_active_tab )
				);
				echo wp_kses_post( $axiom_blocks_panel_block->render() );
			}
		} else {
			echo wp_kses_post( $content );
		}
		?>
	</div>
</div>
