<?php
/**
 * Email settings.
 *
 * Site-wide delivery settings for Axiom form emails: which route sends them,
 * the From identity, the fallback switch, and entry storage. Kept in their own
 * option so the shipped general settings (all booleans) stay untouched.
 *
 * The Resend API key is stored apart from the rest, never autoloaded, and never
 * returned to the browser. A wp-config.php constant overrides it, so a site can
 * keep the key out of the database entirely.
 *
 * @package AxiomBlocks\Email
 * @since 1.1.0
 */

namespace AxiomBlocks\Email;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Email delivery settings.
 */
final class EmailSettings {

	const OPTION_KEY = 'axiom_blocks_email_settings';

	const KEY_OPTION = 'axiom_blocks_resend_api_key';

	const KEY_CONSTANT = 'AXIOM_BLOCKS_RESEND_API_KEY';

	const LAST_ERROR = 'axiom_blocks_mail_last_error';

	const LAST_SENT = 'axiom_blocks_mail_last_sent';

	const TEST_PASSED = 'axiom_blocks_mail_test_passed';

	/**
	 * Route ids. Lowercase on purpose: they are stored values, not the brand name.
	 */
	const ROUTE_WP = 'wordpress'; // phpcs:ignore WordPress.WP.CapitalPDangit.MisspelledInText -- Stored identifier.

	const ROUTE_RESEND = 'resend';

	const ROUTES = array( self::ROUTE_WP, self::ROUTE_RESEND );

	/**
	 * Defaults. An empty from_email means "noreply@ the site's own host".
	 */
	private const DEFAULTS = array(
		'route'          => self::ROUTE_WP,
		'from_email'     => '',
		'from_name'      => '',
		'fallback'       => true,
		'save_entries'   => true,
		'retention_days' => 0,
	);

	/**
	 * Default settings.
	 *
	 * @return array
	 */
	public static function get_defaults(): array {
		return self::DEFAULTS;
	}

	/**
	 * Current settings merged with defaults.
	 *
	 * @return array
	 */
	public static function get(): array {
		$saved = get_option( self::OPTION_KEY, array() );
		return array_merge( self::DEFAULTS, is_array( $saved ) ? $saved : array() );
	}

	/**
	 * Sanitize and save. Unknown keys are ignored; missing keys keep their value.
	 *
	 * @param array $input Raw input.
	 * @return array Saved settings.
	 */
	public static function update( array $input ): array {
		$current = self::get();
		$out     = $current;

		if ( array_key_exists( 'route', $input ) ) {
			$route        = (string) $input['route'];
			$out['route'] = in_array( $route, self::ROUTES, true ) ? $route : self::ROUTE_WP;
		}
		if ( array_key_exists( 'from_email', $input ) ) {
			$email             = sanitize_email( (string) $input['from_email'] );
			$out['from_email'] = is_email( $email ) ? $email : '';
		}
		if ( array_key_exists( 'from_name', $input ) ) {
			$out['from_name'] = self::header_text( (string) $input['from_name'] );
		}
		foreach ( array( 'fallback', 'save_entries' ) as $flag ) {
			if ( array_key_exists( $flag, $input ) ) {
				$out[ $flag ] = (bool) $input[ $flag ];
			}
		}
		if ( array_key_exists( 'retention_days', $input ) ) {
			$out['retention_days'] = min( 3650, absint( $input['retention_days'] ) );
		}

		update_option( self::OPTION_KEY, $out );

		if ( array_key_exists( 'resend_api_key', $input ) ) {
			self::set_api_key( (string) $input['resend_api_key'] );
		}

		return $out;
	}

	/**
	 * Restore defaults. The API key is left alone; it is cleared on its own.
	 *
	 * @return array
	 */
	public static function reset(): array {
		delete_option( self::OPTION_KEY );
		return self::DEFAULTS;
	}

	/**
	 * The Resend API key in effect: the constant when defined, else the option.
	 *
	 * @return string
	 */
	public static function api_key(): string {
		if ( defined( self::KEY_CONSTANT ) ) {
			return trim( (string) constant( self::KEY_CONSTANT ) );
		}
		return trim( (string) get_option( self::KEY_OPTION, '' ) );
	}

	/**
	 * Save or clear the stored key. Ignored while the constant is defined.
	 *
	 * @param string $key Raw key. Empty clears it.
	 * @return void
	 */
	public static function set_api_key( string $key ): void {
		if ( defined( self::KEY_CONSTANT ) ) {
			return;
		}
		$key = trim( preg_replace( '/[^A-Za-z0-9_\-]/', '', $key ) );
		if ( '' === $key ) {
			delete_option( self::KEY_OPTION );
			return;
		}
		if ( false === get_option( self::KEY_OPTION, false ) ) {
			add_option( self::KEY_OPTION, $key, '', 'no' );
		} else {
			update_option( self::KEY_OPTION, $key, 'no' );
		}
	}

	/**
	 * What the browser may know about the key: whether one is set, its last
	 * four characters, and whether it comes from wp-config.php.
	 *
	 * @return array
	 */
	public static function key_status(): array {
		$key = self::api_key();
		return array(
			'has_key'       => '' !== $key,
			'last4'         => '' !== $key ? substr( $key, -4 ) : '',
			'from_constant' => defined( self::KEY_CONSTANT ),
		);
	}

	/**
	 * The From address in effect: the saved one, else noreply@ the site host.
	 *
	 * @return string
	 */
	public static function from_email(): string {
		$saved = (string) self::get()['from_email'];
		if ( '' !== $saved && is_email( $saved ) ) {
			return $saved;
		}
		$host = (string) wp_parse_url( home_url(), PHP_URL_HOST );
		$host = preg_replace( '/^www\./i', '', $host );
		$addr = 'noreply@' . $host;
		return is_email( $addr ) ? $addr : (string) get_option( 'admin_email' );
	}

	/**
	 * The From name in effect: the saved one, else the site title.
	 *
	 * @return string
	 */
	public static function from_name(): string {
		$saved = (string) self::get()['from_name'];
		if ( '' !== $saved ) {
			return $saved;
		}
		return self::header_text( wp_specialchars_decode( (string) get_bloginfo( 'name' ), ENT_QUOTES ) );
	}

	/**
	 * Whether the From domain differs from the site's own host. Mail from a
	 * foreign domain is the most common reason messages are rejected.
	 *
	 * @return bool
	 */
	public static function from_domain_mismatch(): bool {
		$from   = strtolower( (string) substr( strrchr( self::from_email(), '@' ), 1 ) );
		$host   = strtolower( (string) wp_parse_url( home_url(), PHP_URL_HOST ) );
		$host   = preg_replace( '/^www\./', '', $host );
		$suffix = '.' . $from;
		return '' !== $from && $from !== $host && substr( $host, -strlen( $suffix ) ) !== $suffix;
	}

	/**
	 * The last delivery failure, or null.
	 *
	 * @return array|null { time, route, message }
	 */
	public static function last_error(): ?array {
		$error = get_option( self::LAST_ERROR, null );
		return is_array( $error ) ? $error : null;
	}

	/**
	 * Record a delivery failure for the admin notice.
	 *
	 * @param string $route   Route that failed.
	 * @param string $message Error text.
	 * @return void
	 */
	public static function record_error( string $route, string $message ): void {
		$value = array(
			'time'    => time(),
			'route'   => $route,
			'message' => self::header_text( $message, 500 ),
		);
		if ( false === get_option( self::LAST_ERROR, false ) ) {
			add_option( self::LAST_ERROR, $value, '', 'no' );
		} else {
			update_option( self::LAST_ERROR, $value, 'no' );
		}
	}

	/**
	 * Clear the recorded failure (after a success, or when dismissed).
	 *
	 * @return void
	 */
	public static function clear_error(): void {
		delete_option( self::LAST_ERROR );
	}

	/**
	 * The last successful send, or null.
	 *
	 * @return array|null { time, route }
	 */
	public static function last_sent(): ?array {
		$sent = get_option( self::LAST_SENT, null );
		return is_array( $sent ) ? $sent : null;
	}

	/**
	 * Record a successful send, for the Email tab's status line.
	 *
	 * @param string $route Route that delivered.
	 * @return void
	 */
	public static function record_sent( string $route ): void {
		$value = array(
			'time'  => time(),
			'route' => $route,
		);
		if ( false === get_option( self::LAST_SENT, false ) ) {
			add_option( self::LAST_SENT, $value, '', 'no' );
		} else {
			update_option( self::LAST_SENT, $value, 'no' );
		}
	}

	/**
	 * Whether a test email from the dashboard has ever gone out.
	 *
	 * @return bool
	 */
	public static function test_passed(): bool {
		return (bool) get_option( self::TEST_PASSED, false );
	}

	/**
	 * Remember that a test email went out (ticks the Get started checklist).
	 *
	 * @return void
	 */
	public static function mark_test_passed(): void {
		if ( ! self::test_passed() ) {
			update_option( self::TEST_PASSED, time(), false );
		}
	}

	/**
	 * Single-line, header-safe text.
	 *
	 * @param string $text Raw text.
	 * @param int    $max  Maximum length.
	 * @return string
	 */
	public static function header_text( string $text, int $max = 200 ): string {
		$text = sanitize_text_field( str_replace( array( "\r", "\n", '%0a', '%0d' ), ' ', $text ) );
		return function_exists( 'mb_substr' ) ? mb_substr( $text, 0, $max ) : substr( $text, 0, $max );
	}
}
