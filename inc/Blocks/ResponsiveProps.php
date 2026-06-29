<?php
/**
 * Central responsive wiring for per-block single-value controls (columns, gap, …).
 *
 * The shared SpacingPanel / TypographyPanel are wired by their own central classes;
 * this handles the one-off per-block controls that opt in via the ABResponsive
 * editor wrapper. Each registered block lists prop specs (CSS property, attribute
 * key, selector relative to the wrapper, and an optional value format). At render
 * it adds a per-instance class to the wrapper's first tag and queues the
 * Tablet/Mobile CSS (Desktop stays as-is → back-compat).
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
 * Central responsive per-block props.
 *
 * @since 1.0.4
 */
class ResponsiveProps {

	/**
	 * Standard left/center/right => flex value map shared by alignment specs.
	 */
	private const ALIGN_FLEX = array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
	);

	/**
	 * Block name => list of prop specs. Keep in sync with the JS registry in
	 * src/components/responsiveProps.js (which holds the attribute types).
	 *
	 * Spec keys: prop (CSS property), key (base attr), selector (relative to wrapper,
	 * '' = wrapper itself), format ('grid-columns' | 'px' | ''), type (attr type to
	 * inject), map (optional value => CSS map, e.g. alignment left => flex-start).
	 *
	 * @var array<string, array<int, array<string, mixed>>>
	 */
	private const TARGETS = array(
		'axiom-blocks/counter-group'   => array(
			array(
				'prop'     => 'grid-template-columns',
				'key'      => 'columns',
				'selector' => '',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-counter-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-counter-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/pricing-table'   => array(
			array(
				'prop'     => 'grid-template-columns',
				'key'      => 'columns',
				'selector' => '.axiom-blocks-pricing-table__grid',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-pt-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => 'px',
				'type'     => 'number',
			),
		),
		'axiom-blocks/testimonials'    => array(
			array(
				'prop'     => 'grid-template-columns',
				'key'      => 'columns',
				'selector' => '',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-tst-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/trust-badges'    => array(
			array(
				'prop'     => 'grid-template-columns',
				'key'      => 'columns',
				'selector' => '.axiom-blocks-trust-badges__list',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-tb-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => 'px',
				'type'     => 'number',
			),
			array(
				'prop'     => 'justify-content',
				'key'      => 'alignment',
				'selector' => '.axiom-blocks-trust-badges__list',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
			array(
				'prop'     => 'text-align',
				'key'      => 'headingAlign',
				'selector' => '.axiom-blocks-trust-badges__heading',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/accordion'       => array(
			array(
				'prop'     => '--ab-acc-gap',
				'key'      => 'itemGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-acc-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/icon-list'       => array(
			array(
				'prop'     => '--ab-il-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-il-row-gap',
				'key'      => 'rowGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-il-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/info-box'        => array(
			array(
				'prop'     => '--ab-ibox-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => 'align-items',
				'key'      => 'contentAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
			array(
				'prop'     => 'text-align',
				'key'      => 'contentAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/button-group'    => array(
			array(
				'prop'     => '--ab-btng-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => 'px',
				'type'     => 'number',
			),
			array(
				'prop'     => 'justify-content',
				'key'      => 'justify',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'left'          => 'flex-start',
					'center'        => 'center',
					'right'         => 'flex-end',
					'space-between' => 'space-between',
				),
			),
		),
		'axiom-blocks/tabs'            => array(
			array(
				'prop'     => '--axiom-blocks-tabs-content-gap',
				'key'      => 'contentGap',
				'selector' => '',
				'format'   => 'px',
				'type'     => 'number',
			),
			array(
				'prop'     => 'justify-content',
				'key'      => 'tabAlignment',
				'selector' => '.axiom-blocks-tabs__list',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
		),
		'axiom-blocks/countdown-timer' => array(
			array(
				'prop'     => 'gap',
				'key'      => 'gap',
				'selector' => '.axiom-blocks-countdown__container',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => 'justify-content',
				'key'      => 'alignment',
				'selector' => '.axiom-blocks-countdown__container',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
			array(
				'prop'     => 'align-items',
				'key'      => 'alignment',
				'selector' => '.axiom-blocks-countdown__container',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
		),
		'axiom-blocks/star-rating'     => array(
			array(
				'prop'     => 'justify-content',
				'key'      => 'alignment',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
			array(
				'prop'     => 'width',
				'key'      => 'starSize',
				'selector' => '.axiom-blocks-star-rating__stars svg',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => 'height',
				'key'      => 'starSize',
				'selector' => '.axiom-blocks-star-rating__stars svg',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/icon'            => array(
			array(
				'prop'     => 'justify-content',
				'key'      => 'iconAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
			array(
				'prop'     => '--ab-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/copy-to-clipboard' => array(
			array(
				'prop'     => 'text-align',
				'key'      => 'alignment',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/notice'            => array(
			array(
				'prop'     => '--ab-notice-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/advanced-button'   => array(
			array(
				'prop'     => '--ab-advbtn-icon',
				'key'      => 'iconSize',
				'selector' => '.ab-adv-btn',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/advanced-heading' => array(
			array(
				'prop'     => 'margin-left',
				'key'      => 'accentAlign',
				'selector' => '.ab-ah__accent',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'left'   => '0',
					'center' => 'auto',
					'right'  => 'auto',
				),
			),
			array(
				'prop'     => 'margin-right',
				'key'      => 'accentAlign',
				'selector' => '.ab-ah__accent',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'left'   => 'auto',
					'center' => 'auto',
					'right'  => '0',
				),
			),
			array(
				'prop'     => '--ab-ah-accent-w',
				'key'      => 'accentWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ah-accent-h',
				'key'      => 'accentThickness',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
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
	 * Inject *Tablet / *Mobile attributes for each registered prop.
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
		foreach ( self::TARGETS[ $name ] as $spec ) {
			foreach ( array( 'Tablet', 'Mobile' ) as $device ) {
				$key = $spec['key'] . $device;
				if ( ! isset( $args['attributes'][ $key ] ) ) {
					$args['attributes'][ $key ] = array( 'type' => $spec['type'] ?? 'string' );
				}
			}
		}
		return $args;
	}

	/**
	 * Add the per-instance class to the wrapper + queue Tablet/Mobile CSS.
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
		if ( ! class_exists( '\WP_HTML_Tag_Processor' ) ) {
			return $block_content;
		}

		$attributes = $block['attrs'] ?? array();
		$specs      = self::TARGETS[ $name ];
		if ( ! Responsive::props_has_overrides( $attributes, $specs ) ) {
			return $block_content;
		}

		$instance_class = Responsive::props_instance_class( $attributes, $specs );
		ResponsiveStyles::add( Responsive::props_css( $instance_class, $attributes, $specs ) );

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
