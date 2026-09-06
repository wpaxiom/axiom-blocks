/**
 * Post Filter — the field anatomy panel shared by all four child controls.
 *
 * Every control in a bar is a label plus a control sized by a width preset, so
 * the rows that shape it live here once instead of in each child. The block
 * passes its own content rows in as children; this adds the shape rows below
 * them.
 */

import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { ABSelectControl, ABToggleControl } from '../../components/ABControls';
import { ABResponsive } from '../../components/ABResponsive';
import { SizeControl } from '../../components/SizeControl';

const WIDTHS = [
	{ label: __( 'Auto', 'axiom-blocks' ), value: '' },
	{ label: __( 'Full', 'axiom-blocks' ), value: 'full' },
	{ label: __( 'Half', 'axiom-blocks' ), value: 'half' },
	{ label: __( 'Custom', 'axiom-blocks' ), value: 'custom' },
];

const LABEL_POSITIONS = [
	{ label: __( 'Above', 'axiom-blocks' ), value: '' },
	{ label: __( 'Inline', 'axiom-blocks' ), value: 'inline' },
	{
		label: __( 'Hidden (screen readers only)', 'axiom-blocks' ),
		value: 'hidden',
	},
];

export function FieldPanel( {
	title,
	attributes,
	setAttributes,
	labelRows = true,
	children,
} ) {
	const { showLabel, labelPosition, width } = attributes;

	return (
		<PanelBody title={ title } initialOpen>
			{ children }
			{ labelRows && (
				<>
					<ABToggleControl
						label={ __( 'Show label', 'axiom-blocks' ) }
						checked={ showLabel !== false }
						onChange={ ( v ) => setAttributes( { showLabel: v } ) }
					/>
					{ showLabel !== false && (
						<>
							<ABSelectControl
								label={ __( 'Label position', 'axiom-blocks' ) }
								value={ labelPosition }
								options={ LABEL_POSITIONS }
								onChange={ ( v ) =>
									setAttributes( { labelPosition: v } )
								}
							/>
							<SizeControl
								label={ __( 'Label gap', 'axiom-blocks' ) }
								value={ attributes.labelGap }
								onChange={ ( v ) =>
									setAttributes( { labelGap: v } )
								}
								defaultUnit="px"
							/>
						</>
					) }
				</>
			) }
			<ABSelectControl
				label={ __( 'Field width', 'axiom-blocks' ) }
				value={ width }
				options={ WIDTHS }
				onChange={ ( v ) => setAttributes( { width: v } ) }
			/>
			{ 'custom' === width && (
				<ABResponsive
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="widthCustom"
				>
					{ ( { value, setValue, inherited } ) => (
						<SizeControl
							label={ __( 'Width', 'axiom-blocks' ) }
							value={ value === '' ? inherited || '' : value }
							onChange={ setValue }
							defaultUnit="px"
						/>
					) }
				</ABResponsive>
			) }
		</PanelBody>
	);
}
