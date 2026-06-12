/**
 * Advanced Button — curated content icon set (Lucide outline, 24×24, 2px stroke).
 *
 * Keep in sync with icons.php, which renders the same set on the frontend.
 * Icons are stored by slug in the `icon` attribute; the SVG is always resolved
 * at render time so the set can evolve without saved-markup migrations.
 */

import { __ } from '@wordpress/i18n';

const Svg = ( { children } ) => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{ children }
	</svg>
);

export const BUTTON_ICONS = {
	'arrow-right': (
		<Svg>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</Svg>
	),
	'arrow-up-right': (
		<Svg>
			<path d="M7 7h10v10" />
			<path d="M7 17 17 7" />
		</Svg>
	),
	'chevron-right': (
		<Svg>
			<path d="m9 18 6-6-6-6" />
		</Svg>
	),
	'external-link': (
		<Svg>
			<path d="M15 3h6v6" />
			<path d="M10 14 21 3" />
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		</Svg>
	),
	download: (
		<Svg>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="m7 10 5 5 5-5" />
			<path d="M12 15V3" />
		</Svg>
	),
	cart: (
		<Svg>
			<circle cx="8" cy="21" r="1" />
			<circle cx="19" cy="21" r="1" />
			<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
		</Svg>
	),
	send: (
		<Svg>
			<path d="m22 2-7 20-4-9-9-4Z" />
			<path d="M22 2 11 13" />
		</Svg>
	),
	mail: (
		<Svg>
			<rect width="20" height="16" x="2" y="4" rx="2" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
		</Svg>
	),
	phone: (
		<Svg>
			<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
		</Svg>
	),
	plus: (
		<Svg>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</Svg>
	),
	check: (
		<Svg>
			<path d="M20 6 9 17l-5-5" />
		</Svg>
	),
	star: (
		<Svg>
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
		</Svg>
	),
	heart: (
		<Svg>
			<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
		</Svg>
	),
	play: (
		<Svg>
			<path d="m6 3 14 9-14 9V3z" />
		</Svg>
	),
	zap: (
		<Svg>
			<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
		</Svg>
	),
};

export const BUTTON_ICON_OPTIONS = [
	{ label: __( 'None', 'axiom-blocks' ), value: '' },
	{ label: __( 'Arrow right', 'axiom-blocks' ), value: 'arrow-right' },
	{ label: __( 'Arrow up-right', 'axiom-blocks' ), value: 'arrow-up-right' },
	{ label: __( 'Chevron right', 'axiom-blocks' ), value: 'chevron-right' },
	{ label: __( 'External link', 'axiom-blocks' ), value: 'external-link' },
	{ label: __( 'Download', 'axiom-blocks' ), value: 'download' },
	{ label: __( 'Cart', 'axiom-blocks' ), value: 'cart' },
	{ label: __( 'Send', 'axiom-blocks' ), value: 'send' },
	{ label: __( 'Mail', 'axiom-blocks' ), value: 'mail' },
	{ label: __( 'Phone', 'axiom-blocks' ), value: 'phone' },
	{ label: __( 'Plus', 'axiom-blocks' ), value: 'plus' },
	{ label: __( 'Check', 'axiom-blocks' ), value: 'check' },
	{ label: __( 'Star', 'axiom-blocks' ), value: 'star' },
	{ label: __( 'Heart', 'axiom-blocks' ), value: 'heart' },
	{ label: __( 'Play', 'axiom-blocks' ), value: 'play' },
	{ label: __( 'Zap', 'axiom-blocks' ), value: 'zap' },
];
