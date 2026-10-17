import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormChoices = createFieldBlock( 'choices', {
	title: __( 'Choices Field', 'axiom-blocks' ),
	description: __(
		'Radio buttons or checkboxes, plain or as buttons.',
		'axiom-blocks'
	),
	variations: [
		{
			name: 'radio',
			title: __( 'Radio Buttons', 'axiom-blocks' ),
			description: __( 'Pick one option.', 'axiom-blocks' ),
			keywords: [ __( 'radio', 'axiom-blocks' ) ],
			attributes: { choiceType: 'radio' },
			isActive: [ 'choiceType' ],
			scope: [ 'inserter', 'block', 'transform' ],
		},
		{
			name: 'checkboxes',
			title: __( 'Checkboxes', 'axiom-blocks' ),
			description: __( 'Pick several options.', 'axiom-blocks' ),
			keywords: [ __( 'checkbox', 'axiom-blocks' ) ],
			attributes: { choiceType: 'checkbox' },
			isActive: [ 'choiceType' ],
			scope: [ 'inserter', 'block', 'transform' ],
		},
	],
} );
