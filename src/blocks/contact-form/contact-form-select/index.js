import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormSelect = createFieldBlock( 'select', {
	title: __( 'Select Field', 'axiom-blocks' ),
	description: __( 'A drop-down of options.', 'axiom-blocks' ),
} );
