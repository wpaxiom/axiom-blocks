<?php
/**
 * Post Filter - frontend render.
 *
 * Emits the bar's <form>. It uses method="get" and namespaced, whitelisted
 * `ab_f_*` fields, so with JavaScript off the form is still a real, working
 * GET form. The target Post Grid's render.php picks up those same tokens and
 * applied them to the author's saved query; the JS upgrade (assets/post-filter.js)
 * intercepts the submit and swaps the results in place instead.
 *
 * The only thing the form carries about the grid is its base template key, via
 * a hidden `ab_f_base` input. That key is registered by the grid itself; the
 * client never sends markup or untrusted query arguments, only a key plus the
 * validated tokens.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\PostFilterResolver;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a     = $attributes ?? array();
$axiom_blocks_inner = $block->parsed_block['innerBlocks'] ?? array();

if ( empty( $axiom_blocks_inner ) ) {
	return;
}

/* ── Resolve the target grid ──────────────────────────────────────────────── */
// The anchor is the ground truth for WHICH grid this bar drives: it is a saved
// attribute, so it is known here no matter where the grid sits on the page.
//
// The base key is a bonus, not a requirement. It can only be filled in by a grid
// that already rendered, and a bar normally sits ABOVE its grid, so it is empty
// on the common layout. Post Grid therefore matches on either signal, and the
// bar sends whichever it has.
$axiom_blocks_target = (string) ( $axiom_blocks_a['targetAnchor'] ?? '' );

if ( class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter state; key is a sanitized hash.
	$axiom_blocks_base_key = isset( $_GET['ab_f_base'] ) ? sanitize_key( wp_unslash( $_GET['ab_f_base'] ) ) : '';
	if ( '' === $axiom_blocks_base_key ) {
		$axiom_blocks_base_key = PostFilterResolver::key_for_anchor( $axiom_blocks_target );
	}
} else {
	$axiom_blocks_base_key = '';
}

// Preserve other public query state (pagination base key + page) so a filtered
// submit keeps working within the same query string.
$axiom_blocks_action = remove_query_arg(
	array( 'ab_f_base', 'ab_f_target', 'ab_f_s', 'ab_f_sort', 'ab_f_reset', 'ab_f_tax' ),
	(string) get_permalink()
);

/* ── Bar CSS custom properties + spacing ──────────────────────────────────── */
$axiom_blocks_style_parts = array();

foreach ( array(
	'--ab-pf-bg'     => 'barBg',
	'--ab-pf-shadow' => 'barShadow',
	'--ab-pf-bc'     => 'barBorderColor',

	// Bar layout. The direction and gaps also have per-device values, injected
	// by ResponsiveProps on the same custom properties.
	'--ab-pf-dir'     => 'direction',
	'--ab-pf-gap'     => 'fieldGap',
	'--ab-pf-row-gap' => 'fieldRowGap',
	'--ab-pf-align'   => 'alignItems',

	// Field labels and the result count are painted from the bar, so one label
	// style covers every control without each child repeating the rows.
	'--ab-pff-label-color'           => 'labelColor',
	'--ab-pff-label-font-family'     => 'labelFontFamily',
	'--ab-pff-label-font-weight'     => 'labelFontWeight',
	'--ab-pff-label-font-size'       => 'labelFontSize',
	'--ab-pff-label-line-height'     => 'labelLineHeight',
	'--ab-pff-label-letter-spacing'  => 'labelLetterSpacing',
	'--ab-pff-label-text-transform'  => 'labelTextTransform',
	'--ab-pff-label-text-decoration' => 'labelTextDecoration',
	'--ab-pff-label-text-align'      => 'labelTextAlign',

	'--ab-pf-count-color'           => 'countColor',
	'--ab-pf-count-font-family'     => 'countFontFamily',
	'--ab-pf-count-font-weight'     => 'countFontWeight',
	'--ab-pf-count-font-size'       => 'countFontSize',
	'--ab-pf-count-line-height'     => 'countLineHeight',
	'--ab-pf-count-letter-spacing'  => 'countLetterSpacing',
	'--ab-pf-count-text-transform'  => 'countTextTransform',
	'--ab-pf-count-text-decoration' => 'countTextDecoration',
	'--ab-pf-count-text-align'      => 'countTextAlign',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'barBorderTopWidth',
	'right'  => 'barBorderRightWidth',
	'bottom' => 'barBorderBottomWidth',
	'left'   => 'barBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pf-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_bar_bs = (string) ( $axiom_blocks_a['barBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pf-bs: ' . ( '' !== $axiom_blocks_bar_bs ? $axiom_blocks_bar_bs : 'solid' );
} elseif ( '' !== $axiom_blocks_bar_bs ) {
	$axiom_blocks_style_parts[] = '--ab-pf-bs: ' . $axiom_blocks_bar_bs;
}

foreach ( array(
	'tl' => 'barRadiusTopLeft',
	'tr' => 'barRadiusTopRight',
	'br' => 'barRadiusBottomRight',
	'bl' => 'barRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pf-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

foreach ( array(
	'pt' => 'barPaddingTop',
	'pr' => 'barPaddingRight',
	'pb' => 'barPaddingBottom',
	'pl' => 'barPaddingLeft',
) as $axiom_blocks_edge => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pf-' . $axiom_blocks_edge . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array( 'ab-pf' );
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
$axiom_blocks_label              = (string) ( $axiom_blocks_a['label'] ?? '' );

/* ── Render inner field blocks ────────────────────────────────────────────── */
// The filter provides postFilterTaxonomy / postFilterTarget via providesContext,
// but because the bar itself uses no context, WP_Block::__construct leaves the
// public $block->context empty (the provided values sit in its protected
// available_context). Reconstruct that context explicitly so the taxonomy field
// sees the bar's taxonomy, mirroring how post-grid hands a custom context to its
// children. Also drop the 3rd registry arg (its default is the global registry);
// passing a context array there makes WP_Block call get_registered() on an array
// and fatal.
$axiom_blocks_field_ctx = array_merge(
	$block->context,
	array(
		'axiom-blocks/postFilterTaxonomy' => (string) ( $axiom_blocks_a['taxonomy'] ?? '' ),
		'axiom-blocks/postFilterTarget'   => $axiom_blocks_target,
	)
);

$axiom_blocks_fields = '';
foreach ( $axiom_blocks_inner as $axiom_blocks_child ) {
	$axiom_blocks_fields .= ( new WP_Block( $axiom_blocks_child, $axiom_blocks_field_ctx ) )->render();
}

// translators: %s is the number of matching posts.
$axiom_blocks_count_one = __( '%s post', 'axiom-blocks' );
// translators: %s is the number of matching posts.
$axiom_blocks_count_many = __( '%s posts', 'axiom-blocks' );
// translators: %s is the number of matching posts.
$axiom_blocks_live_tmpl = __( 'Filter applied. Showing %s results.', 'axiom-blocks' );
?>
<form
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	action="<?php echo esc_url( $axiom_blocks_action ); ?>"
	method="get"
	role="search"
	data-ab-pf-base="<?php echo esc_attr( $axiom_blocks_base_key ); ?>"
	data-ab-pf-target="<?php echo esc_attr( $axiom_blocks_target ); ?>"
	data-ab-pf-count-one="<?php echo esc_attr( $axiom_blocks_count_one ); ?>"
	data-ab-pf-count-many="<?php echo esc_attr( $axiom_blocks_count_many ); ?>"
	data-ab-pf-live="<?php echo esc_attr( $axiom_blocks_live_tmpl ); ?>"
>
	<?php if ( '' !== $axiom_blocks_label ) : ?>
		<span class="ab-pf__label screen-reader-text"><?php echo esc_html( $axiom_blocks_label ); ?></span>
	<?php endif; ?>
	<div class="ab-pf__fields">
		<?php
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner field HTML, each field escapes its own output.
		echo $axiom_blocks_fields;
		?>
	</div>
	<?php if ( ! empty( $axiom_blocks_a['showCount'] ) ) : ?>
		<span class="ab-pf__count" role="status" aria-live="polite"></span>
	<?php endif; ?>
	<input type="hidden" name="ab_f_target" class="ab-pf__target" value="<?php echo esc_attr( $axiom_blocks_target ); ?>" />
	<input type="hidden" name="ab_f_base" class="ab-pf__base" value="<?php echo esc_attr( $axiom_blocks_base_key ); ?>" />
</form>
