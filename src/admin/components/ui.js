/** Shared UI primitives — icons, toggle, badges, stat card, section bar, logo */

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

/* ── Axiom Blocks Logo — "Blocky B" ────────────────────────────────────────── */
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
export const Toggle = ( { on, onChange, disabled } ) => {
	const bg = disabled ? '#C3C4C7' : on ? '#7C3AED' : '#C3C4C7';
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
			aria-checked={ on }
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
		'wc-free': { bg: '#f5f3ff', color: '#7c3aed', label: 'WC FREE' },
		'wc-pro': { bg: '#f9f7ff', color: '#7c3aed', label: 'WC PRO' },
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
		<button className="ab-btn-ghost" onClick={ onEnableAll }>
			<PowerIcon size={ 11 } /> { __( 'Enable all', 'axiom-blocks' ) }
		</button>
		<button className="ab-btn-ghost" onClick={ onDisableAll }>
			<CloseIcon size={ 11 } /> { __( 'Disable all', 'axiom-blocks' ) }
		</button>
	</div>
);
