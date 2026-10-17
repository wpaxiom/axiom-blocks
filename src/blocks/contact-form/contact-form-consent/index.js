import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormConsent = createFieldBlock( 'consent', {
	title: __( 'Consent Field', 'axiom-blocks' ),
	description: __(
		'A required checkbox or switch, for terms or privacy consent.',
		'axiom-blocks'
	),
} );
