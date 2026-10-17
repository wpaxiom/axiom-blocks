import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import {
	ABRangeControl,
	ABSelectControl,
	ABTextControl,
	ABTextareaControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { ABResponsive } from '../../components/ABResponsive';
import { SizeControl } from '../../components/SizeControl';
import { useDeviceType } from '../../components/responsive';
import { useSpacingStyle } from '../../components/SpacingPanel';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { safeTrackList } from '../css-grid/tracks';
import { BlockIcon } from '../../blockIcons';
import { EmailPanel } from './EmailPanel';
import {
	columnCount,
	formVars,
	gridTemplate,
	newFormId,
	resolveForDevice,
} from './shared';

const NAME = 'axiom-blocks/contact-form';

const FIELD_BLOCKS = [
	'axiom-blocks/contact-form-text',
	'axiom-blocks/contact-form-email',
	'axiom-blocks/contact-form-phone',
	'axiom-blocks/contact-form-textarea',
	'axiom-blocks/contact-form-select',
	'axiom-blocks/contact-form-choices',
	'axiom-blocks/contact-form-consent',
	'axiom-blocks/contact-form-date',
	'axiom-blocks/contact-form-hidden',
];

export const ALLOWED = [
	...FIELD_BLOCKS,
	'axiom-blocks/contact-form-group',
	'axiom-blocks/contact-form-submit',
	'core/heading',
	'core/paragraph',
	'core/separator',
];

const CONTACT_TEMPLATE = [
	[
		'axiom-blocks/contact-form-text',
		{
			label: __( 'Name', 'axiom-blocks' ),
			required: true,
			autocomplete: 'name',
			span: 1,
		},
	],
	[
		'axiom-blocks/contact-form-email',
		{
			label: __( 'Email', 'axiom-blocks' ),
			required: true,
			autocomplete: 'email',
			span: 1,
		},
	],
	[
		'axiom-blocks/contact-form-textarea',
		{ label: __( 'Message', 'axiom-blocks' ), required: true },
	],
	[ 'axiom-blocks/contact-form-submit', {} ],
];

const NEWSLETTER_TEMPLATE = [
	[
		'axiom-blocks/contact-form-email',
		{
			label: __( 'Email', 'axiom-blocks' ),
			placeholder: __( 'you@example.com', 'axiom-blocks' ),
			required: true,
			autocomplete: 'email',
			span: 1,
			icon: 'mail',
		},
	],
	[
		'axiom-blocks/contact-form-submit',
		{ label: __( 'Subscribe', 'axiom-blocks' ), span: 1 },
	],
];

const ENQUIRY_TEMPLATE = [
	[
		'axiom-blocks/contact-form-text',
		{
			label: __( 'Name', 'axiom-blocks' ),
			required: true,
			autocomplete: 'name',
			span: 1,
		},
	],
	[
		'axiom-blocks/contact-form-email',
		{
			label: __( 'Email', 'axiom-blocks' ),
			required: true,
			autocomplete: 'email',
			span: 1,
		},
	],
	[
		'axiom-blocks/contact-form-phone',
		{
			label: __( 'Phone', 'axiom-blocks' ),
			autocomplete: 'tel',
			span: 1,
		},
	],
	[
		'axiom-blocks/contact-form-select',
		{
			label: __( 'Budget', 'axiom-blocks' ),
			span: 1,
			options: [
				{ label: __( 'Under $5k', 'axiom-blocks' ), value: '' },
				{ label: __( '$5k to $20k', 'axiom-blocks' ), value: '' },
				{ label: __( 'Over $20k', 'axiom-blocks' ), value: '' },
			],
		},
	],
	[
		'axiom-blocks/contact-form-choices',
		{
			label: __( 'Services', 'axiom-blocks' ),
			choiceType: 'checkbox',
			choiceDisplay: 'buttons',
			choiceLayout: 'inline',
			options: [
				{ label: __( 'Design', 'axiom-blocks' ), value: '' },
				{ label: __( 'Development', 'axiom-blocks' ), value: '' },
				{ label: __( 'Marketing', 'axiom-blocks' ), value: '' },
			],
		},
	],
	[
		'axiom-blocks/contact-form-textarea',
		{ label: __( 'Project details', 'axiom-blocks' ), required: true },
	],
	[ 'axiom-blocks/contact-form-consent', {} ],
	[
		'axiom-blocks/contact-form-submit',
		{ label: __( 'Send enquiry', 'axiom-blocks' ) },
	],
];

const VARIATIONS = [
	{
		name: 'contact',
		title: __( 'Contact form', 'axiom-blocks' ),
		description: __(
			'Name and email side by side, a message and a button.',
			'axiom-blocks'
		),
		isDefault: true,
		attributes: { columns: 2, columnsMobile: 1 },
		innerBlocks: CONTACT_TEMPLATE,
		scope: [ 'inserter', 'block' ],
	},
	{
		name: 'newsletter',
		title: __( 'Newsletter form', 'axiom-blocks' ),
		description: __(
			'An email field and a button on one row.',
			'axiom-blocks'
		),
		attributes: {
			formName: __( 'Newsletter', 'axiom-blocks' ),
			tracks: '1fr auto',
			tracksMobile: '',
			columnsMobile: 1,
			rowAlign: 'end',
			labelPosition: 'hidden',
			successMessage: __( 'Thanks for subscribing.', 'axiom-blocks' ),
		},
		innerBlocks: NEWSLETTER_TEMPLATE,
		scope: [ 'inserter', 'block' ],
	},
	{
		name: 'enquiry',
		title: __( 'Enquiry form', 'axiom-blocks' ),
		description: __(
			'Contact details, budget, services as buttons, project details and consent.',
			'axiom-blocks'
		),
		attributes: {
			formName: __( 'Enquiry', 'axiom-blocks' ),
			columns: 2,
			columnsMobile: 1,
		},
		innerBlocks: ENQUIRY_TEMPLATE,
		scope: [ 'inserter', 'block' ],
	},
];

const sides = ( p, suffix ) =>
	[ 'Top', 'Right', 'Bottom', 'Left' ].map(
		( s ) => `${ p }Border${ s }${ suffix }`
	);
const corners = ( p ) =>
	[ 'TopLeft', 'TopRight', 'BottomRight', 'BottomLeft' ].map(
		( c ) => `${ p }Radius${ c }`
	);
const border = ( p, extra = {} ) => ( {
	widthKeys: sides( p, 'Width' ),
	styleKey: `${ p }BorderStyle`,
	colorKey: `${ p }BorderColor`,
	max: 12,
	...extra,
} );
const px = ( bind, label, max, extra = {} ) => ( {
	bind,
	label,
	min: 0,
	max,
	units: [ 'px', 'em', 'rem' ],
	...extra,
} );

const DESIGN = {
	block: 'cf',
	targets: [
		{
			noun: __( 'Form', 'axiom-blocks' ),
			align: {
				bind: 'formAlign',
				label: __( 'Form alignment', 'axiom-blocks' ),
			},
			background: {
				full: true,
				prefix: 'form',
				colorKey: 'formBg',
				overlay: false,
			},
			border: border( 'form' ),
			radius: { keys: corners( 'form' ), max: 64 },
			shadow: { bind: 'formShadow' },
			padding: { type: 'formPadding', responsive: true },
			size: {
				bind: 'formMaxWidth',
				label: __( 'Max width', 'axiom-blocks' ),
				responsive: true,
				defaultUnit: 'px',
			},
		},
		{
			noun: __( 'Fields', 'axiom-blocks' ),
			ranges: [
				px( 'rowGap', __( 'Row gap', 'axiom-blocks' ), 120, {
					responsive: true,
				} ),
				px( 'columnGap', __( 'Column gap', 'axiom-blocks' ), 120, {
					responsive: true,
				} ),
			],
		},
		{
			noun: __( 'Label', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'labelColor' },
				{
					label: __( 'Required marker', 'axiom-blocks' ),
					bind: 'requiredColor',
				},
			],
			typography: 'label',
			ranges: [
				px( 'labelGap', __( 'Space to input', 'axiom-blocks' ), 40 ),
			],
		},
		{
			noun: __( 'Input', 'axiom-blocks' ),
			states: [ 'hover', 'focus', 'error' ],
			align: {
				bind: 'inputAlign',
				label: __( 'Text alignment', 'axiom-blocks' ),
			},
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'inputColor' },
				{
					label: __( 'Placeholder', 'axiom-blocks' ),
					bind: 'inputPlaceholder',
					static: true,
				},
			],
			background: { bind: 'inputBg' },
			typography: 'input',
			border: border( 'input', { stateBind: {} } ),
			radius: { keys: corners( 'input' ), max: 64 },
			shadow: { bind: 'inputShadow' },
			padding: { type: 'inputPadding' },
			ranges: [
				px( 'inputHeight', __( 'Height', 'axiom-blocks' ), 120 ),
				px(
					'textareaHeight',
					__( 'Message box height', 'axiom-blocks' ),
					600
				),
			],
		},
		{
			noun: __( 'Icon', 'axiom-blocks' ),
			states: [ 'focus' ],
			colors: [
				{ label: __( 'Icon', 'axiom-blocks' ), bind: 'iconColor' },
				{
					label: __( 'Select arrow', 'axiom-blocks' ),
					bind: 'chevronColor',
					static: true,
				},
			],
			ranges: [
				px( 'iconSize', __( 'Icon size', 'axiom-blocks' ), 48 ),
				px( 'iconGap', __( 'Space to text', 'axiom-blocks' ), 40 ),
				px( 'chevronSize', __( 'Arrow size', 'axiom-blocks' ), 40 ),
			],
		},
		{
			noun: __( 'Choice', 'axiom-blocks' ),
			states: [ 'hover', 'focus', 'checked' ],
			colors: [
				{
					label: __( 'Check mark', 'axiom-blocks' ),
					bind: 'checkColor',
					static: true,
				},
				{
					label: __( 'Label', 'axiom-blocks' ),
					bind: 'choiceLabelColor',
					static: true,
				},
			],
			background: { bind: 'choiceBg' },
			typography: 'choice',
			border: border( 'choice', { stateBind: {} } ),
			ranges: [
				px( 'choiceSize', __( 'Box size', 'axiom-blocks' ), 40 ),
				px( 'choiceRadius', __( 'Box radius', 'axiom-blocks' ), 20 ),
				px( 'choiceGap', __( 'Space between', 'axiom-blocks' ), 40 ),
			],
		},
		{
			noun: __( 'Choice buttons', 'axiom-blocks' ),
			states: [ 'hover', 'checked' ],
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'chbColor' },
			],
			background: { bind: 'chbBg' },
			typography: 'chb',
			border: border( 'chb', { stateBind: {} } ),
			radius: { keys: corners( 'chb' ), max: 64 },
			shadow: { bind: 'chbShadow' },
			padding: { type: 'chbPadding' },
			ranges: [
				px( 'chbGap', __( 'Space between', 'axiom-blocks' ), 40 ),
			],
		},
		{
			noun: __( 'Switch', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Track', 'axiom-blocks' ), bind: 'switchTrack' },
				{
					label: __( 'Track when on', 'axiom-blocks' ),
					bind: 'switchTrackOn',
				},
				{ label: __( 'Thumb', 'axiom-blocks' ), bind: 'switchThumb' },
			],
			ranges: [ px( 'switchSize', __( 'Size', 'axiom-blocks' ), 40 ) ],
		},
		{
			noun: __( 'Help and errors', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Help text', 'axiom-blocks' ), bind: 'helpColor' },
				{
					label: __( 'Error text', 'axiom-blocks' ),
					bind: 'errorColor',
				},
			],
			typography: 'help',
		},
		{
			noun: __( 'Group', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Legend', 'axiom-blocks' ), bind: 'legendColor' },
			],
			background: { bind: 'groupBg' },
			typography: 'legend',
			border: border( 'group' ),
			radius: { keys: corners( 'group' ), max: 64 },
			padding: { type: 'groupPadding' },
		},
		{
			noun: __( 'Messages', 'axiom-blocks' ),
			normalLabel: __( 'Success', 'axiom-blocks' ),
			states: [ 'error' ],
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'msgColor' },
			],
			background: { bind: 'msgBg' },
			typography: 'msg',
			border: border( 'msg', { stateBind: {} } ),
			radius: { keys: corners( 'msg' ), max: 64 },
			padding: { type: 'msgPadding' },
		},
	],
};

const opts = ( pairs ) =>
	pairs.map( ( [ value, label ] ) => ( { value, label } ) );

function FormPanel( { attributes, setAttributes } ) {
	return (
		<PanelBody title={ __( 'Form', 'axiom-blocks' ) } initialOpen>
			<ABTextControl
				label={ __( 'Form name', 'axiom-blocks' ) }
				help={ __(
					'Shown in the email subject and the entries list.',
					'axiom-blocks'
				) }
				value={ attributes.formName }
				onChange={ ( v ) => setAttributes( { formName: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Save entries', 'axiom-blocks' ) }
				help={ __(
					'Keeps every message under Axiom Blocks > Form entries, so nothing is lost if an email fails.',
					'axiom-blocks'
				) }
				checked={ attributes.saveEntries !== false }
				onChange={ ( v ) => setAttributes( { saveEntries: v } ) }
			/>
		</PanelBody>
	);
}

function AfterSubmitPanel( {
	attributes,
	setAttributes,
	preview,
	setPreview,
} ) {
	const redirect = attributes.confirmationType === 'redirect';
	return (
		<PanelBody
			title={ __( 'After submit', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABSelectControl
				label={ __( 'When the form is sent', 'axiom-blocks' ) }
				value={ attributes.confirmationType }
				options={ opts( [
					[ 'message', __( 'Show a message', 'axiom-blocks' ) ],
					[ 'redirect', __( 'Go to another page', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { confirmationType: v } ) }
			/>
			{ redirect ? (
				<ABTextControl
					label={ __( 'Page URL', 'axiom-blocks' ) }
					type="url"
					value={ attributes.redirectUrl }
					onChange={ ( v ) => setAttributes( { redirectUrl: v } ) }
				/>
			) : (
				<>
					<ABTextareaControl
						label={ __( 'Success message', 'axiom-blocks' ) }
						placeholder={ __(
							'Thanks, your message has been sent.',
							'axiom-blocks'
						) }
						rows={ 2 }
						value={ attributes.successMessage }
						onChange={ ( v ) =>
							setAttributes( { successMessage: v } )
						}
					/>
					<ABToggleControl
						label={ __(
							'Hide the form after sending',
							'axiom-blocks'
						) }
						checked={ !! attributes.hideOnSuccess }
						onChange={ ( v ) =>
							setAttributes( { hideOnSuccess: v } )
						}
					/>
				</>
			) }
			<ABTextareaControl
				label={ __( 'Error message', 'axiom-blocks' ) }
				placeholder={ __(
					'Something went wrong and your message was not sent. Please try again.',
					'axiom-blocks'
				) }
				rows={ 2 }
				value={ attributes.errorMessage }
				onChange={ ( v ) => setAttributes( { errorMessage: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Message position', 'axiom-blocks' ) }
				value={ attributes.messagePosition }
				options={ opts( [
					[ 'top', __( 'Above the fields', 'axiom-blocks' ) ],
					[ 'bottom', __( 'Below the fields', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { messagePosition: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Field errors', 'axiom-blocks' ) }
				value={ attributes.errorDisplay }
				options={ opts( [
					[ 'inline', __( 'Under each field', 'axiom-blocks' ) ],
					[
						'summary',
						__( 'As a list in the message', 'axiom-blocks' ),
					],
					[ 'both', __( 'Both', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { errorDisplay: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Preview in the editor', 'axiom-blocks' ) }
				help={ __(
					'Only changes the editor view, so you can style the message and error states.',
					'axiom-blocks'
				) }
				value={ preview }
				options={ opts( [
					[ '', __( 'The form as it loads', 'axiom-blocks' ) ],
					[ 'success', __( 'Success message', 'axiom-blocks' ) ],
					[ 'error', __( 'Errors', 'axiom-blocks' ) ],
				] ) }
				onChange={ setPreview }
			/>
		</PanelBody>
	);
}

function LayoutPanel( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Layout', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="columns"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABRangeControl
						label={ __( 'Columns', 'axiom-blocks' ) }
						unit=""
						min={ 1 }
						max={ 6 }
						value={
							value === '' || value == null
								? inherited || 1
								: value
						}
						onChange={ setValue }
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="tracks"
			>
				{ ( { value, setValue, inherited } ) => (
					<>
						<ABTextControl
							label={ __( 'Custom columns', 'axiom-blocks' ) }
							help={
								value && ! safeTrackList( value )
									? __(
											'Not a valid column list, so equal columns are used. Use values like 2fr 1fr, 1fr auto or 240px 1fr.',
											'axiom-blocks'
									  )
									: __(
											'Optional, overrides Columns. For example 2fr 1fr, or 1fr auto for an email and button on one row.',
											'axiom-blocks'
									  )
							}
							placeholder={ inherited || '' }
							value={ value }
							onChange={ setValue }
						/>
					</>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="rowAlign"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABSelectControl
						label={ __(
							'Line up fields in a row by',
							'axiom-blocks'
						) }
						help={ __(
							'Bottom lines a button up with inputs that have labels.',
							'axiom-blocks'
						) }
						value={ value || inherited || '' }
						options={ opts( [
							[ '', __( 'Top (default)', 'axiom-blocks' ) ],
							[ 'center', __( 'Middle', 'axiom-blocks' ) ],
							[ 'end', __( 'Bottom', 'axiom-blocks' ) ],
							[ 'stretch', __( 'Stretch', 'axiom-blocks' ) ],
						] ) }
						onChange={ setValue }
					/>
				) }
			</ABResponsive>
		</PanelBody>
	);
}

function LabelsPanel( { attributes, setAttributes } ) {
	return (
		<PanelBody
			title={ __( 'Labels', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="labelPosition"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABSelectControl
						label={ __( 'Label position', 'axiom-blocks' ) }
						value={ value || inherited || 'above' }
						options={ opts( [
							[
								'above',
								__( 'Above the field', 'axiom-blocks' ),
							],
							[
								'beside',
								__( 'Beside the field', 'axiom-blocks' ),
							],
							[
								'hidden',
								__(
									'Hidden (screen readers only)',
									'axiom-blocks'
								),
							],
						] ) }
						onChange={ setValue }
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="labelWidth"
			>
				{ ( { value, setValue, inherited } ) => (
					<SizeControl
						label={ __( 'Label width (beside)', 'axiom-blocks' ) }
						value={ value === '' ? inherited || '' : value }
						onChange={ setValue }
						defaultUnit="px"
					/>
				) }
			</ABResponsive>
			<ABToggleControl
				label={ __( 'Floating labels', 'axiom-blocks' ) }
				help={ __(
					'The label sits inside the field and moves up when you type. Applies to text, email, phone and message fields with the label above.',
					'axiom-blocks'
				) }
				checked={ !! attributes.floatingLabels }
				onChange={ ( v ) => setAttributes( { floatingLabels: v } ) }
			/>
			<ABSelectControl
				label={ __(
					'Required fields are marked with',
					'axiom-blocks'
				) }
				value={ attributes.requiredMarker }
				options={ opts( [
					[ 'asterisk', __( 'An asterisk', 'axiom-blocks' ) ],
					[ 'text', __( 'Text', 'axiom-blocks' ) ],
					[ 'none', __( 'Nothing', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { requiredMarker: v } ) }
			/>
			{ attributes.requiredMarker === 'text' && (
				<ABTextControl
					label={ __( 'Required text', 'axiom-blocks' ) }
					value={ attributes.requiredText }
					onChange={ ( v ) => setAttributes( { requiredText: v } ) }
				/>
			) }
			<ABTextControl
				label={ __( 'Mark optional fields with', 'axiom-blocks' ) }
				help={ __(
					'For example (optional). Leave empty to mark nothing.',
					'axiom-blocks'
				) }
				value={ attributes.optionalText }
				onChange={ ( v ) => setAttributes( { optionalText: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Help text position', 'axiom-blocks' ) }
				value={ attributes.helpPosition }
				options={ opts( [
					[ 'below-input', __( 'Below the field', 'axiom-blocks' ) ],
					[ 'below-label', __( 'Below the label', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { helpPosition: v } ) }
			/>
		</PanelBody>
	);
}

/**
 * Give a new or duplicated form its own id. A copy keeps the original's id
 * until this runs, and only the later block in document order is renamed, so
 * the original keeps its id (and the entries filed under it).
 *
 * @param {string}   clientId      Block client id.
 * @param {string}   formId        Current id.
 * @param {Function} setAttributes Setter.
 */
function useUniqueFormId( clientId, formId, setAttributes ) {
	const isDuplicate = useSelect(
		( select ) => {
			if ( ! formId ) {
				return false;
			}
			const store = select( 'core/block-editor' );
			const ids = store.getClientIdsWithDescendants();
			const first = ids.find( ( id ) => {
				const b = store.getBlock( id );
				return b?.name === NAME && b.attributes.formId === formId;
			} );
			return first && first !== clientId;
		},
		[ clientId, formId ]
	);

	useEffect( () => {
		if ( ! formId || isDuplicate ) {
			setAttributes( { formId: newFormId() } );
		}
	}, [ formId, isDuplicate ] ); // eslint-disable-line react-hooks/exhaustive-deps
}

function ContactFormInner( props ) {
	const { attributes, setAttributes, clientId } = props;
	const [ preview, setPreview ] = useState( '' );
	useUniqueFormId( clientId, attributes.formId, setAttributes );

	const device = useDeviceType();
	const resolved = resolveForDevice( NAME, attributes, device );
	const stacked =
		columnCount( gridTemplate( resolved.columns, resolved.tracks ) ) === 1;

	const classes = [ 'ab-cf', 'is-editor' ];
	if ( attributes.floatingLabels ) {
		classes.push( 'is-floating' );
	}
	if ( stacked ) {
		classes.push( 'is-stacked' );
	}
	if ( [ 'center', 'right' ].includes( attributes.formAlign ) ) {
		classes.push( `is-form-${ attributes.formAlign }` );
	}
	if ( preview === 'error' ) {
		classes.push( 'is-preview-error' );
	}
	if ( preview === 'success' && attributes.hideOnSuccess ) {
		classes.push( 'is-done' );
	}

	const blockProps = useBlockProps( {
		className: classes.join( ' ' ),
		style: { ...formVars( resolved ), ...useSpacingStyle( attributes ) },
		'data-ab-cf-display': attributes.errorDisplay || 'inline',
	} );

	const innerProps = useInnerBlocksProps(
		{ className: 'ab-cf__fields' },
		{
			allowedBlocks: ALLOWED,
			template: CONTACT_TEMPLATE,
			templateLock: false,
		}
	);

	let status = null;
	if ( preview ) {
		const text =
			preview === 'success'
				? attributes.successMessage ||
				  __( 'Thanks, your message has been sent.', 'axiom-blocks' )
				: __( 'Please check the highlighted fields.', 'axiom-blocks' );
		status = (
			<div
				className={ `ab-cf-status ${
					preview === 'success' ? 'is-success' : 'is-error'
				}` }
			>
				<p className="ab-cf-status__text">{ text }</p>
				{ preview === 'error' &&
					[ 'summary', 'both' ].includes(
						attributes.errorDisplay
					) && (
						<ul className="ab-cf-summary">
							<li>
								{ __(
									'Email: Enter a valid email address.',
									'axiom-blocks'
								) }
							</li>
						</ul>
					) }
			</div>
		);
	}
	const top = attributes.messagePosition !== 'bottom';

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={
					<>
						<FormPanel { ...{ attributes, setAttributes } } />
						<EmailPanel { ...{ attributes, setAttributes } } />
						<AfterSubmitPanel
							{ ...{
								attributes,
								setAttributes,
								preview,
								setPreview,
							} }
						/>
						<LayoutPanel { ...{ attributes, setAttributes } } />
						<LabelsPanel { ...{ attributes, setAttributes } } />
					</>
				}
			/>
			<form { ...blockProps } onSubmit={ ( e ) => e.preventDefault() }>
				{ top && status }
				<div { ...innerProps } />
				{ ! top && status }
			</form>
		</>
	);
}

function ContactFormEdit( props ) {
	if ( ! isBlockEnabled( 'contact-form' ) ) {
		return <DisabledBlockMessage blockName="Contact Form" />;
	}
	return <ContactFormInner { ...props } />;
}

export const ContactForm = {
	name: NAME,
	settings: {
		title: __( 'Contact Form', 'axiom-blocks' ),
		description: __(
			'A contact form that saves every message and emails it through your site mail or Resend. Works without JavaScript.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="contact-form" />,
		variations: VARIATIONS,
		edit: ContactFormEdit,
		save: () => <InnerBlocks.Content />,
	},
};
