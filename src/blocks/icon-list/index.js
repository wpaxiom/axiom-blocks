import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody, Dropdown } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABTextControl,
} from '../../components/ABControls';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { useDeviceType } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import { responsiveVarValue } from '../../components/responsiveProps';
import { IconPicker } from '../../components/IconPicker';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { useIconNode } from '../../components/useCustomIcons';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

const newId = () => `item-${ Math.random().toString( 36 ).slice( 2, 8 ) }`;

/* Row reorder/remove handles — same look as the Pro data-table mini-actions. */
const iconStroke = {
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.8,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};
const IconUp = () => (
	<svg viewBox="0 0 16 16" { ...iconStroke }>
		<path d="M4 10l4-4 4 4" />
	</svg>
);
const IconDown = () => (
	<svg viewBox="0 0 16 16" { ...iconStroke }>
		<path d="M4 6l4 4 4-4" />
	</svg>
);
const IconTrash = () => (
	<svg viewBox="0 0 24 24" { ...iconStroke }>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M3 6h18" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</svg>
);
const IconLink = () => (
	<svg viewBox="0 0 24 24" { ...iconStroke }>
		<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
		<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
	</svg>
);
const IconPlus = () => (
	<svg viewBox="0 0 16 16" { ...iconStroke }>
		<path d="M8 3v10M3 8h10" />
	</svg>
);

export function getIconListVars( attributes ) {
	const {
		iconSize,
		iconColor,
		gap,
		rowGap,
		dividerColor,
		textColor,
		linkColor,
		linkHoverColor,
	} = attributes;
	return {
		'--ab-il-icon-size': iconSize || undefined,
		'--ab-il-icon-color': iconColor || undefined,
		'--ab-il-gap': gap || undefined,
		'--ab-il-row-gap': rowGap || undefined,
		'--ab-il-divider': dividerColor || undefined,
		'--ab-il-link': linkColor || undefined,
		'--ab-il-link-h': linkHoverColor || undefined,
		color: textColor || undefined,
	};
}

export function getIconListClasses( attributes ) {
	const { layout, iconPosition, itemsAlign, showDivider } = attributes;
	return [
		'ab-icon-list',
		`ab-icon-list--${ layout || 'vertical' }`,
		`ab-icon-list--icon-${ iconPosition || 'left' }`,
		`ab-icon-list--align-${ itemsAlign || 'left' }`,
		showDivider ? 'has-divider' : '',
	].filter( Boolean );
}

function IconListEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'icon-list' ) ) {
		return <DisabledBlockMessage blockName="Icon List" />;
	}

	const resolveIcon = useIconNode();

	const {
		items,
		layout,
		iconPosition,
		itemsAlign,
		iconColor,
		gap,
		rowGap,
		showDivider,
		dividerColor,
		textColor,
		linkColor,
		linkHoverColor,
	} = attributes;

	const list = Array.isArray( items ) ? items : [];

	const updateItem = ( id, patch ) =>
		setAttributes( {
			items: list.map( ( it ) =>
				it.id === id ? { ...it, ...patch } : it
			),
		} );
	const addItem = () =>
		setAttributes( {
			items: [
				...list,
				{ id: newId(), icon: 'check', text: '', url: '' },
			],
		} );
	const removeItem = ( id ) =>
		setAttributes( { items: list.filter( ( it ) => it.id !== id ) } );
	const moveItem = ( index, dir ) => {
		const next = index + dir;
		if ( next < 0 || next >= list.length ) return;
		const copy = [ ...list ];
		[ copy[ index ], copy[ next ] ] = [ copy[ next ], copy[ index ] ];
		setAttributes( { items: copy } );
	};

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: getIconListClasses( attributes ).join( ' ' ),
		style: {
			...getIconListVars( attributes ),
			...useSpacingStyle( attributes ),
			...useTypographyStyle( attributes ),
			'--ab-il-gap': responsiveVarValue( attributes, 'gap', device ),
			'--ab-il-row-gap': responsiveVarValue(
				attributes,
				'rowGap',
				device
			),
			'--ab-il-icon-size': responsiveVarValue(
				attributes,
				'iconSize',
				device
			),
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'List', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Layout', 'axiom-blocks' ) }
						value={ layout }
						options={ [
							{
								label: __( 'Vertical', 'axiom-blocks' ),
								value: 'vertical',
							},
							{
								label: __( 'Horizontal', 'axiom-blocks' ),
								value: 'horizontal',
							},
						] }
						onChange={ ( v ) => setAttributes( { layout: v } ) }
					/>
					<ABSelectControl
						label={ __( 'Icon position', 'axiom-blocks' ) }
						value={ iconPosition }
						options={ [
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Right', 'axiom-blocks' ),
								value: 'right',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { iconPosition: v } )
						}
					/>
					<ABSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={ itemsAlign }
						options={ [
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Center', 'axiom-blocks' ),
								value: 'center',
							},
							{
								label: __( 'Right', 'axiom-blocks' ),
								value: 'right',
							},
						] }
						onChange={ ( v ) => setAttributes( { itemsAlign: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="iconSize"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Size', 'axiom-blocks' ) }
								value={ fromPx(
									value === '' ? inherited : value,
									20
								) }
								onChange={ ( v ) => setValue( toPx( v ) ) }
								min={ 10 }
								max={ 64 }
								step={ 1 }
								unit="px"
							/>
						) }
					</ABResponsive>
					<ABColorControl
						label={ __( 'Colour', 'axiom-blocks' ) }
						color={ iconColor }
						onChange={ ( v ) => setAttributes( { iconColor: v } ) }
					/>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="gap"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Icon gap', 'axiom-blocks' ) }
								value={ fromPx(
									value !== '' && value != null
										? value
										: inherited,
									10
								) }
								onChange={ ( v ) => setValue( toPx( v ) ) }
								min={ 0 }
								max={ 40 }
								step={ 1 }
								unit="px"
							/>
						) }
					</ABResponsive>
				</PanelBody>

				<PanelBody
					title={ __( 'Spacing & divider', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="rowGap"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __(
									'Space between items',
									'axiom-blocks'
								) }
								value={ fromPx(
									value !== '' && value != null
										? value
										: inherited,
									12
								) }
								onChange={ ( v ) => setValue( toPx( v ) ) }
								min={ 0 }
								max={ 60 }
								step={ 1 }
								unit="px"
							/>
						) }
					</ABResponsive>
					<ABToggleControl
						label={ __( 'Divider between items', 'axiom-blocks' ) }
						checked={ !! showDivider }
						onChange={ ( v ) =>
							setAttributes( { showDivider: v } )
						}
					/>
					{ showDivider && (
						<ABColorControl
							label={ __( 'Divider colour', 'axiom-blocks' ) }
							color={ dividerColor }
							onChange={ ( v ) =>
								setAttributes( { dividerColor: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Colours', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Text', 'axiom-blocks' ) }
						color={ textColor }
						onChange={ ( v ) => setAttributes( { textColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Link', 'axiom-blocks' ) }
						color={ linkColor }
						onChange={ ( v ) => setAttributes( { linkColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Link hover', 'axiom-blocks' ) }
						color={ linkHoverColor }
						onChange={ ( v ) =>
							setAttributes( { linkHoverColor: v } )
						}
					/>
				</PanelBody>

				<TypographyPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					responsive
				/>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<ul { ...blockProps }>
				{ list.map( ( item, i ) => (
					<li key={ item.id } className="ab-icon-list__item">
						<Dropdown
							className="ab-icon-list__icon-pick"
							contentClassName="ab-icon-list__icon-popover"
							popoverProps={ { placement: 'bottom-start' } }
							renderToggle={ ( { isOpen, onToggle } ) => (
								<button
									type="button"
									className="ab-icon-list__icon ab-icon-list__icon-btn"
									onClick={ onToggle }
									aria-expanded={ isOpen }
									aria-label={ __(
										'Choose icon',
										'axiom-blocks'
									) }
								>
									{ resolveIcon( item.icon ) ||
										ICON_LIBRARY.check }
								</button>
							) }
							renderContent={ () => (
								<div className="ab-icon-list__icon-pop">
									<IconPicker
										value={ item.icon }
										onChange={ ( v ) =>
											updateItem( item.id, { icon: v } )
										}
									/>
								</div>
							) }
						/>
						<RichText
							tagName="span"
							className="ab-icon-list__text"
							value={ item.text }
							onChange={ ( v ) =>
								updateItem( item.id, { text: v } )
							}
							placeholder={ __( 'List item…', 'axiom-blocks' ) }
							allowedFormats={
								item.url
									? [ 'core/bold', 'core/italic' ]
									: [
											'core/bold',
											'core/italic',
											'core/link',
									  ]
							}
						/>
						<div
							className="ab-icon-list__tools"
							contentEditable={ false }
						>
							<Dropdown
								className="ab-icon-list__link-pick"
								popoverProps={ { placement: 'bottom-end' } }
								renderToggle={ ( { isOpen, onToggle } ) => (
									<button
										type="button"
										className={ `ab-icon-list__tool${
											item.url ? ' is-active' : ''
										}` }
										onClick={ onToggle }
										aria-expanded={ isOpen }
										aria-label={ __(
											'Set link',
											'axiom-blocks'
										) }
									>
										<IconLink />
									</button>
								) }
								renderContent={ () => (
									<div className="ab-icon-list__link-pop">
										<ABTextControl
											label={ __(
												'Link URL',
												'axiom-blocks'
											) }
											value={ item.url }
											onChange={ ( v ) =>
												updateItem( item.id, {
													url: v,
												} )
											}
											placeholder="https://"
											type="url"
										/>
									</div>
								) }
							/>
							<button
								type="button"
								className="ab-icon-list__tool"
								onClick={ () => moveItem( i, -1 ) }
								disabled={ i === 0 }
								aria-label={ __(
									'Move item up',
									'axiom-blocks'
								) }
							>
								<IconUp />
							</button>
							<button
								type="button"
								className="ab-icon-list__tool"
								onClick={ () => moveItem( i, 1 ) }
								disabled={ i === list.length - 1 }
								aria-label={ __(
									'Move item down',
									'axiom-blocks'
								) }
							>
								<IconDown />
							</button>
							<button
								type="button"
								className="ab-icon-list__tool is-danger"
								onClick={ () => removeItem( item.id ) }
								disabled={ list.length <= 1 }
								aria-label={ __(
									'Remove item',
									'axiom-blocks'
								) }
							>
								<IconTrash />
							</button>
						</div>
					</li>
				) ) }
				<li className="ab-icon-list__add-row" contentEditable={ false }>
					<button
						type="button"
						className="ab-btn ab-btn--secondary ab-icon-list__add"
						onClick={ addItem }
					>
						<IconPlus />
						<span>{ __( 'Add item', 'axiom-blocks' ) }</span>
					</button>
				</li>
			</ul>
		</>
	);
}

export const IconList = {
	name: 'axiom-blocks/icon-list',
	settings: {
		title: __( 'Icon List', 'axiom-blocks' ),
		description: __(
			'A list with a custom icon on every row — for features, benefits, or checklists.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="icon-list" />,
		edit: IconListEdit,
		save: ( { attributes } ) => {
			const { items } = attributes;
			const blockProps = useBlockProps.save();
			const list = Array.isArray( items ) ? items : [];
			return (
				<ul { ...blockProps }>
					{ list.map( ( item ) => (
						<li key={ item.id } className="ab-icon-list__item">
							{ item.url ? (
								<a className="ab-icon-list__link" href={ item.url }>
									<RichText.Content tagName="span" className="ab-icon-list__text" value={ item.text } />
								</a>
							) : (
								<RichText.Content tagName="span" className="ab-icon-list__text" value={ item.text } />
							) }
						</li>
					) ) }
				</ul>
			);
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
