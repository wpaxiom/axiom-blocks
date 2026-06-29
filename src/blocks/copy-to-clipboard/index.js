import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import {
	ABSelectControl,
	ABTextControl,
	ABColorControl,
	ABToggleControl,
} from '../../components/ABControls';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import { useDeviceType, resolveResponsiveAttrs } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import { responsiveAlignValue } from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

const CopyIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
		<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
	</svg>
);

const CheckIcon = () => (
	<svg
		width="16"
		height="16"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<polyline points="20 6 9 17 4 12" />
	</svg>
);

function CopyToClipboardEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'copy-to-clipboard' ) ) {
		return <DisabledBlockMessage blockName="Copy to Clipboard" />;
	}
	const {
		textToCopy,
		buttonText,
		successText,
		showIcon,
		iconPosition,
		buttonStyle,
		buttonColor,
		buttonTextColor,
		borderRadius,
		fontSize,
		copiedBgColor,
		displayMode,
		placeholder,
		alignment,
	} = attributes;

	const [ copied, setCopied ] = useState( false );

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs( attributes, [ 'alignment' ], device );
	const blockProps = useBlockProps( {
		className: `axiom-blocks-copy-to-clipboard axiom-blocks-copy-to-clipboard--align-${ resolved.alignment }`,
		style: {
			...useSpacingStyle( attributes ),
			textAlign: responsiveAlignValue( attributes, 'alignment', device ),
		},
	} );

	const btnBg = copied
		? copiedBgColor
		: buttonStyle === 'filled'
		? buttonColor
		: 'transparent';
	const btnColor = copied
		? '#ffffff'
		: buttonStyle === 'filled'
		? buttonTextColor
		: buttonColor;
	const btnBorder =
		buttonStyle === 'outline'
			? copied
				? `2px solid ${ copiedBgColor }`
				: `2px solid ${ buttonColor }`
			: 'none';

	// Baseline declarations first; typography panel values (when set) override.
	const buttonStyles = {
		fontFamily: 'inherit',
		fontWeight: '500',
		fontSize,
		...useTypographyStyle( attributes ),
		backgroundColor: btnBg,
		color: btnColor,
		border: btnBorder,
		borderRadius,
		padding: '10px 20px',
		cursor: 'pointer',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		transition: 'all 0.2s ease',
	};

	const handleCopy = () => {
		if ( ! textToCopy ) return;
		navigator.clipboard
			.writeText( textToCopy )
			.then( () => {
				setCopied( true );
				setTimeout( () => setCopied( false ), 2000 );
			} )
			.catch( () => {} );
	};

	const icon = copied ? <CheckIcon /> : <CopyIcon />;

	const buttonContent = (
		<button onClick={ handleCopy } style={ buttonStyles }>
			{ showIcon && iconPosition === 'left' && icon }
			<span>{ copied ? successText : buttonText }</span>
			{ showIcon && iconPosition === 'right' && icon }
		</button>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Content', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Display Mode', 'axiom-blocks' ) }
						value={ displayMode }
						options={ [
							{
								label: __( 'Button Only', 'axiom-blocks' ),
								value: 'button',
							},
							{
								label: __( 'Input + Button', 'axiom-blocks' ),
								value: 'input',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { displayMode: v } )
						}
					/>
					<ABTextControl
						label={ __( 'Text to Copy', 'axiom-blocks' ) }
						value={ textToCopy }
						onChange={ ( v ) => setAttributes( { textToCopy: v } ) }
						placeholder={ __(
							'Enter text or code to copy…',
							'axiom-blocks'
						) }
					/>
					{ displayMode === 'input' && (
						<ABTextControl
							label={ __( 'Placeholder', 'axiom-blocks' ) }
							value={ placeholder }
							onChange={ ( v ) =>
								setAttributes( { placeholder: v } )
							}
						/>
					) }
					<ABTextControl
						label={ __( 'Button Label', 'axiom-blocks' ) }
						value={ buttonText }
						onChange={ ( v ) => setAttributes( { buttonText: v } ) }
					/>
					<ABTextControl
						label={ __( 'Copied Label', 'axiom-blocks' ) }
						value={ successText }
						onChange={ ( v ) =>
							setAttributes( { successText: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show Icon', 'axiom-blocks' ) }
						checked={ showIcon }
						onChange={ ( v ) => setAttributes( { showIcon: v } ) }
					/>
					{ showIcon && (
						<ABSelectControl
							label={ __( 'Icon Position', 'axiom-blocks' ) }
							value={ iconPosition }
							options={ [
								{
									label: __( 'Left', 'axiom-blocks' ),
									value: 'left',
								},
								{
									label: __( 'Right', 'axiom-blocks' ),
									value: 'right',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { iconPosition: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="alignment"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABSelectControl
								label={ __( 'Alignment', 'axiom-blocks' ) }
								value={
									value !== '' && value != null
										? value
										: inherited ?? 'left'
								}
								options={ [
									{
										label: __( 'Left', 'axiom-blocks' ),
										value: 'left',
									},
									{
										label: __( 'Center', 'axiom-blocks' ),
										value: 'center',
									},
									{
										label: __( 'Right', 'axiom-blocks' ),
										value: 'right',
									},
								] }
								onChange={ setValue }
							/>
						) }
					</ABResponsive>
					<ABSelectControl
						label={ __( 'Button Style', 'axiom-blocks' ) }
						value={ buttonStyle }
						options={ [
							{
								label: __( 'Filled', 'axiom-blocks' ),
								value: 'filled',
							},
							{
								label: __( 'Outline', 'axiom-blocks' ),
								value: 'outline',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { buttonStyle: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Button Color', 'axiom-blocks' ) }
						color={ buttonColor }
						defaultColor="#7c3aed"
						onChange={ ( c ) =>
							setAttributes( { buttonColor: c } )
						}
					/>
					<ABColorControl
						label={ __( 'Text Color', 'axiom-blocks' ) }
						color={ buttonTextColor }
						defaultColor="#ffffff"
						onChange={ ( c ) =>
							setAttributes( { buttonTextColor: c } )
						}
					/>
					<ABColorControl
						label={ __( 'Success Color', 'axiom-blocks' ) }
						color={ copiedBgColor }
						defaultColor="#00a32a"
						onChange={ ( c ) =>
							setAttributes( { copiedBgColor: c } )
						}
					/>
					<ABTextControl
						label={ __( 'Border Radius', 'axiom-blocks' ) }
						value={ borderRadius }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: v } )
						}
						help={ __( 'e.g. 4px, 50%', 'axiom-blocks' ) }
					/>
				</PanelBody>

				<TypographyPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					title={ __( 'Button typography', 'axiom-blocks' ) }
					responsive
				/>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="axiom-blocks-copy-to-clipboard__preview-label">
					{ __( 'Copy to Clipboard', 'axiom-blocks' ) }
					<span className="axiom-blocks-copy-to-clipboard__preview-badge">
						{ displayMode === 'input'
							? __( 'input + button', 'axiom-blocks' )
							: __( 'button', 'axiom-blocks' ) }
					</span>
				</div>
				{ displayMode === 'input' ? (
					<div className="axiom-blocks-copy-to-clipboard__input-row">
						<input
							type="text"
							value={ textToCopy }
							placeholder={ placeholder }
							className="axiom-blocks-copy-to-clipboard__input"
							style={ { borderRadius, fontSize } }
						/>
						{ buttonContent }
					</div>
				) : (
					buttonContent
				) }
				<p
					className="axiom-blocks-copy-to-clipboard__hint"
					style={ {
						margin: '8px 0 0',
						fontSize: '11px',
						color: '#6b7280',
						fontStyle: 'italic',
					} }
				>
					{ __(
						'Click the button to copy the text to your clipboard.',
						'axiom-blocks'
					) }
				</p>
			</div>
		</>
	);
}

export const CopyToClipboard = {
	name: 'axiom-blocks/copy-to-clipboard',
	settings: {
		title: __( 'Copy to Clipboard', 'axiom-blocks' ),
		description: __(
			'Copy text or code snippets to clipboard with one click.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="copy-to-clipboard" />,
		edit: CopyToClipboardEdit,
		save: ( { attributes } ) => {
			const { textToCopy, buttonText, displayMode, placeholder } = attributes;
			const blockProps = useBlockProps.save( { className: 'axiom-blocks-copy-to-clipboard' } );
			return (
				<div { ...blockProps }>
					{ displayMode === 'input' ? (
						<div className="axiom-blocks-copy-to-clipboard__input-row">
							<span className="axiom-blocks-copy-to-clipboard__input">{ textToCopy || placeholder }</span>
							<span className="axiom-blocks-copy-to-clipboard__button">{ buttonText }</span>
						</div>
					) : (
						<span className="axiom-blocks-copy-to-clipboard__button">{ buttonText }</span>
					) }
				</div>
			);
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
