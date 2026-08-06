<?php
/**
 * Table of Contents — frontend render.
 *
 * Emits the wrapper + an empty list placeholder. The actual list (and the
 * section-count text + heading `id` anchors) is built by the `the_content`
 * filter in AxiomBlocks\Frontend\TableOfContents, which runs after the block
 * content is assembled so it can see every heading on the page.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Icons;
use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a = $attributes ?? array();

/* ── Which heading levels feed the list ───────────────────────────────────── */
$axiom_blocks_levels = array();
foreach ( array( 1, 2, 3, 4, 5, 6 ) as $axiom_blocks_lvl ) {
	if ( ! empty( $axiom_blocks_a[ 'levelH' . $axiom_blocks_lvl ] ) ) {
		$axiom_blocks_levels[] = $axiom_blocks_lvl;
	}
}
if ( empty( $axiom_blocks_levels ) ) {
	$axiom_blocks_levels = array( 2, 3, 4 );
}

$axiom_blocks_marker = (string) ( $axiom_blocks_a['markerType'] ?? 'numbered' );
if ( ! in_array( $axiom_blocks_marker, array( 'numbered', 'bullet', 'none' ), true ) ) {
	$axiom_blocks_marker = 'numbered';
}

$axiom_blocks_eyebrow      = (string) ( $axiom_blocks_a['eyebrow'] ?? 'On this page' );
$axiom_blocks_show_title   = ! empty( $axiom_blocks_a['showTitle'] );
$axiom_blocks_title        = (string) ( $axiom_blocks_a['title'] ?? '' );
$axiom_blocks_collapsible  = ! empty( $axiom_blocks_a['collapsible'] );
$axiom_blocks_init_collapsed = $axiom_blocks_collapsible && ! empty( $axiom_blocks_a['initialCollapsed'] );
$axiom_blocks_show_count   = ! isset( $axiom_blocks_a['showSectionCount'] ) || ! empty( $axiom_blocks_a['showSectionCount'] );
$axiom_blocks_footer_top   = ! empty( $axiom_blocks_a['footerBackToTop'] );
$axiom_blocks_sticky       = ! empty( $axiom_blocks_a['sticky'] );
$axiom_blocks_hide_mobile  = $axiom_blocks_sticky && ! empty( $axiom_blocks_a['hideOnMobile'] );
$axiom_blocks_dock         = $axiom_blocks_sticky && ! $axiom_blocks_hide_mobile
	&& ( ! isset( $axiom_blocks_a['mobileDock'] ) || ! empty( $axiom_blocks_a['mobileDock'] ) );
$axiom_blocks_dark         = 'dark' === (string) ( $axiom_blocks_a['colorScheme'] ?? 'light' );

$axiom_blocks_title_tag = (string) ( $axiom_blocks_a['titleTag'] ?? 'h2' );
if ( ! in_array( $axiom_blocks_title_tag, array( 'h2', 'h3', 'h4', 'h5', 'h6', 'div' ), true ) ) {
	$axiom_blocks_title_tag = 'h2';
}

/* A close/collapse control is present when collapsible or when docking on mobile. */
$axiom_blocks_has_toggle = $axiom_blocks_collapsible || $axiom_blocks_dock;

/* ── Wrapper CSS custom properties + spacing ──────────────────────────────── */
$axiom_blocks_var_map = array(
	'--ab-toc-bg'            => 'bgColor',
	'--ab-toc-link'          => 'textColor',
	'--ab-toc-link-hover'    => 'linkHoverColor',
	'--ab-toc-active'        => 'activeColor',
	'--ab-toc-marker'        => 'markerColor',
	'--ab-toc-progress'      => 'progressColor',
	'--ab-toc-border'        => 'borderColor',
	'--ab-toc-bs'            => 'borderStyle',
	'--ab-toc-bw'            => 'borderWidth',
	'--ab-toc-radius'        => 'borderRadius',
	'--ab-toc-indent'        => 'indent',
	'--ab-toc-gap'           => 'itemGap',
	'--ab-toc-shadow'        => 'tocShadow',
	'--ab-toc-title-color'   => 'titleColor',
);
$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( isset( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) && '' !== $axiom_blocks_a[ $axiom_blocks_attr_key ] ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

/* Border — per-side falls back to the legacy single `borderWidth`. */
$axiom_blocks_border_map      = array(
	'top'    => 'borderTopWidth',
	'right'  => 'borderRightWidth',
	'bottom' => 'borderBottomWidth',
	'left'   => 'borderLeftWidth',
);
$axiom_blocks_border_fallback = $axiom_blocks_a['borderWidth'] ?? '';
foreach ( $axiom_blocks_border_map as $axiom_blocks_side => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $axiom_blocks_a[ $axiom_blocks_attr_key ] ?? '';
	if ( '' === $axiom_blocks_val ) {
		$axiom_blocks_val = $axiom_blocks_border_fallback;
	}
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_style_parts[] = '--ab-toc-bw-' . $axiom_blocks_side . ': ' . $axiom_blocks_val;
	}
}

/* Radius — per-corner falls back to the legacy single `borderRadius`. */
$axiom_blocks_radius_map      = array(
	'tl' => 'radiusTopLeft',
	'tr' => 'radiusTopRight',
	'br' => 'radiusBottomRight',
	'bl' => 'radiusBottomLeft',
);
$axiom_blocks_radius_fallback = $axiom_blocks_a['borderRadius'] ?? '';
foreach ( $axiom_blocks_radius_map as $axiom_blocks_corner => $axiom_blocks_attr_key ) {
	$axiom_blocks_val = $axiom_blocks_a[ $axiom_blocks_attr_key ] ?? '';
	if ( '' === $axiom_blocks_val ) {
		$axiom_blocks_val = $axiom_blocks_radius_fallback;
	}
	if ( '' !== $axiom_blocks_val ) {
		$axiom_blocks_style_parts[] = '--ab-toc-radius-' . $axiom_blocks_corner . ': ' . $axiom_blocks_val;
	}
}

/* Max width — inline-only (content-slider / info-box pattern): unset ⇒ no output
   so the ToC fills the content column; ResponsiveProps adds the media rules. */
if ( ! empty( $axiom_blocks_a['maxWidth'] ) ) {
	$axiom_blocks_style_parts[] = 'max-width: ' . $axiom_blocks_a['maxWidth'];
}

if ( $axiom_blocks_sticky ) {
	$axiom_blocks_style_parts[] = '--ab-toc-sticky-offset: ' . (int) ( $axiom_blocks_a['stickyOffset'] ?? 24 ) . 'px';
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper classes ──────────────────────────────────────────────────────── */
$axiom_blocks_classes = array( 'ab-toc', 'ab-toc--' . $axiom_blocks_marker );
if ( $axiom_blocks_dark ) {
	$axiom_blocks_classes[] = 'ab-toc--dark';
}
if ( $axiom_blocks_sticky ) {
	$axiom_blocks_classes[] = 'ab-toc--sticky';
	if ( $axiom_blocks_hide_mobile ) {
		$axiom_blocks_classes[] = 'ab-toc--hide-mobile';
	}
	if ( $axiom_blocks_dock ) {
		$axiom_blocks_classes[] = 'ab-toc--dock';
	}
}
if ( $axiom_blocks_collapsible ) {
	$axiom_blocks_classes[] = 'ab-toc--collapsible';
	if ( $axiom_blocks_init_collapsed ) {
		$axiom_blocks_classes[] = 'is-collapsed';
	}
}
if ( ! empty( $axiom_blocks_a['sectionProgress'] ) ) {
	$axiom_blocks_classes[] = 'ab-toc--progress';
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
$axiom_blocks_style_attr = safecss_filter_attr( implode( ';', $axiom_blocks_merged_style_parts ) );
$axiom_blocks_id_attr    = $axiom_blocks_block_supports['id'] ?? '';

$axiom_blocks_title_typo   = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'title' ) );
$axiom_blocks_content_typo = safecss_filter_attr( Typography::inline_style( $axiom_blocks_a, 'content' ) );

$axiom_blocks_copy_link = ! empty( $axiom_blocks_a['copyLink'] );
?>
<nav
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	aria-label="<?php echo esc_attr__( 'Table of contents', 'axiom-blocks' ); ?>"
	data-ab-toc="1"
	data-smooth="<?php echo empty( $axiom_blocks_a['smoothScroll'] ) ? '0' : '1'; ?>"
	data-offset="<?php echo (int) ( $axiom_blocks_a['scrollOffset'] ?? 0 ); ?>"
	data-spy="<?php echo empty( $axiom_blocks_a['scrollSpy'] ) ? '0' : '1'; ?>"
	data-sticky="<?php echo $axiom_blocks_sticky ? '1' : '0'; ?>"
	data-dock="<?php echo $axiom_blocks_dock ? '1' : '0'; ?>"
	data-back-to-top="<?php echo empty( $axiom_blocks_a['backToTop'] ) ? '0' : '1'; ?>"
	data-section-progress="<?php echo empty( $axiom_blocks_a['sectionProgress'] ) ? '0' : '1'; ?>"
	data-collapsible="<?php echo $axiom_blocks_collapsible ? '1' : '0'; ?>"
>
	<?php if ( $axiom_blocks_dock ) : ?>
		<button type="button" class="ab-toc__bar" data-ab-toc-open aria-label="<?php echo esc_attr__( 'Open table of contents', 'axiom-blocks' ); ?>">
			<span class="ab-toc__bar-ico"><?php echo wp_kses( Icons::get( 'list' ), AllowedHtml::svg() ); ?></span>
			<span class="ab-toc__bar-label"><?php echo esc_html( $axiom_blocks_eyebrow ); ?></span>
			<span class="ab-toc__bar-meta" data-ab-toc-count></span>
			<span class="ab-toc__bar-chev"><?php echo wp_kses( Icons::get( 'chevron-up' ), AllowedHtml::svg() ); ?></span>
		</button>
		<div class="ab-toc__scrim" data-ab-toc-close></div>
	<?php endif; ?>

	<div class="ab-toc__head">
		<div class="ab-toc__head-titles">
			<p class="ab-toc__eyebrow"><?php echo esc_html( $axiom_blocks_eyebrow ); ?><?php if ( $axiom_blocks_show_count && $axiom_blocks_collapsible ) : ?><span class="ab-toc__count" data-ab-toc-count-sep></span><?php endif; ?></p>
			<?php if ( $axiom_blocks_show_title && '' !== trim( $axiom_blocks_title ) ) : ?>
				<<?php echo tag_escape( $axiom_blocks_title_tag ); ?>
					class="ab-toc__title"
					<?php echo '' !== $axiom_blocks_title_typo ? ' style="' . esc_attr( $axiom_blocks_title_typo ) . '"' : ''; ?>
				><?php echo wp_kses_post( $axiom_blocks_title ); ?></<?php echo tag_escape( $axiom_blocks_title_tag ); ?>>
			<?php endif; ?>
		</div>
		<?php if ( $axiom_blocks_has_toggle ) : ?>
			<button
				type="button"
				class="ab-toc__toggle"
				data-ab-toc-toggle
				aria-expanded="<?php echo $axiom_blocks_init_collapsed ? 'false' : 'true'; ?>"
				aria-label="<?php echo esc_attr__( 'Toggle table of contents', 'axiom-blocks' ); ?>"
			><?php echo wp_kses( Icons::get( 'chevron-down' ), AllowedHtml::svg() ); ?></button>
		<?php endif; ?>
	</div>

	<div class="ab-toc__body">
		<div
			class="ab-toc__list"
			data-ab-toc-levels="<?php echo esc_attr( implode( ',', $axiom_blocks_levels ) ); ?>"
			data-ab-toc-marker="<?php echo esc_attr( $axiom_blocks_marker ); ?>"
			data-ab-toc-prefix="<?php echo esc_attr( (string) ( $axiom_blocks_a['numberPrefix'] ?? '' ) ); ?>"
			data-ab-toc-copy="<?php echo $axiom_blocks_copy_link ? '1' : '0'; ?>"
			<?php echo '' !== $axiom_blocks_content_typo ? ' style="' . esc_attr( $axiom_blocks_content_typo ) . '"' : ''; ?>
		></div>
	</div>

	<?php if ( $axiom_blocks_footer_top ) : ?>
		<div class="ab-toc__foot">
			<button type="button" class="ab-toc__top" data-ab-toc-top>
				<?php echo wp_kses( Icons::get( 'arrow-up' ), AllowedHtml::svg() ); ?>
				<?php echo esc_html__( 'Back to top', 'axiom-blocks' ); ?>
			</button>
		</div>
	<?php endif; ?>
</nav>
