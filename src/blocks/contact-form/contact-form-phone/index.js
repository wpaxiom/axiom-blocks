import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormPhone = createFieldBlock( 'phone', {
	title: __( 'Phone Field', 'axiom-blocks' ),
	description: __( 'A telephone number.', 'axiom-blocks' ),
} );
