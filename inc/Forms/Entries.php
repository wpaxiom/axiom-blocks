<?php
/**
 * Contact Form entries.
 *
 * Every valid submission is saved here before any email is sent, so a broken
 * mailer never loses a message. Entries are a private post type with no front
 * end and no REST exposure, listed under the Axiom Blocks menu, readable and
 * deletable by administrators only. No IP address is stored.
 *
 * Also registers the personal-data exporter and eraser (keyed by the email the
 * visitor gave), the suggested privacy-policy text, and the daily cron that
 * applies the retention setting and garbage-collects the form store.
 *
 * @package AxiomBlocks\Forms
 * @since 1.1.0
 */

namespace AxiomBlocks\Forms;

use AxiomBlocks\Email\EmailSettings;
use AxiomBlocks\Plugin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Stores and lists form entries.
 */
final class Entries {

	const POST_TYPE = 'ab_form_entry';

	const CRON_HOOK = 'axiom_blocks_cf_daily';

	const META_FIELDS   = '_ab_cf_fields';
	const META_FORM     = '_ab_cf_form_name';
	const META_KEY      = '_ab_cf_form_key';
	const META_PAGE     = '_ab_cf_page';
	const META_EMAIL    = '_ab_cf_email';
	const META_DELIVERY = '_ab_cf_delivery';
	const META_ROUTE    = '_ab_cf_route';
	const META_ERRORS   = '_ab_cf_errors';

	const VIEWED_META = 'axiom_blocks_entries_viewed';

	/**
	 * When the current user last opened the list, read before this visit
	 * overwrote it, so the rows that were new can still be marked.
	 *
	 * @var int|null
	 */
	private static $previous_view = null;

	/**
	 * New-entry count for the current user, worked out once per request.
	 *
	 * @var int|null
	 */
	private static $new_count = null;

	/**
	 * Wire hooks.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_action( 'init', array( self::class, 'register_post_type' ) );
		add_action( 'init', array( self::class, 'schedule' ) );
		add_action( self::CRON_HOOK, array( self::class, 'daily' ) );

		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( self::class, 'columns' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( self::class, 'column' ), 10, 2 );
		add_filter( 'post_row_actions', array( self::class, 'row_actions' ), 10, 2 );
		add_filter( 'bulk_actions-edit-' . self::POST_TYPE, array( self::class, 'bulk_actions' ) );
		add_action( 'add_meta_boxes_' . self::POST_TYPE, array( self::class, 'meta_boxes' ) );
		add_filter( 'manage_edit-' . self::POST_TYPE . '_sortable_columns', array( self::class, 'sortable_columns' ) );
		add_filter( 'list_table_primary_column', array( self::class, 'primary_column' ), 10, 2 );
		add_action( 'edit_form_top', array( self::class, 'back_link' ) );
		add_action( 'load-edit.php', array( self::class, 'mark_viewed' ) );
		add_action( 'admin_menu', array( self::class, 'menu_order' ), 98 );
		add_action( 'admin_menu', array( self::class, 'menu_bubble' ), 99 );
		add_action( 'admin_enqueue_scripts', array( self::class, 'styles' ) );

		add_filter( 'wp_privacy_personal_data_exporters', array( self::class, 'register_exporter' ) );
		add_filter( 'wp_privacy_personal_data_erasers', array( self::class, 'register_eraser' ) );
		add_action( 'admin_init', array( self::class, 'privacy_policy_text' ) );
	}

	/**
	 * Register the entry post type.
	 *
	 * @return void
	 */
	public static function register_post_type(): void {
		$cap = 'manage_options';
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'               => __( 'Form entries', 'axiom-blocks' ),
					'singular_name'      => __( 'Form entry', 'axiom-blocks' ),
					'menu_name'          => __( 'Form entries', 'axiom-blocks' ),
					'all_items'          => __( 'Form entries', 'axiom-blocks' ),
					'edit_item'          => __( 'Form entry', 'axiom-blocks' ),
					'view_item'          => __( 'View entry', 'axiom-blocks' ),
					'search_items'       => __( 'Search entries', 'axiom-blocks' ),
					'not_found'          => __( 'No entries yet. Messages sent through a Contact Form block appear here.', 'axiom-blocks' ),
					'not_found_in_trash' => __( 'No entries in the trash.', 'axiom-blocks' ),
				),
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => 'axiom-blocks-dashboard',
				'show_in_nav_menus'   => false,
				'show_in_admin_bar'   => false,
				'show_in_rest'        => false,
				'has_archive'         => false,
				'rewrite'             => false,
				'query_var'           => false,
				'supports'            => array( 'title' ),
				'map_meta_cap'        => false,
				'capabilities'        => array(
					'edit_post'              => $cap,
					'read_post'              => $cap,
					'delete_post'            => $cap,
					'edit_posts'             => $cap,
					'edit_others_posts'      => $cap,
					'edit_published_posts'   => $cap,
					'edit_private_posts'     => $cap,
					'delete_posts'           => $cap,
					'delete_others_posts'    => $cap,
					'delete_published_posts' => $cap,
					'delete_private_posts'   => $cap,
					'read_private_posts'     => $cap,
					'publish_posts'          => 'do_not_allow',
					'create_posts'           => 'do_not_allow',
				),
			)
		);
	}

	/**
	 * Save one entry.
	 *
	 * @param array  $config Form configuration.
	 * @param string $key    Store key.
	 * @param array  $values Validated values, keyed by field key.
	 * @param string $page   Page URL the form was submitted from.
	 * @return int Post ID, or 0 on failure.
	 */
	public static function create( array $config, string $key, array $values, string $page ): int {
		$rows  = array();
		$email = '';
		foreach ( $config['fields'] ?? array() as $field ) {
			if ( ! array_key_exists( $field['key'], $values ) ) {
				continue;
			}
			$rows[] = array(
				'key'   => $field['key'],
				'label' => $field['label'],
				'type'  => $field['type'],
				'value' => self::flatten( $values[ $field['key'] ] ),
			);
			if ( '' === $email && 'email' === $field['type'] && is_email( (string) $values[ $field['key'] ] ) ) {
				$email = strtolower( (string) $values[ $field['key'] ] );
			}
		}

		$form_name = (string) ( $config['name'] ?? '' );
		$title     = '' !== $email ? $form_name . ' · ' . $email : $form_name;

		$post_id = wp_insert_post(
			array(
				'post_type'   => self::POST_TYPE,
				'post_status' => 'publish',
				'post_title'  => wp_strip_all_tags( $title ),
				'post_author' => 0,
			),
			true
		);
		if ( is_wp_error( $post_id ) || ! $post_id ) {
			return 0;
		}

		update_post_meta( $post_id, self::META_FIELDS, $rows );
		update_post_meta( $post_id, self::META_FORM, $form_name );
		update_post_meta( $post_id, self::META_KEY, $key );
		update_post_meta( $post_id, self::META_PAGE, esc_url_raw( $page ) );
		update_post_meta( $post_id, self::META_DELIVERY, 'pending' );
		if ( '' !== $email ) {
			update_post_meta( $post_id, self::META_EMAIL, $email );
		}
		return (int) $post_id;
	}

	/**
	 * Record how delivery went.
	 *
	 * @param int   $post_id Entry ID.
	 * @param array $result  Mailer::send() result.
	 * @return void
	 */
	public static function set_delivery( int $post_id, array $result ): void {
		update_post_meta( $post_id, self::META_DELIVERY, $result['ok'] ? 'sent' : 'failed' );
		update_post_meta( $post_id, self::META_ROUTE, (string) $result['route'] );
		$errors = array();
		foreach ( $result['attempts'] ?? array() as $attempt ) {
			if ( ! $attempt['ok'] ) {
				$errors[] = $attempt['route'] . ': ' . $attempt['error'];
			}
		}
		update_post_meta( $post_id, self::META_ERRORS, $errors );
	}

	/**
	 * A stored value as display text.
	 *
	 * @param mixed $value Value (string or list).
	 * @return string
	 */
	public static function flatten( $value ): string {
		if ( is_array( $value ) ) {
			return implode( ', ', array_map( 'strval', $value ) );
		}
		if ( is_bool( $value ) ) {
			return $value ? __( 'Yes', 'axiom-blocks' ) : __( 'No', 'axiom-blocks' );
		}
		return (string) $value;
	}

	/* ── Admin list ─────────────────────────────────────────────────────────── */

	/**
	 * List table columns.
	 *
	 * @param array $columns Default columns.
	 * @return array
	 */
	public static function columns( array $columns ): array {
		return array(
			'cb'             => $columns['cb'] ?? '<input type="checkbox" />',
			'ab_cf_entry'    => __( 'Entry', 'axiom-blocks' ),
			'ab_cf_form'     => __( 'Form', 'axiom-blocks' ),
			'ab_cf_delivery' => __( 'Email', 'axiom-blocks' ),
			'ab_cf_received' => __( 'Received', 'axiom-blocks' ),
		);
	}

	/**
	 * Received sorts by date, newest first by default.
	 *
	 * @param array $columns Sortable columns.
	 * @return array
	 */
	public static function sortable_columns( array $columns ): array {
		$columns['ab_cf_received'] = array( 'date', true );
		return $columns;
	}

	/**
	 * The Entry column carries the row actions.
	 *
	 * @param string $column Default primary column.
	 * @param string $screen Screen id.
	 * @return string
	 */
	public static function primary_column( string $column, string $screen ): string {
		return 'edit-' . self::POST_TYPE === $screen ? 'ab_cf_entry' : $column;
	}

	/**
	 * Render a custom column.
	 *
	 * @param string $column  Column name.
	 * @param int    $post_id Entry ID.
	 * @return void
	 */
	public static function column( string $column, int $post_id ): void {
		switch ( $column ) {
			case 'ab_cf_entry':
				$email = (string) get_post_meta( $post_id, self::META_EMAIL, true );
				$new   = self::is_new( $post_id );
				printf(
					'<strong><a class="row-title%1$s" href="%2$s">%3$s</a></strong>',
					$new ? ' ab-cf-row-new' : '',
					esc_url( (string) get_edit_post_link( $post_id ) ),
					esc_html( self::display_name( $post_id ) )
				);
				if ( $new ) {
					echo ' <span class="ab-cf-new">' . esc_html__( 'New', 'axiom-blocks' ) . '</span>';
				}
				if ( '' !== $email && self::display_name( $post_id ) !== $email ) {
					echo '<div class="ab-cf-sub">' . esc_html( $email ) . '</div>';
				}
				return;
			case 'ab_cf_form':
				echo esc_html( (string) get_post_meta( $post_id, self::META_FORM, true ) );
				return;
			case 'ab_cf_delivery':
				self::pill( (string) get_post_meta( $post_id, self::META_DELIVERY, true ) );
				return;
			case 'ab_cf_received':
				echo '<span class="ab-cf-sub">' . esc_html( self::received_label( $post_id ) ) . '</span>';
				return;
		}
	}

	/**
	 * Human label for a delivery status.
	 *
	 * @param string $status Stored status.
	 * @return string
	 */
	public static function delivery_label( string $status ): string {
		switch ( $status ) {
			case 'sent':
				return __( 'Sent', 'axiom-blocks' );
			case 'failed':
				return __( 'Not sent', 'axiom-blocks' );
			case 'pending':
				return __( 'Sending', 'axiom-blocks' );
			default:
				return __( 'Not emailed', 'axiom-blocks' );
		}
	}

	/**
	 * Print the delivery status as a pill: icon, colour and text, never colour
	 * alone.
	 *
	 * @param string $status Stored status.
	 * @return void
	 */
	public static function pill( string $status ): void {
		$icons = array(
			'sent'    => 'M5 13l4 4L19 7',
			'failed'  => 'M6 18L18 6M6 6l12 12',
			'pending' => 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
			'none'    => 'M20 12H4',
		);
		$key   = isset( $icons[ $status ] ) ? $status : 'none';
		printf(
			'<span class="ab-cf-pill ab-cf-pill--%1$s"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="%2$s"/></svg>%3$s</span>',
			esc_attr( $key ),
			esc_attr( $icons[ $key ] ),
			esc_html( self::delivery_label( $status ) )
		);
	}

	/**
	 * The visitor's name when the form asked for one, else their email, else the
	 * form name.
	 *
	 * @param int $post_id Entry ID.
	 * @return string
	 */
	public static function display_name( int $post_id ): string {
		$rows = get_post_meta( $post_id, self::META_FIELDS, true );
		foreach ( is_array( $rows ) ? $rows : array() as $row ) {
			$key   = strtolower( (string) ( $row['key'] ?? '' ) );
			$label = strtolower( (string) ( $row['label'] ?? '' ) );
			$value = trim( (string) ( $row['value'] ?? '' ) );
			if ( '' !== $value && ( in_array( $key, array( 'name', 'full-name', 'full_name', 'your-name' ), true ) || in_array( $label, array( 'name', 'full name', 'your name' ), true ) ) ) {
				return $value;
			}
		}
		$email = (string) get_post_meta( $post_id, self::META_EMAIL, true );
		if ( '' !== $email ) {
			return $email;
		}
		$form = (string) get_post_meta( $post_id, self::META_FORM, true );
		return '' !== $form ? $form : __( 'Form entry', 'axiom-blocks' );
	}

	/**
	 * "Just now", "2 hours ago" within a day, the date after that.
	 *
	 * @param int $post_id Entry ID.
	 * @return string
	 */
	public static function received_label( int $post_id ): string {
		$time = (int) get_post_time( 'U', true, $post_id );
		$ago  = time() - $time;
		if ( $ago < MINUTE_IN_SECONDS ) {
			return __( 'Just now', 'axiom-blocks' );
		}
		if ( $ago < DAY_IN_SECONDS ) {
			/* translators: %s: time span, for example "2 hours". */
			return sprintf( __( '%s ago', 'axiom-blocks' ), human_time_diff( $time ) );
		}
		return (string) get_the_date( '', $post_id );
	}

	/**
	 * Keep "View" (the read-only screen) and the trash actions, drop quick edit.
	 *
	 * @param array    $actions Row actions.
	 * @param \WP_Post $post    Post.
	 * @return array
	 */
	public static function row_actions( array $actions, $post ): array {
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return $actions;
		}
		unset( $actions['inline hide-if-no-js'], $actions['view'] );
		if ( isset( $actions['edit'] ) ) {
			$actions['edit'] = sprintf(
				'<a href="%s">%s</a>',
				esc_url( (string) get_edit_post_link( $post->ID ) ),
				esc_html__( 'View', 'axiom-blocks' )
			);
		}
		return $actions;
	}

	/**
	 * Only trash/delete in bulk.
	 *
	 * @param array $actions Bulk actions.
	 * @return array
	 */
	public static function bulk_actions( array $actions ): array {
		unset( $actions['edit'] );
		return $actions;
	}

	/* ── New entries ────────────────────────────────────────────────────────── */

	/**
	 * Entries received so far (published, plus any in the trash).
	 *
	 * @return int
	 */
	public static function total(): int {
		$counts = wp_count_posts( self::POST_TYPE );
		return (int) ( $counts->publish ?? 0 ) + (int) ( $counts->trash ?? 0 );
	}

	/**
	 * Entries received since the current user last opened the list.
	 *
	 * @return int
	 */
	public static function new_count(): int {
		if ( null !== self::$new_count ) {
			return self::$new_count;
		}
		$query           = new \WP_Query(
			array(
				'post_type'              => self::POST_TYPE,
				'post_status'            => 'publish',
				'fields'                 => 'ids',
				'posts_per_page'         => 1,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'date_query'             => array(
					array(
						'after'     => gmdate( 'Y-m-d H:i:s', self::last_viewed() ),
						'column'    => 'post_date_gmt',
						'inclusive' => false,
					),
				),
			)
		);
		self::$new_count = (int) $query->found_posts;
		return self::$new_count;
	}

	/**
	 * When the current user last opened the list (0 for never).
	 *
	 * @return int
	 */
	public static function last_viewed(): int {
		return (int) get_user_meta( get_current_user_id(), self::VIEWED_META, true );
	}

	/**
	 * Whether an entry arrived after the previous visit to the list.
	 *
	 * @param int $post_id Entry ID.
	 * @return bool
	 */
	private static function is_new( int $post_id ): bool {
		$since = null !== self::$previous_view ? self::$previous_view : self::last_viewed();
		return (int) get_post_time( 'U', true, $post_id ) > $since;
	}

	/**
	 * Opening the list marks everything as seen. The previous time is kept for
	 * this request so the rows that were new still show it once.
	 *
	 * @return void
	 */
	public static function mark_viewed(): void {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Reads the screen's post type, changes nothing on its own.
		$type = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : '';
		if ( self::POST_TYPE !== $type || ! current_user_can( 'manage_options' ) ) {
			return;
		}
		self::$previous_view = self::last_viewed();
		self::$new_count     = 0;
		update_user_meta( get_current_user_id(), self::VIEWED_META, time() );
	}

	/**
	 * Put Form entries straight under Dashboard. Post type submenus are added
	 * in whatever order the hooks ran, so move it once everything is in.
	 *
	 * @return void
	 */
	public static function menu_order(): void {
		global $submenu;
		$items = $submenu['axiom-blocks-dashboard'] ?? null;
		if ( ! is_array( $items ) ) {
			return;
		}
		$entries = null;
		$rest    = array();
		foreach ( $items as $item ) {
			if ( null === $entries && isset( $item[2] ) && 'edit.php?post_type=' . self::POST_TYPE === $item[2] ) {
				$entries = $item;
			} else {
				$rest[] = $item;
			}
		}
		if ( null === $entries ) {
			return;
		}
		$ordered = array();
		foreach ( $rest as $item ) {
			$ordered[] = $item;
			if ( isset( $item[2] ) && 'axiom-blocks-dashboard' === $item[2] ) {
				$ordered[] = $entries;
				$entries   = null;
			}
		}
		if ( null !== $entries ) {
			array_splice( $ordered, 1, 0, array( $entries ) );
		}
		$submenu['axiom-blocks-dashboard'] = $ordered; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Reordering our own submenu.
	}

	/**
	 * A count bubble on the Axiom Blocks menu and its Form entries item, in the
	 * same markup core uses for pending comments.
	 *
	 * @return void
	 */
	public static function menu_bubble(): void {
		global $menu, $submenu;
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		// The list itself is about to mark everything seen, so no bubble there.
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only screen check.
		$type = isset( $_GET['post_type'] ) ? sanitize_key( wp_unslash( $_GET['post_type'] ) ) : '';
		if ( 'edit.php' === ( $GLOBALS['pagenow'] ?? '' ) && self::POST_TYPE === $type ) {
			return;
		}
		$count = self::new_count();
		if ( $count < 1 ) {
			return;
		}
		$bubble = sprintf(
			' <span class="awaiting-mod count-%1$d"><span class="pending-count" aria-hidden="true">%2$s</span><span class="screen-reader-text">%3$s</span></span>',
			$count,
			esc_html( number_format_i18n( $count ) ),
			/* translators: %s: number of new form entries. */
			esc_html( sprintf( _n( '%s new entry', '%s new entries', $count, 'axiom-blocks' ), number_format_i18n( $count ) ) )
		);
		foreach ( (array) $menu as $i => $item ) {
			if ( isset( $item[2] ) && 'axiom-blocks-dashboard' === $item[2] ) {
				$menu[ $i ][0] .= $bubble; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Appending a count bubble, as core does for comments.
			}
		}
		foreach ( (array) ( $submenu['axiom-blocks-dashboard'] ?? array() ) as $i => $item ) {
			if ( isset( $item[2] ) && 'edit.php?post_type=' . self::POST_TYPE === $item[2] ) {
				$submenu['axiom-blocks-dashboard'][ $i ][0] .= $bubble; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- Same.
			}
		}
	}

	/**
	 * The list URL.
	 *
	 * @return string
	 */
	public static function list_url(): string {
		return admin_url( 'edit.php?post_type=' . self::POST_TYPE );
	}

	/* ── Single entry ───────────────────────────────────────────────────────── */

	/**
	 * Replace the editing UI with a read-only view.
	 *
	 * @param \WP_Post $post Entry.
	 * @return void
	 */
	public static function meta_boxes( $post ): void {
		global $title;
		remove_post_type_support( self::POST_TYPE, 'title' );
		remove_meta_box( 'submitdiv', self::POST_TYPE, 'side' );
		remove_meta_box( 'slugdiv', self::POST_TYPE, 'normal' );
		add_meta_box( 'ab-cf-entry', __( 'Submission', 'axiom-blocks' ), array( self::class, 'render_entry' ), self::POST_TYPE, 'normal', 'high' );
		add_meta_box( 'ab-cf-entry-meta', __( 'Details', 'axiom-blocks' ), array( self::class, 'render_details' ), self::POST_TYPE, 'side', 'high' );
		if ( $post instanceof \WP_Post ) {
			/* translators: %s: visitor name or email. */
			$title = sprintf( __( 'Entry from %s', 'axiom-blocks' ), self::display_name( $post->ID ) ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited -- The screen heading, set before admin-header prints it.
		}
	}

	/**
	 * "Back to Form entries" above the read-only view.
	 *
	 * @param \WP_Post $post Post being edited.
	 * @return void
	 */
	public static function back_link( $post ): void {
		if ( ! $post || self::POST_TYPE !== $post->post_type ) {
			return;
		}
		echo '<p class="ab-cf-back"><a class="button" href="' . esc_url( self::list_url() ) . '">' . esc_html__( 'Back to Form entries', 'axiom-blocks' ) . '</a></p>';
	}

	/**
	 * The submitted fields.
	 *
	 * @param \WP_Post $post Entry.
	 * @return void
	 */
	public static function render_entry( $post ): void {
		$rows = get_post_meta( $post->ID, self::META_FIELDS, true );
		if ( ! is_array( $rows ) || empty( $rows ) ) {
			echo '<p>' . esc_html__( 'This entry has no fields.', 'axiom-blocks' ) . '</p>';
			return;
		}
		echo '<table class="ab-cf-fields"><tbody>';
		foreach ( $rows as $row ) {
			echo '<tr><th scope="row">' . esc_html( (string) ( $row['label'] ?? '' ) ) . '</th><td>' . esc_html( (string) ( $row['value'] ?? '' ) ) . '</td></tr>';
		}
		echo '</tbody></table>';
	}

	/**
	 * Form, time, page, delivery and a delete link.
	 *
	 * @param \WP_Post $post Entry.
	 * @return void
	 */
	public static function render_details( $post ): void {
		$page   = (string) get_post_meta( $post->ID, self::META_PAGE, true );
		$errors = get_post_meta( $post->ID, self::META_ERRORS, true );
		$route  = (string) get_post_meta( $post->ID, self::META_ROUTE, true );
		$path   = '' !== $page ? (string) wp_parse_url( $page, PHP_URL_PATH ) : '';

		echo '<dl class="ab-cf-details">';
		echo '<dt>' . esc_html__( 'Form', 'axiom-blocks' ) . '</dt><dd>' . esc_html( (string) get_post_meta( $post->ID, self::META_FORM, true ) ) . '</dd>';
		/* translators: 1: date, 2: time. */
		echo '<dt>' . esc_html__( 'Received', 'axiom-blocks' ) . '</dt><dd>' . esc_html( sprintf( __( '%1$s at %2$s', 'axiom-blocks' ), get_the_date( '', $post ), get_the_time( '', $post ) ) ) . '</dd>';
		if ( '' !== $page ) {
			echo '<dt>' . esc_html__( 'Page', 'axiom-blocks' ) . '</dt><dd><a href="' . esc_url( $page ) . '">' . esc_html( '' !== $path ? $path : $page ) . '</a></dd>';
		}
		echo '<dt>' . esc_html__( 'Email', 'axiom-blocks' ) . '</dt><dd>';
		self::pill( (string) get_post_meta( $post->ID, self::META_DELIVERY, true ) );
		if ( '' !== $route ) {
			/* translators: %s: delivery route name. */
			echo ' <span class="ab-cf-sub">' . esc_html( sprintf( __( 'through %s', 'axiom-blocks' ), 'resend' === $route ? 'Resend' : __( 'WordPress mail', 'axiom-blocks' ) ) ) . '</span>';
		}
		if ( is_array( $errors ) && ! empty( $errors ) ) {
			echo '<pre class="ab-cf-errors">' . esc_html( implode( "\n", array_map( 'strval', $errors ) ) ) . '</pre>';
		}
		echo '</dd></dl>';
		if ( current_user_can( 'manage_options' ) ) {
			$url = get_delete_post_link( $post->ID );
			if ( $url ) {
				echo '<div class="ab-cf-details__foot"><a class="submitdelete" href="' . esc_url( $url ) . '">' . esc_html__( 'Move to trash', 'axiom-blocks' ) . '</a></div>';
			}
		}
	}

	/**
	 * Styles for the list and the single view: the pill, the New marker, the
	 * fields table and the details list. Everything else is core.
	 *
	 * @return void
	 */
	public static function styles(): void {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || self::POST_TYPE !== $screen->post_type ) {
			return;
		}
		$css = '
			.ab-cf-pill{display:inline-flex;align-items:center;gap:4px;padding:1px 8px;border-radius:999px;border:1px solid;font-size:12px;font-weight:500;line-height:1.6;white-space:nowrap}
			.ab-cf-pill--sent{color:#00450c;background:#edfaef;border-color:#b8e6bf}
			.ab-cf-pill--failed{color:#8a2424;background:#fcf0f1;border-color:#f1b9ba}
			.ab-cf-pill--pending{color:#614200;background:#fcf9e8;border-color:#f0d48a}
			.ab-cf-pill--none{color:#50575e;background:#f0f0f1;border-color:#dcdcde}
			.ab-cf-new{font-size:11px;font-weight:600;color:#646970}
			.ab-cf-row-new{font-weight:700}
			.ab-cf-sub{color:#646970}
			td.column-ab_cf_entry .ab-cf-sub{margin-top:2px;word-break:break-all}
			th.column-ab_cf_form,th.column-ab_cf_received{width:150px}
			th.column-ab_cf_delivery{width:130px}
			.ab-cf-back{margin:0 0 12px}
			.ab-cf-fields{width:100%;border-collapse:collapse}
			.ab-cf-fields th{width:170px;padding:10px 16px 10px 0;text-align:left;vertical-align:top;font-weight:600}
			.ab-cf-fields td{padding:10px 0;line-height:1.6;white-space:pre-wrap;word-break:break-word}
			.ab-cf-fields tr+tr{border-top:1px solid #f0f0f1}
			.ab-cf-details{margin:0}
			.ab-cf-details dt{padding-top:9px;border-top:1px solid #f0f0f1;margin-bottom:3px;font-size:12px;color:#646970}
			.ab-cf-details dt:first-child{border-top:0}
			.ab-cf-details dd{margin:0 0 9px}
			.ab-cf-errors{margin:8px 0 0;padding:8px 10px;background:#fcf0f1;border:1px solid #f1b9ba;border-radius:3px;font-size:11.5px;line-height:1.6;color:#5c1616;white-space:pre-wrap;word-break:break-word}
			.ab-cf-details__foot{margin:12px -12px -12px;padding:10px 12px;border-top:1px solid #c3c4c7;background:#f6f7f7}
			.ab-cf-details__foot .submitdelete{color:#b32d2e}
			@media (max-width:782px){.ab-cf-fields th{width:110px}}
		';
		wp_register_style( 'axiom-blocks-entries', false, array(), Plugin::VERSION );
		wp_enqueue_style( 'axiom-blocks-entries' );
		wp_add_inline_style( 'axiom-blocks-entries', $css );
	}

	/* ── Privacy ────────────────────────────────────────────────────────────── */

	/**
	 * Register the exporter.
	 *
	 * @param array $exporters Exporters.
	 * @return array
	 */
	public static function register_exporter( array $exporters ): array {
		$exporters['axiom-blocks-form-entries'] = array(
			'exporter_friendly_name' => __( 'Axiom Blocks form entries', 'axiom-blocks' ),
			'callback'               => array( self::class, 'export' ),
		);
		return $exporters;
	}

	/**
	 * Register the eraser.
	 *
	 * @param array $erasers Erasers.
	 * @return array
	 */
	public static function register_eraser( array $erasers ): array {
		$erasers['axiom-blocks-form-entries'] = array(
			'eraser_friendly_name' => __( 'Axiom Blocks form entries', 'axiom-blocks' ),
			'callback'             => array( self::class, 'erase' ),
		);
		return $erasers;
	}

	/**
	 * Entry IDs for an email address, one page at a time.
	 *
	 * @param string $email Address.
	 * @param int    $page  1-based page.
	 * @return int[]
	 */
	private static function ids_for_email( string $email, int $page ): array {
		return get_posts(
			array(
				'post_type'      => self::POST_TYPE,
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => 50,
				'paged'          => max( 1, $page ),
				'meta_query'     => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Privacy requests are rare admin actions.
					array(
						'key'   => self::META_EMAIL,
						'value' => strtolower( $email ),
					),
				),
			)
		);
	}

	/**
	 * Personal-data export callback.
	 *
	 * @param string $email Address.
	 * @param int    $page  Page.
	 * @return array
	 */
	public static function export( string $email, int $page = 1 ): array {
		$ids  = self::ids_for_email( $email, $page );
		$data = array();
		foreach ( $ids as $id ) {
			$items = array(
				array(
					'name'  => __( 'Form', 'axiom-blocks' ),
					'value' => (string) get_post_meta( $id, self::META_FORM, true ),
				),
				array(
					'name'  => __( 'Received', 'axiom-blocks' ),
					'value' => (string) get_post_field( 'post_date', $id ),
				),
			);
			$rows  = get_post_meta( $id, self::META_FIELDS, true );
			foreach ( is_array( $rows ) ? $rows : array() as $row ) {
				$items[] = array(
					'name'  => (string) ( $row['label'] ?? '' ),
					'value' => (string) ( $row['value'] ?? '' ),
				);
			}
			$data[] = array(
				'group_id'    => 'axiom-blocks-form-entries',
				'group_label' => __( 'Form entries', 'axiom-blocks' ),
				'item_id'     => 'ab-form-entry-' . $id,
				'data'        => $items,
			);
		}
		return array(
			'data' => $data,
			'done' => count( $ids ) < 50,
		);
	}

	/**
	 * Personal-data eraser callback. Deletes the whole entry: an entry exists
	 * only to hold what the person sent.
	 *
	 * @param string $email Address.
	 * @param int    $page  Page (ignored: deleting shifts the pages).
	 * @return array
	 */
	public static function erase( string $email, int $page = 1 ): array { // phpcs:ignore Generic.CodeAnalysis.UnusedFunctionParameter.FoundAfterLastUsed -- Core callback signature.
		$ids     = self::ids_for_email( $email, 1 );
		$removed = 0;
		foreach ( $ids as $id ) {
			if ( wp_delete_post( $id, true ) ) {
				++$removed;
			}
		}
		return array(
			'items_removed'  => $removed > 0,
			'items_retained' => false,
			'messages'       => array(),
			'done'           => count( $ids ) < 50,
		);
	}

	/**
	 * Suggested privacy-policy text.
	 *
	 * @return void
	 */
	public static function privacy_policy_text(): void {
		if ( ! function_exists( 'wp_add_privacy_policy_content' ) ) {
			return;
		}
		$text  = '<p>' . esc_html__( 'When you send a message through a contact form on this site, we keep what you entered in the form, the page you sent it from and the time it was sent, so we can reply. We do not store your IP address.', 'axiom-blocks' ) . '</p>';
		$text .= '<p>' . esc_html__( 'The message is also sent to us by email. If this site sends email through Resend, your message passes through Resend to reach us.', 'axiom-blocks' ) . '</p>';
		wp_add_privacy_policy_content( __( 'Axiom Blocks', 'axiom-blocks' ), wp_kses_post( $text ) );
	}

	/* ── Cron ───────────────────────────────────────────────────────────────── */

	/**
	 * Schedule the daily job once.
	 *
	 * @return void
	 */
	public static function schedule(): void {
		if ( ! wp_next_scheduled( self::CRON_HOOK ) ) {
			wp_schedule_event( time() + HOUR_IN_SECONDS, 'daily', self::CRON_HOOK );
		}
	}

	/**
	 * Remove the daily job (plugin deactivation).
	 *
	 * @return void
	 */
	public static function unschedule(): void {
		wp_clear_scheduled_hook( self::CRON_HOOK );
	}

	/**
	 * Daily job: store garbage collection and entry retention.
	 *
	 * @return void
	 */
	public static function daily(): void {
		ContactFormStore::collect_garbage();

		$days = (int) EmailSettings::get()['retention_days'];
		if ( $days <= 0 ) {
			return;
		}
		$ids = get_posts(
			array(
				'post_type'      => self::POST_TYPE,
				'post_status'    => 'any',
				'fields'         => 'ids',
				'posts_per_page' => 100,
				'date_query'     => array(
					array(
						'before' => gmdate( 'Y-m-d H:i:s', time() - $days * DAY_IN_SECONDS ),
						'column' => 'post_date_gmt',
					),
				),
			)
		);
		foreach ( $ids as $id ) {
			wp_delete_post( $id, true );
		}
	}
}
