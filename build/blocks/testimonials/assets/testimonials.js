/**
 * Testimonials — frontend behaviour (progressive enhancement).
 *
 * The cards render server-side as a plain grid, so nothing is lost with JS off.
 * This script upgrades a group to a carousel or a continuous marquee, and adds
 * the "Read more" toggle for clamped quotes. Honours prefers-reduced-motion:
 * carousel autoplay and marquee animation are skipped.
 */
( function () {
	'use strict';

	function reducedMotion() {
		return (
			window.matchMedia &&
			window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches
		);
	}

	var ARROW_PREV =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
	var ARROW_NEXT =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';

	function visibleColumns( cols ) {
		var w = window.innerWidth;
		if ( w <= 600 ) {
			return 1;
		}
		if ( w <= 900 ) {
			return Math.min( cols, 2 );
		}
		return Math.max( 1, cols );
	}

	function gapPx( root ) {
		var g = getComputedStyle( root ).getPropertyValue( '--ab-tst-gap' );
		var n = parseInt( g, 10 );
		return isNaN( n ) ? 24 : n;
	}

	/* ── Read more ─────────────────────────────────────────────────────────── */
	function initReadMore( root ) {
		var quotes = root.querySelectorAll( '.ab-testimonial__quote' );
		Array.prototype.forEach.call( quotes, function ( quote ) {
			if ( quote.scrollHeight - quote.clientHeight < 4 ) {
				return;
			}
			var btn = document.createElement( 'button' );
			btn.type = 'button';
			btn.className = 'ab-testimonial__readmore';
			btn.textContent = 'Read more';
			btn.setAttribute( 'aria-expanded', 'false' );
			quote.insertAdjacentElement( 'afterend', btn );
			btn.addEventListener( 'click', function () {
				var expanded = quote.classList.toggle( 'is-expanded' );
				btn.textContent = expanded ? 'Read less' : 'Read more';
				btn.setAttribute( 'aria-expanded', expanded ? 'true' : 'false' );
			} );
		} );
	}

	/* ── Shared: move cards into a track inside a viewport ─────────────────── */
	function buildTrack( root ) {
		var cards = Array.prototype.slice.call(
			root.querySelectorAll( ':scope > .ab-testimonial' )
		);
		var viewport = document.createElement( 'div' );
		viewport.className = 'ab-testimonials__viewport';
		var track = document.createElement( 'div' );
		track.className = 'ab-testimonials__track';
		cards.forEach( function ( c ) {
			track.appendChild( c );
		} );
		viewport.appendChild( track );
		root.appendChild( viewport );
		return { viewport: viewport, track: track, cards: cards };
	}

	function sizeCards( cards, viewport, cols, gap ) {
		var width = ( viewport.clientWidth - gap * ( cols - 1 ) ) / cols;
		cards.forEach( function ( c ) {
			c.style.width = width + 'px';
		} );
		return width;
	}

	/* ── Carousel ──────────────────────────────────────────────────────────── */
	function initCarousel( root ) {
		var built = buildTrack( root );
		var track = built.track;
		var cards = built.cards;
		var viewport = built.viewport;
		var total = cards.length;

		var cols = parseInt( root.getAttribute( 'data-columns' ), 10 ) || 3;
		var loop = root.getAttribute( 'data-loop' ) !== '0';
		var showArrows = root.getAttribute( 'data-arrows' ) !== '0';
		var showDots = root.getAttribute( 'data-dots' ) !== '0';
		var speed = parseInt( root.getAttribute( 'data-slide-speed' ), 10 );
		if ( isNaN( speed ) ) {
			speed = 500;
		}
		var autoplay =
			root.getAttribute( 'data-autoplay' ) === '1' && ! reducedMotion();
		var autoplayDelay =
			parseInt( root.getAttribute( 'data-autoplay-speed' ), 10 ) || 4000;
		var pauseHover = root.getAttribute( 'data-pause-hover' ) !== '0';

		var index = 0;
		var visible = visibleColumns( cols );
		var cardW = 0;
		var gap = gapPx( root );
		var timer = null;

		function maxIndex() {
			return Math.max( 0, total - visible );
		}

		function layout() {
			visible = visibleColumns( cols );
			cardW = sizeCards( cards, viewport, visible, gap );
			if ( index > maxIndex() ) {
				index = maxIndex();
			}
			apply( false );
			renderDots();
		}

		function apply( animate ) {
			track.style.transition = animate
				? 'transform ' + speed + 'ms ease'
				: 'none';
			track.style.transform =
				'translateX(' + -index * ( cardW + gap ) + 'px)';
			if ( prevBtn && ! loop ) {
				prevBtn.disabled = index <= 0;
			}
			if ( nextBtn && ! loop ) {
				nextBtn.disabled = index >= maxIndex();
			}
			updateDots();
		}

		function goTo( i, animate ) {
			var max = maxIndex();
			if ( loop ) {
				if ( i < 0 ) {
					i = max;
				} else if ( i > max ) {
					i = 0;
				}
			} else {
				i = Math.max( 0, Math.min( max, i ) );
			}
			index = i;
			apply( animate !== false );
		}

		/* Arrows */
		var prevBtn = null;
		var nextBtn = null;
		if ( showArrows && total > visible ) {
			prevBtn = document.createElement( 'button' );
			prevBtn.type = 'button';
			prevBtn.className =
				'ab-testimonials__arrow ab-testimonials__arrow--prev';
			prevBtn.setAttribute( 'aria-label', 'Previous' );
			prevBtn.innerHTML = ARROW_PREV;
			nextBtn = document.createElement( 'button' );
			nextBtn.type = 'button';
			nextBtn.className =
				'ab-testimonials__arrow ab-testimonials__arrow--next';
			nextBtn.setAttribute( 'aria-label', 'Next' );
			nextBtn.innerHTML = ARROW_NEXT;
			root.appendChild( prevBtn );
			root.appendChild( nextBtn );
			prevBtn.addEventListener( 'click', function () {
				goTo( index - 1 );
			} );
			nextBtn.addEventListener( 'click', function () {
				goTo( index + 1 );
			} );
		}

		/* Dots */
		var dotsWrap = null;
		function renderDots() {
			if ( ! showDots ) {
				return;
			}
			if ( ! dotsWrap ) {
				dotsWrap = document.createElement( 'div' );
				dotsWrap.className = 'ab-testimonials__dots';
				root.appendChild( dotsWrap );
			}
			dotsWrap.innerHTML = '';
			var count = maxIndex() + 1;
			if ( count <= 1 ) {
				dotsWrap.style.display = 'none';
				return;
			}
			dotsWrap.style.display = '';
			for ( var i = 0; i < count; i++ ) {
				( function ( i ) {
					var dot = document.createElement( 'button' );
					dot.type = 'button';
					dot.className = 'ab-testimonials__dot';
					dot.setAttribute(
						'aria-label',
						'Go to testimonial ' + ( i + 1 )
					);
					dot.addEventListener( 'click', function () {
						goTo( i );
						restart();
					} );
					dotsWrap.appendChild( dot );
				} )( i );
			}
			updateDots();
		}
		function updateDots() {
			if ( ! dotsWrap ) {
				return;
			}
			var dots = dotsWrap.children;
			for ( var i = 0; i < dots.length; i++ ) {
				dots[ i ].classList.toggle( 'is-active', i === index );
			}
		}

		/* Autoplay */
		function start() {
			if ( ! autoplay || total <= visible ) {
				return;
			}
			timer = window.setInterval( function () {
				goTo( index + 1 );
			}, autoplayDelay );
		}
		function stop() {
			if ( timer ) {
				window.clearInterval( timer );
				timer = null;
			}
		}
		function restart() {
			stop();
			start();
		}
		if ( pauseHover ) {
			root.addEventListener( 'mouseenter', stop );
			root.addEventListener( 'mouseleave', start );
		}

		/* Keyboard */
		root.setAttribute( 'tabindex', '0' );
		root.setAttribute( 'aria-roledescription', 'carousel' );
		root.addEventListener( 'keydown', function ( e ) {
			if ( e.key === 'ArrowLeft' ) {
				goTo( index - 1 );
				restart();
			} else if ( e.key === 'ArrowRight' ) {
				goTo( index + 1 );
				restart();
			}
		} );

		/* Touch / pointer drag */
		var dragX = 0;
		var startTx = 0;
		var dragging = false;
		viewport.addEventListener(
			'pointerdown',
			function ( e ) {
				dragging = true;
				dragX = e.clientX;
				startTx = -index * ( cardW + gap );
				track.style.transition = 'none';
				stop();
			},
			{ passive: true }
		);
		window.addEventListener( 'pointermove', function ( e ) {
			if ( ! dragging ) {
				return;
			}
			var dx = e.clientX - dragX;
			track.style.transform =
				'translateX(' + ( startTx + dx ) + 'px)';
		} );
		window.addEventListener( 'pointerup', function ( e ) {
			if ( ! dragging ) {
				return;
			}
			dragging = false;
			var dx = e.clientX - dragX;
			var threshold = ( cardW + gap ) / 4;
			if ( dx <= -threshold ) {
				goTo( index + 1 );
			} else if ( dx >= threshold ) {
				goTo( index - 1 );
			} else {
				apply( true );
			}
			start();
		} );

		var resizeTimer = null;
		window.addEventListener( 'resize', function () {
			window.clearTimeout( resizeTimer );
			resizeTimer = window.setTimeout( layout, 150 );
		} );

		root.classList.add( 'is-ready' );
		layout();
		start();
	}

	/* ── Marquee ───────────────────────────────────────────────────────────── */
	function initMarquee( root ) {
		var built = buildTrack( root );
		var track = built.track;
		var cards = built.cards;
		var viewport = built.viewport;

		var cols = parseInt( root.getAttribute( 'data-columns' ), 10 ) || 3;
		var gap = gapPx( root );
		var reverse = root.getAttribute( 'data-marquee-reverse' ) === '1';
		var pauseHover = root.getAttribute( 'data-marquee-pause' ) !== '0';

		root.classList.add( 'is-ready' );

		function layout() {
			var visible = visibleColumns( cols );
			sizeCards( cards, viewport, visible, gap );
		}
		layout();

		// Duplicate the set once for a seamless -50% loop.
		cards.forEach( function ( c ) {
			var clone = c.cloneNode( true );
			clone.setAttribute( 'aria-hidden', 'true' );
			var link = clone.querySelector( '.ab-testimonial__link' );
			if ( link ) {
				link.setAttribute( 'tabindex', '-1' );
			}
			track.appendChild( clone );
		} );

		if ( reverse ) {
			root.classList.add( 'is-reverse' );
		}
		if ( pauseHover ) {
			root.addEventListener( 'mouseenter', function () {
				root.classList.add( 'is-paused' );
			} );
			root.addEventListener( 'mouseleave', function () {
				root.classList.remove( 'is-paused' );
			} );
		}

		var resizeTimer = null;
		window.addEventListener( 'resize', function () {
			window.clearTimeout( resizeTimer );
			resizeTimer = window.setTimeout( layout, 150 );
		} );
	}

	/* ── Init ──────────────────────────────────────────────────────────────── */
	function initGroup( root ) {
		if ( root.dataset.abTstReady === '1' ) {
			return;
		}
		root.dataset.abTstReady = '1';

		if ( root.getAttribute( 'data-readmore' ) === '1' ) {
			initReadMore( root );
		}

		var layout = root.getAttribute( 'data-layout' );
		var count = root.querySelectorAll( ':scope > .ab-testimonial' ).length;
		if ( count < 2 ) {
			return;
		}
		if ( layout === 'carousel' ) {
			initCarousel( root );
		} else if ( layout === 'marquee' ) {
			initMarquee( root );
		}
	}

	function initAll() {
		document
			.querySelectorAll( '.ab-testimonials' )
			.forEach( initGroup );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}

	window.axiomBlocksInitTestimonials = initAll;
} )();
