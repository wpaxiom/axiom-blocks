/**
 * IconPicker — searchable grid for choosing an icon from the shared library.
 *
 * Reusable across blocks (Icon, Icon List). Stores the chosen icon by slug.
 * Styles live in src/editor.scss (`.ab-icon-picker`) so every consumer shares
 * one look without per-block CSS.
 */

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ICON_LIBRARY, ICON_META } from './iconLibrary';

export function IconPicker( { value, onChange } ) {
	const [ query, setQuery ] = useState( '' );
	const q = query.trim().toLowerCase();

	const list = q
		? ICON_META.filter(
				( i ) =>
					i.label.toLowerCase().includes( q ) ||
					i.keywords.includes( q ) ||
					i.slug.includes( q )
		  )
		: ICON_META;

	return (
		<div className="ab-icon-picker">
			<input
				type="search"
				className="ab-icon-picker__search"
				placeholder={ __( 'Search icons…', 'axiom-blocks' ) }
				value={ query }
				onChange={ ( e ) => setQuery( e.target.value ) }
			/>
			<div className="ab-icon-picker__grid">
				{ list.map( ( i ) => (
					<button
						key={ i.slug }
						type="button"
						title={ i.label }
						aria-label={ i.label }
						aria-pressed={ value === i.slug }
						className={ `ab-icon-picker__item${
							value === i.slug ? ' is-selected' : ''
						}` }
						onClick={ () => onChange( i.slug ) }
					>
						{ ICON_LIBRARY[ i.slug ] }
					</button>
				) ) }
				{ list.length === 0 && (
					<p className="ab-icon-picker__empty">
						{ __( 'No icons found.', 'axiom-blocks' ) }
					</p>
				) }
			</div>
		</div>
	);
}
