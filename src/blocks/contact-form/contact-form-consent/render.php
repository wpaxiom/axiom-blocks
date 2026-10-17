<?php
/**
 * Contact Form consent field - frontend render. Markup lives in ContactFormRender
 * so every field type shares one implementation.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- ContactFormRender escapes every part it builds.
echo \AxiomBlocks\Forms\ContactFormRender::field( 'consent', $attributes ?? array(), $block );
