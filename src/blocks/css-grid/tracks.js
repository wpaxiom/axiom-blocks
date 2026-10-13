const TOKEN =
	/^(?:0|(?:\d+(?:\.\d+)?|\.\d+)(?:fr|px|rem|em|%|vw|vh)|auto|min-content|max-content)$/i;
const EQUAL = /^repeat\(\d{1,2},\s*minmax\(0,\s*1fr\)\)$/i;
const AUTO =
	/^repeat\((?:auto-fit|auto-fill),\s*minmax\((?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vw|vh),\s*1fr\)\)$/i;

export function safeTrackList( value ) {
	const input = String( value || '' )
		.trim()
		.replace( /\s+/g, ' ' );
	if ( ! input ) return '';
	if ( EQUAL.test( input ) || AUTO.test( input ) ) return input;
	const tokens = input.split( ' ' );
	return tokens.length <= 12 &&
		tokens.every( ( token ) => TOKEN.test( token ) )
		? input
		: '';
}

export function safeTrackToken( value, fallback = 'auto' ) {
	const token = String( value || '' ).trim();
	return TOKEN.test( token ) ? token : fallback;
}

export function safeLength( value, fallback = '240px' ) {
	const token = String( value || '' ).trim();
	return /^(?:\d+(?:\.\d+)?|\.\d+)(?:px|rem|em|%|vw|vh)$/i.test( token )
		? token
		: fallback;
}

export function templateFor( mode, columns, minWidth, custom ) {
	if ( mode === 'custom' ) return safeTrackList( custom );
	if ( mode === 'auto-fit' ) {
		const min = safeLength( minWidth );
		return `repeat(auto-fit, minmax(${ min }, 1fr))`;
	}
	const count = Math.max( 1, Math.min( 12, Number( columns ) || 3 ) );
	return `repeat(${ count }, minmax(0, 1fr))`;
}

// Number of explicit columns a template creates, or 0 when it depends on the
// container width (auto-fit / auto-fill).
export function trackCount( template ) {
	const value = String( template || '' ).trim();
	const repeat = value.match( /^repeat\((\d+),/i );
	if ( repeat ) return Number( repeat[ 1 ] );
	if ( /^repeat\(/i.test( value ) ) return 0;
	return value ? value.split( /\s+/ ).length : 0;
}
