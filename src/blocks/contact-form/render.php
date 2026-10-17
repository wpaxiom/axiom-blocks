<?php
/**
 * Contact Form - frontend render.
 *
 * Emits a real POST form to admin-post.php, so it works with JavaScript off;
 * the view script upgrades it to a no-reload submit against the REST route.
 *
 * Before rendering its fields the form walks them into a schema
 * (ContactFormSchema), which also fixes each field's final key, and registers
 * schema + email settings in the store (ContactFormStore). The page carries
 * only the resulting key; recipients and the field list never reach the
 * browser, and the server validates against what it registered.
 *
 * @package AxiomBlocks
 * @var array    $attributes
 * @var string   $content
 * @var WP_Block $block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use AxiomBlocks\Blocks\GridTracks;
use AxiomBlocks\Blocks\Spacing;
use AxiomBlocks\Forms\ContactFormHandler;
use AxiomBlocks\Forms\ContactFormRender;
use AxiomBlocks\Forms\ContactFormSchema;
use AxiomBlocks\Forms\ContactFormStore;

$axiom_blocks_a     = $attributes ?? array();
$axiom_blocks_inner = $block->parsed_block['innerBlocks'] ?? array();

if ( empty( $axiom_blocks_inner ) ) {
	return;
}

// ── Schema + store ─────────────────────────────────────────────────────────
$axiom_blocks_fields = ContactFormSchema::build( $axiom_blocks_inner );

$axiom_blocks_form_id = sanitize_key( (string) ( $axiom_blocks_a['formId'] ?? '' ) );
if ( '' === $axiom_blocks_form_id ) {
	// A form inserted outside the editor (a pattern, a template) has no id yet.
	$axiom_blocks_form_id = substr( md5( (string) wp_json_encode( $axiom_blocks_fields ) ), 0, 12 );
}

$axiom_blocks_config = array(
	'form_id'          => $axiom_blocks_form_id,
	'name'             => '' !== trim( (string) ( $axiom_blocks_a['formName'] ?? '' ) ) ? sanitize_text_field( (string) $axiom_blocks_a['formName'] ) : __( 'Contact form', 'axiom-blocks' ),
	'to'               => ContactFormHandler::address_list( (string) ( $axiom_blocks_a['emailTo'] ?? '' ), false ),
	'cc'               => ContactFormHandler::address_list( (string) ( $axiom_blocks_a['emailCc'] ?? '' ), false ),
	'bcc'              => ContactFormHandler::address_list( (string) ( $axiom_blocks_a['emailBcc'] ?? '' ), false ),
	'subject'          => sanitize_text_field( (string) ( $axiom_blocks_a['emailSubject'] ?? '' ) ),
	'reply_to_visitor' => ! isset( $axiom_blocks_a['replyToVisitor'] ) || ! empty( $axiom_blocks_a['replyToVisitor'] ),
	'confirmation'     => 'redirect' === ( $axiom_blocks_a['confirmationType'] ?? 'message' ) ? 'redirect' : 'message',
	'success_message'  => sanitize_text_field( (string) ( $axiom_blocks_a['successMessage'] ?? '' ) ),
	'error_message'    => sanitize_text_field( (string) ( $axiom_blocks_a['errorMessage'] ?? '' ) ),
	'redirect_url'     => esc_url_raw( (string) ( $axiom_blocks_a['redirectUrl'] ?? '' ) ),
	'save_entries'     => ! isset( $axiom_blocks_a['saveEntries'] ) || ! empty( $axiom_blocks_a['saveEntries'] ),
	'fields'           => $axiom_blocks_fields,
);
$axiom_blocks_key    = ContactFormStore::register( $axiom_blocks_config );

// ── No-JS state after a redirect back ──────────────────────────────────────
$axiom_blocks_state  = ContactFormHandler::request_state( $axiom_blocks_form_id );
$axiom_blocks_status = (string) ( $axiom_blocks_state['status'] ?? '' );
$axiom_blocks_errors = (array) ( $axiom_blocks_state['errors'] ?? array() );

// ── Fields ─────────────────────────────────────────────────────────────────
// The children read the form's settings from context. The form builds that
// context itself (as Post Filter does): the provided values sit in WP_Block's
// protected available_context, not in the public $block->context.
$axiom_blocks_ctx = array_merge(
	$block->context,
	array(
		'axiom-blocks/cfFormId'         => $axiom_blocks_form_id,
		'axiom-blocks/cfRequiredMarker' => (string) ( $axiom_blocks_a['requiredMarker'] ?? 'asterisk' ),
		'axiom-blocks/cfRequiredText'   => (string) ( $axiom_blocks_a['requiredText'] ?? '' ),
		'axiom-blocks/cfOptionalText'   => (string) ( $axiom_blocks_a['optionalText'] ?? '' ),
		'axiom-blocks/cfHelpPosition'   => (string) ( $axiom_blocks_a['helpPosition'] ?? 'below-input' ),
		'axiom-blocks/cfFloating'       => ! empty( $axiom_blocks_a['floatingLabels'] ),
		'axiom-blocks/cfErrorDisplay'   => (string) ( $axiom_blocks_a['errorDisplay'] ?? 'inline' ),
		'axiom-blocks/cfLabelPosition'  => (string) ( $axiom_blocks_a['labelPosition'] ?? 'above' ),
	)
);

ContactFormRender::set_state( $axiom_blocks_state );
$axiom_blocks_children = '';
foreach ( $axiom_blocks_inner as $axiom_blocks_child ) {
	$axiom_blocks_children .= ( new WP_Block( $axiom_blocks_child, $axiom_blocks_ctx ) )->render();
}
ContactFormRender::set_state( array() );

// ── Wrapper style ──────────────────────────────────────────────────────────
$axiom_blocks_decl = ContactFormRender::vars( 'form', $axiom_blocks_a );
$axiom_blocks_decl = array_merge( $axiom_blocks_decl, ContactFormRender::label_position_vars( (string) ( $axiom_blocks_a['labelPosition'] ?? 'above' ) ) );

$axiom_blocks_decl[] = '--ab-cf-cols: ' . GridTracks::template( $axiom_blocks_a['columns'] ?? 1, $axiom_blocks_a['tracks'] ?? '' );
if ( in_array( (string) ( $axiom_blocks_a['rowAlign'] ?? '' ), ContactFormRender::ROW_ALIGN, true ) ) {
	$axiom_blocks_decl[] = '--ab-cf-ralign: ' . $axiom_blocks_a['rowAlign'];
}
if ( '' !== (string) ( $axiom_blocks_a['labelWidth'] ?? '' ) ) {
	$axiom_blocks_decl[] = '--ab-cf-lw: ' . $axiom_blocks_a['labelWidth'];
}

$axiom_blocks_style = Spacing::merge( implode( '; ', $axiom_blocks_decl ), $axiom_blocks_a );

$axiom_blocks_supports = WP_Block_Supports::get_instance()->apply_block_supports();

$axiom_blocks_classes = array_merge( array( 'ab-cf' ), GridTracks::stacked_classes( $axiom_blocks_a, 'columns', 'tracks', 1 ) );
if ( ! empty( $axiom_blocks_a['floatingLabels'] ) ) {
	$axiom_blocks_classes[] = 'is-floating';
}
if ( in_array( (string) ( $axiom_blocks_a['formAlign'] ?? '' ), array( 'center', 'right' ), true ) ) {
	$axiom_blocks_classes[] = 'is-form-' . $axiom_blocks_a['formAlign'];
}
if ( 'sent' === $axiom_blocks_status && ! empty( $axiom_blocks_a['hideOnSuccess'] ) ) {
	$axiom_blocks_classes[] = 'is-done';
}
if ( ! empty( $axiom_blocks_a['className'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_a['className'];
}
if ( ! empty( $axiom_blocks_supports['class'] ) ) {
	$axiom_blocks_classes[] = $axiom_blocks_supports['class'];
}

$axiom_blocks_style_attr = safecss_filter_attr(
	implode(
		';',
		array_filter(
			array(
				rtrim( trim( $axiom_blocks_supports['style'] ?? '' ), ';' ),
				rtrim( trim( $axiom_blocks_style ), ';' ),
			)
		)
	)
);
$axiom_blocks_id_attr    = $axiom_blocks_supports['id'] ?? '';

// ── Status line ────────────────────────────────────────────────────────────
$axiom_blocks_display = (string) ( $axiom_blocks_a['errorDisplay'] ?? 'inline' );
$axiom_blocks_message = '';
$axiom_blocks_tone    = '';
if ( 'sent' === $axiom_blocks_status ) {
	$axiom_blocks_tone    = 'is-success';
	$axiom_blocks_message = '' !== $axiom_blocks_config['success_message'] ? $axiom_blocks_config['success_message'] : __( 'Thanks, your message has been sent.', 'axiom-blocks' );
} elseif ( '' !== $axiom_blocks_status ) {
	$axiom_blocks_tone    = 'is-error';
	$axiom_blocks_message = (string) ( $axiom_blocks_state['message'] ?? '' );
	if ( '' === $axiom_blocks_message ) {
		$axiom_blocks_message = __( 'Something went wrong and your message was not sent. Please try again.', 'axiom-blocks' );
	}
}

$axiom_blocks_summary = '';
if ( ! empty( $axiom_blocks_errors ) && in_array( $axiom_blocks_display, array( 'summary', 'both' ), true ) ) {
	$axiom_blocks_labels = array_column( $axiom_blocks_fields, 'label', 'key' );
	$axiom_blocks_items  = '';
	foreach ( $axiom_blocks_errors as $axiom_blocks_ekey => $axiom_blocks_emsg ) {
		$axiom_blocks_items .= '<li>' . esc_html( ( $axiom_blocks_labels[ $axiom_blocks_ekey ] ?? $axiom_blocks_ekey ) . ': ' . $axiom_blocks_emsg ) . '</li>';
	}
	$axiom_blocks_summary = '<ul class="ab-cf-summary">' . $axiom_blocks_items . '</ul>';
}

$axiom_blocks_status_html = sprintf(
	'<div class="ab-cf-status %1$s" id="%2$s" role="status" aria-live="polite" tabindex="-1"%3$s><p class="ab-cf-status__text">%4$s</p>%5$s</div>',
	esc_attr( $axiom_blocks_tone ),
	esc_attr( 'ab-cf-' . $axiom_blocks_form_id ),
	'' === $axiom_blocks_message ? ' hidden' : '',
	esc_html( $axiom_blocks_message ),
	$axiom_blocks_summary
);
$axiom_blocks_on_top      = 'bottom' !== ( $axiom_blocks_a['messagePosition'] ?? 'top' );

// ── Strings the view script needs ──────────────────────────────────────────
$axiom_blocks_i18n = array(
	'required' => __( 'This field is required.', 'axiom-blocks' ),
	'email'    => __( 'Enter a valid email address.', 'axiom-blocks' ),
	'url'      => __( 'Enter a valid web address.', 'axiom-blocks' ),
	'number'   => __( 'Enter a number.', 'axiom-blocks' ),
	'phone'    => __( 'Enter a valid phone number.', 'axiom-blocks' ),
	'choose'   => __( 'Please choose at least one option.', 'axiom-blocks' ),
	'consent'  => __( 'Please tick this box to continue.', 'axiom-blocks' ),
	'tooShort' => __( 'This is too short.', 'axiom-blocks' ),
	'range'    => __( 'This value is out of range.', 'axiom-blocks' ),
	'check'    => __( 'Please check the highlighted fields.', 'axiom-blocks' ),
	'success'  => '' !== $axiom_blocks_config['success_message'] ? $axiom_blocks_config['success_message'] : __( 'Thanks, your message has been sent.', 'axiom-blocks' ),
	'error'    => '' !== $axiom_blocks_config['error_message'] ? $axiom_blocks_config['error_message'] : __( 'Something went wrong and your message was not sent. Please try again.', 'axiom-blocks' ),
);
?>
<form
	<?php echo '' !== $axiom_blocks_id_attr ? 'id="' . esc_attr( $axiom_blocks_id_attr ) . '" ' : ''; ?>
	class="<?php echo esc_attr( trim( implode( ' ', array_filter( $axiom_blocks_classes ) ) ) ); ?>"
	<?php echo '' !== $axiom_blocks_style_attr ? ' style="' . esc_attr( $axiom_blocks_style_attr ) . '"' : ''; ?>
	method="post"
	action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>"
	data-ab-cf-endpoint="<?php echo esc_url( rest_url( 'axiom-blocks/v1/contact-form' ) ); ?>"
	data-ab-cf-display="<?php echo esc_attr( $axiom_blocks_display ); ?>"
	data-ab-cf-hide="<?php echo ! empty( $axiom_blocks_a['hideOnSuccess'] ) ? '1' : '0'; ?>"
	data-ab-cf-i18n="<?php echo esc_attr( (string) wp_json_encode( $axiom_blocks_i18n ) ); ?>"
>
	<input type="hidden" name="action" value="<?php echo esc_attr( ContactFormHandler::ACTION ); ?>" />
	<input type="hidden" name="<?php echo esc_attr( ContactFormHandler::KEY_FIELD ); ?>" value="<?php echo esc_attr( $axiom_blocks_key ); ?>" />
	<input type="hidden" name="<?php echo esc_attr( ContactFormHandler::TS_FIELD ); ?>" value="<?php echo esc_attr( ContactFormHandler::timestamp( $axiom_blocks_key, time() ) ); ?>" />
	<div class="ab-cf-hp" aria-hidden="true">
		<label><?php esc_html_e( 'Leave this field empty', 'axiom-blocks' ); ?>
			<input type="text" name="<?php echo esc_attr( ContactFormHandler::HONEYPOT ); ?>" value="" tabindex="-1" autocomplete="off" />
		</label>
	</div>
	<?php
	if ( $axiom_blocks_on_top ) {
		echo $axiom_blocks_status_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped parts above.
	}
	?>
	<div class="ab-cf__fields">
		<?php
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner block HTML; each field escapes its own output.
		echo $axiom_blocks_children;
		?>
	</div>
	<?php
	if ( ! $axiom_blocks_on_top ) {
		echo $axiom_blocks_status_html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Built from escaped parts above.
	}
	?>
</form>
