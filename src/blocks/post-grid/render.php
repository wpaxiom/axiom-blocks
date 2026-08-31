<?php
/**
 * Post Grid — frontend render.
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

$axiom_blocks_key  = substr( md5( wp_json_encode( array( $axiom_blocks_card, $axiom_blocks_feat, $axiom_blocks_args ) ) ), 0, 16 );
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

// Register the template so the load-more route can render further pages without
// ever accepting block markup from the client.
if ( $axiom_blocks_has_pag && class_exists( '\AxiomBlocks\Blocks\PostGridTemplates' ) ) {
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

if ( ! empty( $axiom_blocks_a['featuredEnabled'] ) ) {
	$axiom_blocks_cols = max( 1, (int) ( $axiom_blocks_a['columns'] ?? 3 ) );
	$axiom_blocks_span = max( 1, (int) ( $axiom_blocks_a['featuredSpan'] ?? 2 ) );
	// Never span more tracks than the grid has, which would create implicit columns.
	$axiom_blocks_style_parts[] = '--ab-pg-feat-span: ' . min( $axiom_blocks_span, $axiom_blocks_cols );
}

/* Grid box — background / shadow / border color, then per-side and per-corner. */
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
		<div class="ab-pg__list" data-ab-pg-key="<?php echo esc_attr( $axiom_blocks_key ); ?>">
			<?php echo $axiom_blocks_cards; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render. ?>
		</div>
	<?php endif; ?>
	<?php echo $axiom_blocks_after; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML, already escaped by each block's own render. ?>
</div>
