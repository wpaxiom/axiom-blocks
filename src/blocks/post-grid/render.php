<?php
/**
 * Post Grid - frontend render.
 *
 * Runs the query, then renders the first `post-card` inner block once per
 * result with `postId` / `postType` injected as render context. Those are
 * CORE's context key names on purpose: the same per-item blocks then work
 * inside `core/post-template` as well as inside our card.
 *
 * Any other inner block (pagination, no-results) renders once, after the loop.
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

// Split the inner blocks into: the default card template, the optional featured
// card template (a second post-card whose cardRole is "featured"), and the
// siblings that render once after the loop.
$axiom_blocks_card     = null;
$axiom_blocks_feat     = null;
$axiom_blocks_siblings = array();
foreach ( $axiom_blocks_inner as $axiom_blocks_child ) {
	if ( 'axiom-blocks/post-card' === ( $axiom_blocks_child['blockName'] ?? '' ) ) {
		$axiom_blocks_role = $axiom_blocks_child['attrs']['cardRole'] ?? 'default';
		if ( 'featured' === $axiom_blocks_role ) {
			if ( null === $axiom_blocks_feat ) {
				$axiom_blocks_feat = $axiom_blocks_child;
			}
			continue;
		}
		if ( null === $axiom_blocks_card ) {
			$axiom_blocks_card = $axiom_blocks_child;
			continue;
		}
	}
	$axiom_blocks_siblings[] = $axiom_blocks_child;
}

if ( null === $axiom_blocks_card ) {
	return;
}

/* ── Query ────────────────────────────────────────────────────────────────── */
$axiom_blocks_post_type = (string) ( $axiom_blocks_a['postType'] ?? 'post' );
if ( ! post_type_exists( $axiom_blocks_post_type ) ) {
	$axiom_blocks_post_type = 'post';
}

$axiom_blocks_order = strtoupper( (string) ( $axiom_blocks_a['order'] ?? 'desc' ) );
if ( ! in_array( $axiom_blocks_order, array( 'ASC', 'DESC' ), true ) ) {
	$axiom_blocks_order = 'DESC';
}

$axiom_blocks_order_by = (string) ( $axiom_blocks_a['orderBy'] ?? 'date' );
if ( ! in_array( $axiom_blocks_order_by, array( 'date', 'modified', 'title', 'menu_order', 'rand', 'comment_count' ), true ) ) {
	$axiom_blocks_order_by = 'date';
}

$axiom_blocks_args = array(
	'post_type'           => $axiom_blocks_post_type,
	'post_status'         => 'publish',
	'posts_per_page'      => max( 1, min( 100, (int) ( $axiom_blocks_a['postsPerPage'] ?? 6 ) ) ),
	'offset'              => max( 0, (int) ( $axiom_blocks_a['offset'] ?? 0 ) ),
	'order'               => $axiom_blocks_order,
	'orderby'             => $axiom_blocks_order_by,
	'ignore_sticky_posts' => true,
	'no_found_rows'       => true,
	'fields'              => 'ids',
);

$axiom_blocks_sticky = (string) ( $axiom_blocks_a['sticky'] ?? '' );
if ( 'only' === $axiom_blocks_sticky ) {
	$axiom_blocks_stickies         = get_option( 'sticky_posts' );
	$axiom_blocks_args['post__in'] = ! empty( $axiom_blocks_stickies ) ? $axiom_blocks_stickies : array( 0 );
} elseif ( 'exclude' === $axiom_blocks_sticky ) {
	$axiom_blocks_stickies = get_option( 'sticky_posts' );
	if ( ! empty( $axiom_blocks_stickies ) ) {
		$axiom_blocks_args['post__not_in'] = $axiom_blocks_stickies; // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in -- Bounded ID list (sticky posts); a post grid excludes by definition.
	}
}

$axiom_blocks_authors = array_filter( array_map( 'absint', (array) ( $axiom_blocks_a['authors'] ?? array() ) ) );
if ( ! empty( $axiom_blocks_authors ) ) {
	$axiom_blocks_args['author__in'] = array_values( $axiom_blocks_authors );
}

$axiom_blocks_taxonomy = (string) ( $axiom_blocks_a['taxonomy'] ?? '' );
if ( '' !== $axiom_blocks_taxonomy && taxonomy_exists( $axiom_blocks_taxonomy ) ) {
	// Carry the taxonomy as metadata on the stored args so PostFilterResolver can
	// validate a Post Filter bar's `ab_f_tax_{taxonomy}` token against the grid.
	// WP_Query ignores a lone `taxonomy` var (it only acts when `term` is also
	// present), so this never changes the base query itself.
	$axiom_blocks_args['taxonomy'] = $axiom_blocks_taxonomy;

	$axiom_blocks_tax_query = array();

	$axiom_blocks_terms = array_filter( array_map( 'absint', (array) ( $axiom_blocks_a['terms'] ?? array() ) ) );
	if ( ! empty( $axiom_blocks_terms ) ) {
		$axiom_blocks_tax_query[] = array(
			'taxonomy' => $axiom_blocks_taxonomy,
			'field'    => 'term_id',
			'terms'    => array_values( $axiom_blocks_terms ),
		);
	}

	$axiom_blocks_ex_terms = array_filter( array_map( 'absint', (array) ( $axiom_blocks_a['excludeTerms'] ?? array() ) ) );
	if ( ! empty( $axiom_blocks_ex_terms ) ) {
		$axiom_blocks_tax_query[] = array(
			'taxonomy' => $axiom_blocks_taxonomy,
			'field'    => 'term_id',
			'terms'    => array_values( $axiom_blocks_ex_terms ),
			'operator' => 'NOT IN',
		);
	}

	if ( ! empty( $axiom_blocks_tax_query ) ) {
		$axiom_blocks_args['tax_query'] = $axiom_blocks_tax_query; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- A post grid is a taxonomy-filtered list by definition.
	}
}

if ( ! empty( $axiom_blocks_a['excludeCurrent'] ) ) {
	$axiom_blocks_current = get_the_ID();
	if ( $axiom_blocks_current ) {
		$axiom_blocks_args['post__not_in'] = array_merge( // phpcs:ignore WordPressVIPMinimum.Performance.WPQueryParams.PostNotIn_post__not_in -- Bounded ID list (current post only); a post grid excludes by definition.
			$axiom_blocks_args['post__not_in'] ?? array(),
			array( $axiom_blocks_current )
		);
	}
}

// A pagination sibling means we need found_rows for the page count, and a
// stable key so two grids on one page paginate independently. The key is a hash
// of the card template + query args: identical grids share one entry, and a
// client can only ever reference a template this site actually rendered.
$axiom_blocks_has_pag = false;
foreach ( $axiom_blocks_siblings as $axiom_blocks_sibling ) {
	if ( 'axiom-blocks/post-pagination' === ( $axiom_blocks_sibling['blockName'] ?? '' ) ) {
		$axiom_blocks_has_pag = true;
		break;
	}
}

// The base key is the hash of the card template + the author's saved args
// (before any filter or pagination folds in). A Post Filter bar targets a grid
// by exactly this base key.
$axiom_blocks_base_key = substr( md5( wp_json_encode( array( $axiom_blocks_card, $axiom_blocks_feat, $axiom_blocks_args ) ) ), 0, 16 );

// A Post Filter bar may target this grid on a full page load (JS-off, or a
// bookmarked filtered URL). The bar only ever names this grid by its *base*
// key, so verify the request's base key against our own before applying any
// whitelisted `ab_f_*` tokens; a filter never applies to a grid it did not name.
// This is purely additive: with no matching `ab_f_base` param it changes nothing.
// The variant key is the hash of the filtered args, exactly the key the
// no-reload route derives, so a reload and the JS upgrade converge on the same
// transient.
// A bar names its grid by anchor (always available to it) and by base key (only
// available once the grid has rendered, so empty whenever the bar sits above the
// grid). Either signal identifies this grid; neither can widen the query, since
// the tokens are still applied to THIS grid's own saved args.
$axiom_blocks_filter         = array();
$axiom_blocks_filtered_args  = $axiom_blocks_args;
$axiom_blocks_req_base       = '';
$axiom_blocks_anchor         = (string) ( $axiom_blocks_a['anchor'] ?? '' );
if ( class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter state; the tokens are whitelisted and validated in PostFilterResolver.
	$axiom_blocks_req_base = isset( $_GET['ab_f_base'] ) ? sanitize_key( wp_unslash( $_GET['ab_f_base'] ) ) : '';
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter state; the anchor only selects which grid on the page is addressed.
	$axiom_blocks_req_target = isset( $_GET['ab_f_target'] ) ? sanitize_text_field( wp_unslash( $_GET['ab_f_target'] ) ) : '';

	$axiom_blocks_addressed = ( '' !== $axiom_blocks_base_key && $axiom_blocks_req_base === $axiom_blocks_base_key )
		|| ( '' !== $axiom_blocks_anchor && $axiom_blocks_req_target === $axiom_blocks_anchor );

	if ( $axiom_blocks_addressed ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public filter state paged via GET; tokens validated in PostFilterResolver.
		$axiom_blocks_filter = PostFilterResolver::tokens_from_get( wp_unslash( $_GET ), $axiom_blocks_args );
		if ( ! empty( $axiom_blocks_filter ) ) {
			$axiom_blocks_filtered_args = PostFilterResolver::apply_filter( $axiom_blocks_args, $axiom_blocks_filter );
		}
	}
}

$axiom_blocks_variant_key  = substr( md5( wp_json_encode( array( $axiom_blocks_card, $axiom_blocks_feat, $axiom_blocks_filtered_args ) ) ), 0, 16 );
$axiom_blocks_is_filtered  = $axiom_blocks_filtered_args !== $axiom_blocks_args;

// If this grid is filtered, the rendered key is the variant; otherwise it is
// the base. Pagination then matches whichever key the request actually targets.
$axiom_blocks_key  = $axiom_blocks_is_filtered ? $axiom_blocks_variant_key : $axiom_blocks_base_key;
$axiom_blocks_args = $axiom_blocks_filtered_args;
$axiom_blocks_page = 1;
if ( $axiom_blocks_has_pag ) {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public pagination state, no action taken.
	$axiom_blocks_req_key = isset( $_GET['ab_pg_key'] ) ? sanitize_key( wp_unslash( $_GET['ab_pg_key'] ) ) : '';
	if ( $axiom_blocks_req_key === $axiom_blocks_key ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only public pagination state, no action taken.
		$axiom_blocks_page = isset( $_GET['ab_pg_page'] ) ? max( 1, absint( wp_unslash( $_GET['ab_pg_page'] ) ) ) : 1;
	}

	$axiom_blocks_args['no_found_rows'] = false;
	$axiom_blocks_args['paged']         = $axiom_blocks_page;
	// `offset` and `paged` are mutually exclusive in WP_Query; fold the offset in.
	if ( ! empty( $axiom_blocks_args['offset'] ) ) {
		$axiom_blocks_args['offset'] = $axiom_blocks_args['offset']
			+ ( ( $axiom_blocks_page - 1 ) * $axiom_blocks_args['posts_per_page'] );
		unset( $axiom_blocks_args['paged'] );
	}
}


$axiom_blocks_query = new WP_Query( $axiom_blocks_args );
$axiom_blocks_ids   = $axiom_blocks_query->posts;
$axiom_blocks_pages = $axiom_blocks_has_pag ? max( 1, (int) $axiom_blocks_query->max_num_pages ) : 1;

// Register the template so the load-more route (and a Post Filter bar) can
// render further / filtered results without ever accepting block markup from
// the client. Registered on every render, not just grids with pagination, so a
// filter bar can resolve the base grid it targets. This is still a template this
// page actually rendered, bounded by the transient TTL; it never widens trust.
if ( class_exists( '\AxiomBlocks\Blocks\PostGridTemplates' ) ) {
	\AxiomBlocks\Blocks\PostGridTemplates::remember(
		$axiom_blocks_key,
		array(
			'card' => $axiom_blocks_card,
			'feat' => $axiom_blocks_feat,
			'args' => $axiom_blocks_args,
			'attr' => $axiom_blocks_a,
		)
	);
}

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-pg-col-gap' => 'columnGap',
	'--ab-pg-row-gap' => 'rowGap',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_style_parts[] = '--ab-pg-cols: ' . max( 1, (int) ( $axiom_blocks_a['columns'] ?? 3 ) );

// Alignment. `left|center|right` maps to a flex value for the card's own
// cross-axis and passes straight through as text-align; an unset value emits
// nothing, so a grid saved before these controls is byte-identical.
$axiom_blocks_align_flex = array(
	'left'   => 'flex-start',
	'center' => 'center',
	'right'  => 'flex-end',
);
$axiom_blocks_content_align = (string) ( $axiom_blocks_a['contentAlign'] ?? '' );
if ( isset( $axiom_blocks_align_flex[ $axiom_blocks_content_align ] ) ) {
	$axiom_blocks_style_parts[] = '--ab-pg-calign: ' . $axiom_blocks_align_flex[ $axiom_blocks_content_align ];
	$axiom_blocks_style_parts[] = '--ab-pg-ctext: ' . $axiom_blocks_content_align;
}
$axiom_blocks_vertical_align = (string) ( $axiom_blocks_a['verticalAlign'] ?? '' );
if ( in_array( $axiom_blocks_vertical_align, array( 'start', 'center', 'end', 'stretch' ), true ) ) {
	$axiom_blocks_style_parts[] = '--ab-pg-valign: ' . $axiom_blocks_vertical_align;
}

if ( ! empty( $axiom_blocks_a['featuredEnabled'] ) ) {
	$axiom_blocks_cols = max( 1, (int) ( $axiom_blocks_a['columns'] ?? 3 ) );
	$axiom_blocks_span = max( 1, (int) ( $axiom_blocks_a['featuredSpan'] ?? 2 ) );
	// Never span more tracks than the grid has, which would create implicit columns.
	$axiom_blocks_style_parts[] = '--ab-pg-feat-span: ' . min( $axiom_blocks_span, $axiom_blocks_cols );
}

/* Grid box - background / shadow / border color, then per-side and per-corner. */
foreach ( array(
	'--ab-pg-bg'     => 'gridBg',
	'--ab-pg-shadow' => 'gridShadow',
	'--ab-pg-bc'     => 'gridBorderColor',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_any_bw = false;
foreach ( array(
	'top'    => 'gridBorderTopWidth',
	'right'  => 'gridBorderRightWidth',
	'bottom' => 'gridBorderBottomWidth',
	'left'   => 'gridBorderLeftWidth',
) as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_any_bw        = true;
		$axiom_blocks_style_parts[] = '--ab-pg-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_grid_bs = (string) ( $axiom_blocks_a['gridBorderStyle'] ?? '' );
if ( $axiom_blocks_any_bw ) {
	$axiom_blocks_style_parts[] = '--ab-pg-bs: ' . ( '' !== $axiom_blocks_grid_bs ? $axiom_blocks_grid_bs : 'solid' );
} elseif ( '' !== $axiom_blocks_grid_bs ) {
	$axiom_blocks_style_parts[] = '--ab-pg-bs: ' . $axiom_blocks_grid_bs;
}

foreach ( array(
	'tl' => 'gridRadiusTopLeft',
	'tr' => 'gridRadiusTopRight',
	'br' => 'gridRadiusBottomRight',
	'bl' => 'gridRadiusBottomLeft',
) as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pg-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

foreach ( array(
	'pt' => 'gridPaddingTop',
	'pr' => 'gridPaddingRight',
	'pb' => 'gridPaddingBottom',
	'pl' => 'gridPaddingLeft',
) as $axiom_blocks_edge => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = '--ab-pg-' . $axiom_blocks_edge . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper attributes ───────────────────────────────────────────────────── */
$axiom_blocks_layout = 'list' === ( $axiom_blocks_a['layout'] ?? 'grid' ) ? 'list' : 'grid';

$axiom_blocks_classes = array(
	'ab-pg',
	'ab-pg--' . $axiom_blocks_layout,
);
if ( ! empty( $axiom_blocks_a['equalHeight'] ) ) {
	$axiom_blocks_classes[] = 'is-equal-height';
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

// Record this grid's base key by its anchor so a Post Filter bar rendered later
// in the same page can emit the key it must filter against. Always the BASE key:
// on an already-filtered request the rendered key is the variant, and handing
// that to a bar would make its next submit filter the filtered result.
if ( class_exists( '\AxiomBlocks\Blocks\PostFilterResolver' ) ) {
	\AxiomBlocks\Blocks\PostFilterResolver::record_anchor( $axiom_blocks_id_attr, $axiom_blocks_base_key );
}

/* ── Loop ─────────────────────────────────────────────────────────────────── */

// Which post, if any, gets the featured template. "specific" falls back to the
// first result when the chosen post is not in this query, so the featured slot
// never silently disappears.
$axiom_blocks_feat_id = 0;
if ( ! empty( $axiom_blocks_a['featuredEnabled'] ) && null !== $axiom_blocks_feat && ! empty( $axiom_blocks_ids ) ) {
	if ( 'specific' === ( $axiom_blocks_a['featuredSource'] ?? 'first' ) ) {
		$axiom_blocks_chosen  = (int) ( $axiom_blocks_a['featuredPostId'] ?? 0 );
		$axiom_blocks_feat_id = in_array( $axiom_blocks_chosen, $axiom_blocks_ids, true )
			? $axiom_blocks_chosen
			: (int) $axiom_blocks_ids[0];
	} else {
		$axiom_blocks_feat_id = (int) $axiom_blocks_ids[0];
	}
}

$axiom_blocks_cards = '';
foreach ( $axiom_blocks_ids as $axiom_blocks_post_id ) {
	$axiom_blocks_tpl = ( $axiom_blocks_feat_id && (int) $axiom_blocks_post_id === $axiom_blocks_feat_id )
		? $axiom_blocks_feat
		: $axiom_blocks_card;

	$axiom_blocks_cards .= ( new WP_Block(
		$axiom_blocks_tpl,
		array(
			'postId'   => $axiom_blocks_post_id,
			'postType' => get_post_type( $axiom_blocks_post_id ),
		)
	) )->render();
}
wp_reset_postdata();

$axiom_blocks_ctx = array(
	'axiom-blocks/pgKey'        => $axiom_blocks_key,
	'axiom-blocks/pgPage'       => $axiom_blocks_page,
	'axiom-blocks/pgTotalPages' => $axiom_blocks_pages,
	'axiom-blocks/pgHasResults' => ! empty( $axiom_blocks_ids ),
);

$axiom_blocks_after = '';
foreach ( $axiom_blocks_siblings as $axiom_blocks_sibling ) {
	$axiom_blocks_after .= ( new WP_Block( $axiom_blocks_sibling, $axiom_blocks_ctx ) )->render();
}
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php if ( '' !== $axiom_blocks_cards ) : ?>
		<div class="ab-pg__list" data-ab-pg-key="<?php echo esc_attr( $axiom_blocks_key ); ?>" data-ab-pg-base="<?php echo esc_attr( $axiom_blocks_base_key ); ?>">
			<?php echo $axiom_blocks_cards; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render. ?>
		</div>
	<?php endif; ?>
	<?php echo $axiom_blocks_after; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render. ?>
</div>
