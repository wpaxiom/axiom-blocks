/** Shared UI primitives: icons, toggle, badges, stat card, section bar, logo. */

import { __ } from '@wordpress/i18n';
export { BlockIcon } from '../../blockIcons';

/* ── Lucide-style icons ──────────────────────────────────────────────────── */
export const SearchIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
	</svg>
);
export const LockIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
	</svg>
);
export const CheckIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
	</svg>
);
export const DocIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
	</svg>
);
export const SparkIcon = ( { size = 24 } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
	>
		<path d="M10.5 3 8 9l4 13 4-13-2.5-6" />
		<path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z" />
		<path d="M2 9h20" />
	</svg>
);
export const CloseIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M6 18L18 6M6 6l12 12" />
	</svg>
);
export const CartIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
	</svg>
);
export const GridIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
	</svg>
);
export const GearIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
		<path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
	</svg>
);
export const KeyIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
	</svg>
);
export const PowerIcon = ( { size = 16, strokeWidth = 2, ...rest } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth={ strokeWidth }
		strokeLinecap="round"
		strokeLinejoin="round"
		{ ...rest }
	>
		<path d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" />
	</svg>
);

/* ── Axiom Blocks logo ("Blocky B") ────────────────────────────────────────── */
export const ABLogo = ( { size = 24, color = '#7C3AED' } ) => (
	<svg width={ size } height={ size } viewBox="0 0 24 24" fill="none">
		<rect x="3" y="3" width="5.5" height="18" rx="1.8" fill={ color } />
		<rect
			x="10"
			y="3"
			width="8.5"
			height="8"
			rx="1.8"
			fill={ color }
			opacity=".7"
		/>
		<rect
			x="10"
			y="13"
			width="10"
			height="8"
			rx="1.8"
			fill={ color }
			opacity=".45"
		/>
	</svg>
);

/* ── Toggle ──────────────────────────────────────────────────────────────── */
// The off track is #8c8f94, not lighter, so it keeps 3:1 against white.
export const Toggle = ( { on, onChange, disabled, label } ) => {
	const bg = disabled ? '#C3C4C7' : on ? '#7C3AED' : '#8c8f94';
	const handleKey = ( e ) => {
		if ( disabled ) return;
		if ( e.key === ' ' || e.key === 'Enter' ) {
			e.preventDefault();
			onChange();
		}
	};
	return (
		<div
			role="switch"
			className="ab-focus"
			aria-checked={ !! on }
			aria-label={ label }
			aria-disabled={ disabled || undefined }
			tabIndex={ disabled ? -1 : 0 }
			onClick={ disabled ? undefined : onChange }
			onKeyDown={ handleKey }
			style={ {
				width: 40,
				height: 22,
				borderRadius: 11,
				background: bg,
				cursor: disabled ? 'not-allowed' : 'pointer',
				position: 'relative',
				transition: 'background .2s',
				flexShrink: 0,
				opacity: disabled ? 0.5 : 1,
			} }
		>
			<div
				style={ {
					width: 16,
					height: 16,
					borderRadius: 8,
					background: '#fff',
					position: 'absolute',
					top: 3,
					left: on && ! disabled ? 21 : 3,
					transition: 'left .18s cubic-bezier(.4,0,.2,1)',
					boxShadow: '0 1px 3px rgba(0,0,0,.25)',
				} }
			/>
		</div>
	);
};

/* ── TierBadge ───────────────────────────────────────────────────────────── */
export const TierBadge = ( { tier } ) => {
	const map = {
		free: { bg: '#f0f6fc', color: '#7C3AED', label: 'FREE' },
		pro: { bg: '#fffbeb', color: '#b45309', label: 'PRO' },
		'wc-free': { bg: '#f5f3ff', color: '#7c5bd6', label: 'WC FREE' },
		'wc-pro': { bg: '#f9f7ff', color: '#7c5bd6', label: 'WC PRO' },
	};
	const s = map[ tier ] || {
		bg: '#f9fafb',
		color: '#6b7280',
		label: tier.toUpperCase(),
	};
	return (
		<span
			style={ {
				background: s.bg,
				color: s.color,
				borderRadius: 99,
				padding: '2px 7px',
				fontSize: 10,
				fontWeight: 700,
				letterSpacing: '.04em',
			} }
		>
			{ s.label }
		</span>
	);
};

/* ── StatCard ────────────────────────────────────────────────────────────── */
export const StatCard = ( { label, value, sub, icon, iconBg, iconColor } ) => (
	<div className="ab-stat-card">
		<div className="ab-stat-card__header">
			<span className="ab-stat-card__label">{ label }</span>
			<div
				className="ab-stat-card__icon"
				style={ { background: iconBg, color: iconColor } }
			>
				{ icon }
			</div>
		</div>
		<div className="ab-stat-card__value">{ value }</div>
		{ sub && <div className="ab-stat-card__sub">{ sub }</div> }
	</div>
);

/* ── SectionBar ──────────────────────────────────────────────────────────── */
export const SectionBar = ( {
	title,
	count,
	icon,
	iconColor,
	onEnableAll,
	onDisableAll,
} ) => (
	<div className="ab-section-bar">
		<div style={ { color: iconColor } }>{ icon }</div>
		<span className="ab-section-bar__title">{ title }</span>
		<span
			className="ab-section-bar__count"
			style={ { background: iconColor + '18', color: iconColor } }
		>
			{ count }
		</span>
		<div style={ { flex: 1 } } />
		<button
			type="button"
			className="ab-btn-ghost ab-focus"
			onClick={ onEnableAll }
		>
			<PowerIcon size={ 11 } /> { __( 'Enable all', 'axiom-blocks' ) }
		</button>
		<button
			type="button"
			className="ab-btn-ghost ab-focus"
			onClick={ onDisableAll }
		>
			<CloseIcon size={ 11 } /> { __( 'Disable all', 'axiom-blocks' ) }
		</button>
	</div>
);

/* ── Line icons for the Get started and Email tabs ───────────────────────── */
const lineIcon =
	( paths ) =>
	( { size = 16, strokeWidth = 2, ...rest } ) => (
		<svg
			width={ size }
			height={ size }
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={ strokeWidth }
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			focusable="false"
			style={ { flexShrink: 0 } }
			{ ...rest }
		>
			{ [].concat( paths ).map( ( d ) => (
				<path key={ d } d={ d } />
			) ) }
		</svg>
	);

export const MailIcon = lineIcon(
	'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
);
export const BookIcon = lineIcon(
	'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
);
export const VideoIcon = lineIcon(
	'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
);
export const ChatIcon = lineIcon(
	'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
);
export const StarIcon = lineIcon(
	'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
);
export const AlertIcon = lineIcon(
	'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
);
export const XCircleIcon = lineIcon(
	'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
);
export const InboxIcon = lineIcon(
	'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4'
);
export const ArrowIcon = lineIcon( 'M14 5l7 7m0 0l-7 7m7-7H3' );
export const ExternalIcon = lineIcon(
	'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
);
export const TickIcon = lineIcon( 'M5 13l4 4L19 7' );
export const GlobeIcon = lineIcon(
	'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
);
// A question mark in a circle. Used on the Help tab.
export const HelpIcon = lineIcon(
	'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
);
export const FormIcon = lineIcon(
	'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
);
export const LoopIcon = lineIcon(
	'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
);
export const PlayIcon = ( { size = 30 } ) => (
	<svg
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fill="currentColor"
		aria-hidden="true"
		focusable="false"
	>
		<path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
	</svg>
);

// Text only screen readers hear.
export const SR = ( { children } ) => (
	<span className="screen-reader-text">{ children }</span>
);

// Inline status box: tinted background, border and icon, never colour alone.
export const Msg = ( { tone, icon, children, className = '' } ) => (
	<div
		className={ `ab-msg ab-msg--${ tone } ${ className }` }
		role={ tone === 'err' ? 'alert' : 'status' }
	>
		<span className="ab-msg__icon">{ icon }</span>
		<div className="ab-msg__body">{ children }</div>
	</div>
);
