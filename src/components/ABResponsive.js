/**
 * ABResponsive — make any single ABControl per-device.
 *
 * The shared SpacingPanel / TypographyPanel carry their own responsive wiring;
 * this is the equivalent for one-off per-block controls (columns, gap, alignment,
 * sizes). It rides WordPress's NATIVE device preview (see ./responsive) and edits
 * the `X` / `XTablet` / `XMobile` attribute for the active device.
 *
 * Render-prop usage:
 *
 *   <ABResponsive attributes={attributes} setAttributes={setAttributes} attrKey="columns">
 *     { ( { value, setValue, inherited } ) => (
 *       <ABRangeControl value={ value === '' ? inherited : value } onChange={ setValue } … />
 *     ) }
 *   </ABResponsive>
 *
 * The render prop receives:
 *   value        the active device's raw value ('' when unset / inheriting)
 *   setValue     writes the active device's attribute
 *   inherited    the resolved cascade value (parent device) — use as fallback
 *   device       active device
 *   isOverridden true when a Tablet/Mobile value is explicitly set
 */

import { __ } from '@wordpress/i18n';
import { useDeviceType, resolveResponsive, deviceKey } from './responsive';
import { DeviceSwitcher } from './DeviceSwitcher';

export function ABResponsive( {
	attributes,
	setAttributes,
	attrKey,
	showSwitcher = true,
	children,
} ) {
	const device = useDeviceType();
	const perDevice = device !== 'Desktop';
	const key = deviceKey( attrKey, device );

	const raw = attributes[ key ];
	const value = raw == null ? '' : raw;
	const setValue = ( v ) => setAttributes( { [ key ]: v } );

	// Value inherited from the larger device — fallback when this device is unset.
	const inherited = perDevice
		? resolveResponsive(
				attributes,
				attrKey,
				device === 'Mobile' ? 'Tablet' : 'Desktop'
		  )
		: undefined;

	const isOverridden = perDevice && value !== '' && value != null;

	return (
		<div className="ab-responsive-control">
			{ showSwitcher && (
				<div className="ab-responsive-control__bar">
					{ isOverridden && (
						<button
							type="button"
							className="ab-responsive-control__reset"
							onClick={ () => setValue( '' ) }
							title={ __(
								'Clear this device’s value',
								'axiom-blocks'
							) }
						>
							{ __( 'Reset', 'axiom-blocks' ) }
						</button>
					) }
					<DeviceSwitcher compact />
				</div>
			) }
			{ children( { value, setValue, inherited, device, isOverridden } ) }
		</div>
	);
}
