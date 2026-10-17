<?php
/**
 * Contact Form rendering helpers.
 *
 * One place builds every field's markup, so the nine field blocks' render.php
 * files are one line each and the markup cannot drift between them. The CSS
 * custom properties come from vars.json, the same map the editor script
 * imports, so the editor and the front end paint from one source.
 *
 * @package AxiomBlocks\Forms
 * @since 1.1.0
 */

namespace AxiomBlocks\Forms;

use AxiomBlocks\Blocks\AllowedHtml;
use AxiomBlocks\Blocks\Background;
use AxiomBlocks\Blocks\Icons;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Markup and CSS variables for the Contact Form family.
 */
final class ContactFormRender {

	/**
	 * Label position => the CSS variables that lay a field out. Shared with the
	 * per-device registry in ResponsiveProps and mirrored in shared.js.
	 */
	const LABEL_POSITION_VARS = array(
		'--ab-cf-fcols' => array(
			'above'  => 'minmax(0, 1fr)',
			'beside' => 'var(--ab-cf-lw, 30%) minmax(0, 1fr)',
			'hidden' => 'minmax(0, 1fr)',
		),
		'--ab-cf-ccol'  => array(
			'above'  => 'auto',
			'beside' => '2',
			'hidden' => 'auto',
		),
		'--ab-cf-lpos'  => array(
			'above'  => 'static',
			'beside' => 'static',
			'hidden' => 'absolute',
		),
		'--ab-cf-lsize' => array(
			'above'  => 'auto',
			'beside' => 'auto',
			'hidden' => '1px',
		),
		'--ab-cf-lof'   => array(
			'above'  => 'visible',
			'beside' => 'visible',
			'hidden' => 'hidden',
		),
		'--ab-cf-lclip' => array(
			'above'  => 'none',
			'beside' => 'none',
			'hidden' => 'inset(50%)',
		),
		'--ab-cf-lws'   => array(
			'above'  => 'normal',
			'beside' => 'normal',
			'hidden' => 'nowrap',
		),
		// Beside the input, the label's first line lines up with the input's text.
		'--ab-cf-lpt'   => array(
			'above'  => '0',
			'beside' => 'calc(var(--ab-cf-in-pt, 10px) + var(--ab-cf-in-bw-t, 1px))',
			'hidden' => '0',
		),
	);

	/**
	 * Span value => grid-column. 0 is the full row.
	 */
	const SPAN_MAP = array(
		'0'  => '1 / -1',
		'1'  => 'span 1',
		'2'  => 'span 2',
		'3'  => 'span 3',
		'4'  => 'span 4',
		'5'  => 'span 5',
		'6'  => 'span 6',
		'7'  => 'span 7',
		'8'  => 'span 8',
		'9'  => 'span 9',
		'10' => 'span 10',
		'11' => 'span 11',
		'12' => 'span 12',
	);

	/**
	 * Submit width preset => CSS width.
	 */
	const BUTTON_WIDTH_MAP = array(
		'auto'   => 'auto',
		'full'   => '100%',
		'custom' => 'var(--ab-cfb-wc, auto)',
	);

	/**
	 * Button alignment (AlignControl values) => justify-content.
	 */
	const ALIGN_MAP = array(
		'left'   => 'flex-start',
		'center' => 'center',
		'right'  => 'flex-end',
		'full'   => 'stretch',
	);

	/**
	 * Row alignment values allowed on the fields grid.
	 */
	const ROW_ALIGN = array( 'start', 'center', 'end', 'stretch' );

	/**
	 * Inline tags a consent label may keep.
	 */
	const CONSENT_KSES = array(
		'a'      => array(
			'href'   => true,
			'target' => true,
			'rel'    => true,
		),
		'strong' => array(),
		'em'     => array(),
		'b'      => array(),
		'i'      => array(),
		'br'     => array(),
	);

	/**
	 * No-JS state of the form being rendered (values and errors after a
	 * redirect). Set by the parent around its children's render.
	 *
	 * @var array
	 */
	private static $state = array();

	/**
	 * Decoded vars.json.
	 *
	 * @var array|null
	 */
	private static $map = null;

	/**
	 * Set the state the children read.
	 *
	 * @param array $state Request state.
	 * @return void
	 */
	public static function set_state( array $state ): void {
		self::$state = $state;
	}

	/**
	 * The variable map.
	 *
	 * @return array
	 */
	public static function map(): array {
		if ( null === self::$map ) {
			$file      = AXIOM_BLOCKS_PLUGIN_DIR . 'build/blocks/contact-form/vars.json';
			$data      = is_readable( $file ) ? json_decode( (string) file_get_contents( $file ), true ) : null; // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local plugin file.
			self::$map = is_array( $data ) ? $data : array();
		}
		return self::$map;
	}

	/**
	 * CSS declarations for one part of the family, from vars.json.
	 *
	 * @param string $part  form | submit | field.
	 * @param array  $attrs Block attributes.
	 * @return string[] "--var: value" declarations.
	 */
	public static function vars( string $part, array $attrs ): array {
		$map  = self::map();
		$spec = $map[ $part ] ?? array();
		$out  = array();

		foreach ( $spec['vars'] ?? array() as $var => $attr ) {
			$value = $attrs[ $attr ] ?? '';
			if ( is_scalar( $value ) && '' !== (string) $value ) {
				$out[] = $var . ': ' . $value;
			}
		}

		foreach ( $spec['borders'] ?? array() as $border ) {
			list( $style_var, $style_attr, $width_attrs ) = $border;
			$style                                        = (string) ( $attrs[ $style_attr ] ?? '' );
			if ( '' !== $style ) {
				continue;
			}
			foreach ( $width_attrs as $width_attr ) {
				if ( '' !== (string) ( $attrs[ $width_attr ] ?? '' ) ) {
					// BorderControl shows "Solid" for an empty style, so a width
					// alone must paint a solid border (the CSS Grid B1 lesson).
					$out[] = $style_var . ': solid';
					break;
				}
			}
		}

		$suffixes = $map['typographySuffixes'] ?? array();
		foreach ( $spec['typography'] ?? array() as $prefix => $var_prefix ) {
			foreach ( $suffixes as $suffix => $css ) {
				$attr  = '' === $prefix ? lcfirst( $suffix ) : $prefix . $suffix;
				$value = $attrs[ $attr ] ?? '';
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

	/**
	 * Desktop label-position declarations.
	 *
	 * @param string $position above | beside | hidden.
	 * @return string[]
	 */
	public static function label_position_vars( string $position ): array {
		if ( ! in_array( $position, array( 'above', 'beside', 'hidden' ), true ) ) {
			$position = 'above';
		}
		$out = array();
		foreach ( self::LABEL_POSITION_VARS as $var => $values ) {
			$out[] = $var . ': ' . $values[ $position ];
		}
		return $out;
	}

	/**
	 * Placement declarations every grid item carries. Always emitted: custom
	 * properties inherit, so an item without its own span would take its
	 * group's.
	 *
	 * @param array $attrs Block attributes.
	 * @return string[]
	 */
	public static function placement_vars( array $attrs ): array {
		$span = (string) absint( $attrs['span'] ?? 0 );
		return array(
			'--ab-cf-span: ' . ( self::SPAN_MAP[ $span ] ?? '1 / -1' ),
			'--ab-cf-ord: ' . (int) ( $attrs['order'] ?? 0 ),
		);
	}

	/**
	 * Join declarations into a safe style attribute value.
	 *
	 * @param string[] $declarations Declarations.
	 * @return string
	 */
	public static function style( array $declarations ): string {
		return safecss_filter_attr( implode( '; ', array_filter( $declarations ) ) );
	}

	/**
	 * Escaped inline SVG for an icon slug, or ''.
	 *
	 * @param string $slug      Icon slug.
	 * @param string $css_class Wrapper class.
	 * @return string
	 */
	public static function icon( string $slug, string $css_class ): string {
		$svg = '' !== $slug ? Icons::get( $slug ) : '';
		if ( '' === $svg ) {
			return '';
		}
		return '<span class="' . esc_attr( $css_class ) . '" aria-hidden="true">' . wp_kses( $svg, AllowedHtml::svg() ) . '</span>';
	}

	/**
	 * The DOM id for a field's control.
	 *
	 * @param array  $context Block context.
	 * @param string $key     Field key.
	 * @return string
	 */
	public static function field_id( array $context, string $key ): string {
		$form = sanitize_html_class( (string) ( $context['axiom-blocks/cfFormId'] ?? '' ) );
		return 'ab-cf-' . ( '' !== $form ? substr( $form, 0, 8 ) . '-' : '' ) . sanitize_html_class( str_replace( '_', '-', $key ) );
	}

	/**
	 * Render one field block.
	 *
	 * @param string    $type  Field type.
	 * @param array     $attrs Block attributes (fieldKey already final).
	 * @param \WP_Block $block Block instance.
	 * @return string
	 */
	public static function field( string $type, array $attrs, $block ): string {
		$context = is_object( $block ) && is_array( $block->context ?? null ) ? $block->context : array();
		$key     = (string) ( $attrs['fieldKey'] ?? '' );
		if ( '' === $key ) {
			$key = ContactFormSchema::slug( (string) ( $attrs['label'] ?? '' ) );
			$key = '' !== $key ? $key : $type;
		}
		$name   = ContactFormHandler::VALUES_FIELD . '[' . $key . ']';
		$values = (array) ( self::$state['values'] ?? array() );
		$errors = (array) ( self::$state['errors'] ?? array() );
		$value  = array_key_exists( $key, $values ) ? $values[ $key ] : (string) ( $attrs['defaultValue'] ?? '' );
		$error  = isset( $errors[ $key ] ) ? (string) $errors[ $key ] : '';

		if ( 'hidden' === $type ) {
			return self::hidden( $attrs, $name );
		}

		$id        = self::field_id( $context, $key );
		$label     = (string) ( $attrs['label'] ?? '' );
		$help      = (string) ( $attrs['help'] ?? '' );
		$required  = ! empty( $attrs['required'] ) || ( 'consent' === $type && ! array_key_exists( 'required', $attrs ) );
		$icon      = (string) ( $attrs['icon'] ?? '' );
		$icon_end  = 'end' === ( $attrs['iconPosition'] ?? 'start' );
		$help_up   = 'below-label' === ( $context['axiom-blocks/cfHelpPosition'] ?? 'below-input' );
		$floatable = in_array( $type, array( 'text', 'email', 'phone', 'textarea' ), true );

		$classes = array( 'ab-cf-field', 'ab-cf-field--' . $type );
		if ( '' !== $error ) {
			$classes[] = 'is-invalid';
		}
		if ( '' !== $icon && 'choices' !== $type && 'consent' !== $type ) {
			$classes[] = $icon_end ? 'has-icon-end' : 'has-icon-start';
		}
		if ( $floatable ) {
			$classes[] = 'ab-cf-field--floatable';
		}

		$described = array();
		if ( '' !== $help ) {
			$described[] = $id . '-help';
		}
		$described[] = $id . '-error';

		$style = self::style( array_merge( self::placement_vars( $attrs ), self::vars( 'field', $attrs ) ) );

		$html  = '<div class="' . esc_attr( implode( ' ', $classes ) ) . '" data-ab-cf-key="' . esc_attr( $key ) . '"';
		$html .= $required ? ' data-ab-cf-required="1"' : '';
		$html .= '' !== $style ? ' style="' . esc_attr( $style ) . '"' : '';
		$html .= '>';

		$help_html  = '' !== $help ? '<p class="ab-cf-help" id="' . esc_attr( $id . '-help' ) . '">' . esc_html( $help ) . '</p>' : '';
		$error_html = '<p class="ab-cf-error" id="' . esc_attr( $id . '-error' ) . '"' . ( '' === $error ? ' hidden' : '' ) . '>' . esc_html( $error ) . '</p>';

		$aria = ' aria-describedby="' . esc_attr( implode( ' ', $described ) ) . '"' . ( '' !== $error ? ' aria-invalid="true"' : '' );

		if ( 'consent' === $type ) {
			$switch = 'switch' === ( $attrs['consentDisplay'] ?? 'checkbox' );
			$html  .= '<label class="ab-cf-consent' . ( $switch ? ' is-switch' : '' ) . '">';
			$html  .= '<input type="checkbox" class="ab-cf-choice__input" id="' . esc_attr( $id ) . '" name="' . esc_attr( $name ) . '" value="1"' . ( $required ? ' required' : '' ) . ( ! empty( $value ) ? ' checked' : '' ) . $aria . ( $switch ? ' role="switch"' : '' ) . ' />';
			$html  .= '<span class="ab-cf-consent__text">' . wp_kses( $label, self::CONSENT_KSES ) . self::required_mark( $required, $context ) . '</span>';
			$html  .= '</label>' . $help_html . $error_html . '</div>';
			return $html;
		}

		if ( 'choices' === $type ) {
			$label_id = $id . '-label';
			$html    .= self::label( $label, $required, $context, $attrs, '', $label_id );
			$html    .= $help_up ? $help_html : '';
			$html    .= self::choices( $attrs, $name, $id, $value, $required, $label_id, $aria );
			$html    .= ( $help_up ? '' : $help_html ) . $error_html . '</div>';
			return $html;
		}

		$html .= self::label( $label, $required, $context, $attrs, $id, '' );
		$html .= $help_up ? $help_html : '';
		$html .= '<div class="ab-cf-control-wrap">';
		if ( '' !== $icon && ! $icon_end ) {
			$html .= self::icon( $icon, 'ab-cf-icon ab-cf-icon--start' );
		}
		$html .= self::control( $type, $attrs, $name, $id, $value, $required, $aria );
		if ( '' !== $icon && $icon_end ) {
			$html .= self::icon( $icon, 'ab-cf-icon ab-cf-icon--end' );
		}
		if ( 'select' === $type && empty( $attrs['multiple'] ) ) {
			$chevron = (string) ( $attrs['chevronIcon'] ?? '' );
			$html   .= self::icon( '' !== $chevron ? $chevron : 'chevron-down', 'ab-cf-chevron' );
		}
		$html .= '</div>';
		$html .= ( $help_up ? '' : $help_html ) . $error_html . '</div>';
		return $html;
	}

	/**
	 * The label element (or a span labelling a group of choices).
	 *
	 * @param string $text     Label text.
	 * @param bool   $required Required.
	 * @param array  $context  Block context.
	 * @param array  $attrs    Field attributes.
	 * @param string $for_id   Control id for a <label>, '' for a span.
	 * @param string $id       Id for the span.
	 * @return string
	 */
	private static function label( string $text, bool $required, array $context, array $attrs, string $for_id, string $id ): string {
		$classes = 'ab-cf-label' . ( isset( $attrs['showLabel'] ) && false === $attrs['showLabel'] ? ' screen-reader-text' : '' );
		$inner   = esc_html( $text ) . self::required_mark( $required, $context );
		if ( '' !== $for_id ) {
			return '<label class="' . esc_attr( $classes ) . '" for="' . esc_attr( $for_id ) . '">' . $inner . '</label>';
		}
		return '<span class="' . esc_attr( $classes ) . '" id="' . esc_attr( $id ) . '">' . $inner . '</span>';
	}

	/**
	 * The required or optional marker after a label.
	 *
	 * @param bool  $required Required.
	 * @param array $context  Block context.
	 * @return string
	 */
	private static function required_mark( bool $required, array $context ): string {
		if ( $required ) {
			$marker = (string) ( $context['axiom-blocks/cfRequiredMarker'] ?? 'asterisk' );
			if ( 'asterisk' === $marker ) {
				return ' <span class="ab-cf-req" aria-hidden="true">*</span>';
			}
			if ( 'text' === $marker ) {
				$text = (string) ( $context['axiom-blocks/cfRequiredText'] ?? '' );
				return '' !== $text ? ' <span class="ab-cf-req">' . esc_html( $text ) . '</span>' : '';
			}
			return '';
		}
		$optional = (string) ( $context['axiom-blocks/cfOptionalText'] ?? '' );
		return '' !== $optional ? ' <span class="ab-cf-opt">' . esc_html( $optional ) . '</span>' : '';
	}

	/**
	 * A text-like control, textarea or select.
	 *
	 * @param string $type     Field type.
	 * @param array  $attrs    Attributes.
	 * @param string $name     Input name.
	 * @param string $id       Input id.
	 * @param mixed  $value    Current value.
	 * @param bool   $required Required.
	 * @param string $aria     Escaped aria attributes.
	 * @return string
	 */
	private static function control( string $type, array $attrs, string $name, string $id, $value, bool $required, string $aria ): string {
		$common = ' class="ab-cf-control" id="' . esc_attr( $id ) . '"' . ( $required ? ' required' : '' ) . $aria;
		$auto   = (string) ( $attrs['autocomplete'] ?? '' );
		if ( '' !== $auto ) {
			$common .= ' autocomplete="' . esc_attr( $auto ) . '"';
		}
		$max = absint( $attrs['maxLength'] ?? 0 );
		$cap = ContactFormSchema::LENGTH_CAPS[ 'select' === $type ? 'text' : $type ] ?? 0;
		$max = $max > 0 ? min( $max, $cap ) : $cap;

		$placeholder = (string) ( $attrs['placeholder'] ?? '' );
		// Floating labels need a placeholder to test :placeholder-shown against.
		$ph_attr = ' placeholder="' . esc_attr( '' !== $placeholder ? $placeholder : ' ' ) . '"';

		if ( 'textarea' === $type ) {
			$rows = max( 1, min( 30, absint( $attrs['rows'] ?? 5 ) ) );
			$cls  = isset( $attrs['resize'] ) && false === $attrs['resize'] ? ' style="resize:none"' : '';
			return '<textarea name="' . esc_attr( $name ) . '" rows="' . esc_attr( (string) $rows ) . '" maxlength="' . esc_attr( (string) $max ) . '"' . $ph_attr . $common . $cls . '>' . esc_textarea( is_scalar( $value ) ? (string) $value : '' ) . '</textarea>';
		}

		if ( 'select' === $type ) {
			$multiple = ! empty( $attrs['multiple'] );
			$picked   = is_array( $value ) ? array_map( 'strval', $value ) : array( (string) $value );
			$html     = '<select name="' . esc_attr( $name . ( $multiple ? '[]' : '' ) ) . '"' . ( $multiple ? ' multiple' : '' ) . $common . '>';
			$first    = (string) ( $attrs['placeholderOption'] ?? '' );
			if ( ! $multiple && '' !== $first ) {
				$html .= '<option value="">' . esc_html( $first ) . '</option>';
			}
			foreach ( ContactFormSchema::options( $attrs['options'] ?? array() ) as $option ) {
				$html .= '<option value="' . esc_attr( $option['value'] ) . '"' . ( in_array( $option['value'], $picked, true ) ? ' selected' : '' ) . '>' . esc_html( $option['label'] ) . '</option>';
			}
			return $html . '</select>';
		}

		$input_type = 'text';
		$extra      = '';
		if ( 'email' === $type ) {
			$input_type = 'email';
		} elseif ( 'phone' === $type ) {
			$input_type = 'tel';
		} elseif ( 'date' === $type ) {
			$input_type = 'date';
			$min        = ContactFormSchema::date_or_empty( $attrs['minDate'] ?? '' );
			$max_date   = ContactFormSchema::date_or_empty( $attrs['maxDate'] ?? '' );
			$extra     .= '' !== $min ? ' min="' . esc_attr( $min ) . '"' : '';
			$extra     .= '' !== $max_date ? ' max="' . esc_attr( $max_date ) . '"' : '';
			$max        = 0;
		} elseif ( 'text' === $type ) {
			$sub        = (string) ( $attrs['inputType'] ?? 'text' );
			$input_type = in_array( $sub, array( 'text', 'url', 'number' ), true ) ? $sub : 'text';
			$min_len    = absint( $attrs['minLength'] ?? 0 );
			$extra     .= $min_len > 0 && 'number' !== $input_type ? ' minlength="' . esc_attr( (string) $min_len ) . '"' : '';
			if ( 'number' === $input_type ) {
				foreach ( array( 'min', 'max' ) as $bound ) {
					$b = $attrs[ $bound ] ?? '';
					if ( '' !== $b && is_numeric( $b ) ) {
						$extra .= ' ' . $bound . '="' . esc_attr( (string) $b ) . '"';
					}
				}
				$extra .= ' step="any"';
				$max    = 0;
			}
		}

		return '<input type="' . esc_attr( $input_type ) . '" name="' . esc_attr( $name ) . '" value="' . esc_attr( is_scalar( $value ) ? (string) $value : '' ) . '"'
			. ( $max > 0 ? ' maxlength="' . esc_attr( (string) $max ) . '"' : '' )
			. ( 'date' === $type ? '' : $ph_attr ) . $extra . $common . ' />';
	}

	/**
	 * Radio buttons or checkboxes.
	 *
	 * @param array  $attrs    Attributes.
	 * @param string $name     Input name.
	 * @param string $id       Base id.
	 * @param mixed  $value    Current value(s).
	 * @param bool   $required Required.
	 * @param string $label_id Id of the group label.
	 * @param string $aria     Escaped aria attributes.
	 * @return string
	 */
	private static function choices( array $attrs, string $name, string $id, $value, bool $required, string $label_id, string $aria ): string {
		$checkbox = 'checkbox' === ( $attrs['choiceType'] ?? 'radio' );
		$layout   = (string) ( $attrs['choiceLayout'] ?? 'stacked' );
		$layout   = in_array( $layout, array( 'stacked', 'inline', 'columns' ), true ) ? $layout : 'stacked';
		$buttons  = 'buttons' === ( $attrs['choiceDisplay'] ?? 'default' );
		$picked   = is_array( $value ) ? array_map( 'strval', $value ) : ( '' !== (string) $value ? array( (string) $value ) : array() );
		$cols     = max( 1, min( 6, absint( $attrs['choiceColumns'] ?? 2 ) ) );

		$html  = '<div class="ab-cf-choices is-' . esc_attr( $layout ) . ( $buttons ? ' is-buttons' : '' ) . '" role="' . ( $checkbox ? 'group' : 'radiogroup' ) . '" aria-labelledby="' . esc_attr( $label_id ) . '"' . $aria;
		$html .= 'columns' === $layout ? ' style="--ab-cf-ch-cols: ' . esc_attr( (string) $cols ) . '"' : '';
		$html .= '>';
		foreach ( ContactFormSchema::options( $attrs['options'] ?? array() ) as $i => $option ) {
			$opt_id = $id . '-' . $i;
			$html  .= '<label class="ab-cf-choice" for="' . esc_attr( $opt_id ) . '">';
			$html  .= '<input type="' . ( $checkbox ? 'checkbox' : 'radio' ) . '" class="ab-cf-choice__input" id="' . esc_attr( $opt_id ) . '" name="' . esc_attr( $name . ( $checkbox ? '[]' : '' ) ) . '" value="' . esc_attr( $option['value'] ) . '"'
				. ( in_array( $option['value'], $picked, true ) ? ' checked' : '' )
				. ( $required && ! $checkbox ? ' required' : '' ) . ' />';
			$html  .= '<span class="ab-cf-choice__text">' . esc_html( $option['label'] ) . '</span></label>';
		}
		return $html . '</div>';
	}

	/**
	 * A hidden field.
	 *
	 * @param array  $attrs Attributes.
	 * @param string $name  Input name.
	 * @return string
	 */
	private static function hidden( array $attrs, string $name ): string {
		$source = (string) ( $attrs['hiddenSource'] ?? 'static' );
		$value  = '';
		if ( 'static' === $source ) {
			$value = (string) ( $attrs['defaultValue'] ?? '' );
		} elseif ( 'url' === $source ) {
			$value = (string) get_permalink();
		} elseif ( 'title' === $source ) {
			$value = wp_strip_all_tags( (string) get_the_title() );
		}
		$data  = 'param' === $source ? ' data-ab-cf-param="' . esc_attr( sanitize_key( (string) ( $attrs['hiddenParam'] ?? '' ) ) ) . '"' : '';
		$data .= 'url' === $source ? ' data-ab-cf-url' : '';
		return '<input type="hidden" class="ab-cf-hidden" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '"' . $data . ' />';
	}
}
