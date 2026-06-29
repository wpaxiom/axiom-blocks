/**
 * DeviceSwitcher — a small segmented Desktop / Tablet / Mobile toggle for
 * responsive controls. It does NOT hold its own state: it reads and writes
 * WordPress's native preview device, so switching here also resizes the canvas,
 * updates the top-bar switcher, and flips every responsive control at once.
 */

import { __ } from '@wordpress/i18n';
import { DEVICES, useDeviceType, useSetDeviceType } from './responsive';

const Svg = ( { children } ) => (
	<svg
		width="15"
		height="15"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{ children }
	</svg>
);

const ICONS = {
	Desktop: (
		<Svg>
			<rect x="2" y="3" width="20" height="14" rx="2" />
			<line x1="8" y1="21" x2="16" y2="21" />
			<line x1="12" y1="17" x2="12" y2="21" />
		</Svg>
	),
	Tablet: (
		<Svg>
			<rect x="4" y="2" width="16" height="20" rx="2" />
			<line x1="12" y1="18" x2="12.01" y2="18" />
		</Svg>
	),
	Mobile: (
		<Svg>
			<rect x="6" y="2" width="12" height="20" rx="2" />
			<line x1="12" y1="18" x2="12.01" y2="18" />
		</Svg>
	),
};

const LABELS = {
	Desktop: __( 'Desktop', 'axiom-blocks' ),
	Tablet: __( 'Tablet', 'axiom-blocks' ),
	Mobile: __( 'Mobile', 'axiom-blocks' ),
};

export function DeviceSwitcher( { compact = false } ) {
	const device = useDeviceType();
	const setDevice = useSetDeviceType();
	return (
		<div
			className={ `ab-device-switcher${
				compact ? ' ab-device-switcher--compact' : ''
			}` }
			role="group"
			aria-label={ __( 'Edit for device', 'axiom-blocks' ) }
		>
			{ DEVICES.map( ( d ) => (
				<button
					key={ d }
					type="button"
					className={ `ab-device-switcher__btn${
						device === d ? ' is-active' : ''
					}` }
					onClick={ () => setDevice( d ) }
					aria-pressed={ device === d }
					aria-label={ LABELS[ d ] }
					title={ LABELS[ d ] }
				>
					{ ICONS[ d ] }
				</button>
			) ) }
		</div>
	);
}
