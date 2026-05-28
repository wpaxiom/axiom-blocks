( function () {
	'use strict';

	function init( bar ) {
		if ( bar.dataset.bsProgressInit === '1' ) return;
		bar.dataset.bsProgressInit = '1';

		// Move the bar to <body> so it escapes any ancestor that creates a
		// containing block for fixed positioning (transform, filter, etc.).
		if ( bar.parentNode !== document.body ) {
			document.body.appendChild( bar );
		}

		const fill = bar.querySelector(
			'.axiom-blocks-reading-progress-bar__fill'
		);
		if ( ! fill ) return;

		let ticking = false;

		function update() {
			const doc = document.documentElement;
			const scrollable =
				( doc.scrollHeight || document.body.scrollHeight ) -
				window.innerHeight;
			const scrolled = window.scrollY || window.pageYOffset || 0;
			const pct =
				scrollable > 0
					? Math.max(
							0,
							Math.min( 100, ( scrolled / scrollable ) * 100 )
					  )
					: 0;

			fill.style.width = pct + '%';
			bar.setAttribute( 'aria-valuenow', Math.round( pct ) );
			ticking = false;
		}

		function onScroll() {
			if ( ! ticking ) {
				window.requestAnimationFrame( update );
				ticking = true;
			}
		}

		window.addEventListener( 'scroll', onScroll, { passive: true } );
		window.addEventListener( 'resize', onScroll, { passive: true } );
		update();
	}

	function boot() {
		document
			.querySelectorAll( '.axiom-blocks-reading-progress-bar' )
			.forEach( init );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
