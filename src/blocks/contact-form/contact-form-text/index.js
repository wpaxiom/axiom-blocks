import { __ } from '@wordpress/i18n';
import { createFieldBlock } from '../FieldEdit';

export const ContactFormText = createFieldBlock( 'text', {
	title: __( 'Text Field', 'axiom-blocks' ),
	description: __(
		'A single-line field: name, website, number or any short text.',
		'axiom-blocks'
	),
	variations: [
		{
			name: 'name',
			title: __( 'Name Field', 'axiom-blocks' ),
			description: __( "The visitor's name.", 'axiom-blocks' ),
			keywords: [ __( 'name', 'axiom-blocks' ) ],
			attributes: {
				label: __( 'Name', 'axiom-blocks' ),
				autocomplete: 'name',
				required: true,
			},
			scope: [ 'inserter', 'block' ],
		},
		{
			name: 'website',
			title: __( 'Website Field', 'axiom-blocks' ),
			description: __( 'A web address.', 'axiom-blocks' ),
			keywords: [
				__( 'url', 'axiom-blocks' ),
				__( 'link', 'axiom-blocks' ),
			],
			attributes: {
				label: __( 'Website', 'axiom-blocks' ),
				inputType: 'url',
				autocomplete: 'url',
			},
			scope: [ 'inserter', 'block' ],
		},
		{
			name: 'number',
			title: __( 'Number Field', 'axiom-blocks' ),
			description: __(
				'A number, with optional limits.',
				'axiom-blocks'
			),
			keywords: [
				__( 'number', 'axiom-blocks' ),
				__( 'quantity', 'axiom-blocks' ),
			],
			attributes: {
				label: __( 'Number', 'axiom-blocks' ),
				inputType: 'number',
			},
			scope: [ 'inserter', 'block' ],
		},
	],
} );
