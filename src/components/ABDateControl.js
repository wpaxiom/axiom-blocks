/**
 * ABDateControl — on-brand date / date-time picker. Renders the ABEditPopover
 * trigger (summary row) and a custom calendar workspace on our tokens (replaces
 * the OS date input / WP's blue DateTimePicker). `time` adds an HH:MM + AM/PM
 * row.
 *
 * Value stays a single ISO string (`toISOString()`), the same contract
 * countdown-timer's `targetDate` already uses (Date.parse-consumable), so a
 * block can adopt this without changing stored data.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { dateI18n, getSettings } from '@wordpress/date';
import { ABEditPopover } from './ABEditPopover';
import { StateTabs } from './StateTabs';

const WEEKDAYS = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];
const MONTHS = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const AMPM = [
	{ label: 'AM', value: 'AM' },
	{ label: 'PM', value: 'PM' },
];

const CalendarIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.6"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 18, height: 18, minWidth: 18, flexShrink: 0 } }
	>
		<rect x="3" y="4" width="18" height="18" rx="2" />
		<path d="M16 2v4M8 2v4M3 10h18" />
	</svg>
);

const Chevron = ( { dir } ) => (
	<svg
		viewBox="0 0 24 24"
		width="18"
		height="18"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d={ dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6' } />
	</svg>
);

const to24 = ( h12, ampm ) => ( ampm === 'PM' ? ( h12 % 12 ) + 12 : h12 % 12 );

export function ABDateControl( { label, value, onChange, time = false } ) {
	const parsed = value ? new Date( value ) : null;
	const selected = parsed && ! isNaN( parsed ) ? parsed : null;
	const anchor = selected || new Date();
	const [ view, setView ] = useState( {
		y: anchor.getFullYear(),
		m: anchor.getMonth(),
	} );

	const settings = getSettings();
	const fmt = time
		? `${ settings.formats.date } ${ settings.formats.time }`
		: settings.formats.date;
	const summary = value ? dateI18n( fmt, value ) : '';

	const hour24 = selected ? selected.getHours() : 9;
	const minute = selected ? selected.getMinutes() : 0;
	const ampm = hour24 >= 12 ? 'PM' : 'AM';
	const hour12 = ( ( hour24 + 11 ) % 12 ) + 1;

	const emit = ( y, m, d, h = hour24, min = minute ) =>
		onChange( new Date( y, m, d, h, min, 0, 0 ).toISOString() );

	const setTime = ( h, min ) => {
		const base = selected || new Date();
		emit( base.getFullYear(), base.getMonth(), base.getDate(), h, min );
	};

	const changeMonth = ( delta ) => {
		const base = new Date( view.y, view.m + delta, 1 );
		setView( { y: base.getFullYear(), m: base.getMonth() } );
	};

	const goToday = () => {
		const now = new Date();
		setView( { y: now.getFullYear(), m: now.getMonth() } );
		emit( now.getFullYear(), now.getMonth(), now.getDate() );
	};

	/* Month grid: leading days of prev month, this month, trailing next. */
	const firstWeekday = new Date( view.y, view.m, 1 ).getDay();
	const daysInMonth = new Date( view.y, view.m + 1, 0 ).getDate();
	const prevDays = new Date( view.y, view.m, 0 ).getDate();
	const cells = [];
	for ( let i = 0; i < firstWeekday; i++ ) {
		cells.push( { out: true, day: prevDays - firstWeekday + 1 + i } );
	}
	for ( let d = 1; d <= daysInMonth; d++ ) {
		cells.push( { day: d } );
	}
	const trailing = ( 7 - ( cells.length % 7 ) ) % 7;
	for ( let i = 1; i <= trailing; i++ ) {
		cells.push( { out: true, day: i } );
	}

	const today = new Date();
	const isToday = ( d ) =>
		today.getFullYear() === view.y &&
		today.getMonth() === view.m &&
		today.getDate() === d;
	const isSelected = ( d ) =>
		selected &&
		selected.getFullYear() === view.y &&
		selected.getMonth() === view.m &&
		selected.getDate() === d;

	return (
		<ABEditPopover
			label={ label }
			title={
				time
					? __( 'Schedule date & time', 'axiom-blocks' )
					: __( 'Select date', 'axiom-blocks' )
			}
			glyph={ <CalendarIcon /> }
			summary={ summary }
			isDefault={ ! value }
			placeholder={ __( 'Select date', 'axiom-blocks' ) }
			onReset={ value ? () => onChange( '' ) : undefined }
		>
			<div className="ab-cal">
				{ time && (
					<div className="ab-cal__time">
						<span className="ab-cal__timef">
							<input
								type="number"
								min="1"
								max="12"
								value={ hour12 }
								onChange={ ( e ) =>
									setTime(
										to24(
											parseInt( e.target.value, 10 ) ||
												12,
											ampm
										),
										minute
									)
								}
							/>
						</span>
						<span className="ab-cal__colon">:</span>
						<span className="ab-cal__timef">
							<input
								type="number"
								min="0"
								max="59"
								value={ String( minute ).padStart( 2, '0' ) }
								onChange={ ( e ) =>
									setTime(
										hour24,
										Math.min(
											59,
											parseInt( e.target.value, 10 ) || 0
										)
									)
								}
							/>
						</span>
						<StateTabs
							className="ab-cal__ampm"
							options={ AMPM }
							value={ ampm }
							onChange={ ( ap ) =>
								setTime( to24( hour12, ap ), minute )
							}
						/>
					</div>
				) }

				<div className="ab-cal__nav">
					<button
						type="button"
						className="ab-cal__navbtn"
						onClick={ () => changeMonth( -1 ) }
						aria-label={ __( 'Previous month', 'axiom-blocks' ) }
					>
						<Chevron dir="left" />
					</button>
					<span className="ab-cal__mo">
						{ MONTHS[ view.m ] } <span>{ view.y }</span>
					</span>
					<button
						type="button"
						className="ab-cal__navbtn"
						onClick={ () => changeMonth( 1 ) }
						aria-label={ __( 'Next month', 'axiom-blocks' ) }
					>
						<Chevron dir="right" />
					</button>
				</div>

				<div className="ab-cal__grid">
					{ WEEKDAYS.map( ( w ) => (
						<div key={ w } className="ab-cal__wk">
							{ w }
						</div>
					) ) }
					{ cells.map( ( c, i ) => (
						<button
							type="button"
							key={ i }
							className={ `ab-cal__d${ c.out ? ' is-out' : '' }${
								! c.out && isToday( c.day ) ? ' is-today' : ''
							}${
								! c.out && isSelected( c.day ) ? ' is-sel' : ''
							}` }
							onClick={ () =>
								! c.out && emit( view.y, view.m, c.day )
							}
							disabled={ c.out }
						>
							{ c.day }
						</button>
					) ) }
				</div>

				<div className="ab-cal__foot">
					<button
						type="button"
						className="ab-ctrl__reset"
						onClick={ goToday }
					>
						{ __( 'Today', 'axiom-blocks' ) }
					</button>
					<button
						type="button"
						className="ab-ctrl__reset ab-cal__clear"
						onClick={ () => onChange( '' ) }
					>
						{ __( 'Clear', 'axiom-blocks' ) }
					</button>
				</div>
			</div>
		</ABEditPopover>
	);
}
