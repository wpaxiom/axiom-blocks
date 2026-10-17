<?php
/**
 * Mailer.
 *
 * Sends Axiom form emails through the site-wide route: WordPress mail
 * (wp_mail, so any SMTP plugin on the site keeps working) or the Resend API.
 * When the API route fails and fallback is on, the message goes out through
 * wp_mail instead. Every attempt is reported back, so the caller can record
 * which route delivered a message or why none did.
 *
 * Only Axiom form emails use the API route. This class never hooks pre_wp_mail
 * or phpmailer_init for other mail, so it cannot fight an SMTP plugin.
 *
 * @package AxiomBlocks\Email
 * @since 1.1.0
 */

namespace AxiomBlocks\Email;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Delivers form emails.
 */
final class Mailer {

	/**
	 * Send a message.
	 *
	 * @param array $message {
	 *     Message to send.
	 *
	 *     @type string[] $to       Recipients (already validated).
	 *     @type string[] $cc       Optional.
	 *     @type string[] $bcc      Optional.
	 *     @type string   $subject  Single-line subject.
	 *     @type string   $html     HTML body (values already escaped).
	 *     @type string   $text     Plain-text body.
	 *     @type string   $reply_to Optional validated address.
	 * }
	 * @return array { ok: bool, route: string, attempts: array[] }
	 */
	public static function send( array $message ): array {
		$settings = EmailSettings::get();
		$route    = in_array( $settings['route'], EmailSettings::ROUTES, true ) ? $settings['route'] : EmailSettings::ROUTE_WP;
		$message  = self::normalize( $message );
		$attempts = array();

		if ( EmailSettings::ROUTE_RESEND === $route ) {
			$attempt    = ResendTransport::send( $message, EmailSettings::api_key() );
			$attempts[] = $attempt;
			if ( ! $attempt['ok'] && ! empty( $settings['fallback'] ) ) {
				$attempts[] = self::send_wp_mail( $message );
			}
		} else {
			$attempts[] = self::send_wp_mail( $message );
		}

		$last = end( $attempts );
		$ok   = (bool) $last['ok'];

		if ( $ok ) {
			EmailSettings::clear_error();
			EmailSettings::record_sent( (string) $last['route'] );
		} else {
			$messages = array();
			foreach ( $attempts as $attempt ) {
				$messages[] = $attempt['route'] . ': ' . $attempt['error'];
			}
			EmailSettings::record_error( $route, implode( ' | ', $messages ) );
		}

		return array(
			'ok'       => $ok,
			'route'    => $last['route'],
			'attempts' => $attempts,
		);
	}

	/**
	 * Fill From, strip header-breaking characters, drop invalid addresses.
	 *
	 * @param array $message Raw message.
	 * @return array
	 */
	public static function normalize( array $message ): array {
		$list = static function ( $value ): array {
			$out = array();
			foreach ( (array) $value as $address ) {
				$address = sanitize_email( (string) $address );
				if ( is_email( $address ) ) {
					$out[] = $address;
				}
			}
			return array_values( array_unique( $out ) );
		};

		$reply = sanitize_email( (string) ( $message['reply_to'] ?? '' ) );

		return array(
			'to'         => $list( $message['to'] ?? array() ),
			'cc'         => $list( $message['cc'] ?? array() ),
			'bcc'        => $list( $message['bcc'] ?? array() ),
			'subject'    => EmailSettings::header_text( (string) ( $message['subject'] ?? '' ), 250 ),
			'html'       => (string) ( $message['html'] ?? '' ),
			'text'       => (string) ( $message['text'] ?? '' ),
			'reply_to'   => is_email( $reply ) ? $reply : '',
			'from_email' => EmailSettings::from_email(),
			'from_name'  => EmailSettings::from_name(),
		);
	}

	/**
	 * Send through wp_mail(), capturing the error text when it fails.
	 *
	 * @param array $message Normalized message.
	 * @return array { route, ok, error }
	 */
	public static function send_wp_mail( array $message ): array {
		if ( empty( $message['to'] ) ) {
			return self::attempt( EmailSettings::ROUTE_WP, false, __( 'No valid recipient address.', 'axiom-blocks' ) );
		}

		$headers   = array( 'Content-Type: text/html; charset=UTF-8' );
		$headers[] = 'From: ' . self::address_header( $message['from_email'], $message['from_name'] );
		if ( '' !== $message['reply_to'] ) {
			$headers[] = 'Reply-To: ' . $message['reply_to'];
		}
		foreach ( $message['cc'] as $cc ) {
			$headers[] = 'Cc: ' . $cc;
		}
		foreach ( $message['bcc'] as $bcc ) {
			$headers[] = 'Bcc: ' . $bcc;
		}

		$error   = '';
		$on_fail = static function ( $wp_error ) use ( &$error ) {
			if ( is_wp_error( $wp_error ) ) {
				$error = $wp_error->get_error_message();
			}
		};
		$alt     = static function ( $phpmailer ) use ( $message ) {
			if ( '' !== $message['text'] && is_object( $phpmailer ) ) {
				$phpmailer->AltBody = $message['text']; // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- PHPMailer property.
			}
		};

		add_action( 'wp_mail_failed', $on_fail );
		add_action( 'phpmailer_init', $alt );
		$sent = wp_mail( $message['to'], $message['subject'], $message['html'], $headers );
		remove_action( 'phpmailer_init', $alt );
		remove_action( 'wp_mail_failed', $on_fail );

		if ( $sent ) {
			return self::attempt( EmailSettings::ROUTE_WP, true, '' );
		}
		return self::attempt(
			EmailSettings::ROUTE_WP,
			false,
			'' !== $error ? $error : __( 'wp_mail() returned false. The site may have no working mail setup.', 'axiom-blocks' )
		);
	}

	/**
	 * "Name <address>" with the name quoted and header-safe.
	 *
	 * @param string $email Address.
	 * @param string $name  Display name.
	 * @return string
	 */
	public static function address_header( string $email, string $name ): string {
		$name = trim( str_replace( array( '"', '<', '>' ), '', EmailSettings::header_text( $name ) ) );
		return '' === $name ? $email : '"' . $name . '" <' . $email . '>';
	}

	/**
	 * One attempt record.
	 *
	 * @param string $route Route name.
	 * @param bool   $ok    Delivered.
	 * @param string $error Error text when not.
	 * @return array
	 */
	public static function attempt( string $route, bool $ok, string $error ): array {
		return array(
			'route' => $route,
			'ok'    => $ok,
			'error' => $error,
		);
	}
}
