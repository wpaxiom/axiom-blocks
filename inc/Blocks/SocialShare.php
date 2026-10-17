<?php
/**
 * Social Share helpers.
 *
 * The network catalog (networks.json) and the CSS variable map (vars.json) are
 * the same files the editor script imports, so the share links and the skin
 * cannot drift between the canvas and the page.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.1.0
 */

namespace AxiomBlocks\Blocks;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Share targets, share URLs and CSS variables for the Social Share block.
 */
final class SocialShare {

	/**
	 * Decoded build files, keyed by file name.
	 *
	 * @var array<string, array>
	 */
	private static $files = array();

	/**
	 * Read one of the block's JSON files from build/.
	 *
	 * @param string $name File name.
	 * @return array
	 */
	private static function json( string $name ): array {
		if ( ! isset( self::$files[ $name ] ) ) {
			$file                 = AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/social-share/' . $name;
			$data                 = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local plugin file.
			self::$files[ $name ] = is_array( $data ) ? $data : array();
		}
		return self::$files[ $name ];
	}

	/**
	 * The network catalog.
	 *
	 * @return array<string, array>
	 */
	public static function networks(): array {
		return self::json( 'networks.json' );
	}

	/**
	 * What the row shares: url, title, text, image.
	 *
	 * A custom URL wins when it is a valid http(s) address. Otherwise the post
	 * in block context (a Post Grid card, a Query Loop item, the post itself),
	 * then the page being viewed.
	 *
	 * @param array          $attrs Block attributes.
	 * @param \WP_Block|null $block Block instance.
	 * @return array{url: string, title: string, text: string, image: string}
	 */
	public static function target( array $attrs, $block = null ): array {
		$url   = '';
		$title = '';
		$image = '';

		if ( 'custom' === ( $attrs['shareSource'] ?? '' ) ) {
			$custom = esc_url_raw( trim( (string) ( $attrs['shareUrl'] ?? '' ) ), array( 'http', 'https' ) );
			if ( '' !== $custom ) {
				$url   = $custom;
				$title = trim( (string) ( $attrs['shareTitle'] ?? '' ) );
			}
		}

		if ( '' === $url ) {
			$post_id = 0;
			if ( $block instanceof \WP_Block && ! empty( $block->context['postId'] ) ) {
				$post_id = (int) $block->context['postId'];
			} elseif ( is_singular() ) {
				$post_id = (int) get_queried_object_id();
			}

			$post = $post_id ? get_post( $post_id ) : null;
			if ( $post && is_post_publicly_viewable( $post ) ) {
				$url   = (string) get_permalink( $post );
				$title = wp_strip_all_tags( get_the_title( $post ) );
				$thumb = get_the_post_thumbnail_url( $post, 'large' );
				$image = $thumb ? (string) $thumb : '';
			} else {
				$url   = self::request_url();
				$title = wp_strip_all_tags( wp_get_document_title() );
			}
		}

		if ( '' === $title ) {
			$title = (string) get_bloginfo( 'name' );
		}

		$text = trim( (string) ( $attrs['shareText'] ?? '' ) );

		return array(
			'url'   => $url,
			'title' => html_entity_decode( $title, ENT_QUOTES, 'UTF-8' ),
			'text'  => html_entity_decode( '' !== $text ? $text : $title, ENT_QUOTES, 'UTF-8' ),
			'image' => $image,
		);
	}

	/**
	 * The address of an archive, the blog index or the front page.
	 *
	 * @return string
	 */
	private static function request_url(): string {
		$object = get_queried_object();
		if ( $object instanceof \WP_Term ) {
			$link = get_term_link( $object );
			if ( ! is_wp_error( $link ) ) {
				return (string) $link;
			}
		}
		if ( $object instanceof \WP_User ) {
			return (string) get_author_posts_url( $object->ID );
		}
		if ( $object instanceof \WP_Post_Type ) {
			$link = get_post_type_archive_link( $object->name );
			if ( $link ) {
				return (string) $link;
			}
		}
		if ( is_home() && ! is_front_page() ) {
			$page = (int) get_option( 'page_for_posts' );
			if ( $page ) {
				return (string) get_permalink( $page );
			}
		}
		return home_url( '/' );
	}

	/**
	 * Comma or space separated hashtags, without the # signs.
	 *
	 * @param string $raw Hashtags as typed.
	 * @return string
	 */
	public static function hashtags( string $raw ): string {
		$tags = preg_split( '/[\s,#]+/', $raw );
		$tags = array_filter(
			array_map(
				static function ( $tag ) {
					return preg_replace( '/[^\p{L}\p{N}_]/u', '', (string) $tag );
				},
				is_array( $tags ) ? $tags : array()
			)
		);
		return implode( ',', $tags );
	}

	/**
	 * The share URL for one network, or '' for an action button.
	 *
	 * Placeholders are URL-encoded; a query parameter left empty (X with no
	 * via handle) is dropped.
	 *
	 * @param array $network Catalog entry.
	 * @param array $target  From target().
	 * @param array $attrs   Block attributes.
	 * @return string
	 */
	public static function href( array $network, array $target, array $attrs ): string {
		if ( empty( $network['url'] ) ) {
			return '';
		}

		$values = array(
			'{url}'      => rawurlencode( $target['url'] ),
			'{title}'    => rawurlencode( $target['title'] ),
			'{text}'     => rawurlencode( $target['text'] ),
			'{image}'    => rawurlencode( $target['image'] ),
			'{via}'      => rawurlencode( ltrim( trim( (string) ( $attrs['xVia'] ?? '' ) ), '@' ) ),
			'{hashtags}' => rawurlencode( self::hashtags( (string) ( $attrs['hashtags'] ?? '' ) ) ),
		);
		$url    = strtr( (string) $network['url'], $values );

		$parts = explode( '?', $url, 2 );
		if ( 2 === count( $parts ) ) {
			$query = array_filter(
				explode( '&', $parts[1] ),
				static function ( $pair ) {
					return '=' !== substr( $pair, -1 );
				}
			);
			$url   = $parts[0] . '?' . implode( '&', $query );
		}

		return $url;
	}

	/**
	 * Tags and attributes the button list may contain, for late escaping.
	 *
	 * @return array
	 */
	public static function allowed_html(): array {
		$button = array(
			'class'      => true,
			'style'      => true,
			'aria-label' => true,
			'data-*'     => true,
		);
		return array_merge(
			AllowedHtml::svg(),
			array(
				'li'     => array(
					'class'  => true,
					'hidden' => true,
				),
				'a'      => array_merge(
					$button,
					array(
						'href'   => true,
						'target' => true,
						'rel'    => true,
					)
				),
				'button' => array_merge( $button, array( 'type' => true ) ),
				'span'   => array( 'class' => true ),
			)
		);
	}

	/**
	 * CSS custom properties from vars.json.
	 *
	 * @param array $attrs Block attributes.
	 * @return string[] "--var: value" declarations.
	 */
	public static function vars( array $attrs ): array {
		$map  = self::json( 'vars.json' );
		$spec = $map['block'] ?? array();
		$out  = array();

		foreach ( $spec['vars'] ?? array() as $var => $attr ) {
			$value = $attrs[ $attr ] ?? '';
			if ( is_scalar( $value ) && '' !== (string) $value ) {
				$out[] = $var . ': ' . $value;
			}
		}

		foreach ( $spec['borders'] ?? array() as $border ) {
			list( $style_var, $style_attr, $width_attrs ) = $border;
			if ( '' !== (string) ( $attrs[ $style_attr ] ?? '' ) ) {
				$out[] = $style_var . ': ' . $attrs[ $style_attr ];
				continue;
			}
			foreach ( $width_attrs as $width_attr ) {
				if ( '' !== (string) ( $attrs[ $width_attr ] ?? '' ) ) {
					// BorderControl shows "Solid" for an empty style, so a width
					// alone paints a solid border.
					$out[] = $style_var . ': solid';
					break;
				}
			}
		}

		$suffixes = $map['typographySuffixes'] ?? array();
		foreach ( $spec['typography'] ?? array() as $prefix => $var_prefix ) {
			foreach ( $suffixes as $suffix => $css ) {
				$value = $attrs[ $prefix . $suffix ] ?? '';
				if ( is_scalar( $value ) && '' !== (string) $value ) {
					$out[] = $var_prefix . '-' . $css . ': ' . $value;
				}
			}
		}

		foreach ( $spec['backgrounds'] ?? array() as $background ) {
			list( $prefix, $color_key, $var ) = $background;
			$value                            = Background::value( $attrs, $prefix, $color_key );
			if ( '' !== $value ) {
				$out[] = $var . ': ' . $value;
			}
		}

		return $out;
	}
}
