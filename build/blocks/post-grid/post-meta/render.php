<?php
/**
 * Post Meta — frontend render.
 *
 * Author / date / updated / comments / read time, each optional, each with its
 * own label. Per-field labels ("By", "on") are Kadence's idea and nobody else's;
 * read time is Essential's. Where the row sits in the card is block order, not a
 * setting, which is what the composable model buys over the rivals' "meta
 * position" select.
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
use AxiomBlocks\Blocks\Icons;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

$axiom_blocks_a       = $attributes ?? array();
$axiom_blocks_post_id = (int) ( $block->context['postId'] ?? 0 );
if ( ! $axiom_blocks_post_id ) {
	$axiom_blocks_post_id = (int) get_the_ID();
}
if ( ! $axiom_blocks_post_id ) {
	return;
}

$axiom_blocks_post = get_post( $axiom_blocks_post_id );
if ( ! $axiom_blocks_post ) {
	return;
}

$axiom_blocks_show_icons = ! empty( $axiom_blocks_a['showIcons'] );
$axiom_blocks_date_fmt   = (string) ( $axiom_blocks_a['dateFormat'] ?? '' );
if ( '' === $axiom_blocks_date_fmt ) {
	$axiom_blocks_date_fmt = (string) get_option( 'date_format' );
}

// This file is included once per post in the loop, so the helper has to be
// declared conditionally or the second card fatals on redeclaration.
if ( ! function_exists( 'axiom_blocks_pc_meta_item' ) ) {
	/**
	 * One meta item: optional icon, optional label, then the value.
	 *
	 * @param string $key       Item key, used for the modifier class.
	 * @param string $icon_slug Shared-library icon slug.
	 * @param string $label     Author-set label, may be empty.
	 * @param string $value_html Already-escaped value markup.
	 * @param bool   $with_icon Whether icons are switched on.
	 * @return string
	 */
	function axiom_blocks_pc_meta_item( string $key, string $icon_slug, string $label, string $value_html, bool $with_icon ): string {
		$out = '<span class="ab-pc__meta-item ab-pc__meta-item--' . esc_attr( $key ) . '">';
		if ( $with_icon ) {
			$out .= '<span class="ab-pc__meta-icon" aria-hidden="true">'
				. wp_kses( Icons::get( $icon_slug ), AllowedHtml::svg() )
				. '</span>';
		}
		if ( '' !== $label ) {
			$out .= '<span class="ab-pc__meta-label">' . esc_html( $label ) . '</span> ';
		}
		$out .= $value_html . '</span>';
		return $out;
	}
}

$axiom_blocks_items = array();

/* Author, optionally with avatar and a link to the archive. */
if ( ! empty( $axiom_blocks_a['showAuthor'] ) ) {
	$axiom_blocks_author_id   = (int) $axiom_blocks_post->post_author;
	$axiom_blocks_author_name = get_the_author_meta( 'display_name', $axiom_blocks_author_id );

	if ( '' !== $axiom_blocks_author_name ) {
		$axiom_blocks_avatar = '';
		if ( ! empty( $axiom_blocks_a['showAvatar'] ) ) {
			$axiom_blocks_avatar_px = (int) ( $axiom_blocks_a['avatarSize'] ?? 0 );
			if ( $axiom_blocks_avatar_px < 1 ) {
				$axiom_blocks_avatar_px = 20;
			}
			$axiom_blocks_avatar = get_avatar(
				$axiom_blocks_author_id,
				$axiom_blocks_avatar_px,
				'',
				'',
				array( 'class' => 'ab-pc__meta-avatar' )
			);
		}

		$axiom_blocks_author_html = '<span class="ab-pc__meta-value">' . esc_html( $axiom_blocks_author_name ) . '</span>';
		if ( ! empty( $axiom_blocks_a['authorLink'] ) ) {
			$axiom_blocks_author_html = sprintf(
				'<a class="ab-pc__meta-value ab-pc__meta-link" href="%1$s">%2$s</a>',
				esc_url( (string) get_author_posts_url( $axiom_blocks_author_id ) ),
				esc_html( $axiom_blocks_author_name )
			);
		}

		$axiom_blocks_items[] = axiom_blocks_pc_meta_item(
			'author',
			'user',
			(string) ( $axiom_blocks_a['authorLabel'] ?? '' ),
			$axiom_blocks_avatar . $axiom_blocks_author_html,
			$axiom_blocks_show_icons
		);
	}
}

/* Published date. */
if ( ! empty( $axiom_blocks_a['showDate'] ) ) {
	$axiom_blocks_items[] = axiom_blocks_pc_meta_item(
		'date',
		'calendar',
		(string) ( $axiom_blocks_a['dateLabel'] ?? '' ),
		sprintf(
			'<time class="ab-pc__meta-value" datetime="%1$s">%2$s</time>',
			esc_attr( (string) get_the_date( 'c', $axiom_blocks_post_id ) ),
			esc_html( (string) get_the_date( $axiom_blocks_date_fmt, $axiom_blocks_post_id ) )
		),
		$axiom_blocks_show_icons
	);
}

/* Last-updated date, only when it differs from publication. */
if ( ! empty( $axiom_blocks_a['showUpdated'] ) ) {
	$axiom_blocks_pub = (string) get_the_date( 'Ymd', $axiom_blocks_post_id );
	$axiom_blocks_mod = (string) get_the_modified_date( 'Ymd', $axiom_blocks_post_id );
	if ( $axiom_blocks_mod > $axiom_blocks_pub ) {
		$axiom_blocks_items[] = axiom_blocks_pc_meta_item(
			'updated',
			'refresh-cw',
			(string) ( $axiom_blocks_a['updatedLabel'] ?? '' ),
			sprintf(
				'<time class="ab-pc__meta-value" datetime="%1$s">%2$s</time>',
				esc_attr( (string) get_the_modified_date( 'c', $axiom_blocks_post_id ) ),
				esc_html( (string) get_the_modified_date( $axiom_blocks_date_fmt, $axiom_blocks_post_id ) )
			),
			$axiom_blocks_show_icons
		);
	}
}

/* Comment count. */
if ( ! empty( $axiom_blocks_a['showComments'] ) ) {
	$axiom_blocks_count   = (int) get_comments_number( $axiom_blocks_post_id );
	$axiom_blocks_items[] = axiom_blocks_pc_meta_item(
		'comments',
		'message-circle',
		(string) ( $axiom_blocks_a['commentsLabel'] ?? '' ),
		'<span class="ab-pc__meta-value">' . esc_html(
			sprintf(
				/* translators: %s: number of comments. */
				_n( '%s comment', '%s comments', $axiom_blocks_count, 'axiom-blocks' ),
				number_format_i18n( $axiom_blocks_count )
			)
		) . '</span>',
		$axiom_blocks_show_icons
	);
}

/* Read time, derived from the content's word count. */
if ( ! empty( $axiom_blocks_a['showReadTime'] ) ) {
	$axiom_blocks_wpm = max( 50, (int) ( $axiom_blocks_a['wordsPerMinute'] ?? 200 ) );
	$axiom_blocks_wc  = str_word_count( wp_strip_all_tags( strip_shortcodes( $axiom_blocks_post->post_content ) ) );
	$axiom_blocks_min = max( 1, (int) ceil( $axiom_blocks_wc / $axiom_blocks_wpm ) );

	$axiom_blocks_items[] = axiom_blocks_pc_meta_item(
		'read-time',
		'clock',
		(string) ( $axiom_blocks_a['readTimeLabel'] ?? '' ),
		'<span class="ab-pc__meta-value">' . esc_html(
			sprintf(
				/* translators: %s: number of minutes. */
				_n( '%s min read', '%s min read', $axiom_blocks_min, 'axiom-blocks' ),
				number_format_i18n( $axiom_blocks_min )
			)
		) . '</span>',
		$axiom_blocks_show_icons
	);
}

if ( empty( $axiom_blocks_items ) ) {
	return;
}

/* ── Styles ───────────────────────────────────────────────────────────────── */
$axiom_blocks_style_parts = array();
foreach ( array(
	'--ab-pc-meta-author'      => 'authorColor',
	'--ab-pc-meta-author-h'    => 'authorColorHover',
	'--ab-pc-meta-date'        => 'dateColor',
	'--ab-pc-meta-date-h'      => 'dateColorHover',
	'--ab-pc-meta-comments'    => 'commentsColor',
	'--ab-pc-meta-comments-h'  => 'commentsColorHover',
	'--ab-pc-meta-sep'         => 'separatorColor',
	'--ab-pc-meta-icon'        => 'metaIconColor',
	'--ab-pc-meta-icon-h'      => 'metaIconColorHover',
	'--ab-pc-meta-icon-size'   => 'iconSize',
	'--ab-pc-meta-gap'         => 'itemGap',
	'--ab-pc-meta-avatar-size' => 'avatarSize',
) as $axiom_blocks_css_var => $axiom_blocks_attr_key ) {
	if ( ! empty( $axiom_blocks_a[ $axiom_blocks_attr_key ] ) ) {
		$axiom_blocks_style_parts[] = $axiom_blocks_css_var . ': ' . $axiom_blocks_a[ $axiom_blocks_attr_key ];
	}
}

$axiom_blocks_typo = Typography::inline_style( $axiom_blocks_a, '' );
if ( '' !== $axiom_blocks_typo ) {
	$axiom_blocks_style_parts[] = rtrim( $axiom_blocks_typo, ';' );
}

$axiom_blocks_wrapper_style = Spacing::merge( implode( '; ', $axiom_blocks_style_parts ), $axiom_blocks_a );
$axiom_blocks_style_attr    = safecss_filter_attr( $axiom_blocks_wrapper_style );

$axiom_blocks_classes = array( 'ab-pc__meta' );
if ( $axiom_blocks_show_icons ) {
	$axiom_blocks_classes[] = 'has-icons';
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_separator = (string) ( $axiom_blocks_a['separator'] ?? '·' );
$axiom_blocks_last      = count( $axiom_blocks_items ) - 1;
?>
<div
	class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
>
	<?php foreach ( $axiom_blocks_items as $axiom_blocks_i => $axiom_blocks_item ) : ?>
		<?php echo $axiom_blocks_item; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from esc_html/esc_url/esc_attr + wp_kses'd SVG above. ?>
		<?php if ( '' !== $axiom_blocks_separator && $axiom_blocks_i < $axiom_blocks_last ) : ?>
			<span class="ab-pc__meta-sep" aria-hidden="true"><?php echo esc_html( $axiom_blocks_separator ); ?></span>
		<?php endif; ?>
	<?php endforeach; ?>
</div>
