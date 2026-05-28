/**
 * Tabs Block — frontend behaviour.
 * Class-only toggling; no inline style manipulation.
 */
( function () {
	'use strict';

	function initTabs( container ) {
		if ( container.dataset.bsTabsReady === '1' ) return;
		container.dataset.bsTabsReady = '1';

		const tabs = container.querySelectorAll(
			':scope > .axiom-blocks-tabs__list > .axiom-blocks-tabs__tab'
		);
		const panels = container.querySelectorAll(
			':scope > .axiom-blocks-tabs__content > .axiom-blocks-tab-panel'
		);

		function activate( tabId ) {
			tabs.forEach( function ( t ) {
				const active = t.dataset.tab === tabId;
				t.classList.toggle( 'is-active', active );
				t.setAttribute( 'aria-selected', active ? 'true' : 'false' );
			} );
			panels.forEach( function ( p ) {
				const active = p.dataset.tabId === tabId;
				p.classList.toggle( 'is-active', active );
				p.classList.toggle( 'is-inactive', ! active );
				p.setAttribute( 'aria-hidden', active ? 'false' : 'true' );
			} );
			container.setAttribute( 'data-active-tab', tabId );
			container.dispatchEvent(
				new CustomEvent( 'axiomBlocks:tabChanged', {
					detail: { tabId },
				} )
			);
		}

		tabs.forEach( function ( tab ) {
			tab.addEventListener( 'click', function ( e ) {
				e.preventDefault();
				const target = tab.dataset.tab;
				if ( target ) activate( target );
			} );

			tab.addEventListener( 'keydown', function ( e ) {
				if ( e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' ) return;
				e.preventDefault();
				const list = Array.from( tabs );
				const idx = list.indexOf( tab );
				const next =
					e.key === 'ArrowRight'
						? list[ ( idx + 1 ) % list.length ]
						: list[ ( idx - 1 + list.length ) % list.length ];
				if ( next ) {
					next.focus();
					activate( next.dataset.tab );
				}
			} );
		} );
	}

	function initAll() {
		document.querySelectorAll( '.axiom-blocks-tabs' ).forEach( initTabs );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}

	window.axiomBlocksInitTabs = initAll;
} )();
