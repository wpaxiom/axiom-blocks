<?php
/**
 * Table of Contents — content processor.
 *
 * Runs on `the_content` after blocks are rendered (priority 20, later than
 * `do_blocks` at 9) so it can see every heading on the page. For each rendered
 * Table of Contents block it:
 *   1. Collects the page's h1–h6 headings (skipping the block's own chrome).
 *   2. Injects a unique `id` on every heading that lacks one, so anchors resolve.
 *   3. Builds the list markup into the block's placeholder container.
 *
 * The heavy DOM work only runs when a Table of Contents block is present.
 *
 * @package AxiomBlocks\Frontend
 * @since 1.0.5
 */

namespace AxiomBlocks\Frontend;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Table of Contents content processor.
 */
class TableOfContents {

	/**
	 * Initialize.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'the_content', array( self::class, 'process' ), 20 );
	}

	/**
	 * Process the post content: inject heading ids and build ToC lists.
	 *
	 * @param string $content Rendered post content.
	 * @return string
	 */
	public static function process( string $content ): string {
		if ( is_admin() || false === strpos( $content, 'ab-toc__list' ) ) {
			return $content;
		}

		/* phpcs:disable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */
		// The DOMDocument / DOMXPath APIs use camelCase members.
		$charset = get_bloginfo( 'charset' );
		$doc     = new \DOMDocument( '1.0', $charset );

		libxml_use_internal_errors( true );
		$loaded = $doc->loadHTML(
			'<?xml encoding="utf-8"?><!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' . $content . '</body></html>'
		);
		libxml_use_internal_errors( false );

		if ( ! $loaded ) {
			return $content;
		}

		$xpath    = new \DOMXPath( $doc );
		$headings = $xpath->query( '//*[self::h1 or self::h2 or self::h3 or self::h4 or self::h5 or self::h6]' );

		$collected   = array();
		$used_anchors = array();
		foreach ( $headings as $heading ) {
			if ( self::is_in_toc( $heading ) ) {
				continue;
			}

			$text = trim( (string) $heading->textContent );
			if ( '' === $text ) {
				continue;
			}

			$anchor = $heading->getAttribute( 'id' );
			if ( '' === $anchor ) {
				$anchor = self::unique_anchor( $text, $used_anchors );
				$heading->setAttribute( 'id', $anchor );
			} else {
				$used_anchors[ $anchor ] = true;
			}

			$collected[] = array(
				'level'  => (int) substr( $heading->nodeName, 1 ),
				'text'   => $text,
				'anchor' => $anchor,
			);
		}

		$lists = $xpath->query( '//*[contains(concat(" ", normalize-space(@class), " "), " ab-toc__list ")]' );
		foreach ( $lists as $list ) {
			self::fill_list( $doc, $list, $collected );
		}
		/* phpcs:enable WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase */

		$body = $doc->getElementsByTagName( 'body' )->item( 0 );
		if ( null === $body ) {
			return $content;
		}

		$out = '';
		foreach ( $body->childNodes as $child ) {
			$out .= $doc->saveHTML( $child );
		}
		return $out;
	}

	/**
	 * Whether a node lives inside a Table of Contents block (so it's excluded
	 * from the collected headings — e.g. the block's own title).
	 *
	 * @param \DOMNode $node Node to test.
	 * @return bool
	 */
	private static function is_in_toc( \DOMNode $node ): bool {
		for ( $current = $node; $current instanceof \DOMElement; $current = $current->parentNode ) {
			$classes = ' ' . trim( (string) $current->getAttribute( 'class' ) ) . ' ';
			if ( false !== strpos( $classes, ' ab-toc ' ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Build a unique anchor slug from heading text.
	 *
	 * @param string $text  Heading text.
	 * @param array  $used  Reference of already-used anchors.
	 * @return string
	 */
	private static function unique_anchor( string $text, array &$used ): string {
		$base = sanitize_title( $text );
		if ( '' === $base ) {
			$base = 'section';
		}
		$anchor = $base;
		$i      = 2;
		while ( isset( $used[ $anchor ] ) ) {
			$anchor = $base . '-' . $i;
			++$i;
		}
		$used[ $anchor ] = true;
		return $anchor;
	}

	/**
	 * Build the flat list of anchor links inside a placeholder container.
	 *
	 * @param \DOMDocument $doc       Document.
	 * @param \DOMElement  $list      The `.ab-toc__list` placeholder.
	 * @param array        $collected All collected headings.
	 * @return void
	 */
	private static function fill_list( \DOMDocument $doc, \DOMElement $list, array $collected ): void {
		$levels_attr = $list->getAttribute( 'data-ab-toc-levels' );
		$levels      = array_filter( array_map( 'intval', explode( ',', $levels_attr ) ) );
		if ( empty( $levels ) ) {
			$levels = array( 2, 3, 4 );
		}
		$marker = (string) $list->getAttribute( 'data-ab-toc-marker' );
		$prefix = (string) $list->getAttribute( 'data-ab-toc-prefix' );
		$nav    = self::closest_nav( $list );

		$items = array();
		foreach ( $collected as $item ) {
			if ( in_array( $item['level'], $levels, true ) ) {
				$items[] = $item;
			}
		}

		if ( empty( $items ) ) {
			if ( $nav instanceof \DOMElement ) {
				$nav->setAttribute( 'class', trim( $nav->getAttribute( 'class' ) . ' ab-toc--empty' ) );
				$nav->setAttribute( 'hidden', '' );
			}
			return;
		}

		$min_level = min( wp_list_pluck( $items, 'level' ) );

		$ul = $doc->createElement( 'ul' );
		$ul->setAttribute( 'class', 'ab-toc__list-ul' );

		foreach ( $items as $item ) {
			$depth = $item['level'] - $min_level;

			$li = $doc->createElement( 'li' );
			$li->setAttribute( 'class', 'ab-toc__item ab-toc__item--h' . $item['level'] );
			$li->setAttribute( 'style', '--ab-toc-depth:' . $depth );

			$a = $doc->createElement( 'a' );
			$a->setAttribute( 'class', 'ab-toc__link' );
			$a->setAttribute( 'href', '#' . $item['anchor'] );

			$marker_span = $doc->createElement( 'span' );
			$marker_span->setAttribute( 'class', 'ab-toc__marker' );
			$marker_span->setAttribute( 'aria-hidden', 'true' );
			if ( 'numbered' === $marker && '' !== $prefix ) {
				$marker_span->setAttribute( 'data-prefix', $prefix );
			}

			$text_span = $doc->createElement( 'span' );
			$text_span->setAttribute( 'class', 'ab-toc__text' );
			$text_span->appendChild( $doc->createTextNode( $item['text'] ) );

			$a->appendChild( $marker_span );
			$a->appendChild( $text_span );
			$li->appendChild( $a );
			$ul->appendChild( $li );
		}

		$list->appendChild( $ul );

		if ( $nav instanceof \DOMElement ) {
			self::fill_counts( $doc, $nav, count( $items ) );
		}
	}

	/**
	 * Fill the section-count elements (mobile bar meta + collapsed eyebrow).
	 *
	 * @param \DOMDocument $doc   Document.
	 * @param \DOMElement  $nav   The `.ab-toc` nav.
	 * @param int          $count Number of listed sections.
	 * @return void
	 */
	private static function fill_counts( \DOMDocument $doc, \DOMElement $nav, int $count ): void {
		// translators: %d is the number of sections in the table of contents.
		$plain = sprintf( _n( '%d section', '%d sections', $count, 'axiom-blocks' ), $count );

		$xpath = new \DOMXPath( $doc );
		foreach ( $xpath->query( './/*[@data-ab-toc-count]', $nav ) as $node ) {
			$node->textContent = $plain;
		}
		foreach ( $xpath->query( './/*[@data-ab-toc-count-sep]', $nav ) as $node ) {
			$node->textContent = ' · ' . $plain;
		}
	}

	/**
	 * Walk up to the nearest `.ab-toc` nav ancestor.
	 *
	 * @param \DOMNode $node Node.
	 * @return \DOMElement|null
	 */
	private static function closest_nav( \DOMNode $node ): ?\DOMElement {
		for ( $current = $node->parentNode; $current instanceof \DOMElement; $current = $current->parentNode ) {
			$classes = ' ' . trim( (string) $current->getAttribute( 'class' ) ) . ' ';
			if ( false !== strpos( $classes, ' ab-toc ' ) ) {
				return $current;
			}
		}
		return null;
	}
}
