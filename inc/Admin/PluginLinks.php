<?php
/**
 * Plugins screen links and the welcome notice.
 *
 * - Action links on the plugin row: Get started (the Help tab) and Settings.
 * - Row meta: Docs, Video tutorials, Support.
 * - A one-time welcome notice after activation. Activation sets a flag; the
 *   notice shows on the Plugins screen and the WP Dashboard only, to people who
 *   can manage options, until they dismiss it or open the Axiom dashboard. It
 *   never shows after a network or bulk activation.
 *
 * @package AxiomBlocks\Admin
 * @since 1.1.0
 */

namespace AxiomBlocks\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin row links and the welcome notice.
 */
final class PluginLinks {

	const WELCOME_OPTION = 'axiom_blocks_welcome';

	const DISMISS_ACTION = 'axiom_blocks_dismiss_welcome';

	/**
	 * Wire hooks.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'plugin_action_links_' . AXIOM_BLOCKS_PLUGIN_BASENAME, array( self::class, 'action_links' ) );
		add_filter( 'plugin_row_meta', array( self::class, 'row_meta' ), 10, 2 );
		add_action( 'admin_notices', array( self::class, 'welcome' ) );
		add_action( 'wp_ajax_' . self::DISMISS_ACTION, array( self::class, 'dismiss' ) );
	}

	/**
	 * Activation: queue the welcome notice, except for a network activation.
	 *
	 * @param bool $network_wide Whether the plugin was network activated.
	 * @return void
	 */
	public static function on_activate( $network_wide = false ): void {
		if ( $network_wide ) {
			return;
		}
		update_option( self::WELCOME_OPTION, 1, false );
	}

	/**
	 * "Get started" and "Settings" before Deactivate.
	 *
	 * @param array $links Action links.
	 * @return array
	 */
	public static function action_links( array $links ): array {
		if ( ! current_user_can( 'manage_options' ) ) {
			return $links;
		}
		$ours = array(
			'axiom-get-started' => '<a href="' . esc_url( Links::dashboard( 'help' ) ) . '">' . esc_html__( 'Get started', 'axiom-blocks' ) . '</a>',
			'axiom-settings'    => '<a href="' . esc_url( Links::dashboard( 'settings' ) ) . '">' . esc_html__( 'Settings', 'axiom-blocks' ) . '</a>',
		);
		return array_merge( $ours, $links );
	}

	/**
	 * Docs, Video tutorials and Support after "View details".
	 *
	 * @param array  $meta Row meta links.
	 * @param string $file Plugin file.
	 * @return array
	 */
	public static function row_meta( array $meta, string $file ): array {
		if ( AXIOM_BLOCKS_PLUGIN_BASENAME !== $file ) {
			return $meta;
		}
		$links = array(
			'docs'    => __( 'Docs', 'axiom-blocks' ),
			'videos'  => __( 'Video tutorials', 'axiom-blocks' ),
			'support' => __( 'Support', 'axiom-blocks' ),
		);
		foreach ( $links as $page => $label ) {
			$meta[] = sprintf(
				'<a href="%1$s" target="_blank" rel="noopener noreferrer">%2$s<span class="screen-reader-text"> %3$s</span></a>',
				esc_url( Links::url( $page, 'plugin-row' ) ),
				esc_html( $label ),
				esc_html__( '(opens in a new tab)', 'axiom-blocks' )
			);
		}
		return $meta;
	}

	/**
	 * Whether the welcome notice is waiting.
	 *
	 * @return bool
	 */
	public static function pending(): bool {
		return (bool) get_option( self::WELCOME_OPTION, false );
	}

	/**
	 * Clear the notice (dismissed, or the Axiom dashboard was opened).
	 *
	 * @return void
	 */
	public static function clear(): void {
		delete_option( self::WELCOME_OPTION );
	}

	/**
	 * Print the welcome notice.
	 *
	 * @return void
	 */
	public static function welcome(): void {
		if ( ! self::pending() || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		// A bulk activation lands on plugins.php?activate-multi=true. Several
		// plugins greeting at once helps nobody, so drop ours.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only flag set by core's redirect.
		if ( isset( $_GET['activate-multi'] ) ) {
			self::clear();
			return;
		}
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! in_array( $screen->id, array( 'plugins', 'dashboard' ), true ) ) {
			return;
		}

		$icon = '<svg width="20" height="20" viewBox="0 0 30 30" aria-hidden="true" focusable="false"><rect x="0" y="18" width="9" height="12" rx="2.5" fill="#7c3aed"/><rect x="10.5" y="10" width="9" height="20" rx="2.5" fill="#7c3aed" opacity=".7"/><rect x="21" y="2" width="9" height="28" rx="2.5" fill="#7c3aed" opacity=".4"/></svg>';
		?>
		<div class="notice is-dismissible ab-welcome" data-ab-dismiss="<?php echo esc_url( wp_nonce_url( admin_url( 'admin-ajax.php?action=' . self::DISMISS_ACTION ), self::DISMISS_ACTION ) ); ?>">
			<div class="ab-welcome__row">
				<?php echo $icon; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Static SVG above. ?>
				<p class="ab-welcome__text"><?php esc_html_e( 'Axiom Blocks is ready. Start with the first three steps.', 'axiom-blocks' ); ?></p>
				<p class="ab-welcome__actions">
					<a class="button ab-welcome__btn" href="<?php echo esc_url( Links::dashboard( 'help' ) ); ?>"><?php esc_html_e( 'Get started', 'axiom-blocks' ); ?></a>
					<a href="<?php echo esc_url( Links::url( 'getting-started', 'welcome-notice' ) ); ?>" target="_blank" rel="noopener noreferrer"><?php esc_html_e( 'Read the docs', 'axiom-blocks' ); ?><span class="screen-reader-text"> <?php esc_html_e( '(opens in a new tab)', 'axiom-blocks' ); ?></span></a>
				</p>
			</div>
		</div>
		<style>
			.ab-welcome{border-left-color:#7c3aed}
			.ab-welcome__row{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:4px 0}
			.ab-welcome__row svg{flex-shrink:0}
			.ab-welcome__text{flex:1 1 280px;margin:.5em 0}
			.ab-welcome__actions{display:flex;align-items:center;gap:12px;margin:.5em 0}
			.ab-welcome .ab-welcome__btn{background:#7c3aed;border-color:#7c3aed;color:#fff}
			.ab-welcome .ab-welcome__btn:hover,.ab-welcome .ab-welcome__btn:focus{background:#6d28d9;border-color:#6d28d9;color:#fff}
			.ab-welcome .ab-welcome__btn:focus{box-shadow:0 0 0 1px #fff,0 0 0 3px #7c3aed}
		</style>
		<script>
			( function () {
				var notice = document.querySelector( '.ab-welcome' );
				if ( ! notice ) {
					return;
				}
				notice.addEventListener( 'click', function ( event ) {
					if ( event.target.closest( '.notice-dismiss' ) ) {
						window.fetch( notice.getAttribute( 'data-ab-dismiss' ), { credentials: 'same-origin' } );
					}
				} );
			} )();
		</script>
		<?php
	}

	/**
	 * Dismiss handler (the notice's close button).
	 *
	 * @return void
	 */
	public static function dismiss(): void {
		check_ajax_referer( self::DISMISS_ACTION );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( null, 403 );
		}
		self::clear();
		wp_send_json_success();
	}
}
