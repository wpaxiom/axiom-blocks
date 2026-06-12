<?php
/**
 * Deactivation feedback.
 *
 * Shows an optional, skippable modal when the admin deactivates the plugin and
 * — only if they actively submit it — forwards the chosen reason to our
 * feedback endpoint. Nothing is sent on skip/cancel, and no data leaves the
 * site unless the user clicks "Submit & Deactivate" (wp.org Guideline 7: no
 * phoning home without explicit, opt-in consent).
 *
 * @package AxiomBlocks\Admin
 * @since 1.0.1
 */

namespace AxiomBlocks\Admin;

use AxiomBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Deactivation feedback handler.
 *
 * @since 1.0.1
 */
class Feedback {

	/**
	 * Endpoint that receives submitted feedback. Override via the
	 * `axiom_blocks_feedback_endpoint` filter.
	 */
	private const ENDPOINT = 'https://insights.wpaxiom.com/api/ingest/feedback';

	/**
	 * Hook in.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'admin_enqueue_scripts', array( self::class, 'enqueue' ) );
		add_action( 'wp_ajax_axiom_blocks_deactivation_feedback', array( self::class, 'handle' ) );
	}

	/**
	 * The reasons offered in the modal. `placeholder` (optional) reveals a
	 * free-text field when that reason is selected.
	 *
	 * @return array<int, array<string, string>>
	 */
	private static function reasons(): array {
		return array(
			array(
				'id'    => 'temporary',
				'label' => __( 'It’s a temporary deactivation', 'axiom-blocks' ),
			),
			array(
				'id'          => 'better_plugin',
				'label'       => __( 'I found a better plugin', 'axiom-blocks' ),
				'placeholder' => __( 'Which plugin, if you don’t mind sharing?', 'axiom-blocks' ),
			),
			array(
				'id'          => 'not_working',
				'label'       => __( 'The plugin didn’t work', 'axiom-blocks' ),
				'placeholder' => __( 'What went wrong?', 'axiom-blocks' ),
			),
			array(
				'id'    => 'too_complicated',
				'label' => __( 'It’s too complicated to set up', 'axiom-blocks' ),
			),
			array(
				'id'          => 'missing_feature',
				'label'       => __( 'I’m missing a feature I need', 'axiom-blocks' ),
				'placeholder' => __( 'Which feature?', 'axiom-blocks' ),
			),
			array(
				'id'          => 'other',
				'label'       => __( 'Other', 'axiom-blocks' ),
				'placeholder' => __( 'Please tell us more', 'axiom-blocks' ),
			),
		);
	}

	/**
	 * Enqueue the modal assets, but only on the Plugins screen.
	 *
	 * @param string $hook Current admin page hook.
	 * @return void
	 */
	public static function enqueue( string $hook ): void {
		if ( 'plugins.php' !== $hook ) {
			return;
		}

		$js  = AXIOM_BLOCKS_PLUGIN_DIR . 'assets/admin/deactivation-feedback.js';
		$css = AXIOM_BLOCKS_PLUGIN_DIR . 'assets/admin/deactivation-feedback.css';

		wp_enqueue_style(
			'axiom-blocks-deactivation-feedback',
			AXIOM_BLOCKS_PLUGIN_URL . 'assets/admin/deactivation-feedback.css',
			array(),
			file_exists( $css ) ? (string) filemtime( $css ) : Plugin::VERSION
		);

		wp_enqueue_script(
			'axiom-blocks-deactivation-feedback',
			AXIOM_BLOCKS_PLUGIN_URL . 'assets/admin/deactivation-feedback.js',
			array(),
			file_exists( $js ) ? (string) filemtime( $js ) : Plugin::VERSION,
			true
		);

		wp_localize_script(
			'axiom-blocks-deactivation-feedback',
			'axiomBlocksFeedback',
			array(
				'basename' => AXIOM_BLOCKS_PLUGIN_BASENAME,
				'ajaxUrl'  => admin_url( 'admin-ajax.php' ),
				'nonce'    => wp_create_nonce( 'axiom_blocks_feedback' ),
				'reasons'  => self::reasons(),
				'i18n'     => array(
					'title'    => __( 'Quick question before you go', 'axiom-blocks' ),
					'subtitle' => __( 'If you have a moment, what’s making you deactivate Axiom Blocks? Your answer is optional and helps us improve.', 'axiom-blocks' ),
					'submit'   => __( 'Submit & Deactivate', 'axiom-blocks' ),
					'skip'     => __( 'Skip & Deactivate', 'axiom-blocks' ),
					'cancel'   => __( 'Cancel', 'axiom-blocks' ),
					'privacy'  => __( 'Only the option you choose and anything you type is sent — never your content, email, or site address.', 'axiom-blocks' ),
				),
			)
		);
	}

	/**
	 * Receive submitted feedback and forward it (best-effort) to the endpoint.
	 * Runs only when the user actively submits the modal.
	 *
	 * @return void
	 */
	public static function handle(): void {
		check_ajax_referer( 'axiom_blocks_feedback', 'nonce' );

		if ( ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error();
		}

		$reason = isset( $_POST['reason'] ) ? sanitize_key( wp_unslash( $_POST['reason'] ) ) : '';
		$detail = isset( $_POST['detail'] ) ? sanitize_textarea_field( wp_unslash( $_POST['detail'] ) ) : '';

		$allowed = wp_list_pluck( self::reasons(), 'id' );
		if ( ! in_array( $reason, $allowed, true ) ) {
			wp_send_json_error();
		}

		$payload = array(
			'plugin'         => 'axiom-blocks',
			'plugin_version' => AXIOM_BLOCKS_VERSION,
			'reason'         => $reason,
			'detail'         => mb_substr( $detail, 0, 1000 ),
			'wp_version'     => get_bloginfo( 'version' ),
			'php_version'    => PHP_VERSION,
			'locale'         => get_locale(),
			'install_id'     => self::install_id(),
		);

		$endpoint = (string) apply_filters( 'axiom_blocks_feedback_endpoint', self::ENDPOINT );

		// An empty endpoint (e.g. via the filter) disables sending entirely.
		if ( '' === $endpoint ) {
			wp_send_json_success();
		}

		$response = wp_remote_post(
			$endpoint,
			array(
				'timeout'  => 5,
				'blocking' => true,
				'headers'  => array( 'Content-Type' => 'application/json' ),
				'body'     => wp_json_encode( $payload ),
			)
		);

		if ( is_wp_error( $response ) ) {
			wp_send_json_error();
		}

		wp_send_json_success();
	}

	/**
	 * Anonymous, random per-install id (not derived from any personal data),
	 * used only to de-duplicate feedback. Generated once, stored locally.
	 *
	 * @return string
	 */
	private static function install_id(): string {
		$id = get_option( 'axiom_blocks_install_id' );
		if ( ! is_string( $id ) || '' === $id ) {
			$id = wp_generate_uuid4();
			update_option( 'axiom_blocks_install_id', $id, false );
		}
		return $id;
	}
}
