/**
 * Before/After Slider — frontend behaviour.
 *
 * Supports horizontal (left/right) and vertical (top/bottom) splits, and two
 * interactions: drag (press + pull; a click jumps the handle) and hover (the
 * handle follows the pointer without pressing). Keyboard navigation on focus.
 */
( function () {
	'use strict';

	function initSlider( wrapper ) {
		if ( wrapper.dataset.basReady === '1' ) return;
		wrapper.dataset.basReady = '1';

		const frame = wrapper.querySelector( '.axiom-blocks-bas__frame' );
		if ( ! frame ) return;

		const vertical = frame.classList.contains( 'is-vertical' );
		const hover = frame.classList.contains( 'is-hover' );

		let dragging = false;

		function setPosition( pct ) {
			pct = Math.max( 0, Math.min( 100, pct ) );
			frame.style.setProperty( '--slider-pos', pct + '%' );
			frame.setAttribute( 'aria-valuenow', String( Math.round( pct ) ) );
		}

		function positionFromEvent( e ) {
			const rect = frame.getBoundingClientRect();
			const touch = e.touches && e.touches[ 0 ];
			const clientX = touch ? touch.clientX : e.clientX;
			const clientY = touch ? touch.clientY : e.clientY;
			const pct = vertical
				? ( ( clientY - rect.top ) / rect.height ) * 100
				: ( ( clientX - rect.left ) / rect.width ) * 100;
			setPosition( pct );
		}

		if ( hover ) {
			// Hover — the handle tracks the pointer while it is over the frame.
			frame.addEventListener( 'pointermove', positionFromEvent );
		} else {
			// Drag — press and pull; a plain click jumps the handle.
			function onDown( e ) {
				dragging = true;
				frame.classList.add( 'is-dragging' );
				positionFromEvent( e );
				if ( e.cancelable ) e.preventDefault();
			}

			function onMove( e ) {
				if ( ! dragging ) return;
				positionFromEvent( e );
				if ( e.cancelable ) e.preventDefault();
			}

			function onUp() {
				dragging = false;
				frame.classList.remove( 'is-dragging' );
			}

			frame.addEventListener( 'mousedown', onDown );
			frame.addEventListener( 'touchstart', onDown, { passive: false } );
			window.addEventListener( 'mousemove', onMove );
			window.addEventListener( 'touchmove', onMove, { passive: false } );
			window.addEventListener( 'mouseup', onUp );
			window.addEventListener( 'touchend', onUp );
			window.addEventListener( 'touchcancel', onUp );
		}

		// Keyboard navigation when the frame has focus.
		frame.addEventListener( 'keydown', function ( e ) {
			const current = parseFloat(
				frame.getAttribute( 'aria-valuenow' ) || '50'
			);
			let next = current;
			switch ( e.key ) {
				case 'ArrowLeft':
				case 'ArrowUp':
					next = current - 2;
					break;
				case 'ArrowRight':
				case 'ArrowDown':
					next = current + 2;
					break;
				case 'Home':
					next = 0;
					break;
				case 'End':
					next = 100;
					break;
				case 'PageDown':
					next = current - 10;
					break;
				case 'PageUp':
					next = current + 10;
					break;
				default:
					return;
			}
			e.preventDefault();
			setPosition( next );
		} );
	}

	function initAll() {
		document.querySelectorAll( '.axiom-blocks-bas' ).forEach( initSlider );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}
	window.axiomBlocksInitBeforeAfter = initAll;
} )();
