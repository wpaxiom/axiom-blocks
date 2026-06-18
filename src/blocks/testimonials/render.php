<?php
/**
 * Testimonials (group) — frontend render (wrapper + optional review schema).
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
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a = $attributes ?? array();

if ( '' === trim( (string) $content ) ) {
	return;
}

$axiom_blocks_layout = (string) ( $axiom_blocks_a['layout'] ?? 'grid' );
if ( ! in_array( $axiom_blocks_layout, array( 'grid', 'carousel', 'marquee' ), true ) ) {
	$axiom_blocks_layout = 'grid';
}
$axiom_blocks_avatar_pos   = 'left' === ( $axiom_blocks_a['avatarPosition'] ?? 'top' ) ? 'left' : 'top';
$axiom_blocks_avatar_shape = (string) ( $axiom_blocks_a['avatarShape'] ?? 'circle' );
if ( ! in_array( $axiom_blocks_avatar_shape, array( 'circle', 'rounded', 'square' ), true ) ) {
	$axiom_blocks_avatar_shape = 'circle';
}
$axiom_blocks_stack      = ! isset( $axiom_blocks_a['stackOnMobile'] ) || ! empty( $axiom_blocks_a['stackOnMobile'] );
$axiom_blocks_shadow     = ! isset( $axiom_blocks_a['cardShadow'] ) || ! empty( $axiom_blocks_a['cardShadow'] );
$axiom_blocks_show_rate  = ! isset( $axiom_blocks_a['showRating'] ) || ! empty( $axiom_blocks_a['showRating'] );
$axiom_blocks_show_quote = ! isset( $axiom_blocks_a['showQuoteIcon'] ) || ! empty( $axiom_blocks_a['showQuoteIcon'] );
$axiom_blocks_readmore   = ! empty( $axiom_blocks_a['readMore'] );

/* ── Cascading CSS custom properties ──────────────────────────────────────── */
$axiom_blocks_var_map     = array(
	'--ab-tst-cols'         => 'columns',
	'--ab-tst-gap'          => 'gap',
	'--ab-tst-card-bg'      => 'cardBg',
	'--ab-tst-card-bc'      => 'cardBorderColor',
	'--ab-tst-card-bw'      => 'cardBorderWidth',
	'--ab-tst-card-radius'  => 'cardRadius',
	'--ab-tst-card-pt'      => 'cardPaddingTop',
	'--ab-tst-card-pr'      => 'cardPaddingRight',
	'--ab-tst-card-pb'      => 'cardPaddingBottom',
	'--ab-tst-card-pl'      => 'cardPaddingLeft',
	'--ab-tst-avatar-size'  => 'avatarSize',
	'--ab-tst-rating'       => 'ratingColor',
	'--ab-tst-quote-icon'   => 'quoteIconColor',
	'--ab-tst-clamp'        => 'readMoreLines',
	'--ab-tst-marquee-time' => 'marqueeSpeed',
	'--ab-tst-name-color'   => 'nameColor',
	'--ab-tst-role-color'   => 'roleColor',
	'--ab-tst-comp-color'   => 'companyColor',
	'--ab-tst-quote-color'  => 'quoteColor',
);
$axiom_blocks_typo_groups = array(
	'name'    => 'name',
	'role'    => 'role',
	'comp'    => 'company',
	'quote'   => 'quote',
);
$axiom_blocks_typo_props = array(
	'ff' => 'FontFamily',
	'fw' => 'FontWeight',
	'fs' => 'FontSize',
	'lh' => 'LineHeight',
	'ls' => 'LetterSpacing',
	'tt' => 'TextTransform',
	'td' => 'TextDecoration',
	'ta' => 'TextAlign',
);
foreach ( $axiom_blocks_typo_groups as $axiom_blocks_short => $axiom_blocks_prefix ) {
	foreach ( $axiom_blocks_typo_props as $axiom_blocks_css => $axiom_blocks_suffix ) {
		$axiom_blocks_var_map[ '--ab-tst-' . $axiom_blocks_short . '-' . $axiom_blocks_css ] = $axiom_blocks_prefix . $axiom_blocks_suffix;
	}
}

$axiom_blocks_style_parts = array();
foreach ( $axiom_blocks_var_map as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( isset( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) && '' !== (string) $axiom_blocks_a[ $axiom_blocks_attr_key ] ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}
$axiom_blocks_wrapper_style = implode( '; ', $axiom_blocks_style_parts );
$axiom_blocks_wrapper_style = Spacing::merge( $axiom_blocks_wrapper_style, $axiom_blocks_a );

/* ── Wrapper classes ──────────────────────────────────────────────────────── */
$axiom_blocks_classes = array(
	'ab-testimonials',
	'ab-testimonials--' . $axiom_blocks_layout,
	'ab-testimonials--avatar-' . $axiom_blocks_avatar_pos,
	'ab-testimonials--shape-' . $axiom_blocks_avatar_shape,
);
if ( $axiom_blocks_stack ) {
	$axiom_blocks_classes[] = 'is-stack-mobile';
}
if ( $axiom_blocks_shadow ) {
	$axiom_blocks_classes[] = 'has-shadow';
}
if ( ! $axiom_blocks_show_rate ) {
	$axiom_blocks_classes[] = 'no-rating';
}
if ( ! $axiom_blocks_show_quote ) {
	$axiom_blocks_classes[] = 'no-quote-icon';
}
if ( $axiom_blocks_readmore ) {
	$axiom_blocks_classes[] = 'has-readmore';
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

/* ── Behaviour data attributes (read by the viewScript) ───────────────────── */
$axiom_blocks_data = array(
	'data-layout'  => $axiom_blocks_layout,
	'data-columns' => (string) (int) ( $axiom_blocks_a['columns'] ?? 3 ),
);
if ( 'carousel' === $axiom_blocks_layout ) {
	$axiom_blocks_data['data-autoplay']       = ! empty( $axiom_blocks_a['autoplay'] ) ? '1' : '0';
	$axiom_blocks_data['data-autoplay-speed'] = (string) (int) ( $axiom_blocks_a['autoplaySpeed'] ?? 4000 );
	$axiom_blocks_data['data-slide-speed']    = (string) (int) ( $axiom_blocks_a['slideSpeed'] ?? 500 );
	$axiom_blocks_data['data-loop']           = ( ! isset( $axiom_blocks_a['loop'] ) || ! empty( $axiom_blocks_a['loop'] ) ) ? '1' : '0';
	$axiom_blocks_data['data-pause-hover']    = ( ! isset( $axiom_blocks_a['pauseOnHover'] ) || ! empty( $axiom_blocks_a['pauseOnHover'] ) ) ? '1' : '0';
	$axiom_blocks_data['data-arrows']         = ( ! isset( $axiom_blocks_a['showArrows'] ) || ! empty( $axiom_blocks_a['showArrows'] ) ) ? '1' : '0';
	$axiom_blocks_data['data-dots']           = ( ! isset( $axiom_blocks_a['showDots'] ) || ! empty( $axiom_blocks_a['showDots'] ) ) ? '1' : '0';
} elseif ( 'marquee' === $axiom_blocks_layout ) {
	$axiom_blocks_data['data-marquee-reverse'] = ! empty( $axiom_blocks_a['marqueeReverse'] ) ? '1' : '0';
	$axiom_blocks_data['data-marquee-pause']   = ( ! isset( $axiom_blocks_a['marqueePauseOnHover'] ) || ! empty( $axiom_blocks_a['marqueePauseOnHover'] ) ) ? '1' : '0';
}
if ( $axiom_blocks_readmore ) {
	$axiom_blocks_data['data-readmore'] = '1';
}
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	<?php foreach ( $axiom_blocks_data as $axiom_blocks_dk => $axiom_blocks_dv ) : ?>
		<?php echo esc_attr( $axiom_blocks_dk ); ?>="<?php echo esc_attr( $axiom_blocks_dv ); ?>"
	<?php endforeach; ?>
>
	<?php echo wp_kses( $content, AllowedHtml::post_with_svg() ); ?>
</div>
<?php
/* ── Opt-in review schema (schema.org Review + AggregateRating) ────────────── */
if ( empty( $axiom_blocks_a['reviewSchema'] ) ) {
	return;
}

$axiom_blocks_items   = $block->parsed_block['innerBlocks'] ?? array();
$axiom_blocks_reviews = array();
$axiom_blocks_sum     = 0.0;
foreach ( $axiom_blocks_items as $axiom_blocks_item ) {
	$axiom_blocks_iattr = $axiom_blocks_item['attrs'] ?? array();
	$axiom_blocks_iname = trim( (string) ( $axiom_blocks_iattr['name'] ?? '' ) );
	$axiom_blocks_ibody = trim( wp_strip_all_tags( (string) ( $axiom_blocks_iattr['quote'] ?? '' ) ) );
	if ( '' === $axiom_blocks_iname || '' === $axiom_blocks_ibody ) {
		continue;
	}
	$axiom_blocks_irate = max( 0, min( 5, (float) ( $axiom_blocks_iattr['rating'] ?? 5 ) ) );
	$axiom_blocks_sum  += $axiom_blocks_irate;

	$axiom_blocks_review = array(
		'@type'        => 'Review',
		'author'       => array(
			'@type' => 'Person',
			'name'  => $axiom_blocks_iname,
		),
		'reviewRating' => array(
			'@type'       => 'Rating',
			'ratingValue' => $axiom_blocks_irate,
			'bestRating'  => 5,
		),
		'reviewBody'   => $axiom_blocks_ibody,
	);
	$axiom_blocks_irole = trim( (string) ( $axiom_blocks_iattr['role'] ?? '' ) );
	$axiom_blocks_icomp = trim( (string) ( $axiom_blocks_iattr['company'] ?? '' ) );
	if ( '' !== $axiom_blocks_irole ) {
		$axiom_blocks_review['author']['jobTitle'] = $axiom_blocks_irole;
	}
	if ( '' !== $axiom_blocks_icomp ) {
		$axiom_blocks_review['author']['worksFor'] = array(
			'@type' => 'Organization',
			'name'  => $axiom_blocks_icomp,
		);
	}
	$axiom_blocks_idate = (string) ( $axiom_blocks_iattr['reviewDate'] ?? '' );
	if ( '' !== $axiom_blocks_idate ) {
		$axiom_blocks_dts = strtotime( $axiom_blocks_idate );
		if ( false !== $axiom_blocks_dts ) {
			$axiom_blocks_review['datePublished'] = gmdate( 'Y-m-d', $axiom_blocks_dts );
		}
	}
	$axiom_blocks_reviews[] = $axiom_blocks_review;
}

if ( empty( $axiom_blocks_reviews ) ) {
	return;
}

$axiom_blocks_count    = count( $axiom_blocks_reviews );
$axiom_blocks_item_nm  = trim( (string) ( $axiom_blocks_a['itemName'] ?? '' ) );
$axiom_blocks_schema   = array(
	'@context'        => 'https://schema.org',
	'@type'           => '' !== $axiom_blocks_item_nm ? 'Product' : 'Organization',
	'name'            => '' !== $axiom_blocks_item_nm ? $axiom_blocks_item_nm : get_bloginfo( 'name' ),
	'aggregateRating' => array(
		'@type'       => 'AggregateRating',
		'ratingValue' => round( $axiom_blocks_sum / $axiom_blocks_count, 1 ),
		'reviewCount' => $axiom_blocks_count,
		'bestRating'  => 5,
	),
	'review'          => $axiom_blocks_reviews,
);

wp_print_inline_script_tag(
	(string) wp_json_encode( $axiom_blocks_schema ),
	array( 'type' => 'application/ld+json' )
);
