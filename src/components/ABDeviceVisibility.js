/**
 * ABDeviceVisibility — universal hide-on-device control (handoff design).
 *
 * A popover-row: a summary trigger ("Visible everywhere" / "Hidden: …") opens a
 * workspace with the summary strip (dimmed + struck-through when a device is
 * hidden) over three explicit "Hide on …" toggle rows. Reads/writes three
 * boolean attributes (hideDesktop/hideTablet/hideMobile) injected into every
 * Axiom block. The frontend hiding is done in PHP (render_block adds
 * `.ab-hide-{device}` classes) + the media sheet in style.scss; all-false ⇒ no
 * class ⇒ zero output ⇒ back-compat safe.
 */

import { __, sprintf } from '@wordpress/i18n';
import { ABToggleControl } from './ABControls';
import { ABEditPopover } from './ABEditPopover';

const Svg = ( { children } ) => (
	<svg
		viewBox="0 0 24 24"
		width="15"
		height="15"
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

const DEVICES = [
	{
		key: 'hideDesktop',
		label: __( 'Desktop', 'axiom-blocks' ),
		hideLabel: __( 'Hide on desktop', 'axiom-blocks' ),
		icon: (
			<Svg>
				<rect x="2" y="3" width="20" height="14" rx="2" />
				<line x1="8" y1="21" x2="16" y2="21" />
				<line x1="12" y1="17" x2="12" y2="21" />
			</Svg>
		),
	},
	{
		key: 'hideTablet',
		label: __( 'Tablet', 'axiom-blocks' ),
		hideLabel: __( 'Hide on tablet', 'axiom-blocks' ),
		icon: (
			<Svg>
				<rect x="4" y="2" width="16" height="20" rx="2" />
				<line x1="12" y1="18" x2="12.01" y2="18" />
			</Svg>
		),
	},
	{
		key: 'hideMobile',
		label: __( 'Mobile', 'axiom-blocks' ),
		hideLabel: __( 'Hide on mobile', 'axiom-blocks' ),
		icon: (
			<Svg>
				<rect x="6" y="2" width="12" height="20" rx="2" />
				<line x1="12" y1="18" x2="12.01" y2="18" />
			</Svg>
		),
	},
];

const EyeGlyph = (
	<Svg>
		<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
		<circle cx="12" cy="12" r="3" />
	</Svg>
);

export function ABDeviceVisibility( { attributes, setAttributes } ) {
	const hiddenDevices = DEVICES.filter( ( { key } ) => !! attributes[ key ] );
	const noneHidden = hiddenDevices.length === 0;
	const summary = noneHidden
		? __( 'Visible everywhere', 'axiom-blocks' )
		: sprintf(
				/* translators: %s: comma-separated device names. */
				__( 'Hidden: %s', 'axiom-blocks' ),
				hiddenDevices.map( ( { label } ) => label ).join( ', ' )
		  );

	return (
		<ABEditPopover
			glyph={ EyeGlyph }
			title={ __( 'Visibility', 'axiom-blocks' ) }
			summary={ summary }
			isDefault={ noneHidden }
			placeholder={ __( 'Visible everywhere', 'axiom-blocks' ) }
			onReset={
				noneHidden
					? undefined
					: () =>
							setAttributes( {
								hideDesktop: false,
								hideTablet: false,
								hideMobile: false,
							} )
			}
		>
			<div className="ab-vis-summary">
				{ DEVICES.map( ( { key, label, icon } ) => {
					const hidden = !! attributes[ key ];
					return (
						<div
							key={ key }
							className={ `ab-vis-summary__item${
								hidden ? ' is-hidden' : ''
							}` }
						>
							<span className="ab-vis-summary__icon">
								{ icon }
							</span>
							{ label }
						</div>
					);
				} ) }
			</div>
			<div className="ab-vis-rows">
				{ DEVICES.map( ( { key, hideLabel } ) => (
					<div key={ key } className="ab-vis-row">
						<span className="ab-ctrl__label">{ hideLabel }</span>
						<ABToggleControl
							checked={ !! attributes[ key ] }
							onChange={ ( v ) =>
								setAttributes( { [ key ]: v } )
							}
						/>
					</div>
				) ) }
			</div>
		</ABEditPopover>
	);
}
