/**
 * Slider — frontend behaviour (progressive enhancement).
 *
 * Slides render server-side as a plain track (first slide visible with JS off).
 * This script upgrades a slider to one of three effects — slide, fade, or
 * coverflow — with horizontal or vertical orientation, arrows, pagination
 * (dots / fraction / progress bar), autoplay + play-pause control, drag/swipe,
 * keyboard, slides-to-scroll, adaptive height, and an optional click-to-zoom
 * lightbox. Honours prefers-reduced-motion: autoplay and transitions are skipped.
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
	var ARROW_UP =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>';
	var ARROW_DOWN =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
	var ICON_PLAY =
		'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 3.5v17a1 1 0 0 0 1.53.85l13-8.5a1 1 0 0 0 0-1.7l-13-8.5A1 1 0 0 0 6 3.5Z"/></svg>';
	var ICON_PAUSE =
		'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
	var ICON_CLOSE =
		'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

	function attrNum( root, name, def ) {
		var v = parseInt( root.getAttribute( name ), 10 );
		return isNaN( v ) ? def : v;
	}

	function gapPx( root ) {
		var g = getComputedStyle( root ).getPropertyValue( '--ab-slider-gap' );
		var n = parseInt( g, 10 );
		return isNaN( n ) ? 16 : n;
	}

	function heightPx( root ) {
		var h = getComputedStyle( root ).getPropertyValue( '--ab-slider-height' );
		var n = parseInt( h, 10 );
		return isNaN( n ) ? 0 : n;
	}

	function perViewFor( root, effect ) {
		if ( effect === 'fade' ) {
			return 1;
		}
		var d = Math.max( 1, attrNum( root, 'data-per-view', 1 ) );
		var t = attrNum( root, 'data-per-view-tablet', 0 );
		var m = attrNum( root, 'data-per-view-mobile', 0 );
		var w = window.innerWidth;
		if ( w <= 600 ) {
			return m > 0 ? m : 1;
		}
		if ( w <= 900 ) {
			return t > 0 ? t : d;
		}
		return d;
	}

	function initSlider( root ) {
		if ( root.dataset.abSliderReady === '1' ) {
			return;
		}
		root.dataset.abSliderReady = '1';

		var viewport = root.querySelector( '.ab-slider__viewport' );
		var track = root.querySelector( '.ab-slider__track' );
		if ( ! viewport || ! track ) {
			return;
		}
		var slides = Array.prototype.slice.call(
			track.querySelectorAll( ':scope > .ab-slide' )
		);
		var total = slides.length;
		if ( total < 2 ) {
			if ( root.getAttribute( 'data-lightbox' ) === '1' ) {
				initLightbox( root, slides );
			}
			return;
		}

		var effect = root.getAttribute( 'data-effect' ) || 'slide';
		var vertical =
			root.getAttribute( 'data-orientation' ) === 'vertical' &&
			effect === 'slide';
		var loop = root.getAttribute( 'data-loop' ) !== '0';
		var showArrows = root.getAttribute( 'data-arrows' ) !== '0';
		var showDots = root.getAttribute( 'data-dots' ) !== '0';
		var pagType = root.getAttribute( 'data-pagination' ) || 'bullets';
		var draggable = root.getAttribute( 'data-draggable' ) !== '0';
		var adaptive =
			root.getAttribute( 'data-adaptive' ) === '1' &&
			effect === 'slide' &&
			! vertical;
		var scroll =
			effect === 'slide'
				? Math.max( 1, attrNum( root, 'data-scroll', 1 ) )
				: 1;
		var speed = attrNum( root, 'data-slide-speed', 500 );
		var autoplay =
			root.getAttribute( 'data-autoplay' ) === '1' && ! reducedMotion();
		var autoplayDelay = attrNum( root, 'data-autoplay-speed', 4000 );
		var pauseHover = root.getAttribute( 'data-pause-hover' ) !== '0';
		var pauseButton = root.getAttribute( 'data-pause-button' ) === '1';

		root.style.setProperty( '--ab-slider-speed', speed + 'ms' );

		var axis = vertical ? 'Y' : 'X';
		var index = 0;
		var perView = perViewFor( root, effect );
		var gap = gapPx( root );
		var slideSize = 0;
		var timer = null;
		var userPaused = false;
		var prevBtn = null;
		var nextBtn = null;
		var pagWrap = null;
		var pauseBtn = null;

		function maxIndex() {
			if ( effect === 'slide' ) {
				return Math.max( 0, total - perView );
			}
			return total - 1;
		}

		/* ── Layout / sizing ─────────────────────────────────────────────── */
		function sizeSlides() {
			perView = Math.min( perViewFor( root, effect ), total );
			if ( effect === 'fade' ) {
				var maxH = 0;
				slides.forEach( function ( s ) {
					s.style.flex = '';
					s.style.width = '';
					s.style.height = '';
					maxH = Math.max( maxH, s.offsetHeight );
				} );
				if ( ! heightPx( root ) ) {
					track.style.height = maxH + 'px';
				}
				return;
			}
			if ( vertical ) {
				var vh = heightPx( root ) || 400;
				viewport.style.height = vh + 'px';
				slideSize = ( vh - gap * ( perView - 1 ) ) / perView;
				// flex-basis (not width) — the base CSS sets flex:0 0 100%,
				// which would otherwise override an inline width/height.
				slides.forEach( function ( s ) {
					s.style.flex = '0 0 ' + slideSize + 'px';
					s.style.height = slideSize + 'px';
					s.style.width = '';
				} );
			} else {
				slideSize =
					( viewport.clientWidth - gap * ( perView - 1 ) ) / perView;
				slides.forEach( function ( s ) {
					s.style.flex = '0 0 ' + slideSize + 'px';
					s.style.width = slideSize + 'px';
					s.style.height = '';
				} );
			}
		}

		function applyAdaptiveHeight() {
			if ( ! adaptive ) {
				return;
			}
			var h = 0;
			for ( var i = index; i < index + perView && i < total; i++ ) {
				// Measure the content, not the slide: flex stretches every
				// slide to the tallest one, so slide.offsetHeight would always
				// read the tallest and never adapt.
				var content = slides[ i ].querySelector( '.ab-slide__content' );
				h = Math.max(
					h,
					content ? content.offsetHeight : slides[ i ].offsetHeight
				);
			}
			if ( h ) {
				viewport.style.height = h + 'px';
				track.style.height = h + 'px';
			}
		}

		/* ── Apply ───────────────────────────────────────────────────────── */
		function apply( animate ) {
			var dur = animate && ! reducedMotion() ? speed : 0;
			if ( effect === 'slide' ) {
				track.style.transition = 'transform ' + dur + 'ms ease';
				track.style.transform =
					'translate' +
					axis +
					'(' +
					-index * ( slideSize + gap ) +
					'px)';
				applyAdaptiveHeight();
			} else if ( effect === 'fade' ) {
				slides.forEach( function ( s, i ) {
					s.classList.toggle( 'is-active', i === index );
				} );
			} else if ( effect === 'coverflow' ) {
				applyCoverflow();
			}
			if ( prevBtn && ! loop ) {
				prevBtn.disabled = index <= 0;
			}
			if ( nextBtn && ! loop ) {
				nextBtn.disabled = index >= maxIndex();
			}
			updatePagination();
		}

		function applyCoverflow() {
			var spacing = slideSize * 0.62;
			slides.forEach( function ( s, i ) {
				var k = i - index;
				var abs = Math.abs( k );
				var sign = k < 0 ? 1 : -1;
				var rot = k === 0 ? 0 : sign * 40;
				var scale = k === 0 ? 1 : 0.82;
				var x = k * spacing - slideSize / 2;
				s.style.width = slideSize + 'px';
				s.style.transform =
					'translateX(' +
					x +
					'px) rotateY(' +
					rot +
					'deg) scale(' +
					scale +
					')';
				s.style.opacity = abs > 2 ? '0' : k === 0 ? '1' : '0.65';
				s.style.zIndex = String( 100 - abs );
				s.style.pointerEvents = k === 0 ? 'auto' : 'none';
			} );
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

		function next() {
			goTo( index + scroll );
		}
		function prev() {
			goTo( index - scroll );
		}

		function layout() {
			sizeSlides();
			if ( index > maxIndex() ) {
				index = maxIndex();
			}
			apply( false );
			renderPagination();
		}

		/* ── Arrows ──────────────────────────────────────────────────────── */
		if ( showArrows ) {
			prevBtn = document.createElement( 'button' );
			prevBtn.type = 'button';
			prevBtn.className = 'ab-slider__arrow ab-slider__arrow--prev';
			prevBtn.setAttribute( 'aria-label', 'Previous slide' );
			prevBtn.innerHTML = vertical ? ARROW_UP : ARROW_PREV;
			nextBtn = document.createElement( 'button' );
			nextBtn.type = 'button';
			nextBtn.className = 'ab-slider__arrow ab-slider__arrow--next';
			nextBtn.setAttribute( 'aria-label', 'Next slide' );
			nextBtn.innerHTML = vertical ? ARROW_DOWN : ARROW_NEXT;
			viewport.appendChild( prevBtn );
			viewport.appendChild( nextBtn );
			prevBtn.addEventListener( 'click', function () {
				prev();
				restart();
			} );
			nextBtn.addEventListener( 'click', function () {
				next();
				restart();
			} );
		}

		/* ── Pagination (dots / fraction / progress) ─────────────────────── */
		function pageCount() {
			return Math.ceil( maxIndex() / scroll ) + 1;
		}
		function currentPage() {
			return Math.min( pageCount() - 1, Math.round( index / scroll ) );
		}

		function renderPagination() {
			if ( ! showDots ) {
				return;
			}
			if ( ! pagWrap ) {
				pagWrap = document.createElement( 'div' );
				pagWrap.className =
					'ab-slider__pagination ab-slider__pagination--' + pagType;
				root.appendChild( pagWrap );
			}
			pagWrap.innerHTML = '';
			var pages = pageCount();
			if ( pages <= 1 ) {
				pagWrap.style.display = 'none';
				return;
			}
			pagWrap.style.display = '';

			if ( pagType === 'fraction' ) {
				pagWrap.innerHTML =
					'<span class="ab-slider__frac-current">1</span>' +
					' / ' +
					'<span class="ab-slider__frac-total">' +
					total +
					'</span>';
			} else if ( pagType === 'progress' ) {
				var bar = document.createElement( 'div' );
				bar.className = 'ab-slider__progress-bar';
				pagWrap.appendChild( bar );
			} else {
				for ( var i = 0; i < pages; i++ ) {
					( function ( i ) {
						var dot = document.createElement( 'button' );
						dot.type = 'button';
						dot.className = 'ab-slider__dot';
						dot.setAttribute(
							'aria-label',
							'Go to slide ' + ( i * scroll + 1 )
						);
						dot.addEventListener( 'click', function () {
							goTo( Math.min( i * scroll, maxIndex() ) );
							restart();
						} );
						pagWrap.appendChild( dot );
					} )( i );
				}
			}
			updatePagination();
		}

		function updatePagination() {
			if ( ! pagWrap ) {
				return;
			}
			if ( pagType === 'fraction' ) {
				var cur = pagWrap.querySelector( '.ab-slider__frac-current' );
				if ( cur ) {
					cur.textContent = String(
						Math.min( total, index + 1 )
					);
				}
			} else if ( pagType === 'progress' ) {
				var bar = pagWrap.querySelector( '.ab-slider__progress-bar' );
				if ( bar ) {
					var max = maxIndex();
					var pct = max <= 0 ? 100 : ( index / max ) * 100;
					bar.style.width = pct + '%';
				}
			} else {
				var dots = pagWrap.children;
				var active = currentPage();
				for ( var i = 0; i < dots.length; i++ ) {
					dots[ i ].classList.toggle( 'is-active', i === active );
				}
			}
		}

		/* ── Autoplay + play/pause ───────────────────────────────────────── */
		function start() {
			if ( ! autoplay || userPaused || total <= perView ) {
				return;
			}
			stop();
			timer = window.setInterval( next, autoplayDelay );
		}
		function stop() {
			if ( timer ) {
				window.clearInterval( timer );
				timer = null;
			}
		}
		function restart() {
			if ( userPaused ) {
				return;
			}
			stop();
			start();
		}
		if ( pauseHover ) {
			root.addEventListener( 'mouseenter', stop );
			root.addEventListener( 'mouseleave', start );
		}

		if ( autoplay && pauseButton ) {
			pauseBtn = document.createElement( 'button' );
			pauseBtn.type = 'button';
			pauseBtn.className = 'ab-slider__pause';
			pauseBtn.setAttribute( 'aria-label', 'Pause autoplay' );
			pauseBtn.setAttribute( 'aria-pressed', 'false' );
			pauseBtn.innerHTML = ICON_PAUSE;
			viewport.appendChild( pauseBtn );
			pauseBtn.addEventListener( 'click', function () {
				userPaused = ! userPaused;
				if ( userPaused ) {
					stop();
					pauseBtn.innerHTML = ICON_PLAY;
					pauseBtn.setAttribute( 'aria-label', 'Play autoplay' );
					pauseBtn.setAttribute( 'aria-pressed', 'true' );
				} else {
					start();
					pauseBtn.innerHTML = ICON_PAUSE;
					pauseBtn.setAttribute( 'aria-label', 'Pause autoplay' );
					pauseBtn.setAttribute( 'aria-pressed', 'false' );
				}
			} );
		}

		/* ── Keyboard ────────────────────────────────────────────────────── */
		root.setAttribute( 'tabindex', '0' );
		root.setAttribute( 'aria-roledescription', 'carousel' );
		root.addEventListener( 'keydown', function ( e ) {
			var back = vertical ? 'ArrowUp' : 'ArrowLeft';
			var fwd = vertical ? 'ArrowDown' : 'ArrowRight';
			if ( e.key === back ) {
				prev();
				restart();
			} else if ( e.key === fwd ) {
				next();
				restart();
			}
		} );

		/* ── Drag / swipe ────────────────────────────────────────────────── */
		if ( draggable ) {
			var dragStart = 0;
			var startTx = 0;
			var dragging = false;
			var coord = function ( e ) {
				return vertical ? e.clientY : e.clientX;
			};
			viewport.addEventListener(
				'pointerdown',
				function ( e ) {
					dragging = true;
					dragStart = coord( e );
					startTx = -index * ( slideSize + gap );
					if ( effect === 'slide' ) {
						track.style.transition = 'none';
					}
					stop();
				},
				{ passive: true }
			);
			window.addEventListener( 'pointermove', function ( e ) {
				if ( ! dragging || effect !== 'slide' ) {
					return;
				}
				var d = coord( e ) - dragStart;
				track.style.transform =
					'translate' + axis + '(' + ( startTx + d ) + 'px)';
			} );
			window.addEventListener( 'pointerup', function ( e ) {
				if ( ! dragging ) {
					return;
				}
				dragging = false;
				var d = coord( e ) - dragStart;
				var threshold = Math.max( 40, ( slideSize + gap ) / 4 );
				if ( d <= -threshold ) {
					next();
				} else if ( d >= threshold ) {
					prev();
				} else {
					apply( true );
				}
				start();
			} );
		}

		/* ── Resize ──────────────────────────────────────────────────────── */
		var resizeTimer = null;
		window.addEventListener( 'resize', function () {
			window.clearTimeout( resizeTimer );
			resizeTimer = window.setTimeout( layout, 150 );
		} );

		root.classList.add( 'is-ready' );
		layout();
		start();

		// Images can size after init; re-run layout once each one loads so the
		// adaptive height reflects the real image dimensions.
		if ( adaptive ) {
			track.querySelectorAll( 'img' ).forEach( function ( img ) {
				if ( ! img.complete ) {
					img.addEventListener( 'load', layout );
				}
			} );
		}

		if ( root.getAttribute( 'data-lightbox' ) === '1' ) {
			initLightbox( root, slides );
		}
	}

	/* ── Lightbox ──────────────────────────────────────────────────────────── */
	function initLightbox( root, slides ) {
		var images = [];
		slides.forEach( function ( s ) {
			var imgs = s.querySelectorAll( 'img' );
			Array.prototype.forEach.call( imgs, function ( img ) {
				images.push( img );
			} );
		} );
		if ( ! images.length ) {
			return;
		}

		var overlay = null;
		var stage = null;
		var current = 0;

		function fullSrc( img ) {
			return (
				img.getAttribute( 'data-full' ) || img.currentSrc || img.src
			);
		}

		function build() {
			overlay = document.createElement( 'div' );
			overlay.className = 'ab-slider-lightbox';
			overlay.setAttribute( 'role', 'dialog' );
			overlay.setAttribute( 'aria-modal', 'true' );

			stage = document.createElement( 'img' );
			stage.alt = '';
			overlay.appendChild( stage );

			var close = mkBtn(
				'ab-slider-lightbox__close',
				'Close',
				ICON_CLOSE
			);
			close.addEventListener( 'click', hide );
			overlay.appendChild( close );

			if ( images.length > 1 ) {
				var prev = mkBtn(
					'ab-slider-lightbox__prev',
					'Previous image',
					ARROW_PREV
				);
				prev.addEventListener( 'click', function () {
					show( current - 1 );
				} );
				var next = mkBtn(
					'ab-slider-lightbox__next',
					'Next image',
					ARROW_NEXT
				);
				next.addEventListener( 'click', function () {
					show( current + 1 );
				} );
				overlay.appendChild( prev );
				overlay.appendChild( next );
			}

			overlay.addEventListener( 'click', function ( e ) {
				if ( e.target === overlay ) {
					hide();
				}
			} );
			document.addEventListener( 'keydown', onKey );
			document.body.appendChild( overlay );
		}

		function mkBtn( cls, label, svg ) {
			var b = document.createElement( 'button' );
			b.type = 'button';
			b.className = 'ab-slider-lightbox__btn ' + cls;
			b.setAttribute( 'aria-label', label );
			b.innerHTML = svg;
			return b;
		}

		function onKey( e ) {
			if ( ! overlay ) {
				return;
			}
			if ( e.key === 'Escape' ) {
				hide();
			} else if ( e.key === 'ArrowLeft' ) {
				show( current - 1 );
			} else if ( e.key === 'ArrowRight' ) {
				show( current + 1 );
			}
		}

		function show( i ) {
			current = ( i + images.length ) % images.length;
			stage.src = fullSrc( images[ current ] );
			stage.alt = images[ current ].alt || '';
		}

		function open( i ) {
			if ( ! overlay ) {
				build();
			}
			show( i );
			requestAnimationFrame( function () {
				overlay.classList.add( 'is-open' );
			} );
		}

		function hide() {
			if ( ! overlay ) {
				return;
			}
			overlay.classList.remove( 'is-open' );
			document.removeEventListener( 'keydown', onKey );
			var el = overlay;
			overlay = null;
			window.setTimeout( function () {
				if ( el && el.parentNode ) {
					el.parentNode.removeChild( el );
				}
			}, 250 );
		}

		images.forEach( function ( img, i ) {
			img.addEventListener( 'click', function () {
				open( i );
			} );
		} );
	}

	/* ── Init ──────────────────────────────────────────────────────────────── */
	function initAll() {
		document.querySelectorAll( '.ab-slider' ).forEach( initSlider );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}

	window.axiomBlocksInitSlider = initAll;
} )();
