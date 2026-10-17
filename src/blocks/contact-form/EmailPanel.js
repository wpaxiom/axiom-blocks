/**
 * Contact Form: the Email settings panel.
 *
 * Per-form recipients and subject live on the block. The delivery route is
 * site-wide, so the panel only shows it, with a link to the settings screen
 * and a test button. Both need manage_options; editors without it see a short
 * note instead.
 */

import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { PanelBody } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { ABTextControl, ABToggleControl } from '../../components/ABControls';

const SETTINGS_URL = ( window.ajaxurl || '/wp-admin/admin-ajax.php' ).replace(
	'admin-ajax.php',
	'admin.php?page=axiom-blocks-dashboard#settings'
);

export function EmailPanel( { attributes, setAttributes } ) {
	const { emailTo, emailSubject, replyToVisitor, emailCc, emailBcc } =
		attributes;
	const [ info, setInfo ] = useState( null );
	const [ denied, setDenied ] = useState( false );
	const [ test, setTest ] = useState( { busy: false, text: '', ok: null } );

	useEffect( () => {
		apiFetch( { path: '/axiom-blocks/v1/email-settings' } )
			.then( setInfo )
			.catch( () => setDenied( true ) );
	}, [] );

	const route =
		info?.settings?.route === 'resend'
			? __( 'Resend', 'axiom-blocks' )
			: __( 'WordPress mail', 'axiom-blocks' );

	const sendTest = () => {
		const to = ( emailTo || '' ).split( ',' )[ 0 ].trim();
		setTest( { busy: true, text: '', ok: null } );
		apiFetch( {
			path: '/axiom-blocks/v1/email/test',
			method: 'POST',
			data: { to },
		} )
			.then( ( res ) => {
				const failed = ( res.attempts || [] )
					.filter( ( a ) => ! a.ok )
					.map( ( a ) => a.error )
					.join( ' ' );
				setTest( {
					busy: false,
					ok: !! res.ok,
					text: res.ok
						? sprintf(
								/* translators: %s: email address. */
								__( 'Test email sent to %s.', 'axiom-blocks' ),
								res.to
						  )
						: failed ||
						  __( 'The test email was not sent.', 'axiom-blocks' ),
				} );
			} )
			.catch( ( err ) =>
				setTest( {
					busy: false,
					ok: false,
					text:
						err?.message ||
						__( 'The test email was not sent.', 'axiom-blocks' ),
				} )
			);
	};

	return (
		<PanelBody
			title={ __( 'Email', 'axiom-blocks' ) }
			initialOpen={ false }
		>
			<ABTextControl
				label={ __( 'Send to', 'axiom-blocks' ) }
				help={ __(
					'One or more addresses, separated by commas. Empty sends to the site admin email.',
					'axiom-blocks'
				) }
				placeholder={ info?.admin_email || '' }
				value={ emailTo }
				onChange={ ( v ) => setAttributes( { emailTo: v } ) }
			/>
			<ABTextControl
				label={ __( 'Subject', 'axiom-blocks' ) }
				help={ __(
					'Use {form}, {site} or {field:key} to insert the form name, the site title or a field value.',
					'axiom-blocks'
				) }
				placeholder={ __( 'New message from {form}', 'axiom-blocks' ) }
				value={ emailSubject }
				onChange={ ( v ) => setAttributes( { emailSubject: v } ) }
			/>
			<ABToggleControl
				label={ __(
					"Reply goes to the visitor's email",
					'axiom-blocks'
				) }
				help={ __(
					'Uses the first Email field as Reply-To, so you can answer straight from your inbox.',
					'axiom-blocks'
				) }
				checked={ replyToVisitor !== false }
				onChange={ ( v ) => setAttributes( { replyToVisitor: v } ) }
			/>
			<ABTextControl
				label={ __( 'Cc', 'axiom-blocks' ) }
				value={ emailCc }
				onChange={ ( v ) => setAttributes( { emailCc: v } ) }
			/>
			<ABTextControl
				label={ __( 'Bcc', 'axiom-blocks' ) }
				value={ emailBcc }
				onChange={ ( v ) => setAttributes( { emailBcc: v } ) }
			/>

			<div className="ab-cf-email-route">
				{ denied ? (
					<p>
						{ __(
							'Delivery is set site-wide by an administrator under Axiom Blocks > Settings.',
							'axiom-blocks'
						) }
					</p>
				) : (
					<>
						<p>
							{ sprintf(
								/* translators: %s: delivery route name. */
								__( 'Delivery: %s', 'axiom-blocks' ),
								info ? route : '…'
							) }{ ' ' }
							<a
								href={ SETTINGS_URL }
								target="_blank"
								rel="noreferrer"
							>
								{ __( 'Change', 'axiom-blocks' ) }
							</a>
						</p>
						<button
							type="button"
							className="components-button is-secondary"
							onClick={ sendTest }
							disabled={ test.busy || ! info }
						>
							{ test.busy
								? __( 'Sending…', 'axiom-blocks' )
								: __( 'Send test email', 'axiom-blocks' ) }
						</button>
						{ test.text && (
							<p
								className={ `ab-cf-email-route__result ${
									test.ok ? 'is-ok' : 'is-error'
								}` }
								role="status"
							>
								{ test.text }
							</p>
						) }
					</>
				) }
			</div>
		</PanelBody>
	);
}
