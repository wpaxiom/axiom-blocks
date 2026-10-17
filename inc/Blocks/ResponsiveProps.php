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
	 * Per-device field sizing shared by every Post Filter child control. The
	 * width preset is a class, so only the custom width needs a per-device var.
	 */
	private const FIELD_WIDTH_PROPS = array(
		array(
			'prop'     => '--ab-pff-w',
			'key'      => 'widthCustom',
			'selector' => '',
			'format'   => '',
			'type'     => 'string',
		),
	);

	/**
	 * Per-device placement shared by every Contact Form field, group and
	 * button: the span maps 0 (full row) and 1-12 to grid-column, order is raw.
	 */
	private const CONTACT_FORM_PLACEMENT = array(
		array(
			'prop'     => '--ab-cf-span',
			'key'      => 'span',
			'selector' => '',
			'format'   => '',
			'type'     => 'number',
			'map'      => \AxiomBlocks\Forms\ContactFormRender::SPAN_MAP,
		),
		array(
			'prop'     => '--ab-cf-ord',
			'key'      => 'order',
			'selector' => '',
			'format'   => '',
			'type'     => 'number',
		),
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
		'axiom-blocks/advanced-section'       => array(
			array(
				'prop'     => 'grid-template-columns',
				'key'      => 'gridColumns',
				'selector' => '',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => 'gap',
				'key'      => 'layoutGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/counter-group'          => array(
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
			array(
				'prop'     => 'min-height',
				'key'      => 'cardMinHeight',
				'selector' => '.ab-counter',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/pricing-table'          => array(
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
			array(
				'prop'     => '--ab-pt-card-minh',
				'key'      => 'cardMinHeight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pt-card-gap',
				'key'      => 'cardGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pt-feat-gap',
				'key'      => 'featureGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pt-feat-icon-size',
				'key'      => 'featIconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/shape-divider'          => array(
			array(
				'prop'     => 'height',
				'key'      => 'height',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/testimonials'           => array(
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
			array(
				'prop'     => '--ab-tst-card-gap',
				'key'      => 'cardGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tst-avatar-size',
				'key'      => 'avatarSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => 'min-height',
				'key'      => 'cardMinHeight',
				'selector' => '.ab-testimonial',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/trust-badges'           => array(
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
			array(
				'prop'     => '--ab-tb-pt',
				'key'      => 'cardPaddingTop',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tb-pr',
				'key'      => 'cardPaddingRight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tb-pb',
				'key'      => 'cardPaddingBottom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tb-pl',
				'key'      => 'cardPaddingLeft',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tb-item-gap',
				'key'      => 'cardGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/accordion'              => array(
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
			array(
				'prop'     => '--ab-acc-cont-maxw',
				'key'      => 'containerMaxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-acc-body-maxw',
				'key'      => 'bodyMaxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/icon-list'              => array(
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
		'axiom-blocks/info-box'               => array(
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
			array(
				'prop'     => '--ab-ibox-w',
				'key'      => 'cardWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				// Real property (not a var): the desktop value is inline-only, so
				// an unset max-width inherits the layout width; these !important
				// media rules override the inline desktop value on small screens.
				'prop'     => 'max-width',
				'key'      => 'cardMaxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ibox-mh',
				'key'      => 'cardMinHeight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/button-group'           => array(
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
		'axiom-blocks/tabs'                   => array(
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
			array(
				'prop'     => '--ab-tabs-gap',
				'key'      => 'tabGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-tab-icon-gap',
				'key'      => 'tabIconGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-bar-pt',
				'key'      => 'barPaddingTop',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-bar-pr',
				'key'      => 'barPaddingRight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-bar-pb',
				'key'      => 'barPaddingBottom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-bar-pl',
				'key'      => 'barPaddingLeft',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-panel-pt',
				'key'      => 'panelPaddingTop',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-panel-pr',
				'key'      => 'panelPaddingRight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-panel-pb',
				'key'      => 'panelPaddingBottom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-tabs-panel-pl',
				'key'      => 'panelPaddingLeft',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/countdown-timer'        => array(
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
			array(
				'prop'     => 'min-width',
				'key'      => 'digitMinWidth',
				'selector' => '.axiom-blocks-countdown__unit',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/star-rating'            => array(
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
		'axiom-blocks/icon'                   => array(
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
		'axiom-blocks/copy-to-clipboard'      => array(
			array(
				'prop'     => 'text-align',
				'key'      => 'alignment',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/notice'                 => array(
			array(
				'prop'     => '--ab-notice-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				// Real property (not a var): the desktop value is inline-only, so
				// an unset max-width inherits the layout width; these !important
				// media rules override the inline desktop value on small screens.
				'prop'     => 'max-width',
				'key'      => 'maxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/advanced-button'        => array(
			array(
				'prop'     => '--ab-advbtn-icon',
				'key'      => 'iconSize',
				'selector' => '.ab-adv-btn',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/advanced-heading'       => array(
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
			array(
				'prop'     => '--ab-ah-sub-gap',
				'key'      => 'headingSubGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ah-maxw',
				'key'      => 'headingMaxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/before-after-slider'    => array(
			array(
				'prop'     => '--ab-bas-maxw',
				'key'      => 'maxWidth',
				'selector' => '.axiom-blocks-bas__frame',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/content-slider'         => array(
			array(
				// Real property (not a var): the desktop value is inline-only, so
				// an unset max-width inherits the layout width; these !important
				// media rules override the inline desktop value on small screens.
				'prop'     => 'max-width',
				'key'      => 'maxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/free-shipping-progress' => array(
			array(
				'prop'     => '--ab-fsp-bar-height',
				'key'      => 'barHeight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				// Real property (not a var): the desktop value is inline-only, so
				// an unset max-width inherits the layout width; these !important
				// media rules override the inline desktop value on small screens.
				'prop'     => 'max-width',
				'key'      => 'maxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/table-of-contents'      => array(
			array(
				// Real property (not a var): the desktop value is inline-only, so
				// an unset max-width inherits the layout width; these !important
				// media rules override the inline desktop value on small screens.
				'prop'     => 'max-width',
				'key'      => 'maxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/post-grid'              => array(
			array(
				'prop'     => '--ab-pg-c',
				'key'      => 'columns',
				'selector' => '.ab-pg__list',
				'format'   => '',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-pg-calign',
				'key'      => 'contentAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => self::ALIGN_FLEX,
			),
			array(
				'prop'     => '--ab-pg-ctext',
				'key'      => 'contentAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pg-col-gap',
				'key'      => 'columnGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pg-row-gap',
				'key'      => 'rowGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/post-image'             => array(
			array(
				'prop'     => '--ab-pc-img-h',
				'key'      => 'height',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/css-grid'               => array(
			array(
				'prop'     => '--ab-cg-cols',
				'key'      => 'columnTemplate',
				'selector' => '',
				'format'   => 'grid-track-list',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cg-rows',
				'key'      => 'rowTemplate',
				'selector' => '',
				'format'   => 'grid-track-list',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cg-auto-cols',
				'key'      => 'autoColumns',
				'selector' => '',
				'format'   => 'grid-track-token',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cg-auto-rows',
				'key'      => 'autoRows',
				'selector' => '',
				'format'   => 'grid-track-token',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cg-flow',
				'key'      => 'autoFlow',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'row'    => 'row',
					'column' => 'column',
				),
			),
			array(
				'prop'     => '--ab-cg-ji',
				'key'      => 'justifyItems',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'stretch' => 'stretch',
					'start'   => 'start',
					'center'  => 'center',
					'end'     => 'end',
				),
			),
			array(
				'prop'     => '--ab-cg-ai',
				'key'      => 'alignItems',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'stretch' => 'stretch',
					'start'   => 'start',
					'center'  => 'center',
					'end'     => 'end',
				),
			),
			array(
				'prop'     => '--ab-cg-jc',
				'key'      => 'justifyContent',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'normal'        => 'normal',
					'start'         => 'start',
					'center'        => 'center',
					'end'           => 'end',
					'space-between' => 'space-between',
					'space-around'  => 'space-around',
					'space-evenly'  => 'space-evenly',
				),
			),
			array(
				'prop'     => '--ab-cg-ac',
				'key'      => 'alignContent',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'normal'        => 'normal',
					'start'         => 'start',
					'center'        => 'center',
					'end'           => 'end',
					'space-between' => 'space-between',
					'space-around'  => 'space-around',
					'space-evenly'  => 'space-evenly',
				),
			),
			array(
				'prop'     => '--ab-cg-cg',
				'key'      => 'columnGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cg-rg',
				'key'      => 'rowGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/grid-item'              => array(
			array(
				'prop'     => 'grid-column-start',
				'key'      => 'columnStart',
				'selector' => '',
				'format'   => 'grid-line-start',
				'type'     => 'number',
			),
			array(
				'prop'     => 'grid-column-end',
				'key'      => 'columnSpan',
				'selector' => '',
				'format'   => 'grid-span',
				'type'     => 'number',
			),
			array(
				'prop'     => 'grid-row-start',
				'key'      => 'rowStart',
				'selector' => '',
				'format'   => 'grid-line-start',
				'type'     => 'number',
			),
			array(
				'prop'     => 'grid-row-end',
				'key'      => 'rowSpan',
				'selector' => '',
				'format'   => 'grid-span',
				'type'     => 'number',
			),
			array(
				'prop'     => 'order',
				'key'      => 'itemOrder',
				'selector' => '',
				'format'   => '',
				'type'     => 'number',
			),
			array(
				'prop'     => 'justify-self',
				'key'      => 'justifySelf',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'auto'    => 'auto',
					'stretch' => 'stretch',
					'start'   => 'start',
					'center'  => 'center',
					'end'     => 'end',
				),
			),
			array(
				'prop'     => 'align-self',
				'key'      => 'alignSelf',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => array(
					'auto'    => 'auto',
					'stretch' => 'stretch',
					'start'   => 'start',
					'center'  => 'center',
					'end'     => 'end',
				),
			),
			array(
				'prop'     => '--ab-gi-minh',
				'key'      => 'minHeight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/post-meta'              => array(
			array(
				'prop'     => '--ab-pc-meta-icon-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/post-card'              => array(
			array(
				'prop'     => '--ab-pc-min-h',
				'key'      => 'cardMinHeight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pc-gap',
				'key'      => 'cardGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/post-filter'            => array(
			array(
				'prop'     => '--ab-pf-pt',
				'key'      => 'barPaddingTop',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pf-pr',
				'key'      => 'barPaddingRight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pf-pb',
				'key'      => 'barPaddingBottom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pf-pl',
				'key'      => 'barPaddingLeft',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pf-dir',
				'key'      => 'direction',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pf-gap',
				'key'      => 'fieldGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-pf-row-gap',
				'key'      => 'fieldRowGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/post-filter-search'     => self::FIELD_WIDTH_PROPS,
		'axiom-blocks/post-filter-taxonomy'   => self::FIELD_WIDTH_PROPS,
		'axiom-blocks/post-filter-sort'       => self::FIELD_WIDTH_PROPS,
		'axiom-blocks/post-filter-reset'      => self::FIELD_WIDTH_PROPS,
		'axiom-blocks/contact-form'           => array(
			array(
				'prop'     => '--ab-cf-cols',
				'key'      => 'columns',
				'selector' => '',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-cf-cols',
				'key'      => 'tracks',
				'selector' => '',
				'format'   => 'grid-track-list',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-ralign',
				'key'      => 'rowAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-fcols',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-fcols'],
			),
			array(
				'prop'     => '--ab-cf-ccol',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-ccol'],
			),
			array(
				'prop'     => '--ab-cf-lpos',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-lpos'],
			),
			array(
				'prop'     => '--ab-cf-lsize',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-lsize'],
			),
			array(
				'prop'     => '--ab-cf-lof',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-lof'],
			),
			array(
				'prop'     => '--ab-cf-lclip',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-lclip'],
			),
			array(
				'prop'     => '--ab-cf-lws',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-lws'],
			),
			array(
				'prop'     => '--ab-cf-lpt',
				'key'      => 'labelPosition',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::LABEL_POSITION_VARS['--ab-cf-lpt'],
			),
			array(
				'prop'     => '--ab-cf-lw',
				'key'      => 'labelWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-gap-r',
				'key'      => 'rowGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-gap-c',
				'key'      => 'columnGap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-form-pt',
				'key'      => 'formPaddingTop',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-form-pr',
				'key'      => 'formPaddingRight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-form-pb',
				'key'      => 'formPaddingBottom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-form-pl',
				'key'      => 'formPaddingLeft',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cf-form-mw',
				'key'      => 'formMaxWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/contact-form-group'     => array(
			array(
				'prop'     => '--ab-cf-span',
				'key'      => 'span',
				'selector' => '',
				'format'   => '',
				'type'     => 'number',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::SPAN_MAP,
			),
			array(
				'prop'     => '--ab-cf-ord',
				'key'      => 'order',
				'selector' => '',
				'format'   => '',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-cf-cols',
				'key'      => 'columns',
				'selector' => '',
				'format'   => 'grid-columns',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-cf-cols',
				'key'      => 'tracks',
				'selector' => '',
				'format'   => 'grid-track-list',
				'type'     => 'string',
			),
		),
		'axiom-blocks/contact-form-submit'    => array(
			array(
				'prop'     => '--ab-cf-span',
				'key'      => 'span',
				'selector' => '',
				'format'   => '',
				'type'     => 'number',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::SPAN_MAP,
			),
			array(
				'prop'     => '--ab-cf-ord',
				'key'      => 'order',
				'selector' => '',
				'format'   => '',
				'type'     => 'number',
			),
			array(
				'prop'     => '--ab-cfb-w',
				'key'      => 'buttonWidth',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::BUTTON_WIDTH_MAP,
			),
			array(
				'prop'     => '--ab-cfb-wc',
				'key'      => 'buttonWidthCustom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cfb-align',
				'key'      => 'btnAlign',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
				'map'      => \AxiomBlocks\Forms\ContactFormRender::ALIGN_MAP,
			),
			array(
				'prop'     => '--ab-cfb-pt',
				'key'      => 'btnPaddingTop',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cfb-pr',
				'key'      => 'btnPaddingRight',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cfb-pb',
				'key'      => 'btnPaddingBottom',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-cfb-pl',
				'key'      => 'btnPaddingLeft',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/social-share'           => array(
			array(
				'prop'     => '--ab-ss-dir',
				'key'      => 'direction',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ss-justify',
				'key'      => 'justify',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ss-gap',
				'key'      => 'gap',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ss-btn-size',
				'key'      => 'btnSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
			array(
				'prop'     => '--ab-ss-ic-size',
				'key'      => 'iconSize',
				'selector' => '',
				'format'   => '',
				'type'     => 'string',
			),
		),
		'axiom-blocks/contact-form-text'      => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-email'     => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-phone'     => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-textarea'  => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-select'    => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-choices'   => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-consent'   => self::CONTACT_FORM_PLACEMENT,
		'axiom-blocks/contact-form-date'      => self::CONTACT_FORM_PLACEMENT,
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
