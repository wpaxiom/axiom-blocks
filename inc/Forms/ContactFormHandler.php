<?php
/**
 * Contact Form submit handler.
 *
 * One pipeline behind two entry points: the REST route the view script posts
 * to, and admin-post.php, which takes the plain HTML form when JavaScript is
 * off and answers with a redirect back to the page.
 *
 * Order matters: load the form by key, drop spam, rate-limit, validate, SAVE
 * the entry, then send the email. Saving first means a broken mailer never
 * loses a message; the visitor sees success once the entry is safe and the
 * admin is told about the failed email instead.
 *
 * There is no nonce. Forms sit on pages that full-page caches serve for days,
 * long after a nonce would expire, which is why Kadence turns theirs off too.
 * The guards are the store key (nothing about recipients comes from the
 * browser), a honeypot, a minimum fill time and a per-IP rate limit.
 *
 * @package AxiomBlocks\Forms
 * @since 1.1.0
 */

namespace AxiomBlocks\Forms;

use AxiomBlocks\Email\EmailSettings;
use AxiomBlocks\Email\Mailer;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Contact Form submissions.
 */
final class ContactFormHandler {

	const ACTION = 'axiom_blocks_contact_form';

	/**
	 * Field names the form posts besides the fields themselves.
	 */
	const KEY_FIELD     = 'ab_cf_key';
	const TS_FIELD      = 'ab_cf_ts';
	const ELAPSED_FIELD = 'ab_cf_el';
	const HONEYPOT      = 'ab_cf_website';
	const VALUES_FIELD  = 'ab_cf';

	/**
	 * Fastest a person can fill a form, in seconds.
	 */
	const MIN_SECONDS = 3;

	/**
	 * Rate limit: submissions per window, per form, per IP.
	 */
	const RATE_LIMIT  = 5;
	const RATE_WINDOW = 600;

	/**
	 * Longest a no-JS invalid submission keeps its values for re-display.
	 */
	const STATE_TTL = 600;

	/**
	 * Most bytes of field data one submission may carry.
	 */
	const PAYLOAD_MAX = 65536;

	/**
	 * Wire the admin-post entry point.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_post_nopriv_' . self::ACTION, array( self::class, 'handle_post' ) );
		add_action( 'admin_post_' . self::ACTION, array( self::class, 'handle_post' ) );
	}

	/**
	 * Run one submission through the pipeline.
	 *
	 * @param array  $input   Posted data (unslashed).
	 * @param string $page    Page URL the form sits on.
	 * @param string $ip      Remote address.
	 * @param int    $now     Unix time.
	 * @return array {
	 *     @type string $status   sent | invalid | error
	 *     @type string $message  Text for the visitor.
	 *     @type array  $errors   Field key => message (invalid only).
	 *     @type array  $values   Validated values (invalid only, for re-display).
	 *     @type string $redirect URL to send the visitor to, if any.
	 *     @type string $form_id  The form's id (for the no-JS redirect anchor).
	 * }
	 */
	public static function process( array $input, string $page, string $ip, int $now ): array {
		$key    = sanitize_key( (string) ( $input[ self::KEY_FIELD ] ?? '' ) );
		$config = ContactFormStore::get( $key );

		if ( null === $config ) {
			return self::result( 'error', __( 'This form has changed since the page loaded. Refresh the page and try again.', 'axiom-blocks' ) );
		}

		$form_id = (string) ( $config['form_id'] ?? '' );
		$error   = '' !== (string) ( $config['error_message'] ?? '' )
			? (string) $config['error_message']
			: __( 'Something went wrong and your message was not sent. Please try again.', 'axiom-blocks' );

		if ( self::is_spam( $input, $key, $now ) ) {
			// Bots get the same answer a person would, so they learn nothing.
			return self::success( $config, $form_id );
		}

		$rate_key = 'ab_cf_rl_' . substr( md5( $key . '|' . wp_hash( $ip ) ), 0, 20 );
		$count    = (int) get_transient( $rate_key );
		if ( $count >= (int) apply_filters( 'axiom_blocks_contact_form_rate_limit', self::RATE_LIMIT, $config ) ) {
			return self::result( 'error', __( 'Too many messages from this connection. Please wait a few minutes and try again.', 'axiom-blocks' ), array(), array(), '', $form_id );
		}

		$raw = $input[ self::VALUES_FIELD ] ?? array();
		if ( ! is_array( $raw ) || strlen( (string) wp_json_encode( $raw ) ) > self::PAYLOAD_MAX ) {
			return self::result( 'error', $error, array(), array(), '', $form_id );
		}

		list( $values, $errors ) = self::validate( $config['fields'] ?? array(), $raw );
		if ( ! empty( $errors ) ) {
			return self::result(
				'invalid',
				__( 'Please check the highlighted fields.', 'axiom-blocks' ),
				$errors,
				$values,
				'',
				$form_id
			);
		}

		/**
		 * Last chance to flag a valid-looking submission as spam (Akismet and the
		 * like). Return true to drop it silently.
		 *
		 * @param bool  $is_spam Whether it is spam.
		 * @param array $values  Validated values.
		 * @param array $config  Form configuration.
		 */
		if ( apply_filters( 'axiom_blocks_contact_form_is_spam', false, $values, $config ) ) {
			return self::success( $config, $form_id );
		}

		set_transient( $rate_key, $count + 1, self::RATE_WINDOW );

		$settings = EmailSettings::get();
		$entry_id = 0;
		if ( ! empty( $settings['save_entries'] ) && ! empty( $config['save_entries'] ) ) {
			$entry_id = Entries::create( $config, $key, $values, $page );
		}

		$result = Mailer::send( self::message( $config, $values, $page ) );
		if ( $entry_id ) {
			Entries::set_delivery( $entry_id, $result );
		}

		/**
		 * Fires after a submission was handled.
		 *
		 * @param array $values   Validated values.
		 * @param array $config   Form configuration.
		 * @param int   $entry_id Saved entry ID, or 0.
		 * @param array $result   Mailer result.
		 */
		do_action( 'axiom_blocks_contact_form_submitted', $values, $config, $entry_id, $result );

		if ( ! $result['ok'] && ! $entry_id ) {
			return self::result( 'error', $error, array(), array(), '', $form_id );
		}

		return self::success( $config, $form_id );
	}

	/**
	 * Honeypot and fill-time checks.
	 *
	 * @param array  $input Posted data.
	 * @param string $key   Store key.
	 * @param int    $now   Unix time.
	 * @return bool
	 */
	public static function is_spam( array $input, string $key, int $now ): bool {
		if ( '' !== trim( (string) ( $input[ self::HONEYPOT ] ?? '' ) ) ) {
			return true;
		}

		// The view script reports how long the visitor actually spent, measured
		// from their first interaction; without it, fall back to the signed
		// render time (which only stops instant bots on uncached pages).
		$elapsed_ms = isset( $input[ self::ELAPSED_FIELD ] ) ? absint( $input[ self::ELAPSED_FIELD ] ) : 0;
		if ( $elapsed_ms > 0 ) {
			return $elapsed_ms < self::MIN_SECONDS * 1000;
		}

		$rendered = self::verify_timestamp( (string) ( $input[ self::TS_FIELD ] ?? '' ), $key );
		if ( null === $rendered ) {
			return true;
		}
		return ( $now - $rendered ) < self::MIN_SECONDS;
	}

	/**
	 * A signed render timestamp for a form.
	 *
	 * @param string $key Store key.
	 * @param int    $now Unix time.
	 * @return string
	 */
	public static function timestamp( string $key, int $now ): string {
		return $now . '.' . substr( wp_hash( 'ab_cf_ts|' . $now . '|' . $key ), 0, 12 );
	}

	/**
	 * The time inside a signed timestamp, or null when the signature is wrong.
	 *
	 * @param string $token Posted token.
	 * @param string $key   Store key.
	 * @return int|null
	 */
	public static function verify_timestamp( string $token, string $key ): ?int {
		if ( ! preg_match( '/^(\d{9,11})\.([a-f0-9]{12})$/', $token, $m ) ) {
			return null;
		}
		$expected = substr( wp_hash( 'ab_cf_ts|' . $m[1] . '|' . $key ), 0, 12 );
		return hash_equals( $expected, $m[2] ) ? (int) $m[1] : null;
	}

	/**
	 * Validate posted values against the stored schema. Only schema keys are
	 * read; anything else the browser sent is ignored.
	 *
	 * @param array $fields Schema fields.
	 * @param array $raw    Posted values keyed by field key.
	 * @return array [ values, errors ]
	 */
	public static function validate( array $fields, array $raw ): array {
		$values = array();
		$errors = array();

		foreach ( $fields as $field ) {
			$key   = (string) $field['key'];
			$type  = (string) $field['type'];
			$value = $raw[ $key ] ?? null;

			if ( 'hidden' === $type ) {
				$values[ $key ] = 'static' === ( $field['source'] ?? '' )
					? (string) ( $field['value'] ?? '' )
					: self::clip( sanitize_text_field( is_scalar( $value ) ? (string) $value : '' ), (int) $field['max_length'] );
				continue;
			}

			if ( 'consent' === $type ) {
				$checked        = is_scalar( $value ) && '' !== (string) $value && '0' !== (string) $value;
				$values[ $key ] = $checked;
				if ( ! $checked && ! empty( $field['required'] ) ) {
					$errors[ $key ] = __( 'Please tick this box to continue.', 'axiom-blocks' );
				}
				continue;
			}

			if ( ! empty( $field['multiple'] ) ) {
				$list   = is_array( $value ) ? $value : ( is_scalar( $value ) && '' !== (string) $value ? array( $value ) : array() );
				$allow  = wp_list_pluck( $field['options'] ?? array(), 'value' );
				$picked = array();
				foreach ( $list as $item ) {
					$item = sanitize_text_field( is_scalar( $item ) ? (string) $item : '' );
					if ( '' === $item ) {
						continue;
					}
					if ( ! in_array( $item, $allow, true ) ) {
						$errors[ $key ] = __( 'Pick from the options given.', 'axiom-blocks' );
						continue 2;
					}
					$picked[] = $item;
				}
				$picked         = array_values( array_unique( $picked ) );
				$values[ $key ] = $picked;
				if ( empty( $picked ) && ! empty( $field['required'] ) ) {
					$errors[ $key ] = __( 'Please choose at least one option.', 'axiom-blocks' );
				}
				continue;
			}

			$text = is_scalar( $value ) ? (string) $value : '';
			$text = 'textarea' === $type ? sanitize_textarea_field( $text ) : sanitize_text_field( $text );
			$text = trim( $text );

			if ( '' === $text ) {
				$values[ $key ] = '';
				if ( ! empty( $field['required'] ) ) {
					$errors[ $key ] = __( 'This field is required.', 'axiom-blocks' );
				}
				continue;
			}

			$max = (int) ( $field['max_length'] ?? 0 );
			if ( $max > 0 && self::length( $text ) > $max ) {
				/* translators: %d: maximum number of characters. */
				$errors[ $key ] = sprintf( __( 'Keep this under %d characters.', 'axiom-blocks' ), $max );
				$values[ $key ] = self::clip( $text, $max );
				continue;
			}

			$message = self::check_type( $field, $text );
			if ( '' !== $message ) {
				$errors[ $key ] = $message;
			}
			$values[ $key ] = 'email' === $type ? sanitize_email( $text ) : ( 'url' === ( $field['input_type'] ?? '' ) ? esc_url_raw( $text ) : $text );
			if ( '' !== $message ) {
				$values[ $key ] = $text;
			}
		}

		return array( $values, $errors );
	}

	/**
	 * Type-specific check for a non-empty scalar value.
	 *
	 * @param array  $field Schema field.
	 * @param string $text  Sanitized value.
	 * @return string Error message, or ''.
	 */
	private static function check_type( array $field, string $text ): string {
		switch ( $field['type'] ) {
			case 'email':
				return is_email( $text ) ? '' : __( 'Enter a valid email address.', 'axiom-blocks' );

			case 'phone':
				return preg_match( '/^[0-9+().\-\s\/x]{3,40}$/i', $text ) && preg_match( '/\d/', $text )
					? ''
					: __( 'Enter a valid phone number.', 'axiom-blocks' );

			case 'select':
			case 'choices':
				return in_array( $text, wp_list_pluck( $field['options'] ?? array(), 'value' ), true )
					? ''
					: __( 'Pick from the options given.', 'axiom-blocks' );

			case 'date':
				$date = ContactFormSchema::date_or_empty( $text );
				if ( '' === $date ) {
					return __( 'Enter a valid date.', 'axiom-blocks' );
				}
				if ( '' !== ( $field['min_date'] ?? '' ) && $date < $field['min_date'] ) {
					/* translators: %s: earliest allowed date. */
					return sprintf( __( 'Choose a date on or after %s.', 'axiom-blocks' ), $field['min_date'] );
				}
				if ( '' !== ( $field['max_date'] ?? '' ) && $date > $field['max_date'] ) {
					/* translators: %s: latest allowed date. */
					return sprintf( __( 'Choose a date on or before %s.', 'axiom-blocks' ), $field['max_date'] );
				}
				return '';

			case 'text':
				$min = (int) ( $field['min_length'] ?? 0 );
				if ( $min > 0 && self::length( $text ) < $min ) {
					/* translators: %d: minimum number of characters. */
					return sprintf( __( 'Enter at least %d characters.', 'axiom-blocks' ), $min );
				}
				if ( 'url' === ( $field['input_type'] ?? '' ) ) {
					return wp_http_validate_url( preg_match( '#^https?://#i', $text ) ? $text : 'https://' . $text )
						? ''
						: __( 'Enter a valid web address.', 'axiom-blocks' );
				}
				if ( 'number' === ( $field['input_type'] ?? '' ) ) {
					if ( ! is_numeric( $text ) ) {
						return __( 'Enter a number.', 'axiom-blocks' );
					}
					if ( null !== ( $field['min'] ?? null ) && (float) $text < (float) $field['min'] ) {
						/* translators: %s: smallest allowed number. */
						return sprintf( __( 'Enter %s or more.', 'axiom-blocks' ), (string) $field['min'] );
					}
					if ( null !== ( $field['max'] ?? null ) && (float) $text > (float) $field['max'] ) {
						/* translators: %s: largest allowed number. */
						return sprintf( __( 'Enter %s or less.', 'axiom-blocks' ), (string) $field['max'] );
					}
				}
				return '';
		}
		return '';
	}

	/**
	 * Build the notification email.
	 *
	 * @param array  $config Form configuration.
	 * @param array  $values Validated values.
	 * @param string $page   Page URL.
	 * @return array Message for Mailer::send().
	 */
	public static function message( array $config, array $values, string $page ): array {
		$site = wp_specialchars_decode( (string) get_bloginfo( 'name' ), ENT_QUOTES );
		$form = (string) ( $config['name'] ?? '' );

		$subject = (string) ( $config['subject'] ?? '' );
		if ( '' === trim( $subject ) ) {
			$subject = 'New message from {form}';
		}
		$subject = strtr(
			$subject,
			array(
				'{form}' => $form,
				'{site}' => $site,
			)
		);
		$subject = preg_replace_callback(
			'/\{field:([a-z0-9_]+)\}/',
			static function ( $m ) use ( $values ) {
				return isset( $values[ $m[1] ] ) ? Entries::flatten( $values[ $m[1] ] ) : '';
			},
			$subject
		);

		$reply = '';
		$rows  = array();
		foreach ( $config['fields'] ?? array() as $field ) {
			if ( ! array_key_exists( $field['key'], $values ) ) {
				continue;
			}
			$value = Entries::flatten( $values[ $field['key'] ] );
			if ( '' === $reply && 'email' === $field['type'] && is_email( $value ) ) {
				$reply = $value;
			}
			$rows[] = array( (string) $field['label'], $value );
		}

		$html = '<table cellpadding="8" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;max-width:640px;width:100%">';
		$text = '';
		foreach ( $rows as $row ) {
			$html .= '<tr><th align="left" valign="top" style="border-bottom:1px solid #e5e7eb;width:30%;color:#374151">' . esc_html( $row[0] ) . '</th>'
				. '<td style="border-bottom:1px solid #e5e7eb;color:#111827">' . nl2br( esc_html( $row[1] ) ) . '</td></tr>';
			$text .= $row[0] . ":\n" . $row[1] . "\n\n";
		}
		$html .= '</table>';
		if ( '' !== $page ) {
			/* translators: %s: page URL. */
			$footer = sprintf( __( 'Sent from %s', 'axiom-blocks' ), $page );
			$html  .= '<p style="font-family:sans-serif;font-size:12px;color:#6b7280">' . esc_html( $footer ) . '</p>';
			$text  .= $footer . "\n";
		}

		return array(
			'to'       => self::address_list( $config['to'] ?? array(), true ),
			'cc'       => self::address_list( $config['cc'] ?? array(), false ),
			'bcc'      => self::address_list( $config['bcc'] ?? array(), false ),
			'subject'  => $subject,
			'html'     => $html,
			'text'     => $text,
			'reply_to' => ! empty( $config['reply_to_visitor'] ) ? $reply : '',
		);
	}

	/**
	 * Parse an address list. The recipient list falls back to the site admin.
	 *
	 * @param mixed $raw      Array or comma list.
	 * @param bool  $fallback Use admin_email when empty.
	 * @return string[]
	 */
	public static function address_list( $raw, bool $fallback ): array {
		$parts = is_array( $raw ) ? $raw : explode( ',', (string) $raw );
		$out   = array();
		foreach ( $parts as $part ) {
			$email = sanitize_email( trim( (string) $part ) );
			if ( is_email( $email ) ) {
				$out[] = $email;
			}
		}
		$out = array_slice( array_values( array_unique( $out ) ), 0, 10 );
		if ( empty( $out ) && $fallback ) {
			$out[] = (string) get_option( 'admin_email' );
		}
		return $out;
	}

	/* ── Entry points ───────────────────────────────────────────────────────── */

	/**
	 * REST callback (the view script).
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response
	 */
	public static function rest( $request ) {
		$input = $request->get_body_params();
		if ( empty( $input ) ) {
			$input = (array) $request->get_json_params();
		}
		$page   = self::page_url( (string) ( $input['ab_cf_page'] ?? '' ) );
		$result = self::process( $input, $page, self::ip(), time() );
		$code   = 'error' === $result['status'] && '' === $result['form_id'] ? 400 : 200;
		unset( $result['values'] );
		return new \WP_REST_Response( $result, $code );
	}

	/**
	 * Callback for admin-post.php (JavaScript off): redirect back to the page.
	 *
	 * @return void
	 */
	public static function handle_post(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing -- Public form, cache-safe by design; see the class comment.
		$input  = wp_unslash( $_POST );
		$page   = self::page_url( (string) wp_get_referer() );
		$result = self::process( is_array( $input ) ? $input : array(), $page, self::ip(), time() );

		if ( 'sent' === $result['status'] && '' !== $result['redirect'] ) {
			wp_redirect( $result['redirect'], 303 ); // phpcs:ignore WordPress.Security.SafeRedirect.wp_redirect_wp_redirect -- The author configured this URL; it may be another site.
			exit;
		}

		$back = '' !== $page ? $page : home_url( '/' );
		$back = remove_query_arg( array( 'ab_cf', 'ab_cf_s', 'ab_cf_t' ), $back );
		$args = array(
			'ab_cf'   => $result['form_id'],
			'ab_cf_s' => $result['status'],
		);
		if ( 'invalid' === $result['status'] || 'error' === $result['status'] ) {
			$token = strtolower( wp_generate_password( 16, false, false ) );
			set_transient(
				'ab_cf_state_' . $token,
				array(
					'values'  => $result['values'],
					'errors'  => $result['errors'],
					'message' => $result['message'],
				),
				self::STATE_TTL
			);
			$args['ab_cf_t'] = $token;
		}
		$target = add_query_arg( $args, $back );
		if ( '' !== $result['form_id'] ) {
			$target .= '#ab-cf-' . rawurlencode( $result['form_id'] );
		}
		wp_safe_redirect( $target, 303 );
		exit;
	}

	/**
	 * The no-JS state for a form on this request: status, message, values and
	 * errors read back after the redirect. Empty when the URL is not about it.
	 *
	 * @param string $form_id Form id.
	 * @return array
	 */
	public static function request_state( string $form_id ): array {
		// phpcs:disable WordPress.Security.NonceVerification.Recommended -- Read-only display state.
		if ( '' === $form_id || ! isset( $_GET['ab_cf'], $_GET['ab_cf_s'] ) ) {
			return array();
		}
		if ( sanitize_key( wp_unslash( $_GET['ab_cf'] ) ) !== sanitize_key( $form_id ) ) {
			return array();
		}
		$status = sanitize_key( wp_unslash( $_GET['ab_cf_s'] ) );
		if ( ! in_array( $status, array( 'sent', 'invalid', 'error' ), true ) ) {
			return array();
		}
		$state = array( 'status' => $status );
		if ( isset( $_GET['ab_cf_t'] ) ) {
			$saved = get_transient( 'ab_cf_state_' . sanitize_key( wp_unslash( $_GET['ab_cf_t'] ) ) );
			if ( is_array( $saved ) ) {
				$state = array_merge( $state, $saved );
			}
		}
		// phpcs:enable WordPress.Security.NonceVerification.Recommended
		return $state;
	}

	/* ── Helpers ────────────────────────────────────────────────────────────── */

	/**
	 * The success result: the author's message, or their redirect.
	 *
	 * @param array  $config  Form configuration.
	 * @param string $form_id Form id.
	 * @return array
	 */
	private static function success( array $config, string $form_id ): array {
		$redirect = '';
		if ( 'redirect' === ( $config['confirmation'] ?? '' ) && '' !== (string) ( $config['redirect_url'] ?? '' ) ) {
			$redirect = esc_url_raw( (string) $config['redirect_url'] );
		}
		$message = '' !== (string) ( $config['success_message'] ?? '' )
			? (string) $config['success_message']
			: __( 'Thanks, your message has been sent.', 'axiom-blocks' );
		return self::result( 'sent', $message, array(), array(), $redirect, $form_id );
	}

	/**
	 * Result array.
	 *
	 * @param string $status   Status.
	 * @param string $message  Message.
	 * @param array  $errors   Field errors.
	 * @param array  $values   Values to re-display.
	 * @param string $redirect Redirect URL.
	 * @param string $form_id  Form id.
	 * @return array
	 */
	private static function result( string $status, string $message, array $errors = array(), array $values = array(), string $redirect = '', string $form_id = '' ): array {
		return array(
			'status'   => $status,
			'message'  => $message,
			'errors'   => (object) $errors,
			'values'   => $values,
			'redirect' => $redirect,
			'form_id'  => $form_id,
		);
	}

	/**
	 * A same-site page URL, or ''.
	 *
	 * @param string $url Candidate.
	 * @return string
	 */
	private static function page_url( string $url ): string {
		if ( '' === $url ) {
			return '';
		}
		$safe = wp_validate_redirect( esc_url_raw( $url ), '' );
		return is_string( $safe ) ? $safe : '';
	}

	/**
	 * The remote address. Proxy headers are ignored on purpose: anyone can send
	 * them, and trusting them would let a bot dodge the rate limit.
	 *
	 * @return string
	 */
	private static function ip(): string {
		return isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
	}

	/**
	 * Multibyte-safe length.
	 *
	 * @param string $text Text.
	 * @return int
	 */
	private static function length( string $text ): int {
		return function_exists( 'mb_strlen' ) ? mb_strlen( $text ) : strlen( $text );
	}

	/**
	 * Multibyte-safe truncation.
	 *
	 * @param string $text Text.
	 * @param int    $max  Length.
	 * @return string
	 */
	private static function clip( string $text, int $max ): string {
		if ( $max <= 0 ) {
			return $text;
		}
		return function_exists( 'mb_substr' ) ? mb_substr( $text, 0, $max ) : substr( $text, 0, $max );
	}
}
