import {
	useState,
	useEffect,
	useLayoutEffect,
	useRef,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { BlockCard } from './BlockCard';
import { SettingsTab } from './SettingsTab';
import { HelpTab } from './HelpTab';
import { EmailTab } from './EmailTab';
import { Loader } from './Loader';
import { link } from '../links';
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
	DocIcon,
	BookIcon,
	ExternalIcon,
	FormIcon,
	LoopIcon,
	MailIcon,
	HelpIcon,
	XCircleIcon,
} from './ui';

const PRIMARY = '#7C3AED';
const DATA = window.axiomBlocksData || {};
const PRO_ACTIVE = !! DATA.proActive;
const TABS = [ 'blocks', 'email', 'settings', 'help' ];

// The tab named in the URL hash, else Block Manager. The failed-email notice
// links to #email, the plugin row and the welcome notice to #help and
// #settings. #get-started is an alias for #help.
const tabFromHash = () => {
	const hash = window.location.hash.replace( '#', '' );
	if ( hash === 'get-started' ) return 'help';
	return TABS.includes( hash ) ? hash : 'blocks';
};

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
	const [ onboarding, setOnboarding ] = useState(
		DATA.onboarding || { checklist: {} }
	);
	const [ mailFailed, setMailFailed ] = useState( !! DATA.mail?.lastError );
	const [ activeTab, setActiveRaw ] = useState( tabFromHash );
	const toastTimer = useRef( null );
	const tabListRef = useRef( null );
	const [ indicator, setIndicator ] = useState( null );
	const [ search, setSearch ] = useState( '' );
	const [ catTab, setCatTab ] = useState( 'all' );
	const [ toast, setToast ] = useState( null );
	const [ license, setLicense ] = useState( EMPTY_LICENSE );
	const [ licenseLoading, setLicenseLoading ] = useState( PRO_ACTIVE );
	const [ settings, setSettings ] = useState( DEFAULT_SETTINGS );

	// Links to #email or #settings from inside the page switch tabs too.
	useEffect( () => {
		const onHash = () => setActiveRaw( tabFromHash() );
		window.addEventListener( 'hashchange', onHash );
		return () => window.removeEventListener( 'hashchange', onHash );
	}, [] );

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

	const showToast = ( message, type = 'success', ms = 3000 ) => {
		if ( toastTimer.current ) clearTimeout( toastTimer.current );
		setToast( { message, type } );
		toastTimer.current = setTimeout( () => setToast( null ), ms );
	};

	const setActive = ( id ) => {
		setActiveRaw( id );
		window.history.replaceState( null, '', `#${ id }` );
	};

	// The Email tab reports every load and test, so the red dot and the
	// checklist follow what just happened.
	const onMailChange = ( payload ) => {
		setMailFailed( !! payload.last_error );
		setOnboarding( ( o ) => ( {
			...o,
			checklist: {
				...o.checklist,
				test: !! payload.test_passed,
				entry: !! o.formOn && ( payload.entries?.total || 0 ) > 0,
			},
		} ) );
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

	const woo = visibleBlocks.filter( isWoo );

	const matches = ( b ) => {
		const q = search.toLowerCase();
		return (
			! q ||
			b.name.toLowerCase().includes( q ) ||
			b.description.toLowerCase().includes( q )
		);
	};

	// Every non-Woo category gets its own section and tab. Add the category
	// here when a new one appears in inc/Blocks/Blocks.php, or its blocks
	// never reach the screen.
	const generalCats = [
		{
			id: 'layout',
			label: __( 'Layout', 'axiom-blocks' ),
			icon: <GridIcon size={ 14 } />,
		},
		{
			id: 'content',
			label: __( 'Content', 'axiom-blocks' ),
			icon: <DocIcon size={ 14 } />,
		},
		{
			id: 'dynamic',
			label: __( 'Dynamic', 'axiom-blocks' ),
			icon: <LoopIcon size={ 14 } />,
		},
		{
			id: 'form',
			label: __( 'Forms', 'axiom-blocks' ),
			icon: <FormIcon size={ 14 } />,
		},
	].map( ( cat ) => {
		const all = visibleBlocks.filter( ( b ) => b.category === cat.id );
		return {
			...cat,
			all,
			shown: all.filter(
				( b ) =>
					matches( b ) && ( catTab === 'all' || catTab === cat.id )
			),
		};
	} );

	const visWoo = woo.filter(
		( b ) => matches( b ) && ( catTab === 'all' || catTab === 'woo' )
	);

	const showGeneral = catTab !== 'woo';
	const showWoo = wcEnabled && ( catTab === 'all' || catTab === 'woo' );

	const enabledCount = visibleBlocks.filter( ( b ) => b.enabled ).length;

	const catTabs = [
		{
			id: 'all',
			label: __( 'All', 'axiom-blocks' ),
			count: visibleBlocks.length,
		},
		...generalCats
			.filter( ( cat ) => cat.all.length > 0 )
			.map( ( cat ) => ( {
				id: cat.id,
				label: cat.label,
				count: cat.all.length,
			} ) ),
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
			id: 'email',
			label: __( 'Email', 'axiom-blocks' ),
			icon: <MailIcon size={ 14 } />,
			dot: mailFailed,
		},
		{
			id: 'settings',
			label: __( 'Settings', 'axiom-blocks' ),
			icon: <GearIcon size={ 14 } />,
		},
		{
			id: 'help',
			label: __( 'Help', 'axiom-blocks' ),
			icon: <HelpIcon size={ 14 } />,
		},
	];

	const onTabKey = ( e ) => {
		const ids = mainTabs.map( ( t ) => t.id );
		const i = ids.indexOf( activeTab );
		let next = null;
		if ( e.key === 'ArrowRight' ) next = ids[ ( i + 1 ) % ids.length ];
		if ( e.key === 'ArrowLeft' )
			next = ids[ ( i - 1 + ids.length ) % ids.length ];
		if ( e.key === 'Home' ) next = ids[ 0 ];
		if ( e.key === 'End' ) next = ids[ ids.length - 1 ];
		if ( next ) {
			e.preventDefault();
			setActive( next );
			document.getElementById( `ab-tab-${ next }` )?.focus();
		}
	};

	// The underline under the active tab is one element that slides between
	// tabs. Re-measure on tab change and whenever the bar resizes, since web
	// fonts loading late or a window resize both move the tab edges.
	useLayoutEffect( () => {
		const list = tabListRef.current;
		if ( ! list ) return undefined;
		const measure = () => {
			const el = list.querySelector( '[aria-selected="true"]' );
			if ( el ) {
				setIndicator( { left: el.offsetLeft, width: el.offsetWidth } );
			}
		};
		measure();
		if ( typeof window.ResizeObserver !== 'function' ) return undefined;
		const ro = new window.ResizeObserver( measure );
		ro.observe( list );
		return () => ro.disconnect();
	}, [ activeTab, loading ] );

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
					<ABLogo size={ 30 } color={ PRIMARY } />
					<div className="ab-header__titles">
						<div className="ab-header__title-row">
							<h1 className="ab-header__title">Axiom Blocks</h1>
							{ DATA.version && (
								<span className="ab-header__version">
									{ sprintf(
										/* translators: %s: plugin version. */
										__( 'Version %s', 'axiom-blocks' ),
										DATA.version
									) }
								</span>
							) }
						</div>
						<p className="ab-header__sub">
							{ __(
								'Blocks the editor leaves out, ready when you need them.',
								'axiom-blocks'
							) }
						</p>
					</div>
					<a
						href={ link( 'docs', 'dashboard-header' ) }
						target="_blank"
						rel="noopener noreferrer"
						className="ab-btn-docs ab-focus"
					>
						<BookIcon size={ 14 } />
						{ __( 'Docs', 'axiom-blocks' ) }
						<ExternalIcon size={ 12 } />
						<span className="screen-reader-text">
							{ __( '(opens in a new tab)', 'axiom-blocks' ) }
						</span>
					</a>
				</div>

				{ /* Horizontal nav tabs */ }
				<div
					ref={ tabListRef }
					className="ab-nav-tabs"
					role="tablist"
					aria-label="Axiom Blocks"
				>
					{ mainTabs.map( ( t ) => {
						const active = activeTab === t.id;
						return (
							<button
								key={ t.id }
								id={ `ab-tab-${ t.id }` }
								type="button"
								role="tab"
								aria-selected={ active }
								aria-controls="ab-tabpanel"
								tabIndex={ active ? 0 : -1 }
								onClick={ () => setActive( t.id ) }
								onKeyDown={ onTabKey }
								className={ `ab-nav-tab ${
									active ? 'is-active' : ''
								}` }
							>
								<span className="ab-nav-tab__icon">
									{ t.icon }
								</span>
								{ t.label }
								{ t.dot && (
									<>
										<span
											className="ab-nav-tab__dot"
											aria-hidden="true"
										/>
										<span className="screen-reader-text">
											{ __(
												', needs attention',
												'axiom-blocks'
											) }
										</span>
									</>
								) }
							</button>
						);
					} ) }
					{ indicator && (
						<span
							className="ab-nav-tabs__indicator"
							aria-hidden="true"
							style={ {
								width: indicator.width,
								transform: `translateX(${ indicator.left }px)`,
							} }
						/>
					) }
				</div>
			</div>

			{ /* Scrollable content */ }
			<div
				className={ `ab-content ab-content--${ activeTab }` }
				id="ab-tabpanel"
				role="tabpanel"
				aria-labelledby={ `ab-tab-${ activeTab }` }
			>
				{ /* Toast notification */ }
				{ toast && (
					<div
						className={ `ab-toast ab-toast--${ toast.type }` }
						role="status"
						aria-live="polite"
					>
						{ toast.type === 'error' ? (
							<XCircleIcon size={ 16 } />
						) : (
							<CheckIcon size={ 16 } />
						) }
						<span>{ toast.message }</span>
						<button
							type="button"
							className="ab-toast__close ab-focus"
							onClick={ () => setToast( null ) }
						>
							<CloseIcon size={ 14 } />
							<span className="screen-reader-text">
								{ __( 'Dismiss', 'axiom-blocks' ) }
							</span>
						</button>
					</div>
				) }

				<div key={ activeTab } className="ab-panel">
					{ activeTab === 'help' && (
						<HelpTab
							state={ onboarding }
							blocks={ visibleBlocks.filter( isFree ) }
							newPageUrl={ DATA.newPageUrl }
							videoThumb={ DATA.videoThumb }
							systemInfo={ DATA.systemInfo }
							showToast={ showToast }
						/>
					) }

					{ activeTab === 'email' && (
						<EmailTab
							showToast={ showToast }
							onMailChange={ onMailChange }
						/>
					) }

					{ /* ── Block Manager ──────────────────────────────────── */ }
					{ activeTab === 'blocks' && (
						<div>
							{ /* Stats row */ }
							<div className="ab-stats-row">
								<StatCard
									label={ __(
										'Total blocks',
										'axiom-blocks'
									) }
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
									label={ __(
										'Free blocks',
										'axiom-blocks'
									) }
									value={ blocks.filter( isFree ).length }
									sub={ __(
										'Always available',
										'axiom-blocks'
									) }
									icon={ <CheckIcon size={ 14 } /> }
									iconBg="#ecfdf5"
									iconColor="#065f46"
								/>
								<StatCard
									label={ __( 'Pro blocks', 'axiom-blocks' ) }
									value={ blocks.filter( isPro ).length }
									sub={
										PRO_ACTIVE
											? `${
													blocks.filter(
														( b ) =>
															isPro( b ) &&
															b.enabled
													).length
											  } ${ __(
													'active',
													'axiom-blocks'
											  ) }`
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
									label={ __(
										'WooCommerce',
										'axiom-blocks'
									) }
									value={ woo.length }
									sub={
										wcEnabled
											? `${
													woo.filter( isPro ).length
											  } ${ __(
													'Pro',
													'axiom-blocks'
											  ) }`
											: __(
													'Integration disabled',
													'axiom-blocks'
											  )
									}
									icon={ <CartIcon size={ 14 } /> }
									iconBg="#f5f3ff"
									iconColor="#7c5bd6"
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
											'Search blocks',
											'axiom-blocks'
										) }
										aria-label={ __(
											'Search blocks',
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
											type="button"
											aria-pressed={ catTab === t.id }
											onClick={ () => setCatTab( t.id ) }
											className={ `ab-cat-tab ${
												catTab === t.id
													? 'is-active'
													: ''
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

							{ /* One section per non-Woo category */ }
							{ showGeneral &&
								generalCats.map(
									( cat ) =>
										cat.shown.length > 0 && (
											<div
												className="ab-section"
												key={ cat.id }
											>
												<SectionBar
													title={ cat.label }
													count={ cat.shown.length }
													icon={ cat.icon }
													iconColor={ PRIMARY }
													onEnableAll={ () =>
														setAll( cat.all, true )
													}
													onDisableAll={ () =>
														setAll( cat.all, false )
													}
												/>
												<div className="ab-grid">
													{ cat.shown.map( ( b ) => (
														<BlockCard
															key={ b.id }
															block={ b }
															onToggle={
																toggleBlock
															}
															onOpenTab={
																setActive
															}
														/>
													) ) }
												</div>
											</div>
										)
								) }

							{ /* WooCommerce section */ }
							{ showWoo && visWoo.length > 0 && (
								<div className="ab-section">
									<div className="ab-woo-bar">
										<CartIcon size={ 14 } />
										<span className="ab-woo-bar__title">
											{ __(
												'WooCommerce blocks',
												'axiom-blocks'
											) }
										</span>
										<span className="ab-woo-bar__count">
											{ visWoo.length }
										</span>
										<div style={ { flex: 1 } } />
										<button
											type="button"
											className="ab-btn-ghost ab-btn-ghost--woo ab-focus"
											onClick={ () =>
												setAll( woo, true )
											}
										>
											<PowerIcon size={ 10 } />{ ' ' }
											{ __(
												'Enable all',
												'axiom-blocks'
											) }
										</button>
										<button
											type="button"
											className="ab-btn-ghost ab-btn-ghost--woo ab-focus"
											onClick={ () =>
												setAll( woo, false )
											}
										>
											<CloseIcon size={ 10 } />{ ' ' }
											{ __(
												'Disable all',
												'axiom-blocks'
											) }
										</button>
									</div>
									<div className="ab-grid">
										{ visWoo.map( ( b ) => (
											<BlockCard
												key={ b.id }
												block={ b }
												onToggle={ toggleBlock }
												onOpenTab={ setActive }
											/>
										) ) }
									</div>
								</div>
							) }

							{ /* Empty state */ }
							{ generalCats.every(
								( cat ) => cat.shown.length === 0
							) &&
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
		</div>
	);
}
