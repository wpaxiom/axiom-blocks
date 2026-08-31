<?php
/**
 * Central responsive-typography wiring.
 *
 * Turns typography (font-size / line-height / align / …) responsive for the Axiom
 * blocks that expose a Typography panel. Unlike spacing — which sets one value on
 * the wrapper and can be wired with no per-block knowledge — typography lands on
 * inner, block-specific elements. So this class carries a registry mapping each
 * block's typography groups to the CSS selector they style, and emits scoped
 * media-query CSS under a per-instance wrapper class.
 *
 * Desktop values keep rendering inline on their element (unchanged / back-compat);
 * only Tablet/Mobile overrides are emitted, and only when they differ.
 *
 * @package AxiomBlocks\Blocks
 * @since 1.0.4
 */

namespace AxiomBlocks\Blocks;

use AxiomBlocks\Frontend\ResponsiveStyles;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Central responsive typography.
 *
 * @since 1.0.4
 */
class ResponsiveTypography {

	/**
	 * Block name => ( typography group prefix => CSS selector relative to wrapper ).
	 *
	 * The empty-string prefix is the block's unprefixed typography group. Keep this
	 * in sync with the JS registry in src/components/typographyTargets.js.
	 *
	 * @var array<string, array<string, string>>
	 */
	private const TARGETS = array(
		'axiom-blocks/advanced-heading' => array(
			'heading' => '.ab-ah__heading',
			'sub'     => '.ab-ah__sub',
		),
		'axiom-blocks/advanced-button'  => array(
			// Main text typography renders inline on `.ab-adv-btn__text`, so the
			// per-device override must target that element (a rule on the parent
			// `.ab-adv-btn` can't override the child's own inline font-size).
			''           => '.ab-adv-btn__text',
			'subCaption' => '.ab-adv-btn__sub',
		),
		'axiom-blocks/copy-to-clipboard' => array(
			'' => '.axiom-blocks-copy-to-clipboard__button',
		),
		'axiom-blocks/icon-list'        => array(
			// Typography is applied to the wrapper itself; empty selector = self.
			'' => '',
		),
		'axiom-blocks/pricing-table'    => array(
			'heading' => '.axiom-blocks-pricing-table__heading',
			// Plan-component typography is set on the table and targets that
			// component inside every plan card. Price targets the number, not
			// the container: the amount and the period each carry their own
			// shipped size, so the container can't drive them.
			'name'    => '.ab-pt-plan__name',
			'price'    => '.ab-pt-plan__amount',
			'currency' => '.ab-pt-plan__currency',
			'period'   => '.ab-pt-plan__period',
			'badge'    => '.ab-pt-plan__badge',
			'desc'    => '.ab-pt-plan__desc',
			'feature' => '.ab-pt-feat__text',
			'cta'     => '.ab-pt-plan__cta',
		),
		'axiom-blocks/pricing-plan'     => array(
			'name'    => '.ab-pt-plan__name',
			'price'   => '.ab-pt-plan__price',
			'desc'    => '.ab-pt-plan__desc',
			'feature' => '.ab-pt-feat__text',
			'cta'     => '.ab-pt-plan__cta',
		),
		'axiom-blocks/trust-badges'     => array(
			'heading' => '.axiom-blocks-trust-badges__heading',
			'label'   => '.axiom-blocks-trust-badges__label',
		),
		'axiom-blocks/countdown-timer'  => array(
			'digit' => '.axiom-blocks-countdown__digit',
			'label' => '.axiom-blocks-countdown__label',
		),
		'axiom-blocks/notice'           => array(
			'title'   => '.ab-notice__title',
			'content' => '.ab-notice__message',
		),
		'axiom-blocks/tabs'             => array(
			'label' => '.axiom-blocks-tabs__label',
		),
		'axiom-blocks/star-rating'      => array(
			'meta' => '.axiom-blocks-star-rating__meta',
		),
		'axiom-blocks/accordion'        => array(
			'header' => '.ab-accordion__title',
		),
		'axiom-blocks/counter-group'    => array(
			'number' => '.ab-counter__number',
			'label'  => '.ab-counter__label',
		),
		'axiom-blocks/testimonials'     => array(
			'name'    => '.ab-testimonial__name',
			'role'    => '.ab-testimonial__author-line',
			'company' => '.ab-testimonial__company',
			'quote'   => '.ab-testimonial__quote',
			'mono'    => '.ab-testimonial__initials',
		),
		'axiom-blocks/before-after-slider' => array(
			'label' => '.axiom-blocks-bas__label',
		),
		'axiom-blocks/free-shipping-progress' => array(
			'message' => '.axiom-blocks-fsp__msg',
		),
		'axiom-blocks/table-of-contents' => array(
			'title'   => '.ab-toc__title',
			'content' => '.ab-toc__list',
		),
		'axiom-blocks/post-title'       => array(
			'' => '.ab-pc__title',
		),
		'axiom-blocks/post-excerpt'     => array(
			'' => '.ab-pc__excerpt',
		),
		'axiom-blocks/post-terms'       => array(
			'' => '.ab-pc__terms',
		),
		'axiom-blocks/post-meta'        => array(
			'' => '.ab-pc__meta',
		),
		'axiom-blocks/post-read-more'   => array(
			'' => '.ab-pc__more-link',
		),
		'axiom-blocks/post-pagination'  => array(
			'' => '.page-numbers',
		),
	);

	/**
	 * Initialize.
	 *
	 * @return void
	 */
	public static function init(): void {
		add_filter( 'register_block_type_args', array( self::class, 'inject_attributes' ), 10, 2 );
		add_filter( 'render_block', array( self::class, 'render' ), 10, 2 );
	}

	/**
	 * Inject *Tablet / *Mobile typography attributes for every group a block declares.
	 *
	 * @param array  $args Block type registration args.
	 * @param string $name Block name.
	 * @return array
	 */
	public static function inject_attributes( array $args, string $name ): array {
		if ( ! isset( self::TARGETS[ $name ] ) ) {
			return $args;
		}
		if ( ! isset( $args['attributes'] ) || ! is_array( $args['attributes'] ) ) {
			$args['attributes'] = array();
		}
		foreach ( array_keys( self::TARGETS[ $name ] ) as $prefix ) {
			foreach ( array_values( Responsive::typography_map() ) as $suffix ) {
				$base_key = Responsive::prefixed( $prefix, $suffix );
				foreach ( array( 'Tablet', 'Mobile' ) as $device ) {
					$key = $base_key . $device;
					if ( ! isset( $args['attributes'][ $key ] ) ) {
						$args['attributes'][ $key ] = array(
							'type'    => 'string',
							'default' => '',
						);
					}
				}
			}
		}
		return $args;
	}

	/**
	 * Add the per-instance class to the wrapper + queue Tablet/Mobile typography CSS.
	 *
	 * @param string $block_content Rendered block HTML.
	 * @param array  $block         Parsed block.
	 * @return string
	 */
	public static function render( string $block_content, array $block ): string {
		$name = $block['blockName'] ?? '';
		if ( ! isset( self::TARGETS[ $name ] ) ) {
			return $block_content;
		}
		// WP_HTML_Tag_Processor is WP 6.2+. On older WP, typography simply degrades
		// to the inline Desktop value (no fatal).
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$attributes = $block['attrs'] ?? array();
		$targets    = self::TARGETS[ $name ];
		if ( ! Responsive::typography_has_overrides( $attributes, $targets ) ) {
			return $block_content;
		}

		$instance_class = Responsive::typography_instance_class( $attributes, $targets );
		ResponsiveStyles::add( Responsive::typography_css( $instance_class, $attributes, $targets ) );

		if ( '' === trim( $block_content ) ) {
			return $block_content;
		}
		$processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( $processor->next_tag() ) {
			$processor->add_class( $instance_class );
			return $processor->get_updated_html();
		}
		return $block_content;
	}
}
