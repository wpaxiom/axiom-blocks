<?php
/**
 * Testimonial Item — frontend render (single card).
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

$axiom_blocks_a = $attributes ?? array();

$axiom_blocks_quote   = (string) ( $axiom_blocks_a['quote'] ?? '' );
$axiom_blocks_name    = (string) ( $axiom_blocks_a['name'] ?? '' );
$axiom_blocks_role    = (string) ( $axiom_blocks_a['role'] ?? '' );
$axiom_blocks_company = (string) ( $axiom_blocks_a['company'] ?? '' );

if ( '' === trim( wp_strip_all_tags( $axiom_blocks_quote ) ) && '' === trim( $axiom_blocks_name ) ) {
	return;
}

$axiom_blocks_avatar_url = (string) ( $axiom_blocks_a['avatarUrl'] ?? '' );
$axiom_blocks_avatar_alt = (string) ( $axiom_blocks_a['avatarAlt'] ?? '' );
$axiom_blocks_rating     = max( 0, min( 5, (float) ( $axiom_blocks_a['rating'] ?? 5 ) ) );
$axiom_blocks_date_raw   = (string) ( $axiom_blocks_a['reviewDate'] ?? '' );
$axiom_blocks_platform   = (string) ( $axiom_blocks_a['sourcePlatform'] ?? 'none' );
$axiom_blocks_src_label  = (string) ( $axiom_blocks_a['sourceLabel'] ?? '' );
$axiom_blocks_verified   = ! empty( $axiom_blocks_a['verified'] );
$axiom_blocks_link       = esc_url( (string) ( $axiom_blocks_a['linkUrl'] ?? '' ) );
$axiom_blocks_new_tab    = ! empty( $axiom_blocks_a['linkNewTab'] );

/* ── Quote icon (decorative; parent toggles visibility via class) ──────────── */
$axiom_blocks_quote_svg = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7.5 7C5.6 7 4 8.6 4 10.5S5.6 14 7.5 14c.2 0 .4 0 .6-.1-.3 1.3-1.4 2.5-2.9 3-.4.1-.6.5-.5.9.1.3.4.5.7.5.1 0 .2 0 .3-.1 2.6-1 4.3-3.4 4.3-6.2V10.5C10 8.6 8.4 7 6.5 7h1zm9 0C14.6 7 13 8.6 13 10.5S14.6 14 16.5 14c.2 0 .4 0 .6-.1-.3 1.3-1.4 2.5-2.9 3-.4.1-.6.5-.5.9.1.3.4.5.7.5.1 0 .2 0 .3-.1 2.6-1 4.3-3.4 4.3-6.2V10.5C19 8.6 17.4 7 15.5 7h1z"/></svg>';

/* ── Star rating (empty + filled overlay → half-star precision) ────────────── */
$axiom_blocks_star = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
$axiom_blocks_stars_row    = str_repeat( $axiom_blocks_star, 5 );
$axiom_blocks_fill_percent = ( $axiom_blocks_rating / 5 ) * 100;
$axiom_blocks_rating_label = sprintf(
	/* translators: %s: rating value out of 5 */
	__( 'Rated %s out of 5', 'axiom-blocks' ),
	number_format_i18n( $axiom_blocks_rating, 1 )
);

/* ── Avatar / initials fallback ────────────────────────────────────────────── */
$axiom_blocks_initials = '';
if ( '' === $axiom_blocks_avatar_url && '' !== trim( $axiom_blocks_name ) ) {
	$axiom_blocks_parts = preg_split( '/\s+/', trim( $axiom_blocks_name ) );
	foreach ( array_slice( $axiom_blocks_parts, 0, 2 ) as $axiom_blocks_part ) {
		$axiom_blocks_initials .= mb_strtoupper( mb_substr( $axiom_blocks_part, 0, 1 ) );
	}
}
$axiom_blocks_hue        = abs( crc32( $axiom_blocks_name ) ) % 360;
$axiom_blocks_init_style = 'background:hsl(' . $axiom_blocks_hue . ',55%,52%)';

/* ── Source / verified badge ───────────────────────────────────────────────── */
$axiom_blocks_platform_names = array(
	'google'     => 'Google',
	'trustpilot' => 'Trustpilot',
	'g2'         => 'G2',
	'capterra'   => 'Capterra',
);
$axiom_blocks_platform_label = '';
if ( 'custom' === $axiom_blocks_platform ) {
	$axiom_blocks_platform_label = $axiom_blocks_src_label;
} elseif ( isset( $axiom_blocks_platform_names[ $axiom_blocks_platform ] ) ) {
	$axiom_blocks_platform_label = $axiom_blocks_platform_names[ $axiom_blocks_platform ];
}
$axiom_blocks_check = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2 4 5v6c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V5z"/><path d="m9 12 2 2 4-4"/></svg>';

/* ── Date ──────────────────────────────────────────────────────────────────── */
$axiom_blocks_date_display = '';
$axiom_blocks_date_iso     = '';
if ( '' !== $axiom_blocks_date_raw ) {
	$axiom_blocks_ts = strtotime( $axiom_blocks_date_raw );
	if ( false !== $axiom_blocks_ts ) {
		$axiom_blocks_date_display = date_i18n( (string) get_option( 'date_format' ), $axiom_blocks_ts );
		$axiom_blocks_date_iso     = gmdate( 'Y-m-d', $axiom_blocks_ts );
	}
}

$axiom_blocks_classes = array( 'ab-testimonial' );
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );
?>
<div class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>">
	<?php if ( '' !== $axiom_blocks_link ) : ?>
		<a
			class="ab-testimonial__link"
			href="<?php echo esc_url( $axiom_blocks_link ); ?>"
			aria-label="<?php echo esc_attr( $axiom_blocks_name ); ?>"
			<?php echo $axiom_blocks_new_tab ? ' target="_blank" rel="noopener noreferrer"' : ''; ?>
		></a>
	<?php endif; ?>

	<span class="ab-testimonial__quote-icon" aria-hidden="true"><?php echo wp_kses( $axiom_blocks_quote_svg, AllowedHtml::svg() ); ?></span>

	<div class="ab-testimonial__rating" role="img" aria-label="<?php echo esc_attr( $axiom_blocks_rating_label ); ?>">
		<span class="ab-testimonial__stars ab-testimonial__stars--empty"><?php echo wp_kses( $axiom_blocks_stars_row, AllowedHtml::svg() ); ?></span>
		<span class="ab-testimonial__stars ab-testimonial__stars--filled" style="width:<?php echo esc_attr( (string) $axiom_blocks_fill_percent ); ?>%"><?php echo wp_kses( $axiom_blocks_stars_row, AllowedHtml::svg() ); ?></span>
	</div>

	<?php if ( '' !== trim( wp_strip_all_tags( $axiom_blocks_quote ) ) ) : ?>
		<blockquote class="ab-testimonial__quote"><?php echo wp_kses_post( $axiom_blocks_quote ); ?></blockquote>
	<?php endif; ?>

	<div class="ab-testimonial__person">
		<span class="ab-testimonial__avatar">
			<?php if ( '' !== $axiom_blocks_avatar_url ) : ?>
				<img src="<?php echo esc_url( $axiom_blocks_avatar_url ); ?>" alt="<?php echo esc_attr( '' !== $axiom_blocks_avatar_alt ? $axiom_blocks_avatar_alt : $axiom_blocks_name ); ?>" loading="lazy" />
			<?php elseif ( '' !== $axiom_blocks_initials ) : ?>
				<span class="ab-testimonial__initials" style="<?php echo esc_attr( $axiom_blocks_init_style ); ?>"><?php echo esc_html( $axiom_blocks_initials ); ?></span>
			<?php endif; ?>
		</span>

		<span class="ab-testimonial__identity">
			<?php if ( '' !== trim( $axiom_blocks_name ) ) : ?>
				<span class="ab-testimonial__name"><?php echo esc_html( $axiom_blocks_name ); ?></span>
			<?php endif; ?>
			<?php if ( '' !== trim( $axiom_blocks_role ) || '' !== trim( $axiom_blocks_company ) ) : ?>
				<span class="ab-testimonial__author-line">
					<?php if ( '' !== trim( $axiom_blocks_role ) ) : ?>
						<span class="ab-testimonial__role"><?php echo esc_html( $axiom_blocks_role ); ?></span>
					<?php endif; ?>
					<?php if ( '' !== trim( $axiom_blocks_company ) ) : ?>
						<span class="ab-testimonial__company"><?php echo esc_html( $axiom_blocks_company ); ?></span>
					<?php endif; ?>
				</span>
			<?php endif; ?>
			<?php if ( $axiom_blocks_verified || '' !== $axiom_blocks_platform_label || '' !== $axiom_blocks_date_display ) : ?>
				<span class="ab-testimonial__source">
					<?php if ( $axiom_blocks_verified ) : ?>
						<span class="ab-testimonial__verified"><?php echo wp_kses( $axiom_blocks_check, AllowedHtml::svg() ); ?><?php echo esc_html__( 'Verified', 'axiom-blocks' ); ?></span>
					<?php endif; ?>
					<?php if ( '' !== $axiom_blocks_platform_label ) : ?>
						<span class="ab-testimonial__via">
							<?php
							/* translators: %s: review source platform name (e.g. Google) */
							echo esc_html( sprintf( __( 'via %s', 'axiom-blocks' ), $axiom_blocks_platform_label ) );
							?>
						</span>
					<?php endif; ?>
					<?php if ( '' !== $axiom_blocks_date_display ) : ?>
						<time class="ab-testimonial__date" datetime="<?php echo esc_attr( $axiom_blocks_date_iso ); ?>"><?php echo esc_html( $axiom_blocks_date_display ); ?></time>
					<?php endif; ?>
				</span>
			<?php endif; ?>
		</span>
	</div>
</div>
