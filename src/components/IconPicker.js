/**
 * IconPicker — searchable grid for choosing an icon, plus the custom-icon library.
 *
 * Defaults to the shared library (ICON_LIBRARY/ICON_META) so most blocks just
 * pass `value`/`onChange`. A block with its own curated set (e.g. Advanced
 * Button) passes its own `library` + `meta`. Set `clearable` to add a leading
 * "None" tile that clears the value.
 *
 * When `custom` is true (default), the picker shows a Library / Custom SVG
 * toggle: the Library tab lists the site-wide custom icons first (a "Custom"
 * group) then the built-ins, and the Custom SVG tab is a manager — paste & name
 * SVGs, delete unused ones (in-use icons are refused). Blocks that resolve icons
 * outside Icons::get() (curated/own frontend) should pass `custom={ false }`.
 *
 * Styles live in src/editor.scss (`.ab-icon-picker`).
 */

import { __, sprintf } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ICON_LIBRARY, ICON_META } from './iconLibrary';
import { useCustomIcons } from './useCustomIcons';

const customGlyph = ( svg ) => (
	// eslint-disable-next-line react/no-danger
	<span dangerouslySetInnerHTML={ { __html: svg } } />
);

const DeleteIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="3"
		strokeLinecap="round"
		aria-hidden="true"
	>
		<path d="M18 6 6 18" />
		<path d="m6 6 12 12" />
	</svg>
);

const WarnIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
		<path d="M12 9v4" />
		<path d="M12 17h.01" />
	</svg>
);

function filterMeta( meta, q ) {
	if ( ! q ) {
		return meta;
	}
	return meta.filter(
		( i ) =>
			i.label.toLowerCase().includes( q ) ||
			( i.keywords && i.keywords.includes( q ) ) ||
			i.slug.includes( q )
	);
}

export function IconPicker( {
	value,
	onChange,
	library = ICON_LIBRARY,
	meta = ICON_META,
	clearable = false,
	custom = true,
} ) {
	const { icons, add, remove } = useCustomIcons();
	const [ tab, setTab ] = useState( 'library' );
	const [ query, setQuery ] = useState( '' );
	const [ svgText, setSvgText ] = useState( '' );
	const [ nameText, setNameText ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ error, setError ] = useState( '' );

	const customMeta = icons.map( ( i ) => ( { slug: i.id, label: i.label } ) );
	const mergedLib = { ...library };
	icons.forEach( ( i ) => {
		mergedLib[ i.id ] = customGlyph( i.svg );
	} );

	const renderItem = ( i ) => (
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
			{ mergedLib[ i.slug ] }
		</button>
	);

	const handleDelete = ( id ) => {
		setError( '' );
		remove( id )
			.then( () => {
				if ( value === id ) {
					onChange( '' );
				}
			} )
			.catch( ( err ) =>
				setError(
					err?.message ||
						__( 'Could not delete this icon.', 'axiom-blocks' )
				)
			);
	};

	const handleAdd = () => {
		if ( ! svgText.trim() || busy ) {
			return;
		}
		setError( '' );
		setBusy( true );
		add( nameText, svgText )
			.then( ( icon ) => {
				setSvgText( '' );
				setNameText( '' );
				onChange( icon.id );
			} )
			.catch( ( err ) =>
				setError(
					err?.message ||
						__( 'Could not add this icon.', 'axiom-blocks' )
				)
			)
			.finally( () => setBusy( false ) );
	};

	const search = (
		<input
			type="search"
			className="ab-icon-picker__search"
			placeholder={ __( 'Search icons…', 'axiom-blocks' ) }
			value={ query }
			onChange={ ( e ) => setQuery( e.target.value ) }
		/>
	);

	// Curated/own-resolution blocks: plain grid, no custom library.
	if ( ! custom ) {
		const list = filterMeta( meta, query.trim().toLowerCase() );
		return (
			<div className="ab-icon-picker">
				{ search }
				<div className="ab-icon-picker__grid">
					{ clearable && ! query && (
						<button
							type="button"
							title={ __( 'None', 'axiom-blocks' ) }
							aria-label={ __( 'None', 'axiom-blocks' ) }
							aria-pressed={ ! value }
							className={ `ab-icon-picker__item ab-icon-picker__item--none${
								! value ? ' is-selected' : ''
							}` }
							onClick={ () => onChange( '' ) }
						>
							{ __( 'None', 'axiom-blocks' ) }
						</button>
					) }
					{ list.map( renderItem ) }
					{ list.length === 0 && (
						<p className="ab-icon-picker__empty">
							{ __( 'No icons found.', 'axiom-blocks' ) }
						</p>
					) }
				</div>
			</div>
		);
	}

	const q = query.trim().toLowerCase();
	const libList = filterMeta( meta, q );
	const custList = filterMeta( customMeta, q );
	const hasCustom = customMeta.length > 0;

	// Only admins manage the custom library; everyone else just picks from it.
	const canManage = !! (
		typeof window !== 'undefined' &&
		window.axiomBlocksSettings &&
		window.axiomBlocksSettings.canManageIcons
	);

	const libraryView = (
		<>
			{ search }
			<div className="ab-icon-picker__grid">
				{ clearable && ! q && (
					<button
						type="button"
						title={ __( 'None', 'axiom-blocks' ) }
						aria-label={ __( 'None', 'axiom-blocks' ) }
						aria-pressed={ ! value }
						className={ `ab-icon-picker__item ab-icon-picker__item--none${
							! value ? ' is-selected' : ''
						}` }
						onClick={ () => onChange( '' ) }
					>
						{ __( 'None', 'axiom-blocks' ) }
					</button>
				) }
				{ hasCustom && custList.length > 0 && (
					<p className="ab-icon-picker__group">
						{ __( 'Custom', 'axiom-blocks' ) }
					</p>
				) }
				{ custList.map( renderItem ) }
				{ hasCustom && libList.length > 0 && (
					<p className="ab-icon-picker__group">
						{ __( 'Library', 'axiom-blocks' ) }
					</p>
				) }
				{ libList.map( renderItem ) }
				{ libList.length === 0 && custList.length === 0 && (
					<p className="ab-icon-picker__empty">
						{ __( 'No icons found.', 'axiom-blocks' ) }
					</p>
				) }
			</div>
		</>
	);

	if ( ! canManage ) {
		return <div className="ab-icon-picker">{ libraryView }</div>;
	}

	return (
		<div className="ab-icon-picker">
			<div className="ab-icon-picker__tabs">
				<button
					type="button"
					className={ `ab-icon-picker__tab${
						tab === 'library' ? ' is-active' : ''
					}` }
					aria-pressed={ tab === 'library' }
					onClick={ () => setTab( 'library' ) }
				>
					{ __( 'Library', 'axiom-blocks' ) }
				</button>
				<button
					type="button"
					className={ `ab-icon-picker__tab${
						tab === 'custom' ? ' is-active' : ''
					}` }
					aria-pressed={ tab === 'custom' }
					onClick={ () => setTab( 'custom' ) }
				>
					{ __( 'Custom SVG', 'axiom-blocks' ) }
				</button>
			</div>

			{ tab === 'library' ? (
				libraryView
			) : (
				<div className="ab-icon-picker__manage">
					<div className="ab-icon-picker__grid">
						{ customMeta.map( ( i ) => (
							<div key={ i.slug } className="ab-icon-picker__cell">
								<button
									type="button"
									title={ i.label }
									aria-label={ i.label }
									aria-pressed={ value === i.slug }
									className={ `ab-icon-picker__item ab-icon-picker__item--custom${
										value === i.slug ? ' is-selected' : ''
									}` }
									onClick={ () => onChange( i.slug ) }
								>
									{ mergedLib[ i.slug ] }
								</button>
								<button
									type="button"
									className="ab-icon-picker__del"
									aria-label={ sprintf(
										/* translators: %s: icon name. */
										__( 'Delete %s', 'axiom-blocks' ),
										i.label
									) }
									onClick={ () => handleDelete( i.slug ) }
								>
									<DeleteIcon />
								</button>
							</div>
						) ) }
						{ ! hasCustom && (
							<p className="ab-icon-picker__empty">
								{ __(
									'No custom icons yet. Paste your first one below.',
									'axiom-blocks'
								) }
							</p>
						) }
					</div>

					{ error && (
						<p className="ab-icon-picker__err">
							<WarnIcon />
							<span>{ error }</span>
						</p>
					) }

					<div className="ab-icon-picker__add">
						<span className="ab-icon-picker__add-label">
							{ __( 'Add a custom icon', 'axiom-blocks' ) }
						</span>
						<textarea
							className="ab-icon-picker__add-svg"
							value={ svgText }
							onChange={ ( e ) => setSvgText( e.target.value ) }
							rows={ 5 }
							placeholder="<svg …>…</svg>"
							spellCheck={ false }
						/>
						<div className="ab-icon-picker__add-row">
							<input
								type="text"
								className="ab-icon-picker__add-name"
								value={ nameText }
								onChange={ ( e ) => setNameText( e.target.value ) }
								placeholder={ __(
									'Name (optional)',
									'axiom-blocks'
								) }
							/>
							<button
								type="button"
								className="ab-icon-picker__add-btn"
								disabled={ ! svgText.trim() || busy }
								onClick={ handleAdd }
							>
								{ __( 'Add', 'axiom-blocks' ) }
							</button>
						</div>
						<p className="ab-icon-picker__add-help">
							{ __(
								'Paste an <svg>. Use currentColor for fills/strokes so the colour controls apply.',
								'axiom-blocks'
							) }
						</p>
					</div>
				</div>
			) }
		</div>
	);
}
