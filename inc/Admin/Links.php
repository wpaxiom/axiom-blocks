<?php
/**
 * Outbound links.
 *
 * The PHP mirror of src/admin/links.js: one place for every docs, video and
 * support URL the plugin prints, each tagged with where it was clicked from.
 * Change a page here and in links.js together.
 *
 * @package AxiomBlocks\Admin
 * @since 1.1.0
 */

namespace AxiomBlocks\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Outbound link builder.
 */
final class Links {

	const DOCS = 'https://www.wpaxiom.com/docs/axiom-blocks';

	/**
	 * Named pages, relative to the docs base. Absolute URLs are used as is.
	 */
	const PAGES = array(
		'docs'                  => '',
		'getting-started'       => '', // /getting-started is not published yet.
		'how-blocks-work'       => '', // /how-blocks-work is not published yet.
		'first-section'         => '', // /first-section is not published yet.
		'videos'                => 'https://www.youtube.com/playlist?list=PLNsJLdrHnJGs',
		'video-getting-started' => 'https://youtu.be/V3Ilqfiymkc',
		'contact-form'          => '', // /contact-form-block is not published yet.
		'email-delivery'        => '', // /email-delivery is not published yet.
		'path-store'            => '', // /store is not published yet.
		'path-blog'             => '', // /blog is not published yet.
		'path-site'             => '', // /site is not published yet.
		'support'               => 'https://wordpress.org/support/plugin/axiom-blocks/',
		'review'                => 'https://wordpress.org/support/plugin/axiom-blocks/reviews/#new-post',
		'bug'                   => 'https://github.com/wpaxiom/axiom-blocks/issues/new',
		'feature'               => 'https://github.com/wpaxiom/axiom-blocks/issues/new?labels=enhancement',
	);

	/**
	 * A tagged URL for a named page.
	 *
	 * @param string $page  Key of self::PAGES.
	 * @param string $place Where the link sits (utm_medium).
	 * @return string
	 */
	public static function url( string $page, string $place ): string {
		$path = self::PAGES[ $page ] ?? '';
		$base = 0 === strpos( $path, 'https://' ) ? $path : self::DOCS . $path;
		return add_query_arg(
			array(
				'utm_source' => 'plugin',
				'utm_medium' => $place,
			),
			$base
		);
	}

	/**
	 * The plugin dashboard, optionally on one tab.
	 *
	 * @param string $tab Tab id (blocks, email, settings, help) or empty.
	 * @return string
	 */
	public static function dashboard( string $tab = '' ): string {
		$url = admin_url( 'admin.php?page=axiom-blocks-dashboard' );
		return '' === $tab ? $url : $url . '#' . $tab;
	}
}
