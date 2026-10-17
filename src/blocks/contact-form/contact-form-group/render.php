<?php
/**
 * Contact Form field group - frontend render.
 *
 * A fieldset with an optional legend and its own fields grid. Its columns are
 * written on the fieldset, so they reach only its own grid; the span and order
 * vars are always written, because custom properties inherit and a group
 * would otherwise pass its own span down to its fields.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\GridTracks;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Forms\ContactFormRender;

$axiom_blocks_a      = $attributes ?? array();
$axiom_blocks_legend = trim( (string) ( $axiom_blocks_a['legend'] ?? '' ) );
$axiom_blocks_show   = ! isset( $axiom_blocks_a['showLegend'] ) || ! empty( $axiom_blocks_a['showLegend'] );

$axiom_blocks_decl   = ContactFormRender::placement_vars( $axiom_blocks_a );
$axiom_blocks_decl[] = '--ab-cf-cols: ' . GridTracks::template( $axiom_blocks_a['columns'] ?? 1, $axiom_blocks_a['tracks'] ?? '' );
$axiom_blocks_style  = safecss_filter_attr( Spacing::merge( implode( '; ', $axiom_blocks_decl ), $axiom_blocks_a ) );

$axiom_blocks_classes = array_merge( array( 'ab-cf-group' ), GridTracks::stacked_classes( $axiom_blocks_a, 'columns', 'tracks', 1 ) );
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
?>
<fieldset class="<?php echo esc_attr( implode( ' ', $axiom_blocks_classes ) ); ?>" style="<?php echo esc_attr( $axiom_blocks_style ); ?>">
	<?php if ( '' !== $axiom_blocks_legend ) : ?>
		<legend class="ab-cf-legend<?php echo $axiom_blocks_show ? '' : ' screen-reader-text'; ?>"><?php echo esc_html( $axiom_blocks_legend ); ?></legend>
	<?php endif; ?>
	<div class="ab-cf__fields">
		<?php
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner field HTML, each field escapes its own output.
		echo $content;
		?>
	</div>
</fieldset>
