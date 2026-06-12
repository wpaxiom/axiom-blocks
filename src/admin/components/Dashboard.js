import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { BlockCard } from './BlockCard';
import { SettingsTab } from './SettingsTab';
import { Loader } from './Loader';
import {
	ABLogo,
	StatCard,
	SectionBar,
	SearchIcon,
	SparkIcon,
	CartIcon,
	GridIcon,
	CheckIcon,
	GearIcon,
	CloseIcon,
	PowerIcon,
} from './ui';

const PRIMARY = '#7C3AED';
const PRO_ACTIVE = !! window.axiomBlocksData?.proActive;

const EMPTY_LICENSE = {
	key: '',
	status: 'inactive',
	activated_at: 0,
	expires_at: 0,
};
const DEFAULT_SETTINGS = {
	woocommerce_integration: true,
	conditional_assets: true,
};

const isFree = ( b ) => b.tier === 'free' || b.tier === 'wc-free';
const isPro = ( b ) => b.tier === 'pro' || b.tier === 'wc-pro';
const isWoo = ( b ) => b.category === 'woocommerce';

export function Dashboard() {
	const [ blocks, setBlocks ] = useState( [] );
	const [ loading, setLoading ] = useState( true );
	const [ activeTab, setActive ] = useState( 'blocks' );
	const [ search, setSearch ] = useState( '' );
	const [ catTab, setCatTab ] = useState( 'all' );
	const [ toast, setToast ] = useState( null );
	const [ license, setLicense ] = useState( EMPTY_LICENSE );
	const [ licenseLoading, setLicenseLoading ] = useState( PRO_ACTIVE );
	const [ settings, setSettings ] = useState( DEFAULT_SETTINGS );

	useEffect( () => {
		fetchBlocks();
		fetchLicense();
		fetchSettings();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	const fetchBlocks = async () => {
		try {
			const data = await apiFetch( { path: '/axiom-blocks/v1/blocks' } );
			setBlocks( data );
		} catch {
			showToast(
				__( 'Failed to load blocks.', 'axiom-blocks' ),
				'error'
			);
		} finally {
			setLoading( false );
		}
	};

	const fetchLicense = async () => {
		if ( ! PRO_ACTIVE ) return;
		setLicenseLoading( true );
		try {
			const data = await apiFetch( { path: '/axiom-blocks/v1/license' } );
			setLicense( data );
		} catch {
			// Keep the inactive default; users can retry from Settings.
		} finally {
			setLicenseLoading( false );
		}
	};

	const fetchSettings = async () => {
		try {
			const data = await apiFetch( {
				path: '/axiom-blocks/v1/settings',
			} );
			setSettings( data );
		} catch {
			// Keep defaults.
		}
	};

	const showToast = ( message, type = 'success' ) => {
		setToast( { message, type } );
		setTimeout( () => setToast( null ), 2500 );
	};

	const toggleBlock = async ( id, enabled ) => {
		// Optimistic update
		setBlocks( ( prev ) =>
			prev.map( ( b ) => ( b.id === id ? { ...b, enabled } : b ) )
		);
		try {
			await apiFetch( {
				path: '/axiom-blocks/v1/blocks/toggle',
				method: 'POST',
				data: { block: id, enabled },
			} );
			showToast(
				enabled
					? __( 'Block enabled.', 'axiom-blocks' )
					: __( 'Block disabled.', 'axiom-blocks' )
			);
		} catch {
			setBlocks( ( prev ) =>
				prev.map( ( b ) =>
					b.id === id ? { ...b, enabled: ! enabled } : b
				)
			);
			showToast(
				__( 'Failed to update block.', 'axiom-blocks' ),
				'error'
			);
		}
	};

	const setAll = async ( list, enabled ) => {
		const toggleable = list.filter( ( b ) => isFree( b ) );
		setBlocks( ( prev ) =>
			prev.map( ( b ) =>
				toggleable.find( ( t ) => t.id === b.id )
					? { ...b, enabled }
					: b
			)
		);
		await Promise.all(
			toggleable.map( ( b ) =>
				apiFetch( {
					path: '/axiom-blocks/v1/blocks/toggle',
					method: 'POST',
					data: { block: b.id, enabled },
				} )
			)
		);
		showToast(
			enabled
				? __( 'All blocks enabled.', 'axiom-blocks' )
				: __( 'All blocks disabled.', 'axiom-blocks' )
		);
	};

	/* ── Derived data ──────────────────────────────────────────────────── */
	const wcEnabled = !! settings.woocommerce_integration;

	// When WooCommerce integration is off the entire WC category is hidden:
	// no blocks, no tab, no count contribution.
	const visibleBlocks = wcEnabled
		? blocks
		: blocks.filter( ( b ) => ! isWoo( b ) );

	const layout = visibleBlocks.filter( ( b ) => b.category === 'layout' );
	const content = visibleBlocks.filter( ( b ) => b.category === 'content' );
	const woo = visibleBlocks.filter( isWoo );

	const matches = ( b ) => {
		const q = search.toLowerCase();
		return (
			! q ||
			b.name.toLowerCase().includes( q ) ||
			b.description.toLowerCase().includes( q )
		);
	};

	const visLayout = layout.filter(
		( b ) => matches( b ) && ( catTab === 'all' || catTab === 'layout' )
	);
	const visContent = content.filter(
		( b ) => matches( b ) && ( catTab === 'all' || catTab === 'content' )
	);
	const visWoo = woo.filter(
		( b ) => matches( b ) && ( catTab === 'all' || catTab === 'woo' )
	);

	const showGeneral = catTab !== 'woo';
	const showWoo = wcEnabled && ( catTab === 'all' || catTab === 'woo' );

	const enabledCount = visibleBlocks.filter( ( b ) => b.enabled ).length;

	const catTabs = [
		{
			id: 'all',
			label: __( 'All Blocks', 'axiom-blocks' ),
			count: visibleBlocks.length,
		},
		{
			id: 'layout',
			label: __( 'Layout', 'axiom-blocks' ),
			count: layout.length,
		},
		{
			id: 'content',
			label: __( 'Content', 'axiom-blocks' ),
			count: content.length,
		},
		...( wcEnabled
			? [
					{
						id: 'woo',
						label: __( 'WooCommerce', 'axiom-blocks' ),
						count: woo.length,
					},
			  ]
			: [] ),
	];

	// If user disabled WC while on the WC tab, fall back to All Blocks.
	useEffect( () => {
		if ( ! wcEnabled && catTab === 'woo' ) setCatTab( 'all' );
	}, [ wcEnabled, catTab ] );

	const mainTabs = [
		{
			id: 'blocks',
			label: __( 'Block Manager', 'axiom-blocks' ),
			icon: <GridIcon size={ 14 } />,
		},
		{
			id: 'settings',
			label: __( 'Settings', 'axiom-blocks' ),
			icon: <GearIcon size={ 14 } />,
		},
	];

	/* ── Render ────────────────────────────────────────────────────────── */
	if ( loading ) {
		return (
			<div className="ab-root ab-root--loading">
				<Loader />
			</div>
		);
	}

	return (
		<div className="ab-root">
			{ /* Plugin page header */ }
			<div className="ab-header">
				<div className="ab-header__top">
					<ABLogo size={ 28 } color={ PRIMARY } />
					<div>
						<h1 className="ab-header__title">Axiom Blocks</h1>
						<p className="ab-header__sub">
							{ __(
								'Free and Pro Gutenberg blocks for WordPress',
								'axiom-blocks'
							) }
						</p>
					</div>
					<div style={ { flex: 1 } } />
				</div>

				{ /* Horizontal nav tabs */ }
				<div className="ab-nav-tabs">
					{ mainTabs.map( ( t ) => (
						<button
							key={ t.id }
							onClick={ () => setActive( t.id ) }
							className={ `ab-nav-tab ${
								activeTab === t.id ? 'is-active' : ''
							}` }
						>
							<span
								style={ {
									color:
										activeTab === t.id
											? PRIMARY
											: '#50575e',
								} }
							>
								{ t.icon }
							</span>
							{ t.label }
						</button>
					) ) }
				</div>
			</div>

			{ /* Scrollable content */ }
			<div className="ab-content">
				{ /* Toast notification */ }
				{ toast && (
					<div className={ `ab-toast ab-toast--${ toast.type }` }>
						{ toast.message }
					</div>
				) }

				{ /* ── Block Manager ──────────────────────────────────── */ }
				{ activeTab === 'blocks' && (
					<div>
						{ /* Stats row */ }
						<div className="ab-stats-row">
							<StatCard
								label={ __( 'Total Blocks', 'axiom-blocks' ) }
								value={ blocks.length }
								sub={ `${ enabledCount } ${ __(
									'active',
									'axiom-blocks'
								) }` }
								icon={ <GridIcon size={ 14 } /> }
								iconBg={ PRIMARY + '18' }
								iconColor={ PRIMARY }
							/>
							<StatCard
								label={ __( 'Free Blocks', 'axiom-blocks' ) }
								value={ blocks.filter( isFree ).length }
								sub={ __( 'Always available', 'axiom-blocks' ) }
								icon={ <CheckIcon size={ 14 } /> }
								iconBg="#ecfdf5"
								iconColor="#065f46"
							/>
							<StatCard
								label={ __( 'Pro Blocks', 'axiom-blocks' ) }
								value={ blocks.filter( isPro ).length }
								sub={
									PRO_ACTIVE
										? `${
												blocks.filter(
													( b ) =>
														isPro( b ) && b.enabled
												).length
										  } ${ __( 'active', 'axiom-blocks' ) }`
										: __(
												'Requires Pro plugin',
												'axiom-blocks'
										  )
								}
								icon={ <SparkIcon size={ 14 } /> }
								iconBg="#fffbeb"
								iconColor="#b45309"
							/>
							<StatCard
								label={ __( 'WooCommerce', 'axiom-blocks' ) }
								value={ woo.length }
								sub={
									wcEnabled
										? `${
												woo.filter( isPro ).length
										  } ${ __( 'Pro', 'axiom-blocks' ) }`
										: __(
												'Integration disabled',
												'axiom-blocks'
										  )
								}
								icon={ <CartIcon size={ 14 } /> }
								iconBg="#f5f3ff"
								iconColor="#a78bfa"
							/>
						</div>

						{ /* Toolbar: search + category tabs */ }
						<div className="ab-toolbar">
							<div className="ab-search">
								<div className="ab-search__icon">
									<SearchIcon size={ 14 } />
								</div>
								<input
									type="text"
									className="ab-search__input"
									placeholder={ __(
										'Search blocks…',
										'axiom-blocks'
									) }
									value={ search }
									onChange={ ( e ) =>
										setSearch( e.target.value )
									}
								/>
							</div>
							<div className="ab-cat-tabs">
								{ catTabs.map( ( t ) => (
									<button
										key={ t.id }
										onClick={ () => setCatTab( t.id ) }
										className={ `ab-cat-tab ${
											catTab === t.id ? 'is-active' : ''
										}` }
									>
										{ t.label }
										<span className="ab-cat-tab__count">
											({ t.count })
										</span>
									</button>
								) ) }
							</div>
						</div>

						{ /* Layout section */ }
						{ showGeneral && visLayout.length > 0 && (
							<div className="ab-section">
								<SectionBar
									title={ __( 'Layout', 'axiom-blocks' ) }
									count={ visLayout.length }
									icon={ <GridIcon size={ 14 } /> }
									iconColor={ PRIMARY }
									onEnableAll={ () => setAll( layout, true ) }
									onDisableAll={ () =>
										setAll( layout, false )
									}
								/>
								<div className="ab-grid">
									{ visLayout.map( ( b ) => (
										<BlockCard
											key={ b.id }
											block={ b }
											onToggle={ toggleBlock }
										/>
									) ) }
								</div>
							</div>
						) }

						{ /* Content section */ }
						{ showGeneral && visContent.length > 0 && (
							<div className="ab-section">
								<SectionBar
									title={ __( 'Content', 'axiom-blocks' ) }
									count={ visContent.length }
									icon={ <GridIcon size={ 14 } /> }
									iconColor={ PRIMARY }
									onEnableAll={ () =>
										setAll( content, true )
									}
									onDisableAll={ () =>
										setAll( content, false )
									}
								/>
								<div className="ab-grid">
									{ visContent.map( ( b ) => (
										<BlockCard
											key={ b.id }
											block={ b }
											onToggle={ toggleBlock }
										/>
									) ) }
								</div>
							</div>
						) }

						{ /* WooCommerce section */ }
						{ showWoo && visWoo.length > 0 && (
							<div className="ab-section">
								<div className="ab-woo-bar">
									<CartIcon
										size={ 14 }
										style={ { color: '#a78bfa' } }
									/>
									<span className="ab-woo-bar__title">
										{ __(
											'WooCommerce Blocks',
											'axiom-blocks'
										) }
									</span>
									<span className="ab-woo-bar__count">
										{ visWoo.length }
									</span>
									<div style={ { flex: 1 } } />
									<button
										className="ab-btn-ghost ab-btn-ghost--woo"
										onClick={ () => setAll( woo, true ) }
									>
										<PowerIcon size={ 10 } />{ ' ' }
										{ __( 'Enable all', 'axiom-blocks' ) }
									</button>
									<button
										className="ab-btn-ghost ab-btn-ghost--woo"
										onClick={ () => setAll( woo, false ) }
									>
										<CloseIcon size={ 10 } />{ ' ' }
										{ __( 'Disable all', 'axiom-blocks' ) }
									</button>
								</div>
								<div className="ab-grid">
									{ visWoo.map( ( b ) => (
										<BlockCard
											key={ b.id }
											block={ b }
											onToggle={ toggleBlock }
										/>
									) ) }
								</div>
							</div>
						) }

						{ /* Empty state */ }
						{ visLayout.length === 0 &&
							visContent.length === 0 &&
							visWoo.length === 0 && (
								<div className="ab-empty">
									<SearchIcon
										size={ 28 }
										style={ { opacity: 0.3 } }
									/>
									<p>
										{ __(
											'No blocks found.',
											'axiom-blocks'
										) }
									</p>
								</div>
							) }
					</div>
				) }

				{ /* ── Settings ───────────────────────────────────────── */ }
				{ activeTab === 'settings' && (
					<SettingsTab
						license={ license }
						licenseLoading={ licenseLoading }
						onLicenseChange={ setLicense }
						settings={ settings }
						onSettingsChange={ setSettings }
						showToast={ showToast }
					/>
				) }
			</div>
		</div>
	);
}
