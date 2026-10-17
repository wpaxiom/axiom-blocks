import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormHidden = createFieldBlock( 'hidden', {
	title: __( 'Hidden Field', 'axiom-blocks' ),
	description: __(
		'A value sent with the form but not shown: fixed text, page URL, page title or a URL parameter.',
		'axiom-blocks'
	),
} );
