<?php
/**
 * Resend transport.
 *
 * Sends one message through the Resend email API over HTTPS. Resend only
 * accepts mail from a domain verified in the sender's Resend account, so the
 * most common failure is a From address on an unverified domain; the error
 * text Resend returns is passed through unchanged so the admin can act on it.
 *
 * @package AxiomBlocks\Email
 * @since 1.1.0
 */

namespace AxiomBlocks\Email;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Resend API transport.
 */
final class ResendTransport {

	const ENDPOINT = 'https://api.resend.com/emails';

	const TIMEOUT = 10;

	/**
	 * Send a normalized message.
	 *
	 * @param array  $message Normalized message (see Mailer::normalize()).
	 * @param string $api_key Resend API key.
	 * @return array { route, ok, error }
	 */
	public static function send( array $message, string $api_key ): array {
		if ( '' === $api_key ) {
			return Mailer::attempt( EmailSettings::ROUTE_RESEND, false, __( 'No Resend API key is set.', 'axiom-blocks' ) );
		}
		if ( empty( $message['to'] ) ) {
			return Mailer::attempt( EmailSettings::ROUTE_RESEND, false, __( 'No valid recipient address.', 'axiom-blocks' ) );
		}

		$response = wp_remote_post(
			self::ENDPOINT,
			array(
				'timeout' => self::TIMEOUT,
				'headers' => array(
					'Authorization' => 'Bearer ' . $api_key,
					'Content-Type'  => 'application/json',
				),
				'body'    => (string) wp_json_encode( self::body( $message ) ),
			)
		);

		if ( is_wp_error( $response ) ) {
			return Mailer::attempt( EmailSettings::ROUTE_RESEND, false, $response->get_error_message() );
		}

		$code = (int) wp_remote_retrieve_response_code( $response );
		if ( $code >= 200 && $code < 300 ) {
			return Mailer::attempt( EmailSettings::ROUTE_RESEND, true, '' );
		}

		$data    = json_decode( (string) wp_remote_retrieve_body( $response ), true );
		$details = is_array( $data ) && ! empty( $data['message'] ) ? (string) $data['message'] : '';
		return Mailer::attempt(
			EmailSettings::ROUTE_RESEND,
			false,
			/* translators: 1: HTTP status code, 2: error text from Resend. */
			trim( sprintf( __( 'Resend returned HTTP %1$d. %2$s', 'axiom-blocks' ), $code, $details ) )
		);
	}

	/**
	 * The JSON body Resend expects.
	 *
	 * @param array $message Normalized message.
	 * @return array
	 */
	public static function body( array $message ): array {
		$body = array(
			'from'    => Mailer::address_header( $message['from_email'], $message['from_name'] ),
			'to'      => $message['to'],
			'subject' => $message['subject'],
			'html'    => $message['html'],
		);
		if ( '' !== $message['text'] ) {
			$body['text'] = $message['text'];
		}
		if ( ! empty( $message['cc'] ) ) {
			$body['cc'] = $message['cc'];
		}
		if ( ! empty( $message['bcc'] ) ) {
			$body['bcc'] = $message['bcc'];
		}
		if ( '' !== $message['reply_to'] ) {
			$body['reply_to'] = $message['reply_to'];
		}
		return $body;
	}
}
