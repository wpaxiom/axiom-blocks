/**
 * Axiom Blocks — deactivation feedback modal.
 *
 * Intercepts the plugin's Deactivate link on the Plugins screen and asks an
 * optional, skippable question. Feedback is only sent when the user clicks
 * "Submit & Deactivate"; Skip and Cancel send nothing.
 */
( function () {
	'use strict';

	const cfg = window.axiomBlocksFeedback;
	if ( ! cfg || ! cfg.basename ) {
		return;
	}

	const row = document.querySelector(
		'tr[data-plugin="' + cfg.basename + '"]'
	);
	const link = row ? row.querySelector( '.deactivate a' ) : null;
	if ( ! link ) {
		return;
	}

	let deactivateUrl = link.getAttribute( 'href' );
	let overlay = null;
	let selected = '';

	function esc( s ) {
		const d = document.createElement( 'div' );
		d.textContent = s == null ? '' : String( s );
		return d.innerHTML;
	}

	function reasonById( id ) {
		for ( let i = 0; i < cfg.reasons.length; i++ ) {
			if ( cfg.reasons[ i ].id === id ) {
				return cfg.reasons[ i ];
			}
		}
		return null;
	}

	function close() {
		if ( overlay && overlay.parentNode ) {
			overlay.parentNode.removeChild( overlay );
		}
		overlay = null;
		document.removeEventListener( 'keydown', onKey );
	}

	function onKey( e ) {
		if ( e.key === 'Escape' ) {
			close();
		}
	}

	function go() {
		window.location.href = deactivateUrl;
	}

	function submit() {
		const detailEl = overlay.querySelector( '.ab-fb-detail' );
		const detail = detailEl ? detailEl.value : '';

		const data = new FormData();
		data.append( 'action', 'axiom_blocks_deactivation_feedback' );
		data.append( 'nonce', cfg.nonce );
		data.append( 'reason', selected );
		data.append( 'detail', detail );

		// keepalive lets the request finish even though we navigate away.
		try {
			fetch( cfg.ajaxUrl, {
				method: 'POST',
				body: data,
				credentials: 'same-origin',
				keepalive: true,
			} )
				.then( go )
				.catch( go );
		} catch ( err ) {
			go();
		}
		// Fallback so deactivation never stalls on a slow/blocked request.
		window.setTimeout( go, 1200 );
	}

	function buildReasons() {
		let html = '';
		cfg.reasons.forEach( function ( r ) {
			html +=
				'<label class="ab-fb-reason">' +
				'<input type="radio" name="ab-fb-reason" value="' +
				esc( r.id ) +
				'" />' +
				'<span>' +
				esc( r.label ) +
				'</span>' +
				'</label>';
		} );
		return html;
	}

	function open() {
		overlay = document.createElement( 'div' );
		overlay.className = 'ab-fb-overlay';
		overlay.innerHTML =
			'<div class="ab-fb-modal" role="dialog" aria-modal="true" aria-label="' +
			esc( cfg.i18n.title ) +
			'">' +
			'<button type="button" class="ab-fb-x" aria-label="' +
			esc( cfg.i18n.cancel ) +
			'">&times;</button>' +
			'<h2 class="ab-fb-title">' +
			esc( cfg.i18n.title ) +
			'</h2>' +
			'<p class="ab-fb-sub">' +
			esc( cfg.i18n.subtitle ) +
			'</p>' +
			'<div class="ab-fb-reasons">' +
			buildReasons() +
			'</div>' +
			'<textarea class="ab-fb-detail" rows="3" style="display:none"></textarea>' +
			'<p class="ab-fb-privacy">' +
			esc( cfg.i18n.privacy ) +
			'</p>' +
			'<div class="ab-fb-actions">' +
			'<button type="button" class="button button-link ab-fb-skip">' +
			esc( cfg.i18n.skip ) +
			'</button>' +
			'<button type="button" class="button button-primary ab-fb-submit" disabled>' +
			esc( cfg.i18n.submit ) +
			'</button>' +
			'</div>' +
			'</div>';

		document.body.appendChild( overlay );
		document.addEventListener( 'keydown', onKey );

		const detailEl = overlay.querySelector( '.ab-fb-detail' );
		const submitBtn = overlay.querySelector( '.ab-fb-submit' );

		overlay.addEventListener( 'change', function ( e ) {
			if ( e.target && e.target.name === 'ab-fb-reason' ) {
				selected = e.target.value;
				submitBtn.disabled = false;
				const r = reasonById( selected );
				if ( r && r.placeholder ) {
					detailEl.placeholder = r.placeholder;
					detailEl.style.display = '';
				} else {
					detailEl.style.display = 'none';
				}
			}
		} );

		overlay.addEventListener( 'click', function ( e ) {
			if (
				e.target === overlay ||
				e.target.classList.contains( 'ab-fb-x' )
			) {
				close();
			}
		} );
		overlay.querySelector( '.ab-fb-skip' ).addEventListener( 'click', go );
		submitBtn.addEventListener( 'click', submit );

		const first = overlay.querySelector( 'input[name="ab-fb-reason"]' );
		if ( first ) {
			first.focus();
		}
	}

	link.addEventListener( 'click', function ( e ) {
		e.preventDefault();
		deactivateUrl = link.getAttribute( 'href' );
		open();
	} );
} )();
