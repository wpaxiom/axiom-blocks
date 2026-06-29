/**
 * Shared block deprecations.
 *
 * Axiom blocks render dynamically via render.php; their save() emits a semantic
 * fallback so authored text survives plugin deactivation. These factories supply
 * the matching `deprecated` entry so content saved under the previous (textless)
 * save shape migrates lazily, with no block-validation warning.
 *
 * Two things a deprecation does NOT do for you, both handled here:
 *  1. It does NOT inherit the block's attributes/supports — pass them in (from
 *     block.json metadata) or comment attributes (e.g. a title) are dropped.
 *  2. The old saves had no wrapper element, so `anchor` lived only in the block
 *     comment, yet the live `anchor` support sources it from an HTML `id`. We
 *     re-add `anchor` as a plain (comment-sourced) attribute and drop it from the
 *     deprecation's supports so in-page anchors survive the migration.
 */

import { InnerBlocks } from '@wordpress/block-editor';

function deprecationSchema( attributes, supports ) {
	const schema = {};
	if ( attributes ) {
		schema.attributes = { ...attributes, anchor: { type: 'string' } };
	}
	if ( supports ) {
		const { anchor: ignored, ...rest } = supports;
		schema.supports = rest;
	}
	return schema;
}

export function nullSaveDeprecation( { attributes, supports } = {} ) {
	return {
		...deprecationSchema( attributes, supports ),
		save: () => null,
	};
}

export function innerBlocksDeprecation( { attributes, supports } = {} ) {
	return {
		...deprecationSchema( attributes, supports ),
		save: () => <InnerBlocks.Content />,
	};
}
