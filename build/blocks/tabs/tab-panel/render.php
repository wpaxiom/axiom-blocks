<?php
/**
 * Tab Panel Block — server-side render.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$axiom_blocks_tab_id     = $attributes['tabId'] ?? '';
$axiom_blocks_active_tab = $block->context['axiom-blocks/activeTab'] ?? '';
$axiom_blocks_is_active  = $axiom_blocks_tab_id && $axiom_blocks_tab_id === $axiom_blocks_active_tab;
?>
<div
	class="axiom-blocks-tab-panel <?php echo esc_attr( $axiom_blocks_is_active ? 'is-active' : 'is-inactive' ); ?>"
	id="axiom-blocks-panel-<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
	data-tab-id="<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
	role="tabpanel"
	aria-hidden="<?php echo esc_attr( $axiom_blocks_is_active ? 'false' : 'true' ); ?>"
	aria-labelledby="axiom-blocks-tab-<?php echo esc_attr( $axiom_blocks_tab_id ); ?>"
>
	<?php echo wp_kses_post( $content ); ?>
</div>
