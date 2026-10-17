<?php
/**
 * Social Share: server-side render.
 *
 * Network buttons are real links built from networks.json, so the row works
 * without JavaScript. Copy link, the native share sheet and print need the
 * view script, so they render hidden and the script reveals them.
 *
 * @package AxiomBlocks
 * @var array    $attributes Block attributes.
 * @var string   $content    Block content.
 * @var WP_Block $block      Block instance.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Icons;
use AxiomBlocks\Blocks\SocialShare;
use AxiomBlocks\Blocks\Spacing;

$axiom_blocks_a        = $attributes;
$axiom_blocks_networks = SocialShare::networks();
$axiom_blocks_target   = SocialShare::target( $axiom_blocks_a, $block ?? null );

$axiom_blocks_display = in_array( (string) ( $axiom_blocks_a['display'] ?? '' ), array( 'icon', 'icon-label', 'label' ), true ) ? $axiom_blocks_a['display'] : 'icon';
$axiom_blocks_shape   = in_array( (string) ( $axiom_blocks_a['shape'] ?? '' ), array( 'square', 'rounded', 'circle' ), true ) ? $axiom_blocks_a['shape'] : 'rounded';
$axiom_blocks_variant = in_array( (string) ( $axiom_blocks_a['variant'] ?? '' ), array( 'filled', 'outline', 'soft', 'plain' ), true ) ? $axiom_blocks_a['variant'] : 'filled';
$axiom_blocks_popup   = 'tab' !== ( $axiom_blocks_a['openIn'] ?? 'popup' );

// ── Buttons ────────────────────────────────────────────────────────────────
$axiom_blocks_items = '';
$axiom_blocks_seen  = array();
foreach ( (array) ( $axiom_blocks_a['items'] ?? array() ) as $axiom_blocks_item ) {
	$axiom_blocks_key = is_array( $axiom_blocks_item ) ? (string) ( $axiom_blocks_item['network'] ?? '' ) : '';
	if ( ! isset( $axiom_blocks_networks[ $axiom_blocks_key ] ) || isset( $axiom_blocks_seen[ $axiom_blocks_key ] ) ) {
		continue;
	}
	$axiom_blocks_seen[ $axiom_blocks_key ] = true;
	$axiom_blocks_net                       = $axiom_blocks_networks[ $axiom_blocks_key ];

	$axiom_blocks_name  = trim( (string) ( $axiom_blocks_item['label'] ?? '' ) );
	$axiom_blocks_name  = '' !== $axiom_blocks_name ? $axiom_blocks_name : (string) $axiom_blocks_net['label'];
	$axiom_blocks_slug  = trim( (string) ( $axiom_blocks_item['icon'] ?? '' ) );
	$axiom_blocks_svg   = Icons::get( '' !== $axiom_blocks_slug ? $axiom_blocks_slug : (string) $axiom_blocks_net['icon'] );
	$axiom_blocks_inner = '';
	if ( 'label' !== $axiom_blocks_display && '' !== $axiom_blocks_svg ) {
		$axiom_blocks_inner .= '<span class="ab-ss__icon">' . wp_kses( $axiom_blocks_svg, AllowedHtml::svg() ) . '</span>';
	}
	if ( 'icon' !== $axiom_blocks_display ) {
		$axiom_blocks_inner .= '<span class="ab-ss__label">' . esc_html( $axiom_blocks_name ) . '</span>';
	}

	$axiom_blocks_action = (string) ( $axiom_blocks_net['action'] ?? '' );
	if ( '' !== $axiom_blocks_action ) {
		$axiom_blocks_aria = 'icon' === $axiom_blocks_display ? ' aria-label="' . esc_attr( $axiom_blocks_name ) . '"' : '';
		$axiom_blocks_data = '';
		if ( 'copy' === $axiom_blocks_action ) {
			$axiom_blocks_data = ' data-ab-ss-copied="' . esc_attr( '' !== (string) ( $axiom_blocks_a['copiedText'] ?? '' ) ? $axiom_blocks_a['copiedText'] : __( 'Copied', 'axiom-blocks' ) ) . '"';
		}
		$axiom_blocks_items .= sprintf(
			'<li class="ab-ss__item" hidden><button type="button" class="ab-ss__btn ab-ss__btn--%1$s" data-ab-ss-action="%2$s"%3$s%4$s style="--ab-ss-brand: %5$s">%6$s</button></li>',
			esc_attr( $axiom_blocks_key ),
			esc_attr( $axiom_blocks_action ),
			$axiom_blocks_aria,
			$axiom_blocks_data,
			esc_attr( (string) $axiom_blocks_net['color'] ),
			$axiom_blocks_inner
		);
		continue;
	}

	$axiom_blocks_href = SocialShare::href( $axiom_blocks_net, $axiom_blocks_target, $axiom_blocks_a );
	if ( '' === $axiom_blocks_href ) {
		continue;
	}
	$axiom_blocks_opens = false !== ( $axiom_blocks_net['popup'] ?? true );
	$axiom_blocks_extra = '';
	if ( $axiom_blocks_opens ) {
		$axiom_blocks_extra .= ' target="_blank" rel="noopener noreferrer nofollow"';
		if ( $axiom_blocks_popup ) {
			$axiom_blocks_extra .= ' data-ab-ss-popup="1"';
		}
	} else {
		$axiom_blocks_extra .= ' rel="nofollow"';
	}
	if ( ! empty( $axiom_blocks_net['instance'] ) ) {
		$axiom_blocks_extra .= ' data-ab-ss-instance="1"';
	}
	/* translators: %s: social network name, e.g. "Facebook". */
	$axiom_blocks_label = sprintf( __( 'Share on %s', 'axiom-blocks' ), $axiom_blocks_name );
	if ( 'email' === $axiom_blocks_key ) {
		$axiom_blocks_label = __( 'Share by email', 'axiom-blocks' );
	} elseif ( 'sms' === $axiom_blocks_key ) {
		$axiom_blocks_label = __( 'Share by text message', 'axiom-blocks' );
	}
	$axiom_blocks_items .= sprintf(
		'<li class="ab-ss__item"><a class="ab-ss__btn ab-ss__btn--%1$s" href="%2$s"%3$s%4$s style="--ab-ss-brand: %5$s">%6$s</a></li>',
		esc_attr( $axiom_blocks_key ),
		esc_url( $axiom_blocks_href, array( 'http', 'https', 'mailto', 'sms' ) ),
		$axiom_blocks_extra,
		'icon' === $axiom_blocks_display ? ' aria-label="' . esc_attr( $axiom_blocks_label ) . '"' : '',
		esc_attr( (string) $axiom_blocks_net['color'] ),
		$axiom_blocks_inner
	);
}

if ( '' === $axiom_blocks_items ) {
	return;
}

// ── Wrapper ────────────────────────────────────────────────────────────────
$axiom_blocks_classes = array(
	'ab-ss',
	'ab-ss--' . $axiom_blocks_display,
	'ab-ss--shape-' . $axiom_blocks_shape,
	'ab-ss--' . $axiom_blocks_variant,
);
if ( false !== ( $axiom_blocks_a['brandColors'] ?? true ) ) {
	$axiom_blocks_classes[] = 'ab-ss--brand';
}
if ( in_array( (string) ( $axiom_blocks_a['hoverEffect'] ?? '' ), array( 'lift', 'grow' ), true ) ) {
	$axiom_blocks_classes[] = 'ab-ss--fx-' . $axiom_blocks_a['hoverEffect'];
}
if ( false === ( $axiom_blocks_a['wrap'] ?? true ) ) {
	$axiom_blocks_classes[] = 'ab-ss--nowrap';
}
if ( ! empty( $axiom_blocks_a['equalWidth'] ) ) {
	$axiom_blocks_classes[] = 'ab-ss--equal';
}
$axiom_blocks_float = (string) ( $axiom_blocks_a['floating'] ?? '' );
if ( in_array( $axiom_blocks_float, array( 'left', 'right' ), true ) ) {
	$axiom_blocks_mobile    = in_array( (string) ( $axiom_blocks_a['floatMobile'] ?? '' ), array( 'bar', 'inline', 'hide' ), true ) ? $axiom_blocks_a['floatMobile'] : 'bar';
	$axiom_blocks_classes[] = 'is-floating';
	$axiom_blocks_classes[] = 'is-floating-' . $axiom_blocks_float;
	$axiom_blocks_classes[] = 'is-float-mobile-' . $axiom_blocks_mobile;
}

$axiom_blocks_supports = WP_Block_Supports::get_instance()->apply_block_supports();
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
if ( ! empty( $axiom_blocks_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_supports['class'];
}

$axiom_blocks_style      = Spacing::merge( implode( '; ', SocialShare::vars( $axiom_blocks_a ) ), $axiom_blocks_a );
$axiom_blocks_style_attr = safecss_filter_attr(
	implode(
		';',
		array_filter(
			array(
				rtrim( trim( $axiom_blocks_supports['style'] ?? '' ), ';' ),
				rtrim( trim( $axiom_blocks_style ), ';' ),
			)
		)
	)
);
$axiom_blocks_id_attr    = $axiom_blocks_supports['id'] ?? '';

$axiom_blocks_lead = '';
if ( ! empty( $axiom_blocks_a['showLead'] ) && '' !== trim( (string) ( $axiom_blocks_a['leadText'] ?? '' ) ) ) {
	$axiom_blocks_lead = '<span class="ab-ss__lead">' . esc_html( $axiom_blocks_a['leadText'] ) . '</span>';
}
?>
<div
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) ) ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	data-ab-ss-url="<?php echo esc_url( $axiom_blocks_target['url'] ); ?>"
	data-ab-ss-title="<?php echo esc_attr( $axiom_blocks_target['title'] ); ?>"
	data-ab-ss-text="<?php echo esc_attr( $axiom_blocks_target['text'] ); ?>"
>
	<?php echo wp_kses_post( $axiom_blocks_lead ); ?>
	<ul class="ab-ss__list" role="list">
		<?php echo wp_kses( $axiom_blocks_items, SocialShare::allowed_html() ); ?>
	</ul>
	<span class="ab-ss__status screen-reader-text" aria-live="polite"></span>
</div>
