/**
 * Countdown Timer Block
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, DateTimePicker, Dropdown } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { dateI18n, getSettings } from '@wordpress/date';
import {
	ABSelectControl,
	ABTextControl,
	ABColorControl,
	ABToggleControl,
	ABSubAccordion,
} from '../../components/ABControls';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { useDeviceType, resolveResponsive, resolveResponsiveAttrs } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	responsiveAlignValue,
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

/**
 * Check if block is enabled
 */

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

		attributes: {
			targetDate: { type: 'string', default: '' },
			showDays: { type: 'boolean', default: true },
			showHours: { type: 'boolean', default: true },
			showMinutes: { type: 'boolean', default: true },
			showSeconds: { type: 'boolean', default: true },
			labelDays: { type: 'string', default: 'Days' },
			labelHours: { type: 'string', default: 'Hours' },
			labelMinutes: { type: 'string', default: 'Minutes' },
			labelSeconds: { type: 'string', default: 'Seconds' },
			digitColor: { type: 'string', default: '#333333' },
			labelColor: { type: 'string', default: '#666666' },
			backgroundColor: { type: 'string', default: '#f0f0f0' },
			borderRadius: { type: 'string', default: '8px' },
			digitFontSize: { type: 'string', default: '48px' },
			labelFontSize: { type: 'string', default: '14px' },
			expiredAction: { type: 'string', default: 'showMessage' },
			expiredMessage: { type: 'string', default: "Time's up!" },
			redirectUrl: { type: 'string', default: '' },
			layout: { type: 'string', default: 'horizontal' },
			alignment: { type: 'string', default: 'center' },
			gap: { type: 'string', default: '20px' },
			paddingTop: { type: 'string', default: '' },
			paddingRight: { type: 'string', default: '' },
			paddingBottom: { type: 'string', default: '' },
			paddingLeft: { type: 'string', default: '' },
			marginTop: { type: 'string', default: '' },
			marginRight: { type: 'string', default: '' },
			marginBottom: { type: 'string', default: '' },
			marginLeft: { type: 'string', default: '' },
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
				digitColor,
				labelColor,
				backgroundColor,
				borderRadius,
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
			const settings = getSettings();

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
			const resolved = resolveResponsiveAttrs( attributes, [ 'alignment' ], device );
			const blockProps = useBlockProps( {
				className: `axiom-blocks-countdown axiom-blocks-countdown--${ layout } axiom-blocks-countdown--align-${ resolved.alignment }`,
				style: useSpacingStyle( attributes ),
			} );

			const unitStyle = {
				backgroundColor,
				borderRadius,
				padding: '20px',
				minWidth: '80px',
			};
			// Baseline declarations first; typography panel values (when set) override.
			const digitStyle = {
				fontWeight: 'bold',
				lineHeight: '1',
				fontSize: digitFontSize,
				...useTypographyStyle( attributes, 'digit' ),
				color: digitColor,
			};
			const labelStyle = {
				textTransform: 'uppercase',
				letterSpacing: '1px',
				fontSize: labelFontSize,
				...useTypographyStyle( attributes, 'label' ),
				color: labelColor,
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

			return (
				<>
					<InspectorControls>
						<PanelBody
							title={ __( 'Target Date', 'axiom-blocks' ) }
							initialOpen={ true }
						>
							<div className="ab-ctrl">
								<div className="ab-ctrl__label">
									{ __( 'Date & Time', 'axiom-blocks' ) }
								</div>
								<Dropdown
									className="axiom-blocks-datetime-picker"
									contentClassName="axiom-blocks-datetime-picker__popover"
									popoverProps={ {
										placement: 'bottom-start',
									} }
									renderToggle={ ( { isOpen, onToggle } ) => (
										<button
											type="button"
											className="ab-btn ab-btn--secondary axiom-blocks-datetime-picker__trigger"
											aria-expanded={ isOpen }
											onClick={ onToggle }
										>
											<svg
												viewBox="0 0 16 16"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.6"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<rect
													x="2.5"
													y="3.5"
													width="11"
													height="10"
													rx="1.5"
												/>
												<path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
											</svg>
											<span className="axiom-blocks-datetime-picker__text">
												{ targetDate
													? dateI18n(
															settings.formats
																.datetime,
															targetDate
													  )
													: __(
															'Select date',
															'axiom-blocks'
													  ) }
											</span>
										</button>
									) }
									renderContent={ () => (
										<DateTimePicker
											currentDate={ targetDate }
											onChange={ ( date ) =>
												setAttributes( {
													targetDate: date,
												} )
											}
											is12Hour={ settings.formats.time.includes(
												'a'
											) }
										/>
									) }
								/>
							</div>
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
									label={ __(
										'Hours Label',
										'axiom-blocks'
									) }
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
										label={ __( 'Alignment', 'axiom-blocks' ) }
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
							<ABTextControl
								label={ __( 'Border Radius', 'axiom-blocks' ) }
								value={ borderRadius }
								onChange={ ( v ) =>
									setAttributes( { borderRadius: v } )
								}
								help={ __(
									'Example: 8px, 50%, etc.',
									'axiom-blocks'
								) }
							/>
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
							title={ __( 'Colors', 'axiom-blocks' ) }
							initialOpen={ false }
						>
							<ABColorControl
								label={ __( 'Digit Color', 'axiom-blocks' ) }
								color={ digitColor }
								defaultColor="#333333"
								onChange={ ( c ) =>
									setAttributes( { digitColor: c } )
								}
							/>
							<ABColorControl
								label={ __( 'Label Color', 'axiom-blocks' ) }
								color={ labelColor }
								defaultColor="#666666"
								onChange={ ( c ) =>
									setAttributes( { labelColor: c } )
								}
							/>
							<ABColorControl
								label={ __(
									'Background Color',
									'axiom-blocks'
								) }
								color={ backgroundColor }
								defaultColor="#f0f0f0"
								onChange={ ( c ) =>
									setAttributes( { backgroundColor: c } )
								}
							/>
						</PanelBody>

						<PanelBody
							title={ __( 'Typography', 'axiom-blocks' ) }
							initialOpen={ false }
						>
							<div className="ab-sub-acc-list">
								<ABSubAccordion
									title={ __( 'Digit', 'axiom-blocks' ) }
								>
									<TypographyPanel
										attributes={ attributes }
										setAttributes={ setAttributes }
										prefix="digit"
										unwrapped
										responsive
									/>
								</ABSubAccordion>
								<ABSubAccordion
									title={ __( 'Label', 'axiom-blocks' ) }
								>
									<TypographyPanel
										attributes={ attributes }
										setAttributes={ setAttributes }
										prefix="label"
										unwrapped
										responsive
									/>
								</ABSubAccordion>
							</div>
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
										label: __(
											'Hide Block',
											'axiom-blocks'
										),
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

						<SpacingPanel
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</InspectorControls>

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
								{ showDays && (
									<div
										className="axiom-blocks-countdown__unit"
										style={ unitStyle }
									>
										<div
											className="axiom-blocks-countdown__digit"
											style={ digitStyle }
										>
											{ timeRemaining
												? formatNumber(
														timeRemaining.days
												  )
												: '00' }
										</div>
										<div
											className="axiom-blocks-countdown__label"
											style={ labelStyle }
										>
											{ labelDays }
										</div>
									</div>
								) }
								{ showHours && (
									<div
										className="axiom-blocks-countdown__unit"
										style={ unitStyle }
									>
										<div
											className="axiom-blocks-countdown__digit"
											style={ digitStyle }
										>
											{ timeRemaining
												? formatNumber(
														timeRemaining.hours
												  )
												: '00' }
										</div>
										<div
											className="axiom-blocks-countdown__label"
											style={ labelStyle }
										>
											{ labelHours }
										</div>
									</div>
								) }
								{ showMinutes && (
									<div
										className="axiom-blocks-countdown__unit"
										style={ unitStyle }
									>
										<div
											className="axiom-blocks-countdown__digit"
											style={ digitStyle }
										>
											{ timeRemaining
												? formatNumber(
														timeRemaining.minutes
												  )
												: '00' }
										</div>
										<div
											className="axiom-blocks-countdown__label"
											style={ labelStyle }
										>
											{ labelMinutes }
										</div>
									</div>
								) }
								{ showSeconds && (
									<div
										className="axiom-blocks-countdown__unit"
										style={ unitStyle }
									>
										<div
											className="axiom-blocks-countdown__digit"
											style={ digitStyle }
										>
											{ timeRemaining
												? formatNumber(
														timeRemaining.seconds
												  )
												: '00' }
										</div>
										<div
											className="axiom-blocks-countdown__label"
											style={ labelStyle }
										>
											{ labelSeconds }
										</div>
									</div>
								) }
							</div>
						) }
					</div>
				</>
			);
		},

		save: function SaveComponent( { attributes } ) {
			const {
				showDays, showHours, showMinutes, showSeconds,
				labelDays, labelHours, labelMinutes, labelSeconds,
			} = attributes;
			const blockProps = useBlockProps.save( { className: 'axiom-blocks-countdown' } );
			return (
				<div { ...blockProps }>
					<div className="axiom-blocks-countdown__container" style={ { display: 'flex', gap: '20px', flexWrap: 'wrap' } }>
						{ showDays && <div className="axiom-blocks-countdown__unit"><span className="axiom-blocks-countdown__digit">00</span> <span className="axiom-blocks-countdown__label">{ labelDays }</span></div> }
						{ showHours && <div className="axiom-blocks-countdown__unit"><span className="axiom-blocks-countdown__digit">00</span> <span className="axiom-blocks-countdown__label">{ labelHours }</span></div> }
						{ showMinutes && <div className="axiom-blocks-countdown__unit"><span className="axiom-blocks-countdown__digit">00</span> <span className="axiom-blocks-countdown__label">{ labelMinutes }</span></div> }
						{ showSeconds && <div className="axiom-blocks-countdown__unit"><span className="axiom-blocks-countdown__digit">00</span> <span className="axiom-blocks-countdown__label">{ labelSeconds }</span></div> }
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
