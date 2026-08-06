/**
 * IconControl — the single, shared icon picker for inspector panels.
 *
 * One consistent affordance across every block: a label row with a trigger
 * button that previews the current icon; clicking opens the searchable grid
 * (plus the custom-icon library) in a popover.
 *
 * Pass `library`/`meta` to use a block's own curated set (Advanced Button);
 * defaults to the shared library. `clearable` adds an in-grid "None" tile;
 * `fallback` previews a slug in the trigger when the value is empty (e.g. a
 * block that always renders a default icon). Custom (site-wide) icons are
 * enabled by default — pass `custom={ false }` for blocks that resolve icons
 * outside Icons::get(). Styles: `.ab-icon-control` in src/editor.scss.
 */

import { __ } from '@wordpress/i18n';
import { Dropdown } from '@wordpress/components';
import { ICON_LIBRARY, ICON_META } from './iconLibrary';
import { IconPicker } from './IconPicker';
import { useCustomIcons } from './useCustomIcons';
import { Caret } from './Caret';

export function IconControl( {
	label = __( 'Icon', 'axiom-blocks' ),
	value,
	onChange,
	library = ICON_LIBRARY,
	meta = ICON_META,
	clearable = false,
	fallback = '',
	placeholder = __( 'None', 'axiom-blocks' ),
	custom = true,
} ) {
	const { icons } = useCustomIcons();
	const isCustomValue =
		typeof value === 'string' && value.startsWith( 'custom:' );
	const customIcon = isCustomValue
		? icons.find( ( i ) => i.id === value )
		: null;

	const activeSlug =
		( value && library[ value ] && value ) ||
		( ! value && fallback && library[ fallback ] && fallback ) ||
		'';

	let glyph = null;
	let name = placeholder;
	if ( customIcon ) {
		glyph = (
			// eslint-disable-next-line react/no-danger
			<span dangerouslySetInnerHTML={ { __html: customIcon.svg } } />
		);
		name = customIcon.label;
	} else if ( activeSlug ) {
		glyph = library[ activeSlug ];
		name = meta.find( ( i ) => i.slug === activeSlug )?.label || activeSlug;
	}

	return (
		<div className="ab-icon-control">
			{ label && (
				<span className="ab-icon-control__label">{ label }</span>
			) }
			<Dropdown
				className="ab-icon-control__pick"
				popoverProps={ { placement: 'bottom-start' } }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<button
						type="button"
						className="ab-icon-control__btn"
						onClick={ onToggle }
						aria-expanded={ isOpen }
						aria-label={ __( 'Choose icon', 'axiom-blocks' ) }
					>
						{ glyph && (
							<span className="ab-icon-control__glyph">
								{ glyph }
							</span>
						) }
						<span
							className={ `ab-icon-control__name${
								glyph ? '' : ' is-placeholder'
							}` }
						>
							{ name }
						</span>
						<Caret className="ab-icon-control__chevron" />
					</button>
				) }
				renderContent={ () => (
					<div className="ab-icon-control__pop">
						<IconPicker
							value={ value }
							onChange={ onChange }
							library={ library }
							meta={ meta }
							clearable={ clearable }
							custom={ custom }
						/>
					</div>
				) }
			/>
		</div>
	);
}
