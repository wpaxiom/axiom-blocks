<?php
/**
 * Failed-delivery admin notice.
 *
 * When a form email could not be sent, administrators see one dismissible
 * notice naming the route and the error, with a link to the email settings.
 * The next successful send clears it on its own.
 *
 * @package AxiomBlocks\Email
 * @since 1.1.0
 */

namespace AxiomBlocks\Email;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Shows the last delivery failure to administrators.
 */
final class MailNotice {

	const DISMISS_ACTION = 'axiom_blocks_dismiss_mail_error';

	/**
	 * Wire hooks.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_notices', array( self::class, 'render' ) );
		add_action( 'admin_post_' . self::DISMISS_ACTION, array( self::class, 'dismiss' ) );
	}

	/**
	 * Print the notice.
	 *
	 * @return void
	 */
	public static function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		$error = EmailSettings::last_error();
		if ( null === $error ) {
			return;
		}

		$dismiss  = wp_nonce_url( admin_url( 'admin-post.php?action=' . self::DISMISS_ACTION ), self::DISMISS_ACTION );
		$settings = admin_url( 'admin.php?page=axiom-blocks-dashboard#email' );
		$when     = wp_date( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), (int) ( $error['time'] ?? time() ) );
		$sep      = ' <span aria-hidden="true" style="color:#a7aaad">|</span> ';

		echo '<div class="notice notice-error ab-mail-notice"><p><strong>' . esc_html__( 'Axiom Blocks: a form email was not sent.', 'axiom-blocks' ) . '</strong></p>';
		echo '<p>' . esc_html__( 'The submission was saved under Form entries. If this site has no mail setup, install an SMTP plugin or send through Resend.', 'axiom-blocks' ) . '</p>';
		/* translators: %s: date and time of the failure. */
		echo '<pre title="' . esc_attr( sprintf( __( 'Last failure %s', 'axiom-blocks' ), (string) $when ) ) . '" style="margin:6px 0;padding:6px 8px;background:#f6f7f7;border:1px solid #dcdcde;white-space:pre-wrap;word-break:break-word;font-size:12px">' . esc_html( (string) ( $error['message'] ?? '' ) ) . '</pre>';
		echo '<p><a href="' . esc_url( $settings ) . '">' . esc_html__( 'Email settings', 'axiom-blocks' ) . '</a>' . $sep; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $sep is static markup.
		echo '<a href="' . esc_url( admin_url( 'edit.php?post_type=ab_form_entry' ) ) . '">' . esc_html__( 'Form entries', 'axiom-blocks' ) . '</a>' . $sep; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- $sep is static markup.
		echo '<a href="' . esc_url( $dismiss ) . '">' . esc_html__( 'Dismiss', 'axiom-blocks' ) . '</a></p></div>';
	}

	/**
	 * Dismiss handler.
	 *
	 * @return void
	 */
	public static function dismiss(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You are not allowed to do that.', 'axiom-blocks' ) );
		}
		check_admin_referer( self::DISMISS_ACTION );
		EmailSettings::clear_error();
		wp_safe_redirect( wp_get_referer() ? wp_get_referer() : admin_url() );
		exit;
	}
}
