import { __ } from '@wordpress/i18n';
import { RichText, useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { ABResponsive } from '../../../components/ABResponsive';
import { IconControl } from '../../../components/IconControl';
import { ICON_LIBRARY } from '../../../components/iconLibrary';
import { SizeControl } from '../../../components/SizeControl';
import { useDeviceType } from '../../../components/responsive';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';
import { PlacementRows } from '../FieldEdit';
import {
	ALIGN_MAP,
	BUTTON_WIDTH_MAP,
	partVars,
	placementVars,
	resolveForDevice,
} from '../shared';

const NAME = 'axiom-blocks/contact-form-submit';

const sides = [ 'Top', 'Right', 'Bottom', 'Left' ].map(
	( s ) => `btnBorder${ s }Width`
);
const corners = [ 'TopLeft', 'TopRight', 'BottomRight', 'BottomLeft' ].map(
	( c ) => `btnRadius${ c }`
);

const DESIGN = {
	block: 'cf-submit',
	targets: [
		{
			noun: __( 'Button', 'axiom-blocks' ),
			states: [ 'hover' ],
			align: {
				bind: 'btnAlign',
				label: __( 'Alignment', 'axiom-blocks' ),
				responsive: true,
			},
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'btnColor' },
			],
			background: {
				full: true,
				prefix: 'btn',
				colorKey: 'btnBg',
				statePrefix: { hover: 'btnHover' },
				stateColorKey: { hover: 'btnBgHover' },
				overlay: false,
				image: false,
			},
			typography: '',
			border: {
				widthKeys: sides,
				styleKey: 'btnBorderStyle',
				colorKey: 'btnBorderColor',
				stateBind: {},
				max: 12,
			},
			radius: { keys: corners, max: 64 },
			shadow: { bind: 'btnShadow' },
			padding: { type: 'btnPadding', responsive: true },
			ranges: [
				{
					bind: 'btnHeight',
					label: __( 'Minimum height', 'axiom-blocks' ),
					min: 0,
					max: 120,
				},
				{
					bind: 'btnIconSize',
					label: __( 'Icon size', 'axiom-blocks' ),
					min: 8,
					max: 48,
				},
				{
					bind: 'btnIconGap',
					label: __( 'Icon gap', 'axiom-blocks' ),
					min: 0,
					max: 40,
				},
			],
		},
	],
};

const opts = ( pairs ) =>
	pairs.map( ( [ value, label ] ) => ( { value, label } ) );

function SubmitEdit( { attributes, setAttributes } ) {
	const device = useDeviceType();
	const resolved = resolveForDevice( NAME, attributes, device );

	const style = {
		...placementVars( resolved ),
		...partVars( 'submit', attributes ),
		'--ab-cfb-w': BUTTON_WIDTH_MAP[ resolved.buttonWidth ] || 'auto',
		...useSpacingStyle( attributes ),
	};
	if ( resolved.buttonWidthCustom ) {
		style[ '--ab-cfb-wc' ] = resolved.buttonWidthCustom;
	}
	if ( ALIGN_MAP[ resolved.btnAlign ] ) {
		style[ '--ab-cfb-align' ] = ALIGN_MAP[ resolved.btnAlign ];
	}

	const blockProps = useBlockProps( { className: 'ab-cf-submit', style } );
	const icon =
		attributes.icon && ICON_LIBRARY[ attributes.icon ] ? (
			<span className="ab-cf-button__icon" aria-hidden="true">
				{ ICON_LIBRARY[ attributes.icon ] }
			</span>
		) : null;
	const before = attributes.iconPosition === 'before';

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={
					<>
						<PanelBody
							title={ __( 'Submit Button', 'axiom-blocks' ) }
							initialOpen
						>
							<ABTextControl
								label={ __( 'Label', 'axiom-blocks' ) }
								value={ attributes.label }
								onChange={ ( v ) =>
									setAttributes( { label: v } )
								}
							/>
							<ABTextControl
								label={ __(
									'Label while sending',
									'axiom-blocks'
								) }
								value={ attributes.sendingLabel }
								onChange={ ( v ) =>
									setAttributes( { sendingLabel: v } )
								}
							/>
							<ABToggleControl
								label={ __(
									'Spinner while sending',
									'axiom-blocks'
								) }
								checked={ attributes.showSpinner !== false }
								onChange={ ( v ) =>
									setAttributes( { showSpinner: v } )
								}
							/>
							<IconControl
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
											'before',
											__(
												'Before the label',
												'axiom-blocks'
											),
										],
										[
											'after',
											__(
												'After the label',
												'axiom-blocks'
											),
										],
									] ) }
									onChange={ ( v ) =>
										setAttributes( { iconPosition: v } )
									}
								/>
							) }
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="buttonWidth"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABSelectControl
										label={ __( 'Width', 'axiom-blocks' ) }
										value={ value || inherited || 'auto' }
										options={ opts( [
											[
												'auto',
												__(
													'Fit the label',
													'axiom-blocks'
												),
											],
											[
												'full',
												__(
													'Full width',
													'axiom-blocks'
												),
											],
											[
												'custom',
												__( 'Custom', 'axiom-blocks' ),
											],
										] ) }
										onChange={ setValue }
									/>
								) }
							</ABResponsive>
							{ resolved.buttonWidth === 'custom' && (
								<ABResponsive
									attributes={ attributes }
									setAttributes={ setAttributes }
									attrKey="buttonWidthCustom"
								>
									{ ( { value, setValue, inherited } ) => (
										<SizeControl
											label={ __(
												'Custom width',
												'axiom-blocks'
											) }
											value={
												value === ''
													? inherited || ''
													: value
											}
											onChange={ setValue }
											defaultUnit="px"
										/>
									) }
								</ABResponsive>
							) }
						</PanelBody>
						<PanelBody
							title={ __( 'Placement', 'axiom-blocks' ) }
							initialOpen={ false }
						>
							<PlacementRows
								{ ...{ attributes, setAttributes } }
							/>
						</PanelBody>
					</>
				}
			/>
			<div { ...blockProps }>
				<div className="ab-cf-button" role="presentation">
					{ before && icon }
					<RichText
						tagName="span"
						className="ab-cf-button__label"
						value={ attributes.label }
						allowedFormats={ [] }
						withoutInteractiveFormatting
						placeholder={ __( 'Send message', 'axiom-blocks' ) }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
					{ ! before && icon }
				</div>
			</div>
		</>
	);
}

export const ContactFormSubmit = {
	name: NAME,
	settings: {
		title: __( 'Submit Button', 'axiom-blocks' ),
		description: __( 'The button that sends the form.', 'axiom-blocks' ),
		icon: <BlockIcon slug="contact-form-submit" />,
		edit: SubmitEdit,
		save: () => null,
	},
};
