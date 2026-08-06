/**
 * SizeControl — shared design-layer size control (currently the max-width field).
 *
 * Stores a single CSS length string (e.g. "800px", "60%"). The number + inline
 * unit picker reuse ABRangeControl. An empty/zero value clears the attribute, so
 * an untouched control produces zero output. Make it per-device by wrapping in
 * <ABResponsive> at the call site.
 */

import { __ } from '@wordpress/i18n';
import { ABRangeControl } from './ABControls';

const UNITS = [ 'px', '%', 'rem', 'em', 'vw' ];
const MAX_FOR_UNIT = { px: 1600, '%': 100, rem: 100, em: 100, vw: 100 };

/* Split "800px" → { num: 800, unit: 'px' }. Empty → { num: 0, unit: fallback }. */
function parseLength( value, fallbackUnit ) {
	if ( value === '' || value == null ) {
		return { num: 0, unit: fallbackUnit };
	}
	const m = String( value ).match( /^(-?\d*\.?\d+)\s*([a-z%]*)$/i );
	if ( ! m ) {
		return { num: 0, unit: fallbackUnit };
	}
	return { num: parseFloat( m[ 1 ] ) || 0, unit: m[ 2 ] || fallbackUnit };
}

export function SizeControl( {
	label = __( 'Max width', 'axiom-blocks' ),
	value = '',
	onChange,
	defaultUnit = 'px',
} ) {
	const { num, unit } = parseLength( value, defaultUnit );
	const max = MAX_FOR_UNIT[ unit ] ?? 1600;

	const emit = ( n, u ) => onChange( n ? `${ n }${ u }` : '' );

	return (
		<ABRangeControl
			label={ label }
			value={ num }
			onChange={ ( n ) => emit( n, unit ) }
			min={ 0 }
			max={ max }
			step={ 1 }
			unit={ unit }
			units={ UNITS }
			onUnitChange={ ( u ) => emit( num, u ) }
		/>
	);
}
