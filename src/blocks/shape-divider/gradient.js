/**
 * Shape Divider — SVG gradient fill.
 *
 * The shape is an SVG `<path fill>`, so a CSS gradient can't paint it. When the
 * Fill background is set to `gradient`, the BackgroundControl attrs are
 * translated into an SVG `<linearGradient>` / `<radialGradient>` instead and the
 * path fills from `url(#id)`. Flat colors keep the shipped `fill="#rrggbb"`.
 *
 * render.php mirrors this file exactly — keep the two in step.
 */

/* CSS gradient angles run clockwise from "to top"; SVG wants a vector in the
 * 0–1 object bounding box, y pointing down. */
export function gradientCoords( angle ) {
	const rad = ( ( parseFloat( angle ) || 0 ) * Math.PI ) / 180;
	const dx = Math.sin( rad ) / 2;
	const dy = Math.cos( rad ) / 2;
	const r = ( n ) => Math.round( n * 10000 ) / 10000;
	return {
		x1: r( 0.5 - dx ),
		y1: r( 0.5 + dy ),
		x2: r( 0.5 + dx ),
		y2: r( 0.5 - dy ),
	};
}

/* `stop-color` takes no alpha channel in older renderers, so an 8-digit hex is
 * split into color + stop-opacity. */
export function splitAlpha( color ) {
	const c = String( color || '' ).trim();
	const m = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec( c );
	if ( m ) {
		return {
			color: `#${ m[ 1 ] }`,
			opacity: String(
				Math.round( ( parseInt( m[ 2 ], 16 ) / 255 ) * 1000 ) / 1000
			),
		};
	}
	return { color: c || '#000000', opacity: null };
}

/* SVG stop offsets must ascend, unlike a CSS stop list. */
export function gradientStops( stops ) {
	return ( Array.isArray( stops ) ? stops : [] )
		.filter( ( s ) => s && s.color )
		.map( ( s, i ) => ( {
			...splitAlpha( s.color ),
			position: Math.max(
				0,
				Math.min( 100, parseFloat( s.position ) || ( i ? 100 : 0 ) )
			),
		} ) )
		.sort( ( a, b ) => a.position - b.position );
}

/* Returns null when the fill is a flat color — the caller then uses `color`. */
export function shapeGradient( attributes ) {
	if ( 'gradient' !== attributes.shapeBgType ) {
		return null;
	}
	const stops = gradientStops( attributes.shapeBgGradStops );
	if ( stops.length < 2 ) {
		return null;
	}
	return {
		radial: 'radial' === attributes.shapeBgGradType,
		coords: gradientCoords( attributes.shapeBgGradAngle ),
		stops,
	};
}
