/**
 * Contact Form: the one editor every field block is built from.
 *
 * createFieldBlock( type, meta ) returns a block definition whose canvas
 * matches the markup ContactFormRender prints, so the classes and custom
 * properties the stylesheet reads are the same in both places. Shared rows
 * (label, help, required, key, placement, icon) live here once; each type adds
 * its own rows through TYPE_ROWS.
 */

import { __ } from '@wordpress/i18n';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABRangeControl,
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { ABResponsive } from '../../components/ABResponsive';
import { IconControl } from '../../components/IconControl';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { useCustomIcons } from '../../components/useCustomIcons';
import { useDeviceType } from '../../components/responsive';
import { BlockIcon } from '../../blockIcons';
import { OptionsControl } from './OptionsControl';
import { partVars, placementVars, resolveForDevice, slugKey } from './shared';

const opts = ( pairs ) =>
	pairs.map( ( [ value, label ] ) => ( { value, label } ) );

const AUTOCOMPLETE = opts( [
	[ '', __( 'Browser default', 'axiom-blocks' ) ],
	[ 'off', __( 'Off', 'axiom-blocks' ) ],
	[ 'name', __( 'Full name', 'axiom-blocks' ) ],
	[ 'given-name', __( 'First name', 'axiom-blocks' ) ],
	[ 'family-name', __( 'Last name', 'axiom-blocks' ) ],
	[ 'email', __( 'Email', 'axiom-blocks' ) ],
	[ 'tel', __( 'Phone', 'axiom-blocks' ) ],
	[ 'organization', __( 'Company', 'axiom-blocks' ) ],
	[ 'organization-title', __( 'Job title', 'axiom-blocks' ) ],
	[ 'street-address', __( 'Street address', 'axiom-blocks' ) ],
	[ 'address-level2', __( 'City', 'axiom-blocks' ) ],
	[ 'postal-code', __( 'Postal code', 'axiom-blocks' ) ],
	[ 'country-name', __( 'Country', 'axiom-blocks' ) ],
	[ 'url', __( 'Website', 'axiom-blocks' ) ],
] );

const OVERRIDE_DESIGN = {
	block: 'cf-field',
	targets: [
		{
			noun: __( 'Style override', 'axiom-blocks' ),
			states: [ 'focus' ],
			colors: [
				{
					label: __( 'Label', 'axiom-blocks' ),
					bind: 'ovLabelColor',
					static: true,
				},
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'ovInputColor',
					static: true,
				},
				{
					label: __( 'Background', 'axiom-blocks' ),
					bind: 'ovInputBg',
					static: true,
				},
				{
					label: __( 'Border', 'axiom-blocks' ),
					bind: 'ovInputBorderColor',
				},
			],
			ranges: [
				{
					bind: 'ovInputRadius',
					label: __( 'Radius', 'axiom-blocks' ),
					min: 0,
					max: 64,
				},
				{
					bind: 'ovInputHeight',
					label: __( 'Height', 'axiom-blocks' ),
					min: 0,
					max: 120,
				},
			],
		},
	],
};

/* ── Icon glyph (library or custom) ─────────────────────────────────────── */

function Glyph( { slug, className } ) {
	const { icons } = useCustomIcons();
	if ( ! slug ) {
		return null;
	}
	if ( slug.startsWith( 'custom:' ) ) {
		const custom = icons.find( ( i ) => i.id === slug );
		return custom ? (
			<span
				className={ className }
				aria-hidden="true"
				// eslint-disable-next-line react/no-danger
				dangerouslySetInnerHTML={ { __html: custom.svg } }
			/>
		) : null;
	}
	return ICON_LIBRARY[ slug ] ? (
		<span className={ className } aria-hidden="true">
			{ ICON_LIBRARY[ slug ] }
		</span>
	) : null;
}

/* ── Inspector ──────────────────────────────────────────────────────────── */

function TextRows( { attributes, setAttributes } ) {
	const number = attributes.inputType === 'number';
	return (
		<>
			<ABSelectControl
				label={ __( 'Accepts', 'axiom-blocks' ) }
				value={ attributes.inputType }
				options={ opts( [
					[ 'text', __( 'Any text', 'axiom-blocks' ) ],
					[ 'url', __( 'A web address', 'axiom-blocks' ) ],
					[ 'number', __( 'A number', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { inputType: v } ) }
			/>
			{ number ? (
				<>
					<ABTextControl
						label={ __( 'Smallest number', 'axiom-blocks' ) }
						type="number"
						value={ attributes.min }
						onChange={ ( v ) => setAttributes( { min: v } ) }
					/>
					<ABTextControl
						label={ __( 'Largest number', 'axiom-blocks' ) }
						type="number"
						value={ attributes.max }
						onChange={ ( v ) => setAttributes( { max: v } ) }
					/>
				</>
			) : (
				<>
					<ABTextControl
						label={ __( 'Minimum characters', 'axiom-blocks' ) }
						type="number"
						min={ 0 }
						value={ attributes.minLength || '' }
						onChange={ ( v ) =>
							setAttributes( { minLength: Number( v ) || 0 } )
						}
					/>
					<MaxLength { ...{ attributes, setAttributes } } />
				</>
			) }
		</>
	);
}

function MaxLength( { attributes, setAttributes } ) {
	return (
		<ABTextControl
			label={ __( 'Maximum characters', 'axiom-blocks' ) }
			help={ __( 'Empty uses the built-in limit.', 'axiom-blocks' ) }
			type="number"
			min={ 0 }
			value={ attributes.maxLength || '' }
			onChange={ ( v ) =>
				setAttributes( { maxLength: Number( v ) || 0 } )
			}
		/>
	);
}

const TYPE_ROWS = {
	text: TextRows,
	email: MaxLength,
	phone: MaxLength,
	textarea: ( { attributes, setAttributes } ) => (
		<>
			<ABRangeControl
				label={ __( 'Visible lines', 'axiom-blocks' ) }
				unit=""
				min={ 1 }
				max={ 20 }
				value={ attributes.rows }
				onChange={ ( v ) => setAttributes( { rows: v } ) }
			/>
			<MaxLength { ...{ attributes, setAttributes } } />
			<ABToggleControl
				label={ __( 'Let visitors resize it', 'axiom-blocks' ) }
				checked={ attributes.resize !== false }
				onChange={ ( v ) => setAttributes( { resize: v } ) }
			/>
		</>
	),
	select: ( { attributes, setAttributes } ) => (
		<>
			<OptionsControl
				options={ attributes.options }
				onChange={ ( v ) => setAttributes( { options: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Allow several choices', 'axiom-blocks' ) }
				checked={ !! attributes.multiple }
				onChange={ ( v ) => setAttributes( { multiple: v } ) }
			/>
			{ ! attributes.multiple && (
				<>
					<ABTextControl
						label={ __( 'First line', 'axiom-blocks' ) }
						help={ __(
							'Shown before a choice is made. Empty hides it.',
							'axiom-blocks'
						) }
						value={ attributes.placeholderOption }
						onChange={ ( v ) =>
							setAttributes( { placeholderOption: v } )
						}
					/>
					<IconControl
						label={ __( 'Arrow icon', 'axiom-blocks' ) }
						value={ attributes.chevronIcon }
						fallback="chevron-down"
						clearable
						onChange={ ( v ) =>
							setAttributes( { chevronIcon: v || '' } )
						}
					/>
				</>
			) }
		</>
	),
	choices: ( { attributes, setAttributes } ) => (
		<>
			<OptionsControl
				options={ attributes.options }
				onChange={ ( v ) => setAttributes( { options: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Visitors can pick', 'axiom-blocks' ) }
				value={ attributes.choiceType }
				options={ opts( [
					[ 'radio', __( 'One (radio buttons)', 'axiom-blocks' ) ],
					[
						'checkbox',
						__( 'Several (checkboxes)', 'axiom-blocks' ),
					],
				] ) }
				onChange={ ( v ) => setAttributes( { choiceType: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Look', 'axiom-blocks' ) }
				value={ attributes.choiceDisplay }
				options={ opts( [
					[ 'default', __( 'Boxes with labels', 'axiom-blocks' ) ],
					[ 'buttons', __( 'Buttons', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { choiceDisplay: v } ) }
			/>
			<ABSelectControl
				label={ __( 'Arrange', 'axiom-blocks' ) }
				value={ attributes.choiceLayout }
				options={ opts( [
					[ 'stacked', __( 'One per line', 'axiom-blocks' ) ],
					[ 'inline', __( 'In a row', 'axiom-blocks' ) ],
					[ 'columns', __( 'In columns', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { choiceLayout: v } ) }
			/>
			{ attributes.choiceLayout === 'columns' && (
				<ABRangeControl
					label={ __( 'Columns', 'axiom-blocks' ) }
					unit=""
					min={ 1 }
					max={ 6 }
					value={ attributes.choiceColumns }
					onChange={ ( v ) => setAttributes( { choiceColumns: v } ) }
				/>
			) }
		</>
	),
	consent: ( { attributes, setAttributes } ) => (
		<ABSelectControl
			label={ __( 'Look', 'axiom-blocks' ) }
			value={ attributes.consentDisplay }
			options={ opts( [
				[ 'checkbox', __( 'Checkbox', 'axiom-blocks' ) ],
				[ 'switch', __( 'Switch', 'axiom-blocks' ) ],
			] ) }
			onChange={ ( v ) => setAttributes( { consentDisplay: v } ) }
		/>
	),
	date: ( { attributes, setAttributes } ) => (
		<>
			<ABTextControl
				label={ __( 'Earliest date', 'axiom-blocks' ) }
				type="date"
				value={ attributes.minDate }
				onChange={ ( v ) => setAttributes( { minDate: v } ) }
			/>
			<ABTextControl
				label={ __( 'Latest date', 'axiom-blocks' ) }
				type="date"
				value={ attributes.maxDate }
				onChange={ ( v ) => setAttributes( { maxDate: v } ) }
			/>
		</>
	),
	hidden: ( { attributes, setAttributes } ) => (
		<>
			<ABSelectControl
				label={ __( 'Value', 'axiom-blocks' ) }
				value={ attributes.hiddenSource }
				options={ opts( [
					[ 'static', __( 'Fixed text', 'axiom-blocks' ) ],
					[ 'url', __( 'The page address', 'axiom-blocks' ) ],
					[ 'title', __( 'The page title', 'axiom-blocks' ) ],
					[ 'param', __( 'A URL parameter', 'axiom-blocks' ) ],
				] ) }
				onChange={ ( v ) => setAttributes( { hiddenSource: v } ) }
			/>
			{ attributes.hiddenSource === 'param' ? (
				<ABTextControl
					label={ __( 'Parameter name', 'axiom-blocks' ) }
					help={ __( 'For example utm_source.', 'axiom-blocks' ) }
					value={ attributes.hiddenParam }
					onChange={ ( v ) => setAttributes( { hiddenParam: v } ) }
				/>
			) : (
				( attributes.hiddenSource || 'static' ) === 'static' && (
					<ABTextControl
						label={ __( 'Text', 'axiom-blocks' ) }
						value={ attributes.defaultValue }
						onChange={ ( v ) =>
							setAttributes( { defaultValue: v } )
						}
					/>
				)
			) }
		</>
	),
};

function FieldPanel( { type, meta, attributes, setAttributes } ) {
	const Rows = TYPE_ROWS[ type ];
	const hidden = type === 'hidden';
	const withControl = ! [ 'choices', 'consent', 'hidden' ].includes( type );

	return (
		<>
			<PanelBody title={ meta.title } initialOpen>
				{ type !== 'consent' && (
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						value={ attributes.label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
				) }
				{ ! hidden && type !== 'consent' && (
					<ABToggleControl
						label={ __( 'Show label', 'axiom-blocks' ) }
						help={ __(
							'A hidden label is still read out by screen readers.',
							'axiom-blocks'
						) }
						checked={ attributes.showLabel !== false }
						onChange={ ( v ) => setAttributes( { showLabel: v } ) }
					/>
				) }
				{ withControl && type !== 'select' && type !== 'date' && (
					<ABTextControl
						label={ __( 'Placeholder', 'axiom-blocks' ) }
						value={ attributes.placeholder }
						onChange={ ( v ) =>
							setAttributes( { placeholder: v } )
						}
					/>
				) }
				{ ! hidden && (
					<>
						<ABTextControl
							label={ __( 'Help text', 'axiom-blocks' ) }
							value={ attributes.help }
							onChange={ ( v ) => setAttributes( { help: v } ) }
						/>
						<ABToggleControl
							label={ __( 'Required', 'axiom-blocks' ) }
							checked={ !! attributes.required }
							onChange={ ( v ) =>
								setAttributes( { required: v } )
							}
						/>
					</>
				) }
				{ Rows && <Rows { ...{ attributes, setAttributes } } /> }
				{ withControl && type !== 'select' && (
					<ABTextControl
						label={ __( 'Default value', 'axiom-blocks' ) }
						value={ attributes.defaultValue }
						onChange={ ( v ) =>
							setAttributes( { defaultValue: v } )
						}
					/>
				) }
				{ withControl && (
					<ABSelectControl
						label={ __( 'Browser autofill', 'axiom-blocks' ) }
						value={ attributes.autocomplete }
						options={ AUTOCOMPLETE }
						onChange={ ( v ) =>
							setAttributes( { autocomplete: v } )
						}
					/>
				) }
				<ABTextControl
					label={ __( 'Field key', 'axiom-blocks' ) }
					help={ __(
						'Names this field in emails, entries and {field:key} placeholders. Letters, numbers and underscores. Empty uses the label.',
						'axiom-blocks'
					) }
					placeholder={ slugKey( attributes.label ) || type }
					value={ attributes.fieldKey }
					onChange={ ( v ) =>
						setAttributes( { fieldKey: slugKey( v ) } )
					}
				/>
			</PanelBody>
			{ ! hidden && (
				<PanelBody
					title={ __( 'Placement', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<PlacementRows { ...{ attributes, setAttributes } } />
					{ withControl && (
						<>
							<IconControl
								label={ __(
									'Icon inside the field',
									'axiom-blocks'
								) }
								value={ attributes.icon }
								clearable
								onChange={ ( v ) =>
									setAttributes( { icon: v || '' } )
								}
							/>
							{ attributes.icon && (
								<ABSelectControl
									label={ __(
										'Icon position',
										'axiom-blocks'
									) }
									value={ attributes.iconPosition }
									options={ opts( [
										[
											'start',
											__( 'Start', 'axiom-blocks' ),
										],
										[ 'end', __( 'End', 'axiom-blocks' ) ],
									] ) }
									onChange={ ( v ) =>
										setAttributes( { iconPosition: v } )
									}
								/>
							) }
						</>
					) }
				</PanelBody>
			) }
		</>
	);
}

/**
 * Span + order rows, shared by fields, the group and the submit button.
 *
 * @param {Object} props               Block props.
 * @param          props.attributes
 * @param          props.setAttributes
 */
export function PlacementRows( { attributes, setAttributes } ) {
	return (
		<>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="span"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABRangeControl
						label={ __(
							'Columns to span (0 = full row)',
							'axiom-blocks'
						) }
						unit=""
						min={ 0 }
						max={ 6 }
						value={
							value === '' || value == null
								? inherited || 0
								: value
						}
						onChange={ setValue }
					/>
				) }
			</ABResponsive>
			<ABResponsive
				attributes={ attributes }
				setAttributes={ setAttributes }
				attrKey="order"
			>
				{ ( { value, setValue, inherited } ) => (
					<ABTextControl
						label={ __( 'Order', 'axiom-blocks' ) }
						help={ __(
							'Lower numbers come first. Use it to reorder fields on one device only.',
							'axiom-blocks'
						) }
						type="number"
						placeholder={ String( inherited ?? 0 ) }
						value={ value }
						onChange={ ( v ) =>
							setValue( v === '' ? '' : Number( v ) )
						}
					/>
				) }
			</ABResponsive>
		</>
	);
}

/* ── Canvas ─────────────────────────────────────────────────────────────── */

function RequiredMark( { required, context } ) {
	if ( required ) {
		const marker = context[ 'axiom-blocks/cfRequiredMarker' ] || 'asterisk';
		if ( marker === 'asterisk' ) {
			return (
				<span className="ab-cf-req" aria-hidden="true">
					{ ' *' }
				</span>
			);
		}
		if ( marker === 'text' && context[ 'axiom-blocks/cfRequiredText' ] ) {
			return (
				<span className="ab-cf-req">
					{ ' ' + context[ 'axiom-blocks/cfRequiredText' ] }
				</span>
			);
		}
		return null;
	}
	const optional = context[ 'axiom-blocks/cfOptionalText' ];
	return optional ? (
		<span className="ab-cf-opt">{ ' ' + optional }</span>
	) : null;
}

function Control( { type, attributes } ) {
	const ph = attributes.placeholder || ' ';
	const common = {
		className: 'ab-cf-control',
		tabIndex: -1,
		readOnly: true,
	};
	if ( type === 'textarea' ) {
		return (
			<textarea
				{ ...common }
				rows={ attributes.rows || 5 }
				placeholder={ ph }
				value={ attributes.defaultValue || '' }
				style={
					attributes.resize === false ? { resize: 'none' } : undefined
				}
			/>
		);
	}
	if ( type === 'select' ) {
		const options = ( attributes.options || [] ).filter(
			( o ) => o?.label
		);
		return (
			<select
				{ ...common }
				multiple={ !! attributes.multiple }
				disabled
				value={ attributes.multiple ? [] : '' }
			>
				{ ! attributes.multiple && attributes.placeholderOption && (
					<option value="">{ attributes.placeholderOption }</option>
				) }
				{ options.map( ( o, i ) => (
					<option key={ i } value={ o.value || o.label }>
						{ o.label }
					</option>
				) ) }
			</select>
		);
	}
	let inputType = 'text';
	if ( type === 'email' ) {
		inputType = 'email';
	} else if ( type === 'phone' ) {
		inputType = 'tel';
	} else if ( type === 'date' ) {
		inputType = 'date';
	} else if ( type === 'text' && attributes.inputType ) {
		inputType = attributes.inputType;
	}
	return (
		<input
			{ ...common }
			type={ inputType }
			placeholder={ type === 'date' ? undefined : ph }
			value={ attributes.defaultValue || '' }
		/>
	);
}

function Choices( { attributes } ) {
	const checkbox = attributes.choiceType === 'checkbox';
	const layout = attributes.choiceLayout || 'stacked';
	const buttons = attributes.choiceDisplay === 'buttons';
	return (
		<div
			className={ `ab-cf-choices is-${ layout }${
				buttons ? ' is-buttons' : ''
			}` }
			style={
				layout === 'columns'
					? {
							'--ab-cf-ch-cols': String(
								attributes.choiceColumns || 2
							),
					  }
					: undefined
			}
		>
			{ ( attributes.options || [] )
				.filter( ( o ) => o?.label )
				.map( ( o, i ) => (
					<span className="ab-cf-choice" key={ i }>
						<input
							type={ checkbox ? 'checkbox' : 'radio' }
							className="ab-cf-choice__input"
							tabIndex={ -1 }
							readOnly
							checked={ i === 0 }
						/>
						<span className="ab-cf-choice__text">{ o.label }</span>
					</span>
				) ) }
		</div>
	);
}

function FieldCanvas( { type, attributes, setAttributes, context } ) {
	const device = useDeviceType();
	const resolved = resolveForDevice(
		`axiom-blocks/contact-form-${ type }`,
		attributes,
		device
	);
	const required = !! attributes.required;
	const icon = attributes.icon;
	const iconEnd = attributes.iconPosition === 'end';
	const helpUp = context[ 'axiom-blocks/cfHelpPosition' ] === 'below-label';
	const floatable = [ 'text', 'email', 'phone', 'textarea' ].includes( type );

	const classes = [ 'ab-cf-field', `ab-cf-field--${ type }` ];
	if ( icon && floatable ) {
		classes.push( iconEnd ? 'has-icon-end' : 'has-icon-start' );
	} else if ( icon && [ 'select', 'date' ].includes( type ) ) {
		classes.push( iconEnd ? 'has-icon-end' : 'has-icon-start' );
	}
	if ( floatable ) {
		classes.push( 'ab-cf-field--floatable' );
	}

	const blockProps = useBlockProps(
		type === 'hidden'
			? { className: 'ab-cf-hidden-chip' }
			: {
					className: classes.join( ' ' ),
					style: {
						...placementVars( resolved ),
						...partVars( 'field', attributes ),
					},
			  }
	);

	if ( type === 'hidden' ) {
		return (
			<div { ...blockProps }>
				<BlockIcon slug="contact-form-hidden" />
				<span>
					{ __( 'Hidden field', 'axiom-blocks' ) }
					{ ': ' }
					<code>
						{ attributes.fieldKey ||
							slugKey( attributes.label ) ||
							'hidden' }
					</code>
				</span>
			</div>
		);
	}

	const labelClass = `ab-cf-label${
		attributes.showLabel === false ? ' screen-reader-text' : ''
	}`;
	const help = attributes.help ? (
		<p className="ab-cf-help">{ attributes.help }</p>
	) : null;
	const error = (
		<p className="ab-cf-error ab-cf-error--preview">
			{ type === 'consent'
				? __( 'Please tick this box to continue.', 'axiom-blocks' )
				: __( 'This field is required.', 'axiom-blocks' ) }
		</p>
	);

	if ( type === 'consent' ) {
		const isSwitch = attributes.consentDisplay === 'switch';
		return (
			<div { ...blockProps }>
				<div
					className={ `ab-cf-consent${
						isSwitch ? ' is-switch' : ''
					}` }
				>
					<input
						type="checkbox"
						className="ab-cf-choice__input"
						tabIndex={ -1 }
						readOnly
						checked={ false }
					/>
					<span className="ab-cf-consent__text">
						<RichText
							tagName="span"
							value={ attributes.label }
							allowedFormats={ [
								'core/link',
								'core/bold',
								'core/italic',
							] }
							placeholder={ __(
								'I agree to the privacy policy.',
								'axiom-blocks'
							) }
							onChange={ ( v ) => setAttributes( { label: v } ) }
						/>
						<RequiredMark
							required={ required }
							context={ context }
						/>
					</span>
				</div>
				{ help }
				{ error }
			</div>
		);
	}

	const label = (
		<span className={ labelClass }>
			<RichText
				tagName="span"
				value={ attributes.label }
				allowedFormats={ [] }
				withoutInteractiveFormatting
				placeholder={ __( 'Label', 'axiom-blocks' ) }
				onChange={ ( v ) => setAttributes( { label: v } ) }
			/>
			<RequiredMark required={ required } context={ context } />
		</span>
	);

	if ( type === 'choices' ) {
		return (
			<div { ...blockProps }>
				{ label }
				{ helpUp && help }
				<Choices attributes={ attributes } />
				{ ! helpUp && help }
				{ error }
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			{ label }
			{ helpUp && help }
			<div className="ab-cf-control-wrap">
				{ icon && ! iconEnd && (
					<Glyph
						slug={ icon }
						className="ab-cf-icon ab-cf-icon--start"
					/>
				) }
				<Control type={ type } attributes={ attributes } />
				{ icon && iconEnd && (
					<Glyph
						slug={ icon }
						className="ab-cf-icon ab-cf-icon--end"
					/>
				) }
				{ type === 'select' && ! attributes.multiple && (
					<Glyph
						slug={ attributes.chevronIcon || 'chevron-down' }
						className="ab-cf-chevron"
					/>
				) }
			</div>
			{ ! helpUp && help }
			{ error }
		</div>
	);
}

/**
 * Build a field block definition.
 *
 * @param {string} type Field type.
 * @param {Object} meta { title, description, variations }.
 * @return {Object} { name, settings }.
 */
export function createFieldBlock( type, meta ) {
	const Edit = ( props ) => {
		const { attributes, setAttributes, context } = props;
		return (
			<>
				<ABInspectorGroups
					attributes={ attributes }
					setAttributes={ setAttributes }
					design={
						type === 'hidden' ? { targets: [] } : OVERRIDE_DESIGN
					}
					spacing={ false }
					leading={
						<FieldPanel
							type={ type }
							meta={ meta }
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					}
				/>
				<FieldCanvas
					type={ type }
					attributes={ attributes }
					setAttributes={ setAttributes }
					context={ context || {} }
				/>
			</>
		);
	};

	return {
		name: `axiom-blocks/contact-form-${ type }`,
		settings: {
			title: meta.title,
			description: meta.description,
			icon: <BlockIcon slug={ `contact-form-${ type }` } />,
			variations: meta.variations || [],
			edit: Edit,
			save: () => null,
		},
	};
}
