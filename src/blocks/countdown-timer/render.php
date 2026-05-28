<?php
/**
 * Countdown Timer Block - Server-side Render Template
 *
 * @package AxiomBlocks
 * @var array  $attributes Block attributes.
 * @var string $content    Block content.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Blocks\Typography;

// Target date (default to 7 days from now if not set).
$axiom_blocks_target_date = ! empty( $attributes['targetDate'] )
	? (string) $attributes['targetDate']
	: gmdate( 'c', strtotime( '+7 days' ) );

// Display units — boolean attributes, fall back to true.
$axiom_blocks_show_days    = (bool) ( $attributes['showDays'] ?? true );
$axiom_blocks_show_hours   = (bool) ( $attributes['showHours'] ?? true );
$axiom_blocks_show_minutes = (bool) ( $attributes['showMinutes'] ?? true );
$axiom_blocks_show_seconds = (bool) ( $attributes['showSeconds'] ?? true );

// Labels.
$axiom_blocks_label_days    = isset( $attributes['labelDays'] ) ? sanitize_text_field( $attributes['labelDays'] ) : __( 'Days', 'axiom-blocks' );
$axiom_blocks_label_hours   = isset( $attributes['labelHours'] ) ? sanitize_text_field( $attributes['labelHours'] ) : __( 'Hours', 'axiom-blocks' );
$axiom_blocks_label_minutes = isset( $attributes['labelMinutes'] ) ? sanitize_text_field( $attributes['labelMinutes'] ) : __( 'Minutes', 'axiom-blocks' );
$axiom_blocks_label_seconds = isset( $attributes['labelSeconds'] ) ? sanitize_text_field( $attributes['labelSeconds'] ) : __( 'Seconds', 'axiom-blocks' );

// Colors and styling.
$axiom_blocks_digit_color      = isset( $attributes['digitColor'] ) ? sanitize_text_field( $attributes['digitColor'] ) : '#333333';
$axiom_blocks_label_color      = isset( $attributes['labelColor'] ) ? sanitize_text_field( $attributes['labelColor'] ) : '#666666';
$axiom_blocks_background_color = isset( $attributes['backgroundColor'] ) ? sanitize_text_field( $attributes['backgroundColor'] ) : '#f0f0f0';
$axiom_blocks_border_radius    = isset( $attributes['borderRadius'] ) ? sanitize_text_field( $attributes['borderRadius'] ) : '8px';
$axiom_blocks_digit_font_size  = isset( $attributes['digitFontSize'] ) ? sanitize_text_field( $attributes['digitFontSize'] ) : '48px';
$axiom_blocks_label_font_size  = isset( $attributes['labelFontSize'] ) ? sanitize_text_field( $attributes['labelFontSize'] ) : '14px';

// Layout.
$axiom_blocks_layout    = isset( $attributes['layout'] ) ? sanitize_text_field( $attributes['layout'] ) : 'horizontal';
$axiom_blocks_alignment = isset( $attributes['alignment'] ) ? sanitize_text_field( $attributes['alignment'] ) : 'center';
$axiom_blocks_gap       = isset( $attributes['gap'] ) ? sanitize_text_field( $attributes['gap'] ) : '20px';

// Expired state.
$axiom_blocks_expired_action  = isset( $attributes['expiredAction'] ) ? sanitize_text_field( $attributes['expiredAction'] ) : 'showMessage';
$axiom_blocks_expired_message = isset( $attributes['expiredMessage'] ) ? sanitize_text_field( $attributes['expiredMessage'] ) : __( "Time's up!", 'axiom-blocks' );
$axiom_blocks_redirect_url    = isset( $attributes['redirectUrl'] ) ? esc_url_raw( $attributes['redirectUrl'] ) : '';

// Inline element styles — preserve original declarations from the pre-refactor render.
$axiom_blocks_container_parts = array(
	'display: flex',
	'flex-wrap: wrap',
	'gap: ' . $axiom_blocks_gap,
);
if ( 'vertical' === $axiom_blocks_layout ) {
	$axiom_blocks_container_parts[] = 'flex-direction: column';
}
$axiom_blocks_container_style = safecss_filter_attr( implode( '; ', $axiom_blocks_container_parts ) );

$axiom_blocks_unit_style = safecss_filter_attr(
	'background-color: ' . $axiom_blocks_background_color
	. '; border-radius: ' . $axiom_blocks_border_radius
	. '; padding: 20px; min-width: 80px'
);

$axiom_blocks_digit_typo = Typography::inline_style( $attributes, 'digit' );
$axiom_blocks_label_typo = Typography::inline_style( $attributes, 'label' );

$axiom_blocks_digit_parts = array_filter(
	array(
		'font-weight: bold',
		'line-height: 1',
		'font-size: ' . $axiom_blocks_digit_font_size,
		rtrim( trim( $axiom_blocks_digit_typo ), ';' ),
		'color: ' . $axiom_blocks_digit_color,
	)
);
$axiom_blocks_digit_style = safecss_filter_attr( implode( '; ', $axiom_blocks_digit_parts ) );

$axiom_blocks_label_parts = array_filter(
	array(
		'text-transform: uppercase',
		'letter-spacing: 1px',
		'font-size: ' . $axiom_blocks_label_font_size,
		rtrim( trim( $axiom_blocks_label_typo ), ';' ),
		'color: ' . $axiom_blocks_label_color,
		'margin-top: 8px',
	)
);
$axiom_blocks_label_style = safecss_filter_attr( implode( '; ', $axiom_blocks_label_parts ) );

// Calculate initial time remaining for SSR.
$axiom_blocks_target_timestamp  = (int) strtotime( $axiom_blocks_target_date );
$axiom_blocks_current_timestamp = time();
$axiom_blocks_diff              = $axiom_blocks_target_timestamp - $axiom_blocks_current_timestamp;

if ( $axiom_blocks_diff > 0 ) {
	$axiom_blocks_days    = (int) floor( $axiom_blocks_diff / DAY_IN_SECONDS );
	$axiom_blocks_hours   = (int) floor( ( $axiom_blocks_diff % DAY_IN_SECONDS ) / HOUR_IN_SECONDS );
	$axiom_blocks_minutes = (int) floor( ( $axiom_blocks_diff % HOUR_IN_SECONDS ) / MINUTE_IN_SECONDS );
	$axiom_blocks_seconds = $axiom_blocks_diff % MINUTE_IN_SECONDS;
} else {
	$axiom_blocks_days    = 0;
	$axiom_blocks_hours   = 0;
	$axiom_blocks_minutes = 0;
	$axiom_blocks_seconds = 0;
}

$axiom_blocks_is_expired = $axiom_blocks_diff <= 0;

// Wrapper attributes — assemble id/class/style from block supports + our own values.
$axiom_blocks_spacing_style  = Spacing::inline_style( $attributes );
$axiom_blocks_block_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array(
	'axiom-blocks-countdown',
	'axiom-blocks-countdown--' . sanitize_html_class( $axiom_blocks_layout ),
	'axiom-blocks-countdown--align-' . sanitize_html_class( $axiom_blocks_alignment ),
);
if ( ! empty( $attributes['className'] ) ) {
	$axiom_blocks_classes[] = $attributes['className'];
}
if ( ! empty( $axiom_blocks_block_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_block_supports['class'];
}
$axiom_blocks_class_attr = trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) );

$axiom_blocks_style_parts = array_filter(
	array(
		rtrim( trim( $axiom_blocks_block_supports['style'] ?? '' ), ';' ),
		rtrim( trim( $axiom_blocks_spacing_style ), ';' ),
	)
);
$axiom_blocks_style_attr  = safecss_filter_attr( implode( ';', $axiom_blocks_style_parts ) );

$axiom_blocks_id_attr = $axiom_blocks_block_supports['id'] ?? '';
?>
<div <?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?> class="<?php echo esc_attr( $axiom_blocks_class_attr ); ?>" <?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>>
	<?php if ( $axiom_blocks_is_expired ) : ?>
		<?php if ( 'showMessage' === $axiom_blocks_expired_action ) : ?>
			<div class="axiom-blocks-countdown__expired">
				<?php echo esc_html( $axiom_blocks_expired_message ); ?>
			</div>
		<?php elseif ( 'redirect' === $axiom_blocks_expired_action && '' !== $axiom_blocks_redirect_url ) : ?>
			<?php
			wp_add_inline_script(
				'axiom-blocks-countdown-script',
				sprintf( 'window.location.href = %s;', wp_json_encode( $axiom_blocks_redirect_url ) )
			);
			?>
		<?php endif; ?>
	<?php else : ?>
		<div
			class="axiom-blocks-countdown__container"
			style="<?php echo esc_attr( $axiom_blocks_container_style ); ?>"
			data-target-date="<?php echo esc_attr( $axiom_blocks_target_date ); ?>"
			data-expired-action="<?php echo esc_attr( $axiom_blocks_expired_action ); ?>"
			data-expired-message="<?php echo esc_attr( $axiom_blocks_expired_message ); ?>"
			data-redirect-url="<?php echo esc_url( $axiom_blocks_redirect_url ); ?>"
		>
			<?php if ( $axiom_blocks_show_days ) : ?>
				<div class="axiom-blocks-countdown__unit" data-unit="days" style="<?php echo esc_attr( $axiom_blocks_unit_style ); ?>">
					<div class="axiom-blocks-countdown__digit" style="<?php echo esc_attr( $axiom_blocks_digit_style ); ?>">
						<?php echo esc_html( sprintf( '%02d', $axiom_blocks_days ) ); ?>
					</div>
					<div class="axiom-blocks-countdown__label" style="<?php echo esc_attr( $axiom_blocks_label_style ); ?>">
						<?php echo esc_html( $axiom_blocks_label_days ); ?>
					</div>
				</div>
			<?php endif; ?>

			<?php if ( $axiom_blocks_show_hours ) : ?>
				<div class="axiom-blocks-countdown__unit" data-unit="hours" style="<?php echo esc_attr( $axiom_blocks_unit_style ); ?>">
					<div class="axiom-blocks-countdown__digit" style="<?php echo esc_attr( $axiom_blocks_digit_style ); ?>">
						<?php echo esc_html( sprintf( '%02d', $axiom_blocks_hours ) ); ?>
					</div>
					<div class="axiom-blocks-countdown__label" style="<?php echo esc_attr( $axiom_blocks_label_style ); ?>">
						<?php echo esc_html( $axiom_blocks_label_hours ); ?>
					</div>
				</div>
			<?php endif; ?>

			<?php if ( $axiom_blocks_show_minutes ) : ?>
				<div class="axiom-blocks-countdown__unit" data-unit="minutes" style="<?php echo esc_attr( $axiom_blocks_unit_style ); ?>">
					<div class="axiom-blocks-countdown__digit" style="<?php echo esc_attr( $axiom_blocks_digit_style ); ?>">
						<?php echo esc_html( sprintf( '%02d', $axiom_blocks_minutes ) ); ?>
					</div>
					<div class="axiom-blocks-countdown__label" style="<?php echo esc_attr( $axiom_blocks_label_style ); ?>">
						<?php echo esc_html( $axiom_blocks_label_minutes ); ?>
					</div>
				</div>
			<?php endif; ?>

			<?php if ( $axiom_blocks_show_seconds ) : ?>
				<div class="axiom-blocks-countdown__unit" data-unit="seconds" style="<?php echo esc_attr( $axiom_blocks_unit_style ); ?>">
					<div class="axiom-blocks-countdown__digit" style="<?php echo esc_attr( $axiom_blocks_digit_style ); ?>">
						<?php echo esc_html( sprintf( '%02d', $axiom_blocks_seconds ) ); ?>
					</div>
					<div class="axiom-blocks-countdown__label" style="<?php echo esc_attr( $axiom_blocks_label_style ); ?>">
						<?php echo esc_html( $axiom_blocks_label_seconds ); ?>
					</div>
				</div>
			<?php endif; ?>
		</div>
	<?php endif; ?>
</div>
