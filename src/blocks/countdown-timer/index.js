/**
 * Countdown Timer Block
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import {
	ABSelectControl,
	ABTextControl,
	ABToggleControl,
} from '../../components/ABControls';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { ABDateControl } from '../../components/ABDateControl';
import {
	useDeviceType,
	resolveResponsive,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import { useSpacingStyle } from '../../components/SpacingPanel';
import {
	responsiveAlignValue,
	responsiveVarValue,
	ALIGN_FLEX_MAP,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

/**
 * Calculate time remaining
 * @param targetDate
 */
const getTimeRemaining = ( targetDate ) => {
	const total = Date.parse( targetDate ) - Date.now();
	const seconds = Math.floor( ( total / 1000 ) % 60 );
	const minutes = Math.floor( ( total / 1000 / 60 ) % 60 );
	const hours = Math.floor( ( total / ( 1000 * 60 * 60 ) ) % 24 );
	const days = Math.floor( total / ( 1000 * 60 * 60 * 24 ) );

	return {
		total,
		days: Math.max( 0, days ),
		hours: Math.max( 0, hours ),
		minutes: Math.max( 0, minutes ),
		seconds: Math.max( 0, seconds ),
	};
};

/**
 * Format number with leading zero
 * @param num
 */
const formatNumber = ( num ) => String( num ).padStart( 2, '0' );

const CD_BW = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const CD_RADIUS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];

const DESIGN = {
	block: 'cd',
	targets: [
		{
			noun: __( 'Digits', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Digit Color', 'axiom-blocks' ),
					bind: 'digitColor',
					fallback: '#333333',
				},
			],
			background: {
				full: true,
				prefix: 'digitBg',
				colorKey: 'backgroundColor',
			},
			typography: 'digit',
			border: { widthKeys: CD_BW, colorKey: 'borderColor', max: 12 },
			radius: { keys: CD_RADIUS, legacyRadius: 'borderRadius', max: 40 },
			shadow: { bind: 'digitShadow' },
			size: {
				bind: 'digitMinWidth',
				label: __( 'Min width', 'axiom-blocks' ),
				responsive: true,
			},
		},
		{
			noun: __( 'Labels', 'axiom-blocks' ),
			colors: [
				{
					label: __( 'Label Color', 'axiom-blocks' ),
					bind: 'labelColor',
					fallback: '#666666',
				},
			],
			typography: 'label',
		},
	],
};

/* CSS vars for the wrapper — consumed by style.scss (loaded in editor AND
 * frontend) so the unit boxes preview identically in both. The digit box
 * background reuses the shipped `backgroundColor` as the flat-color key, so
 * gradient/image (`digitBg*`) are additive and unset ⇒ byte-identical. */
export function getCdVars( attributes, device = 'Desktop' ) {
	const {
		digitColor,
		labelColor,
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
		digitShadow,
	} = attributes;
	const anyBw =
		borderTopWidth ||
		borderRightWidth ||
		borderBottomWidth ||
		borderLeftWidth;
	return {
		// Flat color (legacy `backgroundColor`, bgType empty) is emitted first so
		// the editor matches the frontend's Background::value() fallback; gradient/
		// image (bgType set) come from getBackgroundVars below, which overrides it.
		'--ab-cd-digit-bg': attributes.backgroundColor || undefined,
		...getBackgroundVars( attributes, {
			prefix: 'digitBg',
			varPrefix: '--ab-cd-digit',
			colorKey: 'backgroundColor',
		} ),
		'--ab-cd-digit-color': digitColor || undefined,
		'--ab-cd-label-color': labelColor || undefined,
		'--ab-cd-bc': borderColor || undefined,
		'--ab-cd-bs': anyBw ? borderStyle || 'solid' : borderStyle || undefined,
		'--ab-cd-bw-top': borderTopWidth || undefined,
		'--ab-cd-bw-right': borderRightWidth || undefined,
		'--ab-cd-bw-bottom': borderBottomWidth || undefined,
		'--ab-cd-bw-left': borderLeftWidth || undefined,
		'--ab-cd-radius-tl': radiusTopLeft || undefined,
		'--ab-cd-radius-tr': radiusTopRight || undefined,
		'--ab-cd-radius-br': radiusBottomRight || undefined,
		'--ab-cd-radius-bl': radiusBottomLeft || undefined,
		'--ab-cd-radius': borderRadius || undefined,
		'--ab-cd-shadow': digitShadow || undefined,
		'--ab-cd-digit-minw': responsiveVarValue(
			attributes,
			'digitMinWidth',
			device
		),
	};
}

/**
 * Block metadata
 */
export const CountdownTimer = {
	name: 'axiom-blocks/countdown-timer',
	settings: {
		title: __( 'Countdown Timer', 'axiom-blocks' ),
		description: __(
			'Live countdown timer with customizable styling.',
			'axiom-blocks'
		),
		category: 'axiom-blocks',
		icon: <BlockIcon slug="countdown-timer" />,
		keywords: [
			__( 'countdown', 'axiom-blocks' ),
			__( 'timer', 'axiom-blocks' ),
			__( 'deadline', 'axiom-blocks' ),
		],
		supports: {
			html: false,
			align: [ 'wide', 'full' ],
		},

		edit: function EditComponent( props ) {
			if ( ! isBlockEnabled( 'countdown-timer' ) ) {
				return <DisabledBlockMessage blockName="Countdown Timer" />;
			}

			const { attributes, setAttributes } = props;
			const {
				targetDate,
				showDays,
				showHours,
				showMinutes,
				showSeconds,
				labelDays,
				labelHours,
				labelMinutes,
				labelSeconds,
				digitFontSize,
				labelFontSize,
				expiredAction,
				expiredMessage,
				redirectUrl,
				layout,
				alignment,
				gap,
			} = attributes;

			const [ timeRemaining, setTimeRemaining ] = useState(
				targetDate ? getTimeRemaining( targetDate ) : null
			);

			useEffect( () => {
				if ( ! targetDate ) {
					const date = new Date();
					date.setDate( date.getDate() + 7 );
					setAttributes( { targetDate: date.toISOString() } );
				}
				// eslint-disable-next-line react-hooks/exhaustive-deps
			}, [] );

			useEffect( () => {
				if ( ! targetDate ) return;
				const interval = setInterval( () => {
					setTimeRemaining( getTimeRemaining( targetDate ) );
				}, 1000 );
				setTimeRemaining( getTimeRemaining( targetDate ) );
				return () => clearInterval( interval );
			}, [ targetDate ] );

			const device = useDeviceType();
			const resolved = resolveResponsiveAttrs(
				attributes,
				[ 'alignment' ],
				device
			);
			const blockProps = useBlockProps( {
				className: `axiom-blocks-countdown axiom-blocks-countdown--${ layout } axiom-blocks-countdown--align-${ resolved.alignment }`,
				style: {
					...useSpacingStyle( attributes ),
					...getCdVars( attributes, device ),
				},
			} );

			// Baseline declarations first; typography panel values (when set)
			// override. Colors are var-driven via style.scss (see getCdVars) so
			// the editor matches the frontend exactly.
			const digitStyle = {
				fontWeight: 'bold',
				lineHeight: '1',
				fontSize: digitFontSize,
				...useTypographyStyle( attributes, 'digit' ),
			};
			const labelStyle = {
				textTransform: 'uppercase',
				letterSpacing: '1px',
				fontSize: labelFontSize,
				...useTypographyStyle( attributes, 'label' ),
				marginTop: '8px',
			};
			const containerStyle = {
				display: 'flex',
				flexWrap: 'wrap',
				gap: resolveResponsive( attributes, 'gap', device ),
				justifyContent: responsiveAlignValue(
					attributes,
					'alignment',
					device,
					ALIGN_FLEX_MAP
				),
				alignItems: responsiveAlignValue(
					attributes,
					'alignment',
					device,
					ALIGN_FLEX_MAP
				),
			};
			const containerDirectionStyle =
				layout === 'vertical' ? { flexDirection: 'column' } : {};

			const isExpired = timeRemaining && timeRemaining.total <= 0;

			const renderUnit = ( value, label ) => (
				<div className="axiom-blocks-countdown__unit">
					<div
						className="axiom-blocks-countdown__digit"
						style={ digitStyle }
					>
						{ timeRemaining ? formatNumber( value ) : '00' }
					</div>
					<div
						className="axiom-blocks-countdown__label"
						style={ labelStyle }
					>
						{ label }
					</div>
				</div>
			);

			const leading = (
				<>
					<PanelBody
						title={ __( 'Target Date', 'axiom-blocks' ) }
						initialOpen={ true }
					>
						<ABDateControl
							label={ __( 'Date & Time', 'axiom-blocks' ) }
							value={ targetDate }
							onChange={ ( v ) =>
								setAttributes( { targetDate: v } )
							}
							time
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Display Units', 'axiom-blocks' ) }
						initialOpen={ false }
					>
						<ABToggleControl
							label={ __( 'Show Days', 'axiom-blocks' ) }
							checked={ showDays }
							onChange={ ( v ) =>
								setAttributes( { showDays: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Show Hours', 'axiom-blocks' ) }
							checked={ showHours }
							onChange={ ( v ) =>
								setAttributes( { showHours: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Show Minutes', 'axiom-blocks' ) }
							checked={ showMinutes }
							onChange={ ( v ) =>
								setAttributes( { showMinutes: v } )
							}
						/>
						<ABToggleControl
							label={ __( 'Show Seconds', 'axiom-blocks' ) }
							checked={ showSeconds }
							onChange={ ( v ) =>
								setAttributes( { showSeconds: v } )
							}
						/>
					</PanelBody>

					<PanelBody
						title={ __( 'Labels', 'axiom-blocks' ) }
						initialOpen={ false }
					>
						{ showDays && (
							<ABTextControl
								label={ __( 'Days Label', 'axiom-blocks' ) }
								value={ labelDays }
								onChange={ ( v ) =>
									setAttributes( { labelDays: v } )
								}
							/>
						) }
						{ showHours && (
							<ABTextControl
								label={ __( 'Hours Label', 'axiom-blocks' ) }
								value={ labelHours }
								onChange={ ( v ) =>
									setAttributes( { labelHours: v } )
								}
							/>
						) }
						{ showMinutes && (
							<ABTextControl
								label={ __(
									'Minutes Label',
									'axiom-blocks'
								) }
								value={ labelMinutes }
								onChange={ ( v ) =>
									setAttributes( { labelMinutes: v } )
								}
							/>
						) }
						{ showSeconds && (
							<ABTextControl
								label={ __(
									'Seconds Label',
									'axiom-blocks'
								) }
								value={ labelSeconds }
								onChange={ ( v ) =>
									setAttributes( { labelSeconds: v } )
								}
							/>
						) }
					</PanelBody>

					<PanelBody
						title={ __( 'Layout', 'axiom-blocks' ) }
						initialOpen={ false }
					>
						<ABSelectControl
							label={ __( 'Layout', 'axiom-blocks' ) }
							value={ layout }
							options={ [
								{
									label: __(
										'Horizontal',
										'axiom-blocks'
									),
									value: 'horizontal',
								},
								{
									label: __( 'Vertical', 'axiom-blocks' ),
									value: 'vertical',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { layout: v } )
							}
						/>
						<ABResponsive
							attributes={ attributes }
							setAttributes={ setAttributes }
							attrKey="alignment"
						>
							{ ( { value, setValue, inherited } ) => (
								<ABSelectControl
									label={ __(
										'Alignment',
										'axiom-blocks'
									) }
									value={
										value !== '' && value != null
											? value
											: inherited ?? 'center'
									}
									options={ [
										{
											label: __(
												'Left',
												'axiom-blocks'
											),
											value: 'left',
										},
										{
											label: __(
												'Center',
												'axiom-blocks'
											),
											value: 'center',
										},
										{
											label: __(
												'Right',
												'axiom-blocks'
											),
											value: 'right',
										},
									] }
									onChange={ setValue }
								/>
							) }
						</ABResponsive>
						<ABResponsive
							attributes={ attributes }
							setAttributes={ setAttributes }
							attrKey="gap"
						>
							{ ( { value, setValue } ) => (
								<ABTextControl
									label={ __(
										'Gap Between Units',
										'axiom-blocks'
									) }
									value={ value }
									onChange={ ( v ) => setValue( v ) }
									help={ __(
										'Example: 20px, 1rem, etc.',
										'axiom-blocks'
									) }
								/>
							) }
						</ABResponsive>
					</PanelBody>

					<PanelBody
						title={ __( 'Expired State', 'axiom-blocks' ) }
						initialOpen={ false }
					>
						<ABSelectControl
							label={ __(
								'When Timer Expires',
								'axiom-blocks'
							) }
							value={ expiredAction }
							options={ [
								{
									label: __(
										'Show Message',
										'axiom-blocks'
									),
									value: 'showMessage',
								},
								{
									label: __( 'Hide Block', 'axiom-blocks' ),
									value: 'hide',
								},
								{
									label: __(
										'Redirect to URL',
										'axiom-blocks'
									),
									value: 'redirect',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { expiredAction: v } )
							}
						/>
						{ expiredAction === 'showMessage' && (
							<ABTextControl
								label={ __(
									'Expired Message',
									'axiom-blocks'
								) }
								value={ expiredMessage }
								onChange={ ( v ) =>
									setAttributes( { expiredMessage: v } )
								}
							/>
						) }
						{ expiredAction === 'redirect' && (
							<ABTextControl
								label={ __(
									'Redirect URL',
									'axiom-blocks'
								) }
								value={ redirectUrl }
								onChange={ ( v ) =>
									setAttributes( { redirectUrl: v } )
								}
								placeholder="https://example.com"
							/>
						) }
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
						{ isExpired ? (
							<div className="axiom-blocks-countdown__expired">
								{ expiredAction === 'showMessage'
									? expiredMessage
									: __( '(Timer expired)', 'axiom-blocks' ) }
							</div>
						) : (
							<div
								className="axiom-blocks-countdown__container"
								style={ {
									...containerStyle,
									...containerDirectionStyle,
								} }
								data-target-date={ targetDate }
							>
								{ showDays &&
									renderUnit(
										timeRemaining
											? timeRemaining.days
											: 0,
										labelDays
									) }
								{ showHours &&
									renderUnit(
										timeRemaining
											? timeRemaining.hours
											: 0,
										labelHours
									) }
								{ showMinutes &&
									renderUnit(
										timeRemaining
											? timeRemaining.minutes
											: 0,
										labelMinutes
									) }
								{ showSeconds &&
									renderUnit(
										timeRemaining
											? timeRemaining.seconds
											: 0,
										labelSeconds
									) }
							</div>
						) }
					</div>
				</>
			);
		},

		save: function SaveComponent( { attributes } ) {
			const {
				showDays,
				showHours,
				showMinutes,
				showSeconds,
				labelDays,
				labelHours,
				labelMinutes,
				labelSeconds,
			} = attributes;
			const blockProps = useBlockProps.save( {
				className: 'axiom-blocks-countdown',
			} );
			return (
				<div { ...blockProps }>
					<div
						className="axiom-blocks-countdown__container"
						style={ {
							display: 'flex',
							gap: '20px',
							flexWrap: 'wrap',
						} }
					>
						{ showDays && (
							<div className="axiom-blocks-countdown__unit">
								<span className="axiom-blocks-countdown__digit">
									00
								</span>{ ' ' }
								<span className="axiom-blocks-countdown__label">
									{ labelDays }
								</span>
							</div>
						) }
						{ showHours && (
							<div className="axiom-blocks-countdown__unit">
								<span className="axiom-blocks-countdown__digit">
									00
								</span>{ ' ' }
								<span className="axiom-blocks-countdown__label">
									{ labelHours }
								</span>
							</div>
						) }
						{ showMinutes && (
							<div className="axiom-blocks-countdown__unit">
								<span className="axiom-blocks-countdown__digit">
									00
								</span>{ ' ' }
								<span className="axiom-blocks-countdown__label">
									{ labelMinutes }
								</span>
							</div>
						) }
						{ showSeconds && (
							<div className="axiom-blocks-countdown__unit">
								<span className="axiom-blocks-countdown__digit">
									00
								</span>{ ' ' }
								<span className="axiom-blocks-countdown__label">
									{ labelSeconds }
								</span>
							</div>
						) }
					</div>
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
