import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	InnerBlocks,
	MediaUpload,
	MediaUploadCheck,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { PanelBody, Dropdown, Button } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	getTypographyStyle,
} from '../../components/TypographyPanel';
import { BlockIcon } from '../../blockIcons';
import { UIIcon, UI_ICON_SLUGS } from '../../uiIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ICON_STROKE = {
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.6,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};
const IconChevronUp = () => (
	<svg viewBox="0 0 16 16" { ...ICON_STROKE }>
		<path d="M4 10l4-4 4 4" />
	</svg>
);
const IconChevronDown = () => (
	<svg viewBox="0 0 16 16" { ...ICON_STROKE }>
		<path d="M4 6l4 4 4-4" />
	</svg>
);
const IconTrash = () => (
	<svg viewBox="0 0 24 24" { ...ICON_STROKE }>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M3 6h18" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</svg>
);
const IconPlus = () => (
	<svg viewBox="0 0 16 16" { ...ICON_STROKE }>
		<path d="M8 3.5v9M3.5 8h9" />
	</svg>
);

const generateTabId = () =>
	`tab-${ Math.random().toString( 36 ).slice( 2, 10 ) }`;

const TAB_STYLES = [
	{ label: 'Default', value: 'default' },
	{ label: 'Pills', value: 'pills' },
	{ label: 'Underline', value: 'underline' },
	{ label: 'Boxed', value: 'boxed' },
];

const EMPTY_ICON = { iconSlug: '', iconUrl: '', iconId: 0, iconAlt: '' };

/**
 * Inline preview rendered inside the tab label (editor + picker trigger).
 * Library icons inherit currentColor; uploads render as <img>.
 * @param root0
 * @param root0.slug
 * @param root0.url
 * @param root0.alt
 * @param root0.size
 */
function TabIconPreview( { slug, url, alt, size = 16 } ) {
	if ( slug ) return <UIIcon slug={ slug } size={ size } />;
	if ( url )
		return (
			<img
				src={ url }
				alt={ alt || '' }
				className="axiom-blocks-tabs__icon-img"
			/>
		);
	return null;
}

function IconPicker( { iconSlug, iconUrl, iconAlt, onChange } ) {
	const hasIcon = !! ( iconSlug || iconUrl );
	const svgSupported = !! window.axiomBlocksSettings?.svgUploadSupported;

	return (
		<Dropdown
			className="ab-icon-picker-dropdown"
			contentClassName="ab-icon-picker-popover"
			popoverProps={ { placement: 'bottom-start' } }
			renderToggle={ ( { isOpen, onToggle } ) => (
				<button
					type="button"
					className={ `ab-tab-icon-trigger${
						hasIcon ? ' has-icon' : ''
					}${ isOpen ? ' is-open' : '' }` }
					onClick={ onToggle }
					aria-expanded={ isOpen }
					aria-label={ __( 'Choose icon', 'axiom-blocks' ) }
				>
					{ hasIcon ? (
						<TabIconPreview
							slug={ iconSlug }
							url={ iconUrl }
							alt={ iconAlt }
							size={ 16 }
						/>
					) : (
						<IconPlus />
					) }
				</button>
			) }
			renderContent={ ( { onClose } ) => (
				<div className="ab-icon-picker">
					<div className="ab-icon-picker__header">
						{ __( 'Icon library', 'axiom-blocks' ) }
					</div>
					<div className="ab-icon-picker__grid" role="listbox">
						{ UI_ICON_SLUGS.map( ( slug ) => {
							const isSelected = slug === iconSlug;
							return (
								<button
									key={ slug }
									type="button"
									role="option"
									aria-selected={ isSelected }
									className={ `ab-icon-picker__item${
										isSelected ? ' is-selected' : ''
									}` }
									title={ slug }
									onClick={ () => {
										onChange( {
											...EMPTY_ICON,
											iconSlug: slug,
										} );
										onClose();
									} }
								>
									<UIIcon slug={ slug } size={ 18 } />
								</button>
							);
						} ) }
					</div>
					<div className="ab-icon-picker__footer">
						<div className="ab-icon-picker__upload">
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ ( media ) => {
										onChange( {
											...EMPTY_ICON,
											iconUrl: media.url,
											iconId: media.id,
											iconAlt:
												media.alt || media.title || '',
										} );
										onClose();
									} }
									allowedTypes={ [ 'image' ] }
									value={ 0 }
									render={ ( { open } ) => (
										<Button
											variant="secondary"
											onClick={ open }
										>
											{ __(
												'Upload custom icon',
												'axiom-blocks'
											) }
										</Button>
									) }
								/>
							</MediaUploadCheck>
							{ hasIcon && (
								<Button
									variant="link"
									isDestructive
									onClick={ () => {
										onChange( EMPTY_ICON );
										onClose();
									} }
								>
									{ __( 'Remove', 'axiom-blocks' ) }
								</Button>
							) }
						</div>
						{ svgSupported ? (
							<p className="ab-icon-picker__note">
								{ __(
									'PNG, JPG, GIF, WebP & SVG supported.',
									'axiom-blocks'
								) }
							</p>
						) : (
							<p className="ab-icon-picker__note is-warning">
								{ __(
									'PNG, JPG, GIF & WebP supported. To upload SVG, install a plugin like Safe SVG.',
									'axiom-blocks'
								) }
							</p>
						) }
					</div>
				</div>
			) }
		/>
	);
}

function TabsEdit( { attributes, setAttributes, clientId } ) {
	if ( ! isBlockEnabled( 'tabs' ) ) {
		return <DisabledBlockMessage blockName="Tabs" />;
	}
	const {
		activeTab,
		tabStyle,
		tabOrientation,
		tabAlignment,
		fullWidthTabs,
		activeColor,
		inactiveColor,
		backgroundColor,
		contentBackgroundColor,
		contentGap,
	} = attributes;

	const panels = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ),
		[ clientId ]
	);

	const {
		insertBlock,
		removeBlock,
		moveBlocksToPosition,
		updateBlockAttributes,
	} = useDispatch( blockEditorStore );

	useEffect( () => {
		if ( ! panels.length ) return;
		const ids = panels.map( ( p ) => p.attributes.tabId ).filter( Boolean );
		if ( ! ids.length ) return;
		if ( ! ids.includes( activeTab ) ) {
			setAttributes( { activeTab: ids[ 0 ] } );
		}
	}, [ panels, activeTab, setAttributes ] );

	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-tabs',
			`axiom-blocks-tabs--${ tabStyle }`,
			`axiom-blocks-tab--${ tabOrientation || 'horizontal' }`,
			tabOrientation !== 'vertical'
				? `axiom-blocks-tab--align-${ tabAlignment }`
				: '',
			fullWidthTabs ? 'is-full-width' : '',
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--axiom-blocks-tab-active': activeColor || undefined,
			'--axiom-blocks-tab-inactive': inactiveColor || undefined,
			'--axiom-blocks-tab-bg': backgroundColor || undefined,
			'--axiom-blocks-tab-content-bg':
				contentBackgroundColor || undefined,
			'--axiom-blocks-tabs-content-gap': contentGap
				? `${ contentGap }px`
				: undefined,
			...getSpacingStyle( attributes ),
		},
	} );

	const addTab = () => {
		const tabId = generateTabId();
		const label = `${ __( 'Tab', 'axiom-blocks' ) } ${ panels.length + 1 }`;
		insertBlock(
			createBlock( 'axiom-blocks/tab-panel', { tabId, label } ),
			panels.length,
			clientId,
			false
		);
		// Only promote the new tab to active when there's nothing valid set yet.
		// Otherwise the saved `activeTab` would silently follow whichever tab
		// was added or clicked last, which surfaces on the frontend as "the
		// last tab is always the default-open one".
		const validIds = panels
			.map( ( p ) => p.attributes.tabId )
			.filter( Boolean );
		if ( ! validIds.includes( activeTab ) ) {
			setAttributes( { activeTab: tabId } );
		}
	};

	const removeTab = ( panelClientId, tabId ) => {
		if ( panels.length <= 1 ) return;
		const index = panels.findIndex( ( p ) => p.clientId === panelClientId );
		removeBlock( panelClientId, false );
		if ( activeTab === tabId ) {
			const remaining = panels.filter(
				( p ) => p.clientId !== panelClientId
			);
			if ( remaining.length ) {
				const nextIndex = Math.min( index, remaining.length - 1 );
				setAttributes( {
					activeTab: remaining[ nextIndex ].attributes.tabId,
				} );
			}
		}
	};

	const movePanel = ( panelClientId, direction ) => {
		const index = panels.findIndex( ( p ) => p.clientId === panelClientId );
		const target = index + direction;
		if ( target < 0 || target >= panels.length ) return;
		moveBlocksToPosition( [ panelClientId ], clientId, clientId, target );
	};

	const renameTab = ( panelClientId, newLabel ) => {
		updateBlockAttributes( panelClientId, { label: newLabel } );
	};

	const setIconForPanel = ( panelClientId, iconAttrs ) => {
		updateBlockAttributes( panelClientId, iconAttrs );
	};

	const isVertical = tabOrientation === 'vertical';
	const justifyContent = isVertical
		? undefined
		: { left: 'flex-start', center: 'center', right: 'flex-end' }[
				tabAlignment
		  ] || 'flex-start';

	const labelTypoStyle = getTypographyStyle( attributes, 'label' );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Tabs', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<div className="ab-tab-repeater">
						{ panels.map( ( panel, i ) => {
							const isActive =
								panel.attributes.tabId === activeTab;
							const canDelete = panels.length > 1;
							const {
								iconSlug = '',
								iconUrl = '',
								iconAlt = '',
							} = panel.attributes;
							return (
								<div
									className="ab-tab-row"
									key={ panel.clientId }
								>
									<div
										className={ `ab-tab-item${
											isActive ? ' is-active' : ''
										}` }
									>
										<span className="ab-tab-item__num">
											{ i + 1 }
										</span>
										<IconPicker
											iconSlug={ iconSlug }
											iconUrl={ iconUrl }
											iconAlt={ iconAlt }
											onChange={ ( attrs ) =>
												setIconForPanel(
													panel.clientId,
													attrs
												)
											}
										/>
										<input
											type="text"
											className="ab-tab-item__input"
											value={
												panel.attributes.label || ''
											}
											onChange={ ( e ) =>
												renameTab(
													panel.clientId,
													e.target.value
												)
											}
											placeholder={ __(
												'Tab label',
												'axiom-blocks'
											) }
										/>
										<div className="ab-tab-item__actions">
											<button
												type="button"
												className={ `ab-tab-btn ab-tab-btn--star${
													isActive ? ' is-active' : ''
												}` }
												onClick={ () => {
													if ( ! isActive )
														setAttributes( {
															activeTab:
																panel.attributes
																	.tabId,
														} );
												} }
												aria-pressed={ isActive }
												aria-label={
													isActive
														? __(
																'Default-open tab',
																'axiom-blocks'
														  )
														: __(
																'Make this the default-open tab',
																'axiom-blocks'
														  )
												}
												title={
													isActive
														? __(
																'This tab opens by default on the frontend.',
																'axiom-blocks'
														  )
														: __(
																'Make this the default-open tab.',
																'axiom-blocks'
														  )
												}
											>
												<svg
													viewBox="0 0 16 16"
													width="14"
													height="14"
													aria-hidden="true"
												>
													<path
														d="M8 1.5l1.93 4.12 4.57.55-3.36 3.07.93 4.46L8 11.45l-4.07 2.25.93-4.46L1.5 6.17l4.57-.55L8 1.5z"
														fill={
															isActive
																? 'currentColor'
																: 'none'
														}
														stroke="currentColor"
														strokeWidth="1.5"
														strokeLinejoin="round"
													/>
												</svg>
											</button>
											<button
												type="button"
												className="ab-tab-btn"
												onClick={ () =>
													movePanel(
														panel.clientId,
														-1
													)
												}
												disabled={ i === 0 }
												aria-label={ __(
													'Move up',
													'axiom-blocks'
												) }
											>
												<IconChevronUp />
											</button>
											<button
												type="button"
												className="ab-tab-btn"
												onClick={ () =>
													movePanel(
														panel.clientId,
														1
													)
												}
												disabled={
													i === panels.length - 1
												}
												aria-label={ __(
													'Move down',
													'axiom-blocks'
												) }
											>
												<IconChevronDown />
											</button>
											<button
												type="button"
												className="ab-tab-btn ab-tab-btn--danger"
												onClick={ () =>
													removeTab(
														panel.clientId,
														panel.attributes.tabId
													)
												}
												disabled={ ! canDelete }
												aria-label={ __(
													'Remove tab',
													'axiom-blocks'
												) }
											>
												<IconTrash />
											</button>
										</div>
									</div>
								</div>
							);
						} ) }
						<button
							type="button"
							className="ab-btn ab-btn--secondary ab-tab-add"
							onClick={ addTab }
						>
							<IconPlus />
							<span>{ __( 'Add tab', 'axiom-blocks' ) }</span>
						</button>
					</div>
				</PanelBody>

				<PanelBody
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Preset', 'axiom-blocks' ) }
						value={ tabStyle }
						options={ TAB_STYLES }
						onChange={ ( v ) => setAttributes( { tabStyle: v } ) }
					/>
					<ABSelectControl
						label={ __( 'Orientation', 'axiom-blocks' ) }
						value={ tabOrientation || 'horizontal' }
						options={ [
							{
								label: __( 'Horizontal', 'axiom-blocks' ),
								value: 'horizontal',
							},
							{
								label: __( 'Vertical', 'axiom-blocks' ),
								value: 'vertical',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { tabOrientation: v } )
						}
					/>
					{ ! isVertical && (
						<ABSelectControl
							label={ __( 'Alignment', 'axiom-blocks' ) }
							value={ tabAlignment }
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
							onChange={ ( v ) =>
								setAttributes( { tabAlignment: v } )
							}
						/>
					) }
					<ABToggleControl
						label={ __( 'Full-width tabs', 'axiom-blocks' ) }
						checked={ fullWidthTabs }
						onChange={ ( v ) =>
							setAttributes( { fullWidthTabs: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Content gap', 'axiom-blocks' ) }
						value={ contentGap }
						min={ 0 }
						max={ 80 }
						step={ 1 }
						unit="px"
						onChange={ ( v ) =>
							setAttributes( { contentGap: v ?? 0 } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Colors', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<p className="axiom-blocks-colors-note">
						{ __(
							'Leave empty to inherit theme colors.',
							'axiom-blocks'
						) }
					</p>
					<ABColorControl
						label={ __( 'Active', 'axiom-blocks' ) }
						color={ activeColor || '#000000' }
						onChange={ ( c ) =>
							setAttributes( { activeColor: c } )
						}
					/>
					<ABColorControl
						label={ __( 'Inactive', 'axiom-blocks' ) }
						color={ inactiveColor || '#666666' }
						onChange={ ( c ) =>
							setAttributes( { inactiveColor: c } )
						}
					/>
					<ABColorControl
						label={ __( 'Tab bar', 'axiom-blocks' ) }
						color={ backgroundColor || '#ffffff' }
						onChange={ ( c ) =>
							setAttributes( { backgroundColor: c } )
						}
					/>
					<ABColorControl
						label={ __( 'Content', 'axiom-blocks' ) }
						color={ contentBackgroundColor || '#ffffff' }
						onChange={ ( c ) =>
							setAttributes( { contentBackgroundColor: c } )
						}
					/>
				</PanelBody>

				<TypographyPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					prefix="label"
					title={ __( 'Tab label typography', 'axiom-blocks' ) }
				/>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div
					className="axiom-blocks-tabs__list"
					role="tablist"
					style={ { justifyContent } }
				>
					{ panels.map( ( panel ) => {
						const { tabId, label, iconSlug, iconUrl, iconAlt } =
							panel.attributes;
						const isActive = tabId && tabId === activeTab;
						const hasIcon = !! ( iconSlug || iconUrl );
						return (
							<button
								key={ panel.clientId }
								type="button"
								className={ `axiom-blocks-tabs__tab ${
									isActive ? 'is-active' : ''
								}` }
								role="tab"
								aria-selected={ isActive ? 'true' : 'false' }
								onClick={ () =>
									setAttributes( { activeTab: tabId } )
								}
							>
								{ hasIcon && (
									<span className="axiom-blocks-tabs__icon">
										<TabIconPreview
											slug={ iconSlug }
											url={ iconUrl }
											alt={ iconAlt }
											size={ 18 }
										/>
									</span>
								) }
								<span
									className="axiom-blocks-tabs__label"
									style={ labelTypoStyle }
								>
									{ label ||
										__( '(untitled)', 'axiom-blocks' ) }
								</span>
							</button>
						);
					} ) }
				</div>

				<div className="axiom-blocks-tabs__content">
					<InnerBlocks
						allowedBlocks={ [ 'axiom-blocks/tab-panel' ] }
						template={ [
							[
								'axiom-blocks/tab-panel',
								{
									tabId: 'tab-1',
									label: __( 'Tab 1', 'axiom-blocks' ),
								},
							],
						] }
						templateLock={ false }
						renderAppender={ false }
					/>
				</div>
			</div>
		</>
	);
}

export const Tabs = {
	name: 'axiom-blocks/tabs',
	settings: {
		title: __( 'Tabs', 'axiom-blocks' ),
		description: __(
			'Horizontal tabs with any block content inside each panel.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="tabs" />,
		edit: TabsEdit,
		save: () => <InnerBlocks.Content />,
	},
};
