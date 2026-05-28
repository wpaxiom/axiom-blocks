/**
 * Countdown Timer Frontend Script
 * Handles live countdown updates
 */

( function () {
	'use strict';

	/**
	 * Calculate time remaining
	 * @param {string} targetDate - ISO date string
	 * @return {Object|null}
	 */
	function getTimeRemaining( targetDate ) {
		const total = Date.parse( targetDate ) - Date.now();

		if ( total <= 0 ) {
			return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
		}

		return {
			total,
			days: Math.floor( total / ( 1000 * 60 * 60 * 24 ) ),
			hours: Math.floor( ( total / ( 1000 * 60 * 60 ) ) % 24 ),
			minutes: Math.floor( ( total / 1000 / 60 ) % 60 ),
			seconds: Math.floor( ( total / 1000 ) % 60 ),
		};
	}

	/**
	 * Format number with leading zero
	 * @param {number} num
	 * @return {string}
	 */
	function formatNumber( num ) {
		return String( num ).padStart( 2, '0' );
	}

	/**
	 * Initialize countdown timer
	 * @param {HTMLElement} container
	 */
	function initCountdown( container ) {
		const targetDate = container.dataset.targetDate;
		const expiredAction = container.dataset.expiredAction || 'showMessage';
		const expiredMessage = container.dataset.expiredMessage || "Time's up!";
		const redirectUrl = container.dataset.redirectUrl || '';

		const daysEl = container.querySelector(
			'[data-unit="days"] .axiom-blocks-countdown__digit'
		);
		const hoursEl = container.querySelector(
			'[data-unit="hours"] .axiom-blocks-countdown__digit'
		);
		const minutesEl = container.querySelector(
			'[data-unit="minutes"] .axiom-blocks-countdown__digit'
		);
		const secondsEl = container.querySelector(
			'[data-unit="seconds"] .axiom-blocks-countdown__digit'
		);

		function updateCountdown() {
			const time = getTimeRemaining( targetDate );

			if ( time.total <= 0 ) {
				// Timer expired
				if ( expiredAction === 'hide' ) {
					container.style.display = 'none';
				} else if ( expiredAction === 'redirect' && redirectUrl ) {
					window.location.href = redirectUrl;
					return;
				} else {
					// Show message
					container.innerHTML =
						'<div class="axiom-blocks-countdown__expired">' +
						wp.escapeHtml( expiredMessage ) +
						'</div>';
				}
				return;
			}

			if ( daysEl ) daysEl.textContent = formatNumber( time.days );
			if ( hoursEl ) hoursEl.textContent = formatNumber( time.hours );
			if ( minutesEl )
				minutesEl.textContent = formatNumber( time.minutes );
			if ( secondsEl )
				secondsEl.textContent = formatNumber( time.seconds );
		}

		// Initial update
		updateCountdown();

		// Update every second
		const interval = setInterval( updateCountdown, 1000 );

		// Cleanup on page hide
		document.addEventListener( 'visibilitychange', function () {
			if ( document.hidden ) {
				clearInterval( interval );
			} else {
				updateCountdown();
				setInterval( updateCountdown, 1000 );
			}
		} );
	}

	/**
	 * Initialize all countdowns on page
	 */
	function initAllCountdowns() {
		const containers = document.querySelectorAll(
			'.axiom-blocks-countdown__container'
		);
		containers.forEach( initCountdown );
	}

	// Initialize when DOM is ready
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', initAllCountdowns );
	} else {
		initAllCountdowns();
	}
} )();
