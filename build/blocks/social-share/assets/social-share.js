/**
 * Social Share: progressive enhancement.
 *
 * The share links work without this file. It opens them in a centred popup,
 * reveals and runs the action buttons (copy link, the native share sheet,
 * print), and asks Mastodon users for their own server once.
 */
( function () {
	'use strict';

	const MASTODON_KEY = 'axiomBlocksMastodonServer';

	function data( root ) {
		return {
			url: root.getAttribute( 'data-ab-ss-url' ) || window.location.href,
			title: root.getAttribute( 'data-ab-ss-title' ) || document.title,
			text: root.getAttribute( 'data-ab-ss-text' ) || '',
		};
	}

	function announce( root, message ) {
		const status = root.querySelector( '.ab-ss__status' );
		if ( ! status ) {
			return;
		}
		status.textContent = '';
		// A fresh text node is announced even when the message repeats.
		window.setTimeout( function () {
			status.textContent = message;
		}, 50 );
	}

	function copyText( text ) {
		if ( navigator.clipboard && window.isSecureContext ) {
			return navigator.clipboard.writeText( text );
		}
		const area = document.createElement( 'textarea' );
		area.value = text;
		area.setAttribute( 'readonly', '' );
		area.style.cssText = 'position:fixed;top:-9999px;opacity:0;';
		document.body.appendChild( area );
		area.select();
		let ok = false;
		try {
			ok = document.execCommand( 'copy' );
		} catch ( e ) {
			ok = false;
		}
		document.body.removeChild( area );
		return ok ? Promise.resolve() : Promise.reject( new Error( 'copy' ) );
	}

	function onCopy( root, button ) {
		const share = data( root );
		const label = button.querySelector( '.ab-ss__label' );
		const copied = button.getAttribute( 'data-ab-ss-copied' ) || 'Copied';
		copyText( share.url ).then(
			function () {
				window.clearTimeout( button._abSsTimer );
				if ( label && ! label.hasAttribute( 'data-ab-ss-text' ) ) {
					label.setAttribute( 'data-ab-ss-text', label.textContent );
				}
				button.classList.add( 'is-copied' );
				if ( label ) {
					label.textContent = copied;
				}
				announce( root, copied );
				button._abSsTimer = window.setTimeout( function () {
					button.classList.remove( 'is-copied' );
					if ( label ) {
						label.textContent =
							label.getAttribute( 'data-ab-ss-text' );
					}
				}, 2000 );
			},
			function () {
				// Clipboard refused (permissions, old browser): let the visitor
				// copy the address by hand.
				window.prompt( '', share.url ); // eslint-disable-line no-alert
			}
		);
	}

	function onNative( root ) {
		const share = data( root );
		navigator
			.share( { title: share.title, text: share.text, url: share.url } )
			.catch( function () {
				// AbortError when the visitor closes the sheet; nothing to do.
			} );
	}

	function mastodonHref( href ) {
		let server = '';
		try {
			server = window.localStorage.getItem( MASTODON_KEY ) || '';
		} catch ( e ) {
			server = '';
		}
		if ( ! server ) {
			// eslint-disable-next-line no-alert
			const answer = window.prompt(
				'Your Mastodon server, for example mastodon.social',
				'mastodon.social'
			);
			if ( null === answer ) {
				return '';
			}
			server = String( answer )
				.trim()
				.replace( /^https?:\/\//i, '' )
				.replace( /\/.*$/, '' )
				.toLowerCase();
			if ( ! /^[a-z0-9.-]+\.[a-z]{2,}$/.test( server ) ) {
				return href;
			}
			try {
				window.localStorage.setItem( MASTODON_KEY, server );
			} catch ( e ) {}
		}
		return href.replace( /^https:\/\/[^/]+/, 'https://' + server );
	}

	function init( root ) {
		if ( root._abSsReady ) {
			return;
		}
		root._abSsReady = true;

		root.querySelectorAll( '[data-ab-ss-action]' ).forEach(
			function ( button ) {
				const action = button.getAttribute( 'data-ab-ss-action' );
				if (
					'native' === action &&
					typeof navigator.share !== 'function'
				) {
					return;
				}
				const item = button.closest( '.ab-ss__item' );
				if ( item ) {
					item.hidden = false;
				}
			}
		);

		root.addEventListener( 'click', function ( event ) {
			const button = event.target.closest( '[data-ab-ss-action]' );
			if ( button && root.contains( button ) ) {
				const action = button.getAttribute( 'data-ab-ss-action' );
				if ( 'copy' === action ) {
					onCopy( root, button );
				} else if ( 'native' === action ) {
					onNative( root );
				} else if ( 'print' === action ) {
					window.print();
				}
				return;
			}

			const link = event.target.closest( 'a.ab-ss__btn' );
			if ( ! link || ! root.contains( link ) ) {
				return;
			}
			if (
				event.metaKey ||
				event.ctrlKey ||
				event.shiftKey ||
				event.button > 0
			) {
				return;
			}
			let href = link.href;
			if ( link.hasAttribute( 'data-ab-ss-instance' ) ) {
				href = mastodonHref( href );
				if ( ! href ) {
					event.preventDefault();
					return;
				}
				if ( ! link.hasAttribute( 'data-ab-ss-popup' ) ) {
					event.preventDefault();
					const tab = window.open( href, '_blank' );
					if ( tab ) {
						tab.opener = null;
					}
					return;
				}
			}
			if ( link.hasAttribute( 'data-ab-ss-popup' ) ) {
				// Opened synchronously in the click, so blockers allow it. When
				// a blocker still refuses, the link opens in a new tab instead.
				event.preventDefault();
				const popup = window.open(
					href,
					'_blank',
					'popup,width=600,height=540,left=' +
						Math.max(
							0,
							( window.screenX || 0 ) +
								( window.outerWidth - 600 ) / 2
						) +
						',top=' +
						Math.max(
							0,
							( window.screenY || 0 ) +
								( window.outerHeight - 540 ) / 2
						)
				);
				const win = popup || window.open( href, '_blank' );
				if ( win ) {
					win.opener = null;
				} else {
					window.location.assign( href );
				}
			}
		} );
	}

	function initAll() {
		document.querySelectorAll( '.ab-ss' ).forEach( init );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAll );
	} else {
		initAll();
	}
	window.addEventListener( 'axiom-blocks-content-loaded', initAll );
} )();
