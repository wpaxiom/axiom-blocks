<?php
/**
 * Contact Form schema.
 *
 * Turns a form's saved inner blocks into the server-side field list the submit
 * handler validates against. The same walk also writes each field's final key
 * back into its parsed block, so the rendered `name` attributes and the stored
 * schema can never disagree.
 *
 * @package AxiomBlocks\Forms
 * @since 1.1.0
 */

namespace AxiomBlocks\Forms;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Builds the field schema of a Contact Form.
 */
class ContactFormSchema {

	/**
	 * Field block name => field type.
	 */
	const FIELD_BLOCKS = array(
		'axiom-blocks/contact-form-text'     => 'text',
		'axiom-blocks/contact-form-email'    => 'email',
		'axiom-blocks/contact-form-phone'    => 'phone',
		'axiom-blocks/contact-form-textarea' => 'textarea',
		'axiom-blocks/contact-form-select'   => 'select',
		'axiom-blocks/contact-form-choices'  => 'choices',
		'axiom-blocks/contact-form-consent'  => 'consent',
		'axiom-blocks/contact-form-date'     => 'date',
		'axiom-blocks/contact-form-hidden'   => 'hidden',
	);

	/**
	 * The fieldset block. It holds fields and is walked like the form itself.
	 */
	const GROUP_BLOCK = 'axiom-blocks/contact-form-group';

	/**
	 * Longest key a field may use.
	 */
	const KEY_MAX = 40;

	/**
	 * Hard caps on stored lengths, per type. A field's own max length can only
	 * lower these.
	 */
	const LENGTH_CAPS = array(
		'text'     => 500,
		'email'    => 254,
		'phone'    => 40,
		'textarea' => 20000,
		'hidden'   => 500,
		'date'     => 10,
	);

	/**
	 * Most options a select or choices field may carry.
	 */
	const OPTIONS_MAX = 100;

	/**
	 * Walk inner blocks, assign final keys, and collect the field schema.
	 *
	 * @param array $inner Parsed inner blocks (by reference: keys are written back).
	 * @return array List of field definitions in document order.
	 */
	public static function build( array &$inner ): array {
		$used   = array();
		$fields = array();
		self::walk( $inner, $used, $fields );
		return $fields;
	}

	/**
	 * Recursive walk over a level of inner blocks.
	 *
	 * @param array $blocks Parsed blocks (by reference).
	 * @param array $used   Keys already taken (by reference).
	 * @param array $fields Collected fields (by reference).
	 * @return void
	 */
	private static function walk( array &$blocks, array &$used, array &$fields ): void {
		foreach ( $blocks as &$child ) {
			$name = (string) ( $child['blockName'] ?? '' );

			if ( self::GROUP_BLOCK === $name ) {
				if ( ! empty( $child['innerBlocks'] ) && is_array( $child['innerBlocks'] ) ) {
					self::walk( $child['innerBlocks'], $used, $fields );
				}
				continue;
			}

			if ( ! isset( self::FIELD_BLOCKS[ $name ] ) ) {
				continue;
			}

			$type  = self::FIELD_BLOCKS[ $name ];
			$attrs = isset( $child['attrs'] ) && is_array( $child['attrs'] ) ? $child['attrs'] : array();
			$key   = self::unique_key( self::base_key( $attrs, $type ), $used );

			$child['attrs']             = $attrs;
			$child['attrs']['fieldKey'] = $key;

			$fields[] = self::field( $type, $key, $attrs );
		}
		unset( $child );
	}

	/**
	 * The key a field asks for, before de-duplication.
	 *
	 * @param array  $attrs Field attributes.
	 * @param string $type  Field type.
	 * @return string
	 */
	public static function base_key( array $attrs, string $type ): string {
		foreach ( array( (string) ( $attrs['fieldKey'] ?? '' ), (string) ( $attrs['label'] ?? '' ) ) as $source ) {
			$key = self::slug( $source );
			if ( '' !== $key ) {
				return $key;
			}
		}
		return $type;
	}

	/**
	 * Lowercase, underscore-separated, safe key from any text.
	 *
	 * @param string $text Source text.
	 * @return string
	 */
	public static function slug( string $text ): string {
		$text = strtolower( remove_accents( wp_strip_all_tags( $text ) ) );
		$text = preg_replace( '/[^a-z0-9]+/', '_', $text );
		$text = trim( (string) $text, '_' );
		return substr( $text, 0, self::KEY_MAX );
	}

	/**
	 * Append _2, _3, ... until the key is free, then reserve it.
	 *
	 * @param string $key  Wanted key.
	 * @param array  $used Keys already taken (by reference).
	 * @return string
	 */
	private static function unique_key( string $key, array &$used ): string {
		$final = $key;
		$n     = 2;
		while ( isset( $used[ $final ] ) ) {
			$suffix = '_' . $n;
			$final  = substr( $key, 0, self::KEY_MAX - strlen( $suffix ) ) . $suffix;
			++$n;
		}
		$used[ $final ] = true;
		return $final;
	}

	/**
	 * One field definition for the stored schema.
	 *
	 * @param string $type  Field type.
	 * @param string $key   Final key.
	 * @param array  $attrs Field attributes.
	 * @return array
	 */
	private static function field( string $type, string $key, array $attrs ): array {
		$label = trim( wp_strip_all_tags( (string) ( $attrs['label'] ?? '' ) ) );

		$field = array(
			'key'      => $key,
			'type'     => $type,
			'label'    => '' !== $label ? $label : $key,
			// Consent defaults to required: a consent box nobody has to tick
			// records nothing.
			'required' => (bool) ( $attrs['required'] ?? ( 'consent' === $type ) ),
		);

		if ( isset( self::LENGTH_CAPS[ $type ] ) ) {
			$cap                 = self::LENGTH_CAPS[ $type ];
			$own                 = absint( $attrs['maxLength'] ?? 0 );
			$field['max_length'] = $own > 0 ? min( $own, $cap ) : $cap;
		}

		switch ( $type ) {
			case 'text':
				$input_type          = (string) ( $attrs['inputType'] ?? 'text' );
				$field['input_type'] = in_array( $input_type, array( 'text', 'url', 'number' ), true ) ? $input_type : 'text';
				$field['min_length'] = absint( $attrs['minLength'] ?? 0 );
				if ( 'number' === $field['input_type'] ) {
					$field['min'] = self::number_or_null( $attrs['min'] ?? '' );
					$field['max'] = self::number_or_null( $attrs['max'] ?? '' );
				}
				break;

			case 'select':
				$field['options']  = self::options( $attrs['options'] ?? array() );
				$field['multiple'] = ! empty( $attrs['multiple'] );
				break;

			case 'choices':
				$field['options']  = self::options( $attrs['options'] ?? array() );
				$field['multiple'] = 'checkbox' === ( $attrs['choiceType'] ?? 'radio' );
				break;

			case 'consent':
				// The visible label may carry links; the stored label is its text.
				$field['label'] = '' !== $label ? $label : __( 'Consent', 'axiom-blocks' );
				break;

			case 'date':
				$field['min_date'] = self::date_or_empty( $attrs['minDate'] ?? '' );
				$field['max_date'] = self::date_or_empty( $attrs['maxDate'] ?? '' );
				break;

			case 'hidden':
				$source          = (string) ( $attrs['hiddenSource'] ?? 'static' );
				$field['source'] = in_array( $source, array( 'static', 'url', 'title', 'param' ), true ) ? $source : 'static';
				// A static value is the author's, so the server keeps its own copy
				// and never trusts what the browser posts for it.
				if ( 'static' === $field['source'] ) {
					$field['value'] = sanitize_text_field( (string) ( $attrs['defaultValue'] ?? '' ) );
				}
				$field['required'] = false;
				break;
		}

		return $field;
	}

	/**
	 * Normalize an options list to [ [ 'label' => ..., 'value' => ... ], ... ].
	 *
	 * @param mixed $raw Saved options attribute.
	 * @return array
	 */
	public static function options( $raw ): array {
		if ( ! is_array( $raw ) ) {
			return array();
		}
		$out  = array();
		$seen = array();
		foreach ( $raw as $option ) {
			if ( count( $out ) >= self::OPTIONS_MAX ) {
				break;
			}
			if ( is_string( $option ) ) {
				$option = array( 'label' => $option );
			}
			if ( ! is_array( $option ) ) {
				continue;
			}
			$label = trim( sanitize_text_field( (string) ( $option['label'] ?? '' ) ) );
			$value = trim( sanitize_text_field( (string) ( $option['value'] ?? '' ) ) );
			if ( '' === $value ) {
				$value = $label;
			}
			if ( '' === $value || isset( $seen[ $value ] ) ) {
				continue;
			}
			$seen[ $value ] = true;
			$out[]          = array(
				'label' => '' !== $label ? $label : $value,
				'value' => $value,
			);
		}
		return $out;
	}

	/**
	 * A numeric attribute, or null when unset.
	 *
	 * @param mixed $value Raw value.
	 * @return float|null
	 */
	private static function number_or_null( $value ) {
		if ( '' === $value || null === $value || ! is_numeric( $value ) ) {
			return null;
		}
		return (float) $value;
	}

	/**
	 * A Y-m-d date, or '' when the value is not one.
	 *
	 * @param mixed $value Raw value.
	 * @return string
	 */
	public static function date_or_empty( $value ): string {
		$value = (string) $value;
		if ( ! preg_match( '/^(\d{4})-(\d{2})-(\d{2})$/', $value, $m ) ) {
			return '';
		}
		return checkdate( (int) $m[2], (int) $m[3], (int) $m[1] ) ? $value : '';
	}
}
