/**
 * Trust Badge Library — 14 curated badges in 3 groups.
 *
 * Payment badges: imported from assets directory (actual brand logos)
 * Security badges: inline SVG icons (stylized, consistent with design system)
 * Service badges: inline SVG icons (stylized, consistent with design system)
 */

// Import actual brand SVG files as URLs (colored versions)
import VisaSvg from './assets/visa.svg?url';
import MastercardSvg from './assets/mastercard.svg?url';
import AmexSvg from './assets/amex.svg?url';
import DiscoverSvg from './assets/discover.svg?url';
import PayPalSvg from './assets/paypal.svg?url';
import ApplePaySvg from './assets/apple-pay.svg?url';
import GooglePaySvg from './assets/google-pay.svg?url';
import StripeSvg from './assets/stripe.svg?url';

// Import monochrome versions (grayscale with distinct shades)
import VisaMonoSvg from './assets/monochrome/visa.svg?url';
import MastercardMonoSvg from './assets/monochrome/mastercard.svg?url';
import AmexMonoSvg from './assets/monochrome/amex.svg?url';
import DiscoverMonoSvg from './assets/monochrome/discover.svg?url';
import PayPalMonoSvg from './assets/monochrome/paypal.svg?url';
import ApplePayMonoSvg from './assets/monochrome/apple-pay.svg?url';
import GooglePayMonoSvg from './assets/monochrome/google-pay.svg?url';
import StripeMonoSvg from './assets/monochrome/stripe.svg?url';

/* ── Security (stylized inline icons) ─────────────────────────────────── */

const SSLSecure = (
	<>
		<path d="M12 2.5l7.5 2.5v6c0 5-3.5 8.5-7.5 10.5-4-2-7.5-5.5-7.5-10.5v-6L12 2.5z" />
		<rect x="9.5" y="10" width="5" height="4.5" rx=".6" />
		<path d="M10.5 10V8.5a1.5 1.5 0 013 0V10" />
	</>
);

const Encrypted = (
	<>
		<rect x="5" y="10" width="14" height="10" rx="1.5" />
		<path d="M7.5 10V7.5a4.5 4.5 0 019 0V10" />
		<circle cx="12" cy="14.5" r="1" fill="currentColor" stroke="none" />
		<path d="M12 15.5v2" />
	</>
);

const SecureCheckout = (
	<>
		<path d="M12 2.5l7.5 2.5v6c0 5-3.5 8.5-7.5 10.5-4-2-7.5-5.5-7.5-10.5v-6L12 2.5z" />
		<path d="M8.5 12l2.5 2.5L15.5 10" />
	</>
);

/* ── Service (stylized inline icons) ──────────────────────────────────── */

const FreeShipping = (
	<>
		<path d="M2.5 7h10v9h-10z" />
		<path d="M12.5 10h4l3 3v3h-7z" />
		<circle cx="6.5" cy="17.5" r="1.6" />
		<circle cx="16" cy="17.5" r="1.6" />
		<path d="M2.5 13h10" />
	</>
);

const MoneyBack = (
	<>
		<circle cx="12" cy="12" r="9" />
		<path d="M14 9.5h-3a1.5 1.5 0 000 3h2a1.5 1.5 0 010 3H10M12 8v1M12 15.5v1" />
	</>
);

const Returns = (
	<>
		<path d="M4 11.5a8 8 0 0114-4.5l2 2" />
		<path d="M20 4v5h-5" />
		<path d="M20 12.5a8 8 0 01-14 4.5l-2-2" />
		<path d="M4 20v-5h5" />
	</>
);

/* ── Registry ─────────────────────────────────────────────────────────── */

export const BADGE_GROUPS = [
	{
		id: 'payment',
		label: 'Payment',
		badges: [
			{
				id: 'visa',
				label: 'Visa',
				svgUrl: VisaSvg,
				monoUrl: VisaMonoSvg,
			},
			{
				id: 'mastercard',
				label: 'Mastercard',
				svgUrl: MastercardSvg,
				monoUrl: MastercardMonoSvg,
			},
			{
				id: 'amex',
				label: 'Amex',
				svgUrl: AmexSvg,
				monoUrl: AmexMonoSvg,
			},
			{
				id: 'discover',
				label: 'Discover',
				svgUrl: DiscoverSvg,
				monoUrl: DiscoverMonoSvg,
			},
			{
				id: 'paypal',
				label: 'PayPal',
				svgUrl: PayPalSvg,
				monoUrl: PayPalMonoSvg,
			},
			{
				id: 'apple-pay',
				label: 'Apple Pay',
				svgUrl: ApplePaySvg,
				monoUrl: ApplePayMonoSvg,
			},
			{
				id: 'google-pay',
				label: 'Google Pay',
				svgUrl: GooglePaySvg,
				monoUrl: GooglePayMonoSvg,
			},
			{
				id: 'stripe',
				label: 'Stripe',
				svgUrl: StripeSvg,
				monoUrl: StripeMonoSvg,
			},
		],
	},
	{
		id: 'security',
		label: 'Security',
		badges: [
			{ id: 'ssl-secure', label: 'SSL Secure', svg: SSLSecure },
			{ id: 'encrypted', label: '256-bit Encrypted', svg: Encrypted },
			{
				id: 'secure-checkout',
				label: 'Secure Checkout',
				svg: SecureCheckout,
			},
		],
	},
	{
		id: 'service',
		label: 'Service',
		badges: [
			{ id: 'free-shipping', label: 'Free Shipping', svg: FreeShipping },
			{ id: 'money-back', label: 'Money-Back Guarantee', svg: MoneyBack },
			{ id: 'returns', label: '30-Day Returns', svg: Returns },
		],
	},
];

/** Flat lookup by id */
export const BADGE_INDEX = ( () => {
	const out = {};
	BADGE_GROUPS.forEach( ( g ) =>
		g.badges.forEach( ( b ) => {
			out[ b.id ] = { ...b, group: g.id };
		} )
	);
	return out;
} )();

/** Preset bundles */
export const BADGE_PRESETS = {
	mixed: [ 'visa', 'mastercard', 'paypal', 'ssl-secure', 'money-back' ],
	payment: [ 'visa', 'mastercard', 'amex', 'discover', 'paypal' ],
	security: [ 'ssl-secure', 'encrypted', 'secure-checkout' ],
	service: [ 'free-shipping', 'money-back', 'returns' ],
	all: BADGE_GROUPS.flatMap( ( g ) => g.badges.map( ( b ) => b.id ) ),
};

/**
 * Render a badge
 * @param root0
 * @param root0.id
 * @param root0.size
 * @param root0.className
 * @param root0.colorMode
 */
export function BadgeSvg( {
	id,
	size = 24,
	className = '',
	colorMode = 'color',
} ) {
	const badge = BADGE_INDEX[ id ];
	if ( ! badge ) return null;

	// File-based SVG (brand logos) - use mono version for monochrome mode
	if ( badge.svgUrl ) {
		const src =
			colorMode === 'mono' && badge.monoUrl
				? badge.monoUrl
				: badge.svgUrl;
		return (
			<img
				src={ src }
				alt={ badge.label }
				width={ size }
				height={ size }
				className={ className }
				style={ { objectFit: 'contain' } }
			/>
		);
	}

	// Inline SVG (security/service icons) - render directly like PHP frontend
	const svgContent = badge.svg;

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			width={ size }
			height={ size }
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className={ className }
		>
			{ svgContent }
		</svg>
	);
}
