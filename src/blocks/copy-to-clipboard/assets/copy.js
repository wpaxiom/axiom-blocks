( function () {
	'use strict';

	const COPY_ICON =
		'<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
	const CHECK_ICON = '<polyline points="20 6 9 17 4 12"/>';

	function copyText( text ) {
		if ( navigator.clipboard && window.isSecureContext ) {
			return navigator.clipboard.writeText( text );
		}

		// Fallback for HTTP / older browsers
		const textarea = document.createElement( 'textarea' );
		textarea.value = text;
		textarea.style.cssText =
			'position:fixed;top:-9999px;left:-9999px;opacity:0;';
		document.body.appendChild( textarea );
		textarea.focus();
		textarea.select();

		let ok = false;
		try {
			ok = document.execCommand( 'copy' );
		} catch ( e ) {
			ok = false;
		}
		document.body.removeChild( textarea );

		return ok
			? Promise.resolve()
			: Promise.reject( new Error( 'execCommand copy failed' ) );
	}

	function initCopyButtons() {
		const buttons = document.querySelectorAll(
			'.axiom-blocks-copy-to-clipboard__button'
		);

		buttons.forEach( function ( button ) {
			let resetTimer = null;

			button.addEventListener( 'click', function () {
				const textToCopy = button.getAttribute( 'data-text' );
				const successText = button.getAttribute( 'data-success' );
				const originalText = button.getAttribute( 'data-original' );
				const copiedBg = button.getAttribute( 'data-copied-bg' );
				const textEl = button.querySelector(
					'.axiom-blocks-copy-to-clipboard__text'
				);
				const svgEl = button.querySelector( 'svg' );

				// Save before changing — setting '' would clear the inline style entirely
				const originalBg = button.style.backgroundColor;

				copyText( textToCopy )
					.then( function () {
						if ( resetTimer ) {
							clearTimeout( resetTimer );
						}

						button.style.backgroundColor = copiedBg;
						textEl.textContent = successText;

						if ( svgEl ) {
							svgEl.innerHTML = CHECK_ICON;
						}

						resetTimer = setTimeout( function () {
							button.style.backgroundColor = originalBg;
							textEl.textContent = originalText;

							if ( svgEl ) {
								svgEl.innerHTML = COPY_ICON;
							}

							resetTimer = null;
						}, 2000 );
					} )
					.catch( function ( err ) {
						console.error( 'Copy failed:', err );
					} );
			} );
		} );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initCopyButtons );
	} else {
		initCopyButtons();
	}

	window.addEventListener( 'axiom-blocks-content-loaded', initCopyButtons );
} )();
