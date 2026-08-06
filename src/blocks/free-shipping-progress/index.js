import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABTextControl,
	ABTextareaControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { useDeviceType, resolveResponsive } from '../../components/responsive';
import { resolveTypographyAttrs } from '../../components/typographyTargets';
import { responsiveVarValue } from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const PREVIEW_PERCENT = 55;

/* `barHeight` was historically a bare number (e.g. 4); the re-chrome stores a
 * "px" string. Normalize either form to a px length for CSS. */
const asPxLength = ( v ) => {
	if ( v === '' || v == null ) {
		return undefined;
	}
	const s = String( v );
	return /[a-z%]$/i.test( s ) ? s : `${ s }px`;
};

const FSP_BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const CONT_RADIUS = [
	'containerRadiusTopLeft',
	'containerRadiusTopRight',
	'containerRadiusBottomRight',
	'containerRadiusBottomLeft',
];
const BAR_RADIUS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];

const DESIGN = {
	block: 'fsp',
	targets: [
		{
			noun: __( 'Container', 'axiom-blocks' ),
			border: {
				widthKeys: FSP_BW,
				styleKey: 'borderStyle',
				colorKey: 'borderColor',
				max: 8,
			},
			radius: { prefix: 'container', keys: CONT_RADIUS, max: 40 },
			shadow: { bind: 'containerShadow' },
			size: {
				bind: 'maxWidth',
				label: __( 'Max width', 'axiom-blocks' ),
				responsive: true,
			},
		},
		{
			noun: __( 'Bar', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Track', 'axiom-blocks' ),
					bind: 'barBackground',
					fallback: '#e5e7eb',
				},
				{
					label: __( 'Qualified fill', 'axiom-blocks' ),
					bind: 'qualifiedColor',
					fallback: '#10b981',
				},
			],
			background: {
				full: true,
				prefix: 'bar',
				colorKey: 'barColor',
				image: false,
			},
			radius: { keys: BAR_RADIUS, legacyRadius: 'borderRadius', max: 999 },
			ranges: [
				{
					bind: 'barHeight',
					label: __( 'Height', 'axiom-blocks' ),
					min: 2,
					max: 32,
					default: 4,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Messages', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'messageColor',
				},
			],
			typography: 'message',
		},
	],
};

export function getFspVars( attributes, device = 'Desktop' ) {
	const {
		barColor,
		barBackground,
		qualifiedColor,
		borderColor,
		borderStyle,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		containerRadiusTopLeft,
		containerRadiusTopRight,
		containerRadiusBottomRight,
		containerRadiusBottomLeft,
		containerShadow,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		borderRadius,
		messageColor,
		messageFontFamily,
		messageFontWeight,
		messageFontSize,
		messageLineHeight,
		messageLetterSpacing,
		messageTextTransform,
		messageTextDecoration,
		messageTextAlign,
	} = attributes;
	const anyBw =
		borderTopWidth ||
		borderRightWidth ||
		borderBottomWidth ||
		borderLeftWidth;
	return {
		'--ab-fsp-bar-color': barColor || undefined,
		'--ab-fsp-bar-bg': barBackground || undefined,
		'--ab-fsp-qualified-color': qualifiedColor || undefined,
		'--ab-fsp-bar-height': asPxLength(
			resolveResponsive( attributes, 'barHeight', device )
		),
		// Bar fill — flat color (legacy `barColor`, barBgType empty) is the
		// fallback; gradient (barBgType set) wins via getBackgroundVars.
		...getBackgroundVars( attributes, {
			prefix: 'bar',
			varPrefix: '--ab-fsp-fill',
			colorKey: 'barColor',
		} ),
		// Bar corner radius — per-corner falls back to the legacy single
		// `borderRadius` (a bare number, e.g. 999) so old blocks preview the
		// same as the frontend's render.php fallback.
		'--ab-fsp-radius-tl': radiusTopLeft || `${ borderRadius ?? 999 }px`,
		'--ab-fsp-radius-tr': radiusTopRight || `${ borderRadius ?? 999 }px`,
		'--ab-fsp-radius-br': radiusBottomRight || `${ borderRadius ?? 999 }px`,
		'--ab-fsp-radius-bl': radiusBottomLeft || `${ borderRadius ?? 999 }px`,
		// Container box.
		'--ab-fsp-bc': borderColor || undefined,
		'--ab-fsp-bs': anyBw ? borderStyle || 'solid' : borderStyle || undefined,
		'--ab-fsp-bw-top': borderTopWidth || undefined,
		'--ab-fsp-bw-right': borderRightWidth || undefined,
		'--ab-fsp-bw-bottom': borderBottomWidth || undefined,
		'--ab-fsp-bw-left': borderLeftWidth || undefined,
		'--ab-fsp-cont-radius-tl': containerRadiusTopLeft || undefined,
		'--ab-fsp-cont-radius-tr': containerRadiusTopRight || undefined,
		'--ab-fsp-cont-radius-br': containerRadiusBottomRight || undefined,
		'--ab-fsp-cont-radius-bl': containerRadiusBottomLeft || undefined,
		'--ab-fsp-shadow': containerShadow || undefined,
		// Max width is inline-only (mirrors content-slider): emit the real
		// `max-width` property when set, nothing when unset, so the editor
		// canvas keeps its natural full width.
		maxWidth: responsiveVarValue( attributes, 'maxWidth', device ) || undefined,
		// Messages text.
		'--ab-fsp-msg-color': messageColor || undefined,
		'--ab-fsp-msg-ff': messageFontFamily || undefined,
		'--ab-fsp-msg-fw': messageFontWeight || undefined,
		'--ab-fsp-msg-fs': messageFontSize || undefined,
		'--ab-fsp-msg-lh': messageLineHeight || undefined,
		'--ab-fsp-msg-ls': messageLetterSpacing || undefined,
		'--ab-fsp-msg-tt': messageTextTransform || undefined,
		'--ab-fsp-msg-td': messageTextDecoration || undefined,
		'--ab-fsp-msg-ta': messageTextAlign || undefined,
	};
}

function FreeShippingProgressEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'free-shipping-progress' ) ) {
		return <DisabledBlockMessage blockName="Free Shipping Progress" />;
	}
	const {
		thresholdMode,
		customThreshold,
		messageBefore,
		messageQualified,
		textAlign,
		hideWhenQualified,
		hideWhenEmpty,
	} = attributes;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: `axiom-blocks-fsp is-align-${ textAlign }`,
		style: {
			...useSpacingStyle( attributes ),
			...getFspVars(
				resolveTypographyAttrs( attributes, [ 'message' ], device ),
				device
			),
		},
	} );

	// Editor preview of the "before qualifying" message, with the {amount_left}
	// token replaced by a sample so authors see real text (the frontend builds
	// this from the live cart via Helper::format_message).
	const previewMessage = ( messageBefore || '' ).replace(
		'{amount_left}',
		'$20.00'
	);

	const leading = (
		<>
			<PanelBody
				title={ __( 'Threshold', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<div className="ab-fsp-detected">
					{ thresholdMode === 'auto' ? (
						<>
							{ __( 'Reads the smallest', 'axiom-blocks' ) }{ ' ' }
							<code>min_amount</code>{ ' ' }
							{ __( 'from any active', 'axiom-blocks' ) }{ ' ' }
							<strong>
								{ __( 'Free shipping', 'axiom-blocks' ) }
							</strong>{ ' ' }
							{ __( 'shipping method.', 'axiom-blocks' ) }
						</>
					) : (
						__(
							'Using the custom threshold below — ignores shipping zones.',
							'axiom-blocks'
						)
					) }
				</div>
				<ABSelectControl
					label={ __( 'Detection mode', 'axiom-blocks' ) }
					value={ thresholdMode }
					options={ [
						{
							label: __(
								'Auto (from WooCommerce shipping zones)',
								'axiom-blocks'
							),
							value: 'auto',
						},
						{
							label: __( 'Custom amount', 'axiom-blocks' ),
							value: 'custom',
						},
					] }
					onChange={ ( v ) =>
						setAttributes( { thresholdMode: v } )
					}
				/>
				{ thresholdMode === 'custom' && (
					<ABTextControl
						label={ __( 'Custom threshold', 'axiom-blocks' ) }
						type="number"
						value={ customThreshold }
						onChange={ ( v ) =>
							setAttributes( {
								customThreshold: parseFloat( v ) || 0,
							} )
						}
						placeholder="75"
						help={ __(
							'Cart subtotal (excl. tax) needed to qualify.',
							'axiom-blocks'
						) }
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Messages', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABTextareaControl
					label={ __( 'Before qualifying', 'axiom-blocks' ) }
					value={ messageBefore }
					onChange={ ( v ) =>
						setAttributes( { messageBefore: v } )
					}
					rows={ 2 }
					help={ __(
						'Use {amount_left} for the remaining amount.',
						'axiom-blocks'
					) }
				/>
				<ABTextareaControl
					label={ __( 'After qualifying', 'axiom-blocks' ) }
					value={ messageQualified }
					onChange={ ( v ) =>
						setAttributes( { messageQualified: v } )
					}
					rows={ 2 }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Visibility', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __(
						'Hide when cart is empty',
						'axiom-blocks'
					) }
					checked={ hideWhenEmpty }
					onChange={ ( v ) =>
						setAttributes( { hideWhenEmpty: v } )
					}
				/>
				<ABToggleControl
					label={ __(
						'Hide once free shipping is unlocked',
						'axiom-blocks'
					) }
					checked={ hideWhenQualified }
					onChange={ ( v ) =>
						setAttributes( { hideWhenQualified: v } )
					}
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
				<p className="axiom-blocks-fsp__msg">{ previewMessage }</p>
				<div className="axiom-blocks-fsp__track">
					<div
						className="axiom-blocks-fsp__fill"
						style={ { width: `${ PREVIEW_PERCENT }%` } }
					/>
				</div>
			</div>
		</>
	);
}

export const FreeShippingProgress = {
	name: 'axiom-blocks/free-shipping-progress',
	settings: {
		title: __( 'Free Shipping Progress', 'axiom-blocks' ),
		description: __(
			'Cart progress bar showing how much more a customer needs to spend to qualify for free shipping.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="free-shipping-progress" />,
		edit: FreeShippingProgressEdit,
		save: () => null,
	},
};
