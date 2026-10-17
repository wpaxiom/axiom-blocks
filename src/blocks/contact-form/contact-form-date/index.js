import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormDate = createFieldBlock( 'date', {
	title: __( 'Date Field', 'axiom-blocks' ),
	description: __( 'A date picker.', 'axiom-blocks' ),
} );
