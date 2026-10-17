import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormEmail = createFieldBlock( 'email', {
	title: __( 'Email Field', 'axiom-blocks' ),
	description: __(
		'An email address. The first one is used as Reply-To.',
		'axiom-blocks'
	),
} );
