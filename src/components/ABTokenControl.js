/**
 * BS-styled wrapper around FormTokenField. Pro-side helper because the free
 * plugin's ABControls don't expose a multi-select primitive and the free
 * plugin is on hold for WP.org acceptance.
 *
 * Values are an array of string IDs (or slugs); `options` is [{ value, label }].
 * `suggestionsByLabel` makes label→value lookup possible when FormTokenField
 * hands back the picked label rather than the underlying value.
 */

import { FormTokenField } from '@wordpress/components';
import { useMemo } from '@wordpress/element';

export function ABTokenControl( {
	label,
	value,
	onChange,
	options = [],
	help,
	placeholder = '',
} ) {
	const labels = useMemo(
		() => options.map( ( o ) => o.label ),
		[ options ]
	);

	const labelToValue = useMemo( () => {
		const m = new Map();
		options.forEach( ( o ) => m.set( o.label.toLowerCase(), o.value ) );
		return m;
	}, [ options ] );

	const valueToLabel = useMemo( () => {
		const m = new Map();
		options.forEach( ( o ) => m.set( String( o.value ), o.label ) );
		return m;
	}, [ options ] );

	const selectedLabels = ( Array.isArray( value ) ? value : [] )
		.map( ( v ) => valueToLabel.get( String( v ) ) )
		.filter( Boolean );

	const handleChange = ( picked ) => {
		const out = [];
		picked.forEach( ( token ) => {
			const v = labelToValue.get( String( token ).toLowerCase() );
			if ( v !== undefined ) out.push( v );
		} );
		onChange( out );
	};

	return (
		<div className="ab-ctrl ab-ctrl--token">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<FormTokenField
				value={ selectedLabels }
				suggestions={ labels }
				onChange={ handleChange }
				placeholder={ placeholder }
				__experimentalExpandOnFocus
				__experimentalShowHowTo={ false }
				__nextHasNoMarginBottom
			/>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}
