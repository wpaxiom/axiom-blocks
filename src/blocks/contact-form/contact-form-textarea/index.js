import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormTextarea = createFieldBlock( 'textarea', {
	title: __( 'Message Field', 'axiom-blocks' ),
	description: __(
		'A multi-line field for longer messages.',
		'axiom-blocks'
	),
} );
