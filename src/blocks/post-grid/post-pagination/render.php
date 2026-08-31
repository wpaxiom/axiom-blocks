<?php
/**
 * Post Pagination — frontend render.
 *
 * Numbered pagination is plain server-rendered links, so it works with JS off.
 * Load more is progressive enhancement on top: the button is a real link to
 * page 2, and view.js upgrades it to append results in place.
 *
 * Page state, totals and the template key all arrive as context from the parent
 * grid, so this block never runs a query of its own.
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
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_type = (string) ( $axiom_blocks_a['paginationType'] ?? 'numbered' );
if ( ! in_array( $axiom_blocks_type, array( 'none', 'numbered', 'loadmore' ), true ) ) {
	$axiom_blocks_type = 'numbered';
}
if ( 'none' === $axiom_blocks_type ) {
	return;
}

$axiom_blocks_key   = (string) ( $block->context['axiom-blocks/pgKey'] ?? '' );
$axiom_blocks_page  = max( 1, (int) ( $block->context['axiom-blocks/pgPage'] ?? 1 ) );
$axiom_blocks_total = max( 0, (int) ( $block->context['axiom-blocks/pgTotalPages'] ?? 0 ) );

// One page or none: nothing to paginate.
if ( $axiom_blocks_total < 2 ) {
	return;
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pg-pag-color'   => 'pagColor',
	'--ab-pg-pag-color-h' => 'pagColorHover',
	'--ab-pg-pag-color-a' => 'pagColorActive',
	'--ab-pg-pag-bg'      => 'pagBg',
	'--ab-pg-pag-bg-h'    => 'pagBgHover',
	'--ab-pg-pag-bg-a'    => 'pagBgActive',
	'--ab-pg-pag-bc'      => 'pagBorderColor',
	'--ab-pg-pag-bc-h'    => 'pagBorderColorHover',
	'--ab-pg-pag-bc-a'    => 'pagBorderColorActive',
	'--ab-pg-pag-gap'     => 'pagGap',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'pagBorderTopWidth',
	'right'  => 'pagBorderRightWidth',
	'bottom' => 'pagBorderBottomWidth',
	'left'   => 'pagBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pg-pag-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_bs = (string) ( $axiom_blocks_a['pagBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pg-pag-bs: ' . ( '' !== $axiom_blocks_bs ? $axiom_blocks_bs : 'solid' );
} elseif ( '' !== $axiom_blocks_bs ) {
	$axiom_blocks_style_parts[] = '--ab-pg-pag-bs: ' . $axiom_blocks_bs;
}

foreach ( array(
	'tl' => 'pagRadiusTopLeft',
	'tr' => 'pagRadiusTopRight',
	'br' => 'pagRadiusBottomRight',
	'bl' => 'pagRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pg-pag-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

foreach ( array(
	'pt' => 'pagPaddingTop',
	'pr' => 'pagPaddingRight',
	'pb' => 'pagPaddingBottom',
	'pl' => 'pagPaddingLeft',
) as $axiom_blocks_edge => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pg-pag-' . $axiom_blocks_edge . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_align         = (string) ( $axiom_blocks_a['pagAlign'] ?? 'center' );
$axiom_blocks_map           = array(
	'left'   => 'flex-start',
	'center' => 'center',
	'right'  => 'flex-end',
);
$axiom_blocks_style_parts[] = '--ab-pg-pag-justify: ' . ( $axiom_blocks_map[ $axiom_blocks_align ] ?? 'center' );

$axiom_blocks_typo = Typography::inline_style( $axiom_blocks_a, '' );
if ( '' !== $axiom_blocks_typo ) {
	$axiom_blocks_style_parts[] = rtrim( $axiom_blocks_typo, ';' );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

// Two Post Grids on one page each include this file, so the helper has to be
// declared conditionally or the second one fatals on redeclaration.
if ( ! function_exists( 'axiom_blocks_pg_page_url' ) ) {
	/**
	 * URL for a given page of this grid.
	 *
	 * Scoped by the template key so two grids on one page paginate independently.
	 *
	 * @param int    $page Page number.
	 * @param string $key  Grid template key.
	 * @return string
	 */
	function axiom_blocks_pg_page_url( int $page, string $key ): string {
		$base = remove_query_arg( array( 'ab_pg_page', 'ab_pg_key' ) );
		if ( $page <= 1 ) {
			return $base;
		}
		return add_query_arg(
			array(
				'ab_pg_page' => $page,
				'ab_pg_key'  => $key,
			),
			$base
		);
	}
}

$axiom_blocks_prev = (string) ( $axiom_blocks_a['prevLabel'] ?? '' );
$axiom_blocks_next = (string) ( $axiom_blocks_a['nextLabel'] ?? '' );
if ( '' === $axiom_blocks_prev ) {
	$axiom_blocks_prev = __( 'Previous', 'axiom-blocks' );
}
if ( '' === $axiom_blocks_next ) {
	$axiom_blocks_next = __( 'Next', 'axiom-blocks' );
}
?>
<nav
	class="ab-pg__pagination ab-pg__pagination--<?php echo esc_attr( $axiom_blocks_type ); ?>"
	aria-label="<?php echo esc_attr__( 'Post grid pagination', 'axiom-blocks' ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
<?php if ( 'loadmore' === $axiom_blocks_type ) : ?>
	<?php
	$axiom_blocks_more = (string) ( $axiom_blocks_a['loadMoreLabel'] ?? '' );
	if ( '' === $axiom_blocks_more ) {
		$axiom_blocks_more = __( 'Load more', 'axiom-blocks' );
	}
	?>
	<a
		class="ab-pg__loadmore"
		href="<?php echo esc_url( axiom_blocks_pg_page_url( $axiom_blocks_page + 1, $axiom_blocks_key ) ); ?>"
		data-ab-pg-key="<?php echo esc_attr( $axiom_blocks_key ); ?>"
		data-ab-pg-next="<?php echo esc_attr( (string) ( $axiom_blocks_page + 1 ) ); ?>"
		data-ab-pg-total="<?php echo esc_attr( (string) $axiom_blocks_total ); ?>"
	><?php echo esc_html( $axiom_blocks_more ); ?></a>
<?php else : ?>
	<?php
	$axiom_blocks_links = paginate_links(
		array(
			'base'      => str_replace( 999999999, '%#%', axiom_blocks_pg_page_url( 999999999, $axiom_blocks_key ) ),
			'format'    => '',
			'current'   => $axiom_blocks_page,
			'total'     => $axiom_blocks_total,
			'mid_size'  => max( 0, (int) ( $axiom_blocks_a['midSize'] ?? 2 ) ),
			'prev_text' => $axiom_blocks_prev,
			'next_text' => $axiom_blocks_next,
			'type'      => 'array',
		)
	);
	?>
	<?php if ( is_array( $axiom_blocks_links ) ) : ?>
		<?php foreach ( $axiom_blocks_links as $axiom_blocks_link ) : ?>
			<?php
			echo wp_kses(
				$axiom_blocks_link,
				array(
					'a'    => array(
						'href'  => array(),
						'class' => array(),
					),
					'span' => array( 'class' => array() ),
				)
			);
			?>
		<?php endforeach; ?>
	<?php endif; ?>
<?php endif; ?>
</nav>
