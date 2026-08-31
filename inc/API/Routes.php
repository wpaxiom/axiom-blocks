<?php
/**
 * REST API Routes
 *
 * @package AxiomBlocks\API
 * @since 1.0.0
 */

namespace AxiomBlocks\API;

use AxiomBlocks\Admin\Settings;
use AxiomBlocks\Blocks\Blocks;
use AxiomBlocks\Blocks\CustomIcons;
use AxiomBlocks\Blocks\PostGridTemplates;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * REST API Routes
 */
class Routes {

	const NAMESPACE = 'axiom-blocks/v1';

	/**
	 * Register REST API routes.
	 *
	 * @return void
	 */
	public static function register(): void {
		add_action( 'rest_api_init', array( self::class, 'register_routes' ) );
	}

	/**
	 * Register all REST API routes.
	 *
	 * @return void
	 */
	public static function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/blocks',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'get_blocks' ),
				'permission_callback' => array( self::class, 'permission_check' ),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/blocks/toggle',
			array(
				'methods'             => 'POST',
				'callback'            => array( self::class, 'toggle_block' ),
				'permission_callback' => array( self::class, 'permission_check' ),
				'args'                => array(
					'block'   => array(
						'required' => true,
						'type'     => 'string',
					),
					'enabled' => array(
						'required' => true,
						'type'     => 'boolean',
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/settings',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::class, 'get_settings' ),
					'permission_callback' => array( self::class, 'permission_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( self::class, 'save_settings' ),
					'permission_callback' => array( self::class, 'permission_check' ),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( self::class, 'reset_settings' ),
					'permission_callback' => array( self::class, 'permission_check' ),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/custom-icons',
			array(
				array(
					'methods'             => 'GET',
					'callback'            => array( self::class, 'get_custom_icons' ),
					'permission_callback' => array( self::class, 'edit_permission_check' ),
				),
				array(
					'methods'             => 'POST',
					'callback'            => array( self::class, 'add_custom_icon' ),
					'permission_callback' => array( self::class, 'permission_check' ),
					'args'                => array(
						'svg'   => array(
							'required' => true,
							'type'     => 'string',
						),
						'label' => array(
							'required' => false,
							'type'     => 'string',
							'default'  => '',
						),
					),
				),
				array(
					'methods'             => 'DELETE',
					'callback'            => array( self::class, 'delete_custom_icon' ),
					'permission_callback' => array( self::class, 'permission_check' ),
					'args'                => array(
						'id' => array(
							'required' => true,
							'type'     => 'string',
						),
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/free-shipping-progress',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'free_shipping_progress' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'thresholdMode'     => array(
						'required' => false,
						'type'     => 'string',
						'default'  => 'auto',
					),
					'customThreshold'   => array(
						'required' => false,
						'type'     => 'number',
						'default'  => 0,
					),
					'messageBefore'     => array(
						'required' => false,
						'type'     => 'string',
						'default'  => '',
					),
					'messageQualified'  => array(
						'required' => false,
						'type'     => 'string',
						'default'  => '',
					),
					'hideWhenEmpty'     => array(
						'required' => false,
						'type'     => 'boolean',
						'default'  => false,
					),
					'hideWhenQualified' => array(
						'required' => false,
						'type'     => 'boolean',
						'default'  => false,
					),
				),
			)
		);

		register_rest_route(
			self::NAMESPACE,
			'/post-grid',
			array(
				'methods'             => 'GET',
				'callback'            => array( self::class, 'post_grid_page' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'key'  => array(
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_key',
					),
					'page' => array(
						'required'          => true,
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					),
				),
			)
		);
	}

	/**
	 * Render one more page of a Post Grid.
	 *
	 * Deliberately narrow: the request supplies only a template key and a page
	 * number. Everything else, the card markup and every query argument, is read
	 * back from what the grid registered when it rendered. Nothing the client
	 * sends can widen the query or introduce block markup.
	 *
	 * @param \WP_REST_Request $request Request.
	 * @return \WP_REST_Response|\WP_Error
	 */
	public static function post_grid_page( \WP_REST_Request $request ) {
		$key  = (string) $request->get_param( 'key' );
		$page = max( 1, (int) $request->get_param( 'page' ) );

		$payload = PostGridTemplates::get( $key );
		if ( null === $payload ) {
			return new \WP_Error(
				'axiom_blocks_unknown_grid',
				__( 'That grid is no longer available. Reload the page and try again.', 'axiom-blocks' ),
				array( 'status' => 404 )
			);
		}

		$args = $payload['args'];

		// Belt and braces: these are already the author's saved values, but the
		// route re-asserts the invariants rather than trusting the stored copy.
		$args['post_status']    = 'publish';
		$args['fields']         = 'ids';
		$args['posts_per_page'] = max( 1, min( 50, (int) ( $args['posts_per_page'] ?? 6 ) ) );
		$args['no_found_rows']  = false;

		if ( ! empty( $args['offset'] ) ) {
			$args['offset'] = (int) $args['offset'] + ( ( $page - 1 ) * $args['posts_per_page'] );
			unset( $args['paged'] );
		} else {
			$args['paged'] = $page;
			unset( $args['offset'] );
		}

		$query = new \WP_Query( $args );

		$html = '';
		foreach ( $query->posts as $post_id ) {
			$html .= ( new \WP_Block(
				$payload['card'],
				array(
					'postId'   => $post_id,
					'postType' => get_post_type( $post_id ),
				)
			) )->render();
		}
		wp_reset_postdata();

		return rest_ensure_response(
			array(
				'html'    => $html,
				'page'    => $page,
				'total'   => max( 1, (int) $query->max_num_pages ),
				'hasMore' => $page < (int) $query->max_num_pages,
			)
		);
	}

	/**
	 * Check if user has permission.
	 *
	 * @return bool True if user has manage_options capability.
	 */
	public static function permission_check(): bool {
		return current_user_can( 'manage_options' );
	}

	/**
	 * Check if the user can edit content (and therefore read the custom icon set).
	 *
	 * @return bool True if user has edit_posts capability.
	 */
	public static function edit_permission_check(): bool {
		return current_user_can( 'edit_posts' );
	}

	/**
	 * List all site-wide custom icons.
	 *
	 * @return \WP_REST_Response Custom icons.
	 */
	public static function get_custom_icons(): \WP_REST_Response {
		return rest_ensure_response( CustomIcons::all() );
	}

	/**
	 * Add a custom icon.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response|\WP_Error Stored icon, or an error when the SVG is invalid.
	 */
	public static function add_custom_icon( \WP_REST_Request $request ) {
		$icon = CustomIcons::add(
			(string) $request->get_param( 'label' ),
			(string) $request->get_param( 'svg' )
		);

		if ( null === $icon ) {
			return new \WP_Error(
				'axiom_invalid_svg',
				__( 'That doesn’t look like a valid <svg>. Paste the full SVG markup.', 'axiom-blocks' ),
				array( 'status' => 400 )
			);
		}

		return rest_ensure_response( $icon );
	}

	/**
	 * Delete a custom icon, refusing while it is still in use.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response|\WP_Error Result, or a 409 when the icon is in use.
	 */
	public static function delete_custom_icon( \WP_REST_Request $request ) {
		$id = sanitize_text_field( (string) $request->get_param( 'id' ) );

		$usage = CustomIcons::usage_count( $id );
		if ( $usage > 0 ) {
			return new \WP_Error(
				'axiom_icon_in_use',
				sprintf(
					/* translators: %d: number of blocks using the icon. */
					_n(
						'Can’t delete — %d block is using this icon. Remove it from that block first.',
						'Can’t delete — %d blocks are using this icon. Remove it from those blocks first.',
						$usage,
						'axiom-blocks'
					),
					$usage
				),
				array(
					'status' => 409,
					'count'  => $usage,
				)
			);
		}

		return rest_ensure_response( array( 'deleted' => CustomIcons::delete( $id ) ) );
	}

	/**
	 * Get all blocks with their enabled status.
	 *
	 * @return \WP_REST_Response List of blocks.
	 */
	public static function get_blocks(): \WP_REST_Response {
		$all     = Blocks::get_all();
		$enabled = Blocks::get_enabled();

		$blocks = array_map(
			function ( $block ) use ( $enabled ) {
				return array_merge(
					$block,
					array(
						'enabled' => $enabled[ $block['id'] ] ?? false,
					)
				);
			},
			$all
		);

		return rest_ensure_response( $blocks );
	}

	/**
	 * Live snapshot for the Free Shipping Progress block.
	 * Public endpoint — reflects the caller's WC session/cart only.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response Snapshot response.
	 */
	public static function free_shipping_progress( \WP_REST_Request $request ): \WP_REST_Response {
		if ( ! function_exists( 'WC' ) ) {
			$response = rest_ensure_response(
				array(
					'threshold'     => 0.0,
					'subtotal'      => 0.0,
					'remaining'     => 0.0,
					'percent'       => 0.0,
					'qualified'     => false,
					'empty'         => true,
					'message_html'  => '',
					'should_render' => false,
				)
			);
			$response->header( 'Cache-Control', 'public, max-age=300' );
			return $response;
		}

		require_once AXIOM_BLOCKS_PLUGIN_DIR . 'src/blocks/free-shipping-progress/helper.php';

		// Boot the WC cart on REST requests if it isn't already loaded.
		if ( function_exists( 'wc_load_cart' ) && ! WC()->cart ) {
			wc_load_cart();
		}

		$attrs = array(
			'thresholdMode'     => sanitize_text_field( (string) $request->get_param( 'thresholdMode' ) ),
			'customThreshold'   => (float) $request->get_param( 'customThreshold' ),
			'messageBefore'     => (string) $request->get_param( 'messageBefore' ),
			'messageQualified'  => (string) $request->get_param( 'messageQualified' ),
			'hideWhenEmpty'     => (bool) $request->get_param( 'hideWhenEmpty' ),
			'hideWhenQualified' => (bool) $request->get_param( 'hideWhenQualified' ),
		);

		$snapshot                  = \AxiomBlocks\Blocks\FreeShippingProgress\Helper::snapshot( $attrs );
		$snapshot['should_render'] = \AxiomBlocks\Blocks\FreeShippingProgress\Helper::should_render( $attrs, $snapshot );

		return rest_ensure_response( $snapshot );
	}

	/**
	 * Get current settings.
	 *
	 * @return \WP_REST_Response Current settings.
	 */
	public static function get_settings(): \WP_REST_Response {
		return rest_ensure_response( Settings::get() );
	}

	/**
	 * Save settings.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response Updated settings.
	 */
	public static function save_settings( \WP_REST_Request $request ): \WP_REST_Response {
		$params = $request->get_json_params();
		if ( ! is_array( $params ) ) {
			$params = $request->get_params();
		}
		return rest_ensure_response( Settings::update( $params ) );
	}

	/**
	 * Reset settings to defaults.
	 *
	 * @return \WP_REST_Response Default settings.
	 */
	public static function reset_settings(): \WP_REST_Response {
		return rest_ensure_response( Settings::reset() );
	}

	/**
	 * Toggle a block's enabled status.
	 *
	 * @param \WP_REST_Request $request REST request object.
	 * @return \WP_REST_Response Toggle result.
	 */
	public static function toggle_block( \WP_REST_Request $request ): \WP_REST_Response {
		$block_id = sanitize_text_field( $request['block'] );
		$enabled  = rest_sanitize_boolean( $request['enabled'] );

		Blocks::set_enabled( $block_id, $enabled );

		return rest_ensure_response(
			array(
				'success' => true,
				'block'   => $block_id,
				'enabled' => $enabled,
			)
		);
	}
}
