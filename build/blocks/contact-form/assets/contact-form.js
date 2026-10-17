/**
 * Contact Form: front-end enhancement.
 *
 * The form is a working POST form without this script. With it, a submit is
 * validated in the browser, sent to the REST route without a reload, and the
 * result is announced in the form's status region. The server stays the
 * authority: it validates again and its field errors are shown the same way.
 *
 * The script also reports how long the visitor spent filling the form (the
 * server's fill-time spam check), refreshes "page URL" hidden fields, and fills
 * "URL parameter" hidden fields from the address bar.
 */
( function () {
	'use strict';

	const FORM = 'form.ab-cf';

	function i18n( form ) {
		try {
			return JSON.parse( form.getAttribute( 'data-ab-cf-i18n' ) || '{}' );
		} catch ( e ) {
			return {};
		}
	}

	function fields( form ) {
		return Array.prototype.slice.call(
			form.querySelectorAll( '.ab-cf-field[data-ab-cf-key]' )
		);
	}

	function setFieldError( field, message ) {
		const error = field.querySelector( '.ab-cf-error' );
		const controls = field.querySelectorAll(
			'.ab-cf-control, .ab-cf-choice__input, .ab-cf-choices'
		);
		field.classList.toggle( 'is-invalid', !! message );
		Array.prototype.forEach.call( controls, function ( c ) {
			if ( message ) {
				c.setAttribute( 'aria-invalid', 'true' );
			} else {
				c.removeAttribute( 'aria-invalid' );
			}
		} );
		if ( error ) {
			error.textContent = message || '';
			error.hidden = ! message;
		}
	}

	function labelText( field ) {
		const label = field.querySelector(
			'.ab-cf-label, .ab-cf-consent__text'
		);
		if ( ! label ) {
			return field.getAttribute( 'data-ab-cf-key' );
		}
		const clone = label.cloneNode( true );
		Array.prototype.forEach.call(
			clone.querySelectorAll( '.ab-cf-req, .ab-cf-opt' ),
			function ( n ) {
				n.parentNode.removeChild( n );
			}
		);
		return clone.textContent.trim();
	}

	function showStatus( form, tone, message, errors ) {
		const status = form.querySelector( '.ab-cf-status' );
		if ( ! status ) {
			return;
		}
		const display = form.getAttribute( 'data-ab-cf-display' ) || 'inline';
		status.classList.remove( 'is-success', 'is-error' );
		status.innerHTML = '';
		if ( ! message ) {
			status.hidden = true;
			return;
		}
		status.classList.add( tone === 'success' ? 'is-success' : 'is-error' );
		const p = document.createElement( 'p' );
		p.className = 'ab-cf-status__text';
		p.textContent = message;
		status.appendChild( p );

		if ( errors && errors.length && display !== 'inline' ) {
			const ul = document.createElement( 'ul' );
			ul.className = 'ab-cf-summary';
			errors.forEach( function ( item ) {
				const li = document.createElement( 'li' );
				li.textContent = item.label + ': ' + item.message;
				ul.appendChild( li );
			} );
			status.appendChild( ul );
		}
		status.hidden = false;
	}

	/**
	 * Browser-side check of one field. Mirrors the server's rules closely
	 * enough to catch the common mistakes before a round trip.
	 *
	 * @param {HTMLElement} field Field wrapper.
	 * @param {Object}      t     Strings.
	 * @return {string} Error message, or ''.
	 */
	function check( field, t ) {
		const choices = field.querySelectorAll( '.ab-cf-choice__input' );

		if ( field.classList.contains( 'ab-cf-field--consent' ) ) {
			const box = choices[ 0 ];
			return box && box.required && ! box.checked ? t.consent : '';
		}

		if ( choices.length ) {
			const required =
				field.getAttribute( 'data-ab-cf-required' ) === '1';
			const any = Array.prototype.some.call( choices, function ( c ) {
				return c.checked;
			} );
			return required && ! any ? t.choose : '';
		}

		const control = field.querySelector( '.ab-cf-control' );
		if ( ! control ) {
			return '';
		}
		let value = control.value ? control.value.trim() : '';
		if ( control.multiple ) {
			value = control.selectedOptions.length ? 'x' : '';
		}
		if ( ! value ) {
			return control.required ? t.required : '';
		}
		const v = control.validity || {};
		if ( v.typeMismatch ) {
			return control.type === 'email' ? t.email : t.url;
		}
		if ( v.badInput ) {
			return t.number;
		}
		if ( v.rangeUnderflow || v.rangeOverflow ) {
			return t.range;
		}
		if ( v.tooShort ) {
			return t.tooShort;
		}
		if (
			field.classList.contains( 'ab-cf-field--phone' ) &&
			! /^[0-9+().\-\s/x]{3,40}$/i.test( value )
		) {
			return t.phone;
		}
		return '';
	}

	function validate( form, t ) {
		const errors = [];
		fields( form ).forEach( function ( field ) {
			const message = check( field, t );
			setFieldError( field, message );
			if ( message ) {
				errors.push( {
					field,
					label: labelText( field ),
					message,
				} );
			}
		} );
		return errors;
	}

	function focusFirst( errors ) {
		if ( ! errors.length ) {
			return;
		}
		const target = errors[ 0 ].field.querySelector(
			'.ab-cf-control, .ab-cf-choice__input'
		);
		if ( target ) {
			target.focus();
		}
	}

	function setSending( form, sending ) {
		const button = form.querySelector( '.ab-cf-button' );
		form.classList.toggle( 'is-sending', sending );
		if ( ! button ) {
			return;
		}
		const label = button.querySelector( '.ab-cf-button__label' );
		button.disabled = sending;
		button.setAttribute( 'aria-busy', sending ? 'true' : 'false' );
		if ( label ) {
			if ( sending ) {
				label.setAttribute( 'data-ab-cf-idle', label.textContent );
				if ( button.getAttribute( 'data-ab-cf-sending' ) ) {
					label.textContent =
						button.getAttribute( 'data-ab-cf-sending' );
				}
			} else if ( label.hasAttribute( 'data-ab-cf-idle' ) ) {
				label.textContent = label.getAttribute( 'data-ab-cf-idle' );
			}
		}
	}

	function fillHidden( form ) {
		const params = new URLSearchParams( window.location.search );
		Array.prototype.forEach.call(
			form.querySelectorAll( '.ab-cf-hidden' ),
			function ( input ) {
				if ( input.hasAttribute( 'data-ab-cf-url' ) ) {
					input.value = window.location.href.split( '#' )[ 0 ];
				}
				const param = input.getAttribute( 'data-ab-cf-param' );
				if ( param && params.has( param ) ) {
					input.value = params.get( param ).slice( 0, 500 );
				}
			}
		);
	}

	function init( form ) {
		const t = i18n( form );
		const endpoint = form.getAttribute( 'data-ab-cf-endpoint' );
		let started = 0;

		form.setAttribute( 'novalidate', '' );
		fillHidden( form );

		const start = function () {
			if ( ! started ) {
				started = Date.now();
			}
		};
		form.addEventListener( 'focusin', start );
		form.addEventListener( 'input', start );

		// Clear a field's error as soon as the visitor fixes it.
		form.addEventListener( 'input', function ( event ) {
			const field = event.target.closest( '.ab-cf-field' );
			if ( field && field.classList.contains( 'is-invalid' ) ) {
				if ( ! check( field, t ) ) {
					setFieldError( field, '' );
				}
			}
		} );
		form.addEventListener( 'change', function ( event ) {
			const field = event.target.closest( '.ab-cf-field' );
			if (
				field &&
				field.classList.contains( 'is-invalid' ) &&
				! check( field, t )
			) {
				setFieldError( field, '' );
			}
		} );

		form.addEventListener( 'submit', function ( event ) {
			if ( ! endpoint || ! window.fetch || ! window.FormData ) {
				return; // Let the browser post the form.
			}
			event.preventDefault();
			if ( form.classList.contains( 'is-sending' ) ) {
				return;
			}

			const errors = validate( form, t );
			if ( errors.length ) {
				showStatus( form, 'error', t.check, errors );
				focusFirst( errors );
				return;
			}

			const data = new FormData( form );
			data.append(
				'ab_cf_el',
				String( started ? Date.now() - started : 0 )
			);
			data.append( 'ab_cf_page', window.location.href.split( '#' )[ 0 ] );

			setSending( form, true );
			showStatus( form, '', '' );

			window
				.fetch( endpoint, {
					method: 'POST',
					body: data,
					credentials: 'omit',
					headers: { Accept: 'application/json' },
				} )
				.then( function ( response ) {
					return response.json();
				} )
				.then( function ( res ) {
					setSending( form, false );
					if ( ! res || ! res.status ) {
						throw new Error( 'bad response' );
					}
					if ( res.status === 'sent' ) {
						if ( res.redirect ) {
							window.location.assign( res.redirect );
							return;
						}
						fields( form ).forEach( function ( f ) {
							setFieldError( f, '' );
						} );
						form.reset();
						fillHidden( form );
						started = 0;
						showStatus( form, 'success', res.message || t.success );
						if ( form.getAttribute( 'data-ab-cf-hide' ) === '1' ) {
							form.classList.add( 'is-done' );
						}
						const status = form.querySelector( '.ab-cf-status' );
						if ( status ) {
							status.focus( { preventScroll: false } );
						}
						return;
					}
					const list = [];
					const serverErrors = res.errors || {};
					fields( form ).forEach( function ( field ) {
						const key = field.getAttribute( 'data-ab-cf-key' );
						const message = serverErrors[ key ] || '';
						setFieldError( field, message );
						if ( message ) {
							list.push( {
								field,
								label: labelText( field ),
								message,
							} );
						}
					} );
					showStatus( form, 'error', res.message || t.error, list );
					focusFirst( list );
				} )
				.catch( function () {
					setSending( form, false );
					showStatus( form, 'error', t.error );
				} );
		} );
	}

	function boot() {
		Array.prototype.forEach.call( document.querySelectorAll( FORM ), init );
	}

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
