/**
 * Post Filter children — shared CSS custom-property builder.
 *
 * Builds the --ab-pff-input-* / --ab-pff-sel-* / --ab-pff-btn-* vars from
 * block attributes, consumed by style.scss on both the editor and frontend.
 */

const TYPO_KEYS = [
	[ 'fontFamily', 'FontFamily' ],
	[ 'fontWeight', 'FontWeight' ],
	[ 'fontSize', 'FontSize' ],
	[ 'lineHeight', 'LineHeight' ],
	[ 'letterSpacing', 'LetterSpacing' ],
	[ 'textTransform', 'TextTransform' ],
	[ 'textDecoration', 'TextDecoration' ],
	[ 'textAlign', 'TextAlign' ],
];

function pick( a, k ) {
	const v = a[ k ];
	return v != null && v !== '' ? v : undefined;
}

/**
 * Build CSS custom properties for a single target.
 *
 * @param {Object} attributes         Block attributes.
 * @param {Object} spec               Target spec.
 * @param {string} spec.cssPrefix     CSS var prefix, e.g. '--ab-pff-input'.
 * @param {string} spec.attrPrefix    Attribute prefix, e.g. 'input' or '' (empty).
 * @param {Array}  spec.bwKeys        Border-width attribute keys [top, right, bottom, left].
 * @param {string} spec.bsKey         Border-style attribute key.
 * @param {string} spec.bcKey         Border-color attribute key.
 * @param {string} spec.bcHoverKey    Border-color hover attribute key.
 * @param {Array}  spec.radiusKeys    Radius attribute keys [tl, tr, br, bl].
 * @param {string} spec.shadowKey     Box-shadow attribute key.
 * @param {string} spec.padTopKey     Padding-top attribute key.
 * @param {string} spec.padRightKey   Padding-right attribute key.
 * @param {string} spec.padBotKey     Padding-bottom attribute key.
 * @param {string} spec.padLeftKey    Padding-left attribute key.
 * @param {string} spec.colorKey      Text-color attribute key.
 * @param {string} spec.colorHoverKey Text-color hover attribute key.
 * @param {string} spec.bgKey         Background-color attribute key.
 * @param {string} spec.bgHoverKey    Background-color hover attribute key.
 */
function buildTargetVars(
	attributes,
	{
		cssPrefix,
		attrPrefix = '',
		bwKeys,
		bsKey,
		bcKey,
		bcHoverKey,
		radiusKeys,
		shadowKey,
		padTopKey,
		padRightKey,
		padBotKey,
		padLeftKey,
		colorKey,
		colorHoverKey,
		bgKey,
		bgHoverKey,
	}
) {
	const vars = {};

	const set = ( varName, val ) => {
		if ( val != null && val !== '' ) vars[ varName ] = val;
	};

	// Colors
	set( `${ cssPrefix }-color`, pick( attributes, colorKey ) );
	set( `${ cssPrefix }-color-h`, pick( attributes, colorHoverKey ) );
	set( `${ cssPrefix }-bg`, pick( attributes, bgKey ) );
	set( `${ cssPrefix }-bg-h`, pick( attributes, bgHoverKey ) );

	// Border
	if ( bwKeys ) {
		set( `${ cssPrefix }-bw-t`, pick( attributes, bwKeys[ 0 ] ) );
		set( `${ cssPrefix }-bw-r`, pick( attributes, bwKeys[ 1 ] ) );
		set( `${ cssPrefix }-bw-b`, pick( attributes, bwKeys[ 2 ] ) );
		set( `${ cssPrefix }-bw-l`, pick( attributes, bwKeys[ 3 ] ) );
	}
	set( `${ cssPrefix }-bs`, pick( attributes, bsKey ) );
	set( `${ cssPrefix }-bc`, pick( attributes, bcKey ) );
	set( `${ cssPrefix }-bc-h`, pick( attributes, bcHoverKey ) );

	// Radius
	if ( radiusKeys ) {
		set( `${ cssPrefix }-radius-tl`, pick( attributes, radiusKeys[ 0 ] ) );
		set( `${ cssPrefix }-radius-tr`, pick( attributes, radiusKeys[ 1 ] ) );
		set( `${ cssPrefix }-radius-br`, pick( attributes, radiusKeys[ 2 ] ) );
		set( `${ cssPrefix }-radius-bl`, pick( attributes, radiusKeys[ 3 ] ) );
	}

	// Shadow
	set( `${ cssPrefix }-shadow`, pick( attributes, shadowKey ) );

	// Padding
	set( `${ cssPrefix }-pt`, pick( attributes, padTopKey ) );
	set( `${ cssPrefix }-pr`, pick( attributes, padRightKey ) );
	set( `${ cssPrefix }-pb`, pick( attributes, padBotKey ) );
	set( `${ cssPrefix }-pl`, pick( attributes, padLeftKey ) );

	// Typography
	TYPO_KEYS.forEach( ( [ cssProp, suffix ] ) => {
		const attrKey = attrPrefix ? attrPrefix + suffix : cssProp;
		const cssVar = cssProp.replace(
			/([A-Z])/g,
			( m ) => '-' + m.toLowerCase()
		);
		set( `${ cssPrefix }-${ cssVar }`, pick( attributes, attrKey ) );
	} );

	return vars;
}

/* ── Bar (parent) ──────────────────────────────────────────────────────── */

const BAR_LAYOUT_VARS = {
	'--ab-pf-dir': 'direction',
	'--ab-pf-gap': 'fieldGap',
	'--ab-pf-row-gap': 'fieldRowGap',
	'--ab-pf-align': 'alignItems',
};

const BAR_TEXT_VARS = {
	label: '--ab-pff-label',
	count: '--ab-pf-count',
};

/**
 * CSS custom properties for the bar: layout, plus the label and result-count
 * text styles it paints for every child. Mirrors the map in render.php.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object.
 */
export function barVars( attributes ) {
	const vars = {};

	Object.entries( BAR_LAYOUT_VARS ).forEach( ( [ cssVar, key ] ) => {
		const v = pick( attributes, key );
		if ( v !== undefined ) {
			vars[ cssVar ] = v;
		}
	} );

	Object.entries( BAR_TEXT_VARS ).forEach( ( [ prefix, cssPrefix ] ) => {
		const color = pick( attributes, `${ prefix }Color` );
		if ( color !== undefined ) {
			vars[ `${ cssPrefix }-color` ] = color;
		}
		TYPO_KEYS.forEach( ( [ cssProp, suffix ] ) => {
			const v = pick( attributes, prefix + suffix );
			if ( v === undefined ) {
				return;
			}
			const cssVar = cssProp.replace(
				/([A-Z])/g,
				( m ) => '-' + m.toLowerCase()
			);
			vars[ `${ cssPrefix }-${ cssVar }` ] = v;
		} );
	} );

	return vars;
}

/* ── Field anatomy (shared by all four child controls) ─────────────────── */

/**
 * Modifier classes for a field wrapper. Mirrored by
 * AxiomBlocks\Blocks\PostFilterFields::classes() so the editor and the
 * frontend agree on the markup.
 *
 * @param {Object} attributes Block attributes.
 * @return {string} Space-joined modifier classes.
 */
export function fieldClass( attributes ) {
	const out = [];
	const width = attributes.width || '';
	if ( width ) {
		out.push( `ab-pff--w-${ width }` );
	}
	const pos = attributes.labelPosition || '';
	if ( pos ) {
		out.push( `ab-pff--label-${ pos }` );
	}
	return out.join( ' ' );
}

/**
 * CSS custom properties for a field wrapper.
 *
 * @param {Object} attributes Block attributes.
 * @return {Object} Style object.
 */
export function fieldVars( attributes ) {
	const vars = {};
	if ( attributes.widthCustom ) {
		vars[ '--ab-pff-w' ] = attributes.widthCustom;
	}
	if ( attributes.labelGap ) {
		vars[ '--ab-pff-label-gap' ] = attributes.labelGap;
	}
	return vars;
}

/**
 * Whether a field renders its label at all. An empty label string hides it
 * regardless, matching how the shipped blocks already behave.
 *
 * @param {Object} attributes Block attributes.
 * @return {boolean} True when the label should render.
 */
export function showsLabel( attributes ) {
	return attributes.showLabel !== false && !! attributes.label;
}

/* ── Concrete builders ─────────────────────────────────────────────────── */

export function searchInputVars( attributes ) {
	return buildTargetVars( attributes, {
		cssPrefix: '--ab-pff-input',
		attrPrefix: '',
		bwKeys: [
			'inputBorderTopWidth',
			'inputBorderRightWidth',
			'inputBorderBottomWidth',
			'inputBorderLeftWidth',
		],
		bsKey: 'inputBorderStyle',
		bcKey: 'inputBorderColor',
		bcHoverKey: 'inputBorderColorHover',
		radiusKeys: [
			'inputRadiusTopLeft',
			'inputRadiusTopRight',
			'inputRadiusBottomRight',
			'inputRadiusBottomLeft',
		],
		shadowKey: 'inputShadow',
		padTopKey: 'inputPaddingTop',
		padRightKey: 'inputPaddingRight',
		padBotKey: 'inputPaddingBottom',
		padLeftKey: 'inputPaddingLeft',
		colorKey: 'inputColor',
		colorHoverKey: 'inputColorHover',
		bgKey: 'inputBg',
		bgHoverKey: 'inputBgHover',
	} );
}

export function searchBtnVars( attributes ) {
	return buildTargetVars( attributes, {
		cssPrefix: '--ab-pff-btn',
		attrPrefix: 'btn',
		bwKeys: [
			'btnBorderTopWidth',
			'btnBorderRightWidth',
			'btnBorderBottomWidth',
			'btnBorderLeftWidth',
		],
		bsKey: 'btnBorderStyle',
		bcKey: 'btnBorderColor',
		bcHoverKey: 'btnBorderColorHover',
		radiusKeys: [
			'btnRadiusTopLeft',
			'btnRadiusTopRight',
			'btnRadiusBottomRight',
			'btnRadiusBottomLeft',
		],
		shadowKey: 'btnShadow',
		padTopKey: 'btnPaddingTop',
		padRightKey: 'btnPaddingRight',
		padBotKey: 'btnPaddingBottom',
		padLeftKey: 'btnPaddingLeft',
		colorKey: 'btnColor',
		colorHoverKey: 'btnColorHover',
		bgKey: 'btnBg',
		bgHoverKey: 'btnBgHover',
	} );
}

export function selectVars( attributes ) {
	return buildTargetVars( attributes, {
		cssPrefix: '--ab-pff-sel',
		attrPrefix: '',
		bwKeys: [
			'selectBorderTopWidth',
			'selectBorderRightWidth',
			'selectBorderBottomWidth',
			'selectBorderLeftWidth',
		],
		bsKey: 'selectBorderStyle',
		bcKey: 'selectBorderColor',
		bcHoverKey: 'selectBorderColorHover',
		radiusKeys: [
			'selectRadiusTopLeft',
			'selectRadiusTopRight',
			'selectRadiusBottomRight',
			'selectRadiusBottomLeft',
		],
		shadowKey: 'selectShadow',
		padTopKey: 'selectPaddingTop',
		padRightKey: 'selectPaddingRight',
		padBotKey: 'selectPaddingBottom',
		padLeftKey: 'selectPaddingLeft',
		colorKey: 'selectColor',
		colorHoverKey: 'selectColorHover',
		bgKey: 'selectBg',
		bgHoverKey: 'selectBgHover',
	} );
}

export function resetBtnVars( attributes ) {
	return buildTargetVars( attributes, {
		cssPrefix: '--ab-pff-btn',
		attrPrefix: '' /* reset uses unprefixed typography attrs */,
		bwKeys: [
			'btnBorderTopWidth',
			'btnBorderRightWidth',
			'btnBorderBottomWidth',
			'btnBorderLeftWidth',
		],
		bsKey: 'btnBorderStyle',
		bcKey: 'btnBorderColor',
		bcHoverKey: 'btnBorderColorHover',
		radiusKeys: [
			'btnRadiusTopLeft',
			'btnRadiusTopRight',
			'btnRadiusBottomRight',
			'btnRadiusBottomLeft',
		],
		shadowKey: 'btnShadow',
		padTopKey: 'btnPaddingTop',
		padRightKey: 'btnPaddingRight',
		padBotKey: 'btnPaddingBottom',
		padLeftKey: 'btnPaddingLeft',
		colorKey: 'btnColor',
		colorHoverKey: 'btnColorHover',
		bgKey: 'btnBg',
		bgHoverKey: 'btnBgHover',
	} );
}
