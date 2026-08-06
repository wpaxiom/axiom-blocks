import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useState } from '@wordpress/element';
import {
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import {
	useDeviceType,
	resolveResponsiveAttrs,
} from '../../components/responsive';
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

const CTC_BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const CTC_RADIUS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];

const DESIGN = {
	block: 'ctc',
	targets: [
		{
			noun: __( 'Button', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Button Color', 'axiom-blocks' ),
					bind: 'buttonColor',
					fallback: '#7c3aed',
				},
				{
					label: __( 'Text Color', 'axiom-blocks' ),
					bind: 'buttonTextColor',
					fallback: '#ffffff',
				},
				{
					label: __( 'Copied background', 'axiom-blocks' ),
					bind: 'copiedBgColor',
					fallback: '#00a32a',
					static: true,
				},
			],
			typography: '',
			border: { widthKeys: CTC_BW, colorKey: 'borderColor', max: 8 },
			radius: { keys: CTC_RADIUS, legacyRadius: 'borderRadius', max: 40 },
			shadow: { bind: 'buttonShadow' },
		},
	],
};

/* CSS vars for the wrapper — consumed by style.scss (loaded in editor AND
 * frontend) so the button preview is identical in both. The outline preset's
 * 2px border is reproduced as a fallback when no per-side width is set, so old
 * saved buttons render unchanged. */
export function getCtcVars( attributes ) {
	const {
		buttonStyle,
		buttonColor,
		buttonTextColor,
		borderColor,
		borderStyle,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		borderRadius,
		buttonShadow,
	} = attributes;
	const isOutline = 'outline' === buttonStyle;
	const anyBw =
		borderTopWidth ||
		borderRightWidth ||
		borderBottomWidth ||
		borderLeftWidth;
	const bwFallback = isOutline && ! anyBw ? '2px' : undefined;
	return {
		'--ab-ctc-bg': buttonColor || undefined,
		'--ab-ctc-color':
			( isOutline ? buttonColor : buttonTextColor ) || undefined,
		'--ab-ctc-bc': borderColor || ( isOutline ? buttonColor : undefined ),
		'--ab-ctc-bs':
			anyBw || isOutline
				? borderStyle || 'solid'
				: borderStyle || undefined,
		'--ab-ctc-bw-top': borderTopWidth || bwFallback,
		'--ab-ctc-bw-right': borderRightWidth || bwFallback,
		'--ab-ctc-bw-bottom': borderBottomWidth || bwFallback,
		'--ab-ctc-bw-left': borderLeftWidth || bwFallback,
		'--ab-ctc-radius-tl': radiusTopLeft || undefined,
		'--ab-ctc-radius-tr': radiusTopRight || undefined,
		'--ab-ctc-radius-br': radiusBottomRight || undefined,
		'--ab-ctc-radius-bl': radiusBottomLeft || undefined,
		'--ab-ctc-radius': borderRadius || undefined,
		'--ab-ctc-shadow': buttonShadow || undefined,
	};
}

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
		copiedBgColor,
		displayMode,
		placeholder,
		fontSize,
	} = attributes;

	const [ copied, setCopied ] = useState( false );

	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		[ 'alignment' ],
		device
	);
	const blockProps = useBlockProps( {
		className: `axiom-blocks-copy-to-clipboard axiom-blocks-copy-to-clipboard--align-${ resolved.alignment }`,
		style: {
			...useSpacingStyle( attributes ),
			...getCtcVars( attributes ),
			textAlign: responsiveAlignValue( attributes, 'alignment', device ),
		},
	} );

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

	// Baseline declarations first; typography panel values (when set) override.
	// Background / color / border / radius / shadow are var-driven via
	// style.scss (see getCtcVars) so the editor matches the frontend exactly;
	// only the transient "copied" success state overrides inline.
	const buttonStyles = {
		fontFamily: 'inherit',
		fontWeight: '500',
		fontSize,
		...useTypographyStyle( attributes ),
		padding: '10px 20px',
		cursor: 'pointer',
		display: 'inline-flex',
		alignItems: 'center',
		gap: '8px',
		...( copied
			? { backgroundColor: copiedBgColor, color: '#ffffff' }
			: {} ),
	};

	const icon = copied ? <CheckIcon /> : <CopyIcon />;

	const buttonContent = (
		<button
			onClick={ handleCopy }
			className={ `axiom-blocks-copy-to-clipboard__button ${
				'outline' === buttonStyle ? 'is-outline' : 'is-filled'
			}` }
			style={ buttonStyles }
		>
			{ showIcon && iconPosition === 'left' && icon }
			<span>{ copied ? successText : buttonText }</span>
			{ showIcon && iconPosition === 'right' && icon }
		</button>
	);

	const leading = (
		<>
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
					onChange={ ( v ) => setAttributes( { displayMode: v } ) }
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
					onChange={ ( v ) => setAttributes( { successText: v } ) }
				/>
			</PanelBody>

			<PanelBody title={ __( 'Icon', 'axiom-blocks' ) } initialOpen={ false }>
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
					onChange={ ( v ) => setAttributes( { buttonStyle: v } ) }
				/>
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ leading }
			/>

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
							style={ {
								borderRadius: attributes.borderRadius,
								fontSize,
							} }
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
			const { textToCopy, buttonText, displayMode, placeholder } =
				attributes;
			const blockProps = useBlockProps.save( {
				className: 'axiom-blocks-copy-to-clipboard',
			} );
			return (
				<div { ...blockProps }>
					{ displayMode === 'input' ? (
						<div className="axiom-blocks-copy-to-clipboard__input-row">
							<span className="axiom-blocks-copy-to-clipboard__input">
								{ textToCopy || placeholder }
							</span>
							<span className="axiom-blocks-copy-to-clipboard__button">
								{ buttonText }
							</span>
						</div>
					) : (
						<span className="axiom-blocks-copy-to-clipboard__button">
							{ buttonText }
						</span>
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
