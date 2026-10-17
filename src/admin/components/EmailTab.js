/**
 * Email tab.
 *
 * Site-wide delivery for Contact Form emails: WordPress mail (any SMTP plugin
 * keeps working) or the Resend API, plus the From identity, the fallback
 * switch, entry storage and retention. Above the settings, a status card says
 * how mail is going: healthy, last send failed, or Resend chosen with no key.
 *
 * The Resend key is write-only: the server returns whether one is set and its
 * last four characters, never the key itself.
 */

import { useEffect, useRef, useState } from '@wordpress/element';
import { __, _n, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
	AlertIcon,
	CheckIcon,
	InboxIcon,
	KeyIcon,
	LockIcon,
	MailIcon,
	Msg,
	TickIcon,
	Toggle,
	XCircleIcon,
} from './ui';

// Outside the component on purpose: a component defined during render would be
// a new type every render and remount its inputs, dropping focus while typing.
const Row = ( { label, desc, htmlFor, children, after } ) => (
	<div className="ab-settings-row ab-settings-row--stack">
		<div className="ab-settings-row__inner">
			<div className="ab-settings-row__text">
				{ htmlFor ? (
					<label
						className="ab-settings-row__label"
						htmlFor={ htmlFor }
					>
						{ label }
					</label>
				) : (
					<div className="ab-settings-row__label">{ label }</div>
				) }
				{ desc && (
					<div className="ab-settings-row__desc">{ desc }</div>
				) }
			</div>
			<div className="ab-settings-row__control">{ children }</div>
		</div>
		{ after }
	</div>
);

const routeName = ( route ) =>
	route === 'resend' ? 'Resend' : __( 'WordPress mail', 'axiom-blocks' );

const ago = ( seconds ) => {
	if ( seconds < 60 ) {
		return __( 'just now', 'axiom-blocks' );
	}
	const units = [
		[
			86400,
			// translators: %d: number of days.
			( n ) => _n( '%d day ago', '%d days ago', n, 'axiom-blocks' ),
		],
		[
			3600,
			// translators: %d: number of hours.
			( n ) => _n( '%d hour ago', '%d hours ago', n, 'axiom-blocks' ),
		],
		[
			60,
			// translators: %d: number of minutes.
			( n ) => _n( '%d minute ago', '%d minutes ago', n, 'axiom-blocks' ),
		],
	];
	for ( const [ size, label ] of units ) {
		if ( seconds >= size ) {
			const n = Math.floor( seconds / size );
			return sprintf( label( n ), n );
		}
	}
	return '';
};

function EntriesLine( { entries, button } ) {
	const total = entries?.total || 0;
	const fresh = entries?.new || 0;
	const text =
		total === 0
			? __( 'No entries yet', 'axiom-blocks' )
			: sprintf(
					/* translators: 1: "N entries" phrase, 2: number of new entries. */
					__( '%1$s, %2$d new', 'axiom-blocks' ),
					sprintf(
						/* translators: %d: number of entries. */
						_n( '%d entry', '%d entries', total, 'axiom-blocks' ),
						total
					),
					fresh
			  );
	return (
		<div className="ab-status__entries">
			<InboxIcon size={ 16 } />
			<strong>{ text }</strong>
			{ button && entries?.url && (
				<a
					className="ab-btn-ghost ab-btn-ghost--sm"
					href={ entries.url }
				>
					{ __( 'View entries', 'axiom-blocks' ) }
				</a>
			) }
		</div>
	);
}

function StatusCard( { data, onFocusKey, onFocusTest } ) {
	const settings = data.settings;
	const resend = settings.route === 'resend';

	if ( data.last_error ) {
		return (
			<div className="ab-status ab-status--err">
				<div className="ab-status__row" role="alert">
					<XCircleIcon size={ 18 } className="ab-status__icon" />
					<div className="ab-status__body">
						<p className="ab-status__title">
							{ __(
								'The last form email was not sent.',
								'axiom-blocks'
							) }
						</p>
						<p>
							{ __(
								'The message was saved under Form entries. Send a test email to check the fix.',
								'axiom-blocks'
							) }
						</p>
						<pre className="ab-code">
							{ data.last_error.message }
						</pre>
						<div className="ab-status__actions">
							<button
								type="button"
								className="ab-btn-primary ab-focus"
								onClick={ onFocusTest }
							>
								{ __( 'Send a test email', 'axiom-blocks' ) }
							</button>
							{ data.entries?.url && (
								<a
									className="ab-btn-ghost ab-btn-ghost--lg ab-focus"
									href={ data.entries.url }
								>
									{ __( 'View entries', 'axiom-blocks' ) }
								</a>
							) }
						</div>
					</div>
				</div>
				<EntriesLine entries={ data.entries } />
			</div>
		);
	}

	if ( resend && ! data.key?.has_key ) {
		return (
			<div className="ab-status ab-status--warn">
				<div className="ab-status__row" role="status">
					<AlertIcon size={ 18 } className="ab-status__icon" />
					<div className="ab-status__body">
						<p>
							{ settings.fallback
								? __(
										'Resend is selected but no API key is saved, so emails fall back to WordPress mail.',
										'axiom-blocks'
								  )
								: __(
										'Resend is selected but no API key is saved, so form emails cannot be sent.',
										'axiom-blocks'
								  ) }
						</p>
						<div className="ab-status__actions">
							<button
								type="button"
								className="ab-btn-primary ab-focus"
								onClick={ onFocusKey }
							>
								<KeyIcon size={ 14 } />
								{ __( 'Add your API key', 'axiom-blocks' ) }
							</button>
						</div>
					</div>
				</div>
				<EntriesLine entries={ data.entries } button />
			</div>
		);
	}

	const sent = data.last_sent;
	return (
		<div className="ab-status">
			<div className="ab-status__row">
				<CheckIcon size={ 18 } className="ab-status__icon is-ok" />
				<p>
					{ sent
						? sprintf(
								/* translators: 1: route name, 2: relative time such as "12 minutes ago". */
								__(
									'Emails are going out through %1$s. Last email sent %2$s.',
									'axiom-blocks'
								),
								routeName( settings.route ),
								ago( Math.max( 0, data.now - sent.time ) )
						  )
						: sprintf(
								/* translators: %s: route name. */
								__(
									'Emails go out through %s. No form email has been sent yet.',
									'axiom-blocks'
								),
								routeName( settings.route )
						  ) }
				</p>
			</div>
			<EntriesLine entries={ data.entries } button />
		</div>
	);
}

export function EmailTab( { showToast, onMailChange } ) {
	const [ data, setData ] = useState( null );
	const [ draft, setDraft ] = useState( null );
	const [ apiKey, setApiKey ] = useState( '' );
	const [ busy, setBusy ] = useState( false );
	const [ saved, setSaved ] = useState( false );
	const [ testTo, setTestTo ] = useState( '' );
	const [ test, setTest ] = useState( null );
	const keyRef = useRef( null );
	const testRef = useRef( null );

	const load = ( res ) => {
		setData( res );
		setDraft( res.settings );
		setTestTo( ( t ) => t || res.admin_email || '' );
		onMailChange?.( res );
	};

	useEffect( () => {
		apiFetch( { path: '/axiom-blocks/v1/email-settings' } )
			.then( load )
			.catch( () =>
				showToast?.(
					__( 'Could not load the email settings.', 'axiom-blocks' ),
					'error'
				)
			);
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	const heading = (
		<div className="ab-tab-heading">
			<h2>{ __( 'Email', 'axiom-blocks' ) }</h2>
			<p>
				{ __(
					'Contact Form emails go out through this setting. Every message is saved as an entry first, so nothing is lost if an email fails.',
					'axiom-blocks'
				) }
			</p>
		</div>
	);

	// Until the settings arrive, the heading and the card frames are already
	// on screen; only the parts that depend on saved values shimmer.
	if ( ! data || ! draft ) {
		return (
			<div className="ab-email" aria-busy="true">
				{ heading }
				<div className="ab-status">
					<span className="ab-sk ab-sk--line" />
					<span className="ab-sk ab-sk--line ab-sk--short" />
				</div>
				<div className="ab-settings-card ab-settings-card--rows">
					{ [ 0, 1, 2, 3 ].map( ( i ) => (
						<div
							key={ i }
							className="ab-settings-row ab-settings-row--stack"
						>
							<div className="ab-settings-row__inner">
								<div className="ab-settings-row__text">
									<span className="ab-sk ab-sk--label" />
									<span className="ab-sk ab-sk--line ab-sk--short" />
								</div>
								<div className="ab-settings-row__control">
									<span className="ab-sk ab-sk--control" />
								</div>
							</div>
						</div>
					) ) }
				</div>
				<div className="ab-settings-card">
					<h3 className="ab-card-title">
						{ __( 'Send a test email', 'axiom-blocks' ) }
					</h3>
					<p className="ab-settings-row__desc">
						{ __(
							'Uses the saved settings. Save your changes first.',
							'axiom-blocks'
						) }
					</p>
					<div className="ab-test-row">
						<span className="ab-sk ab-sk--control ab-sk--grow" />
					</div>
				</div>
			</div>
		);
	}

	const set = ( patch ) => {
		setDraft( ( d ) => ( { ...d, ...patch } ) );
		setSaved( false );
	};
	const dirty =
		apiKey !== '' ||
		Object.keys( draft ).some( ( k ) => draft[ k ] !== data.settings[ k ] );

	const save = ( extra = {} ) => {
		setBusy( true );
		const body = { ...draft, ...extra };
		if ( apiKey !== '' ) {
			body.resend_api_key = apiKey;
		}
		return apiFetch( {
			path: '/axiom-blocks/v1/email-settings',
			method: 'POST',
			data: body,
		} )
			.then( ( res ) => {
				load( res );
				setApiKey( '' );
				setSaved( true );
			} )
			.catch( () =>
				showToast?.(
					__( 'Failed to save the email settings.', 'axiom-blocks' ),
					'error'
				)
			)
			.finally( () => setBusy( false ) );
	};

	const refresh = () =>
		apiFetch( { path: '/axiom-blocks/v1/email-settings' } ).then(
			( fresh ) => {
				setData( ( d ) => ( { ...fresh, settings: d.settings } ) );
				onMailChange?.( fresh );
			}
		);

	const sendTest = () => {
		setTest( { busy: true } );
		apiFetch( {
			path: '/axiom-blocks/v1/email/test',
			method: 'POST',
			data: { to: testTo },
		} )
			.then( ( res ) => {
				const errors = ( res.attempts || [] )
					.filter( ( a ) => ! a.ok )
					.map( ( a ) => `${ a.route }: ${ a.error }` );
				setTest( { ok: res.ok, route: res.route, to: res.to, errors } );
				refresh();
			} )
			.catch( ( err ) =>
				setTest( { ok: false, errors: [ err?.message || '' ] } )
			);
	};

	const resend = draft.route === 'resend';
	const key = data.key || {};
	const from = ( draft.from_email || '' ).toLowerCase();
	const fromDomain = from.includes( '@' ) ? from.split( '@' ).pop() : '';
	const fromOff =
		fromDomain !== '' &&
		!! data.site_host &&
		fromDomain !== data.site_host &&
		! data.site_host.endsWith( '.' + fromDomain );

	let keyHelp = __(
		'Create one in your Resend account under API Keys, with sending access.',
		'axiom-blocks'
	);
	let keyIcon = null;
	if ( key.from_constant ) {
		keyHelp = __(
			'Set in wp-config.php (AXIOM_BLOCKS_RESEND_API_KEY), so it cannot be changed here.',
			'axiom-blocks'
		);
		keyIcon = <LockIcon size={ 14 } />;
	} else if ( key.has_key ) {
		keyHelp = sprintf(
			/* translators: %s: last four characters of the key. */
			__(
				'Key ending in %s is saved. Paste a new one to replace it.',
				'axiom-blocks'
			),
			key.last4
		);
		keyIcon = <CheckIcon size={ 14 } className="is-ok" />;
	}

	let saveLabel = __( 'Save email settings', 'axiom-blocks' );
	if ( busy ) {
		saveLabel = __( 'Saving…', 'axiom-blocks' );
	} else if ( saved && ! dirty ) {
		saveLabel = __( 'Saved', 'axiom-blocks' );
	}

	return (
		<div className="ab-email">
			{ heading }

			<StatusCard
				data={ data }
				onFocusKey={ () => keyRef.current?.focus() }
				onFocusTest={ () => testRef.current?.focus() }
			/>

			<div className="ab-settings-card ab-settings-card--rows">
				<Row
					label={ __( 'Send form emails with', 'axiom-blocks' ) }
					htmlFor="ab-mail-route"
					desc={
						resend
							? __(
									'Sent straight to Resend. Only Axiom form emails use this; other site mail is untouched.',
									'axiom-blocks'
							  )
							: __(
									"Uses your site's own mail. If you have an SMTP plugin, it is used automatically. Without one, many hosts do not deliver mail.",
									'axiom-blocks'
							  )
					}
				>
					<select
						id="ab-mail-route"
						className="ab-input ab-select"
						value={ draft.route }
						onChange={ ( e ) => set( { route: e.target.value } ) }
					>
						<option value="wordpress">
							{ __( 'WordPress mail', 'axiom-blocks' ) }
						</option>
						<option value="resend">Resend</option>
					</select>
				</Row>

				{ resend && (
					<>
						<Row
							label={ __( 'Resend API key', 'axiom-blocks' ) }
							htmlFor="ab-mail-key"
							desc={
								<span className="ab-settings-row__icon-text">
									{ keyIcon }
									<span>{ keyHelp }</span>
								</span>
							}
						>
							<div className="ab-inline">
								<input
									id="ab-mail-key"
									ref={ keyRef }
									type="password"
									className="ab-input ab-input--mono"
									autoComplete="off"
									placeholder={
										key.has_key
											? `re_••••••••••••${ key.last4 }`
											: 're_…'
									}
									value={ apiKey }
									disabled={ key.from_constant }
									onChange={ ( e ) => {
										setApiKey( e.target.value );
										setSaved( false );
									} }
								/>
								{ key.has_key && ! key.from_constant && (
									<button
										type="button"
										className="ab-btn-ghost ab-btn-ghost--lg ab-focus"
										disabled={ busy }
										onClick={ () =>
											save( { resend_api_key: '' } )
										}
									>
										{ __( 'Remove', 'axiom-blocks' ) }
									</button>
								) }
							</div>
						</Row>
						<Row
							label={ __(
								'Fall back to WordPress mail',
								'axiom-blocks'
							) }
							desc={ __(
								"If Resend refuses or cannot be reached, try your site's mail instead.",
								'axiom-blocks'
							) }
						>
							<Toggle
								on={ !! draft.fallback }
								label={ __(
									'Fall back to WordPress mail',
									'axiom-blocks'
								) }
								onChange={ () =>
									set( { fallback: ! draft.fallback } )
								}
							/>
						</Row>
					</>
				) }

				<Row
					label={ __( 'From address', 'axiom-blocks' ) }
					htmlFor="ab-mail-from"
					desc={
						resend
							? __(
									'Its domain must be verified in your Resend account.',
									'axiom-blocks'
							  )
							: __(
									"Use an address on your own domain. Visitors' addresses go in Reply-To, never From.",
									'axiom-blocks'
							  )
					}
					after={
						fromOff && (
							<Msg
								tone="warn"
								icon={ <AlertIcon size={ 15 } /> }
								className="ab-msg--compact"
							>
								{ __(
									"This address is not on your site's domain, so receiving servers may reject the mail or mark it as spam.",
									'axiom-blocks'
								) }
							</Msg>
						)
					}
				>
					<input
						id="ab-mail-from"
						type="email"
						className={ `ab-input${ fromOff ? ' is-warn' : '' }` }
						aria-invalid={ fromOff || undefined }
						placeholder={ data.from_effective }
						value={ draft.from_email }
						onChange={ ( e ) =>
							set( { from_email: e.target.value } )
						}
					/>
				</Row>
				<Row
					label={ __( 'From name', 'axiom-blocks' ) }
					htmlFor="ab-mail-name"
				>
					<input
						id="ab-mail-name"
						type="text"
						className="ab-input"
						placeholder={ __( 'Site title', 'axiom-blocks' ) }
						value={ draft.from_name }
						onChange={ ( e ) =>
							set( { from_name: e.target.value } )
						}
					/>
				</Row>
				<Row
					label={ __( 'Save form entries', 'axiom-blocks' ) }
					desc={ __(
						'Keeps every submission under Form entries before the email is sent.',
						'axiom-blocks'
					) }
				>
					<Toggle
						on={ !! draft.save_entries }
						label={ __( 'Save form entries', 'axiom-blocks' ) }
						onChange={ () =>
							set( { save_entries: ! draft.save_entries } )
						}
					/>
				</Row>
				<Row
					label={ __( 'Delete entries after', 'axiom-blocks' ) }
					htmlFor="ab-mail-days"
					desc={ __(
						'Days. 0 keeps them until you delete them.',
						'axiom-blocks'
					) }
				>
					<div className="ab-inline">
						<input
							id="ab-mail-days"
							type="number"
							min="0"
							className="ab-input ab-input--days"
							value={ draft.retention_days }
							onChange={ ( e ) =>
								set( {
									retention_days: Math.max(
										0,
										Number( e.target.value ) || 0
									),
								} )
							}
						/>
						<span className="ab-muted">
							{ __( 'days', 'axiom-blocks' ) }
						</span>
					</div>
				</Row>

				<div className="ab-settings-actions">
					<button
						type="button"
						className={ `ab-btn-primary ab-focus${
							saved && ! dirty ? ' is-saved' : ''
						}` }
						onClick={ () => save() }
						disabled={ busy || ! dirty }
						aria-live="polite"
					>
						{ busy && (
							<span className="ab-spinner" aria-hidden="true" />
						) }
						{ saved && ! dirty && ! busy && (
							<TickIcon size={ 14 } strokeWidth={ 2.5 } />
						) }
						{ saveLabel }
					</button>
				</div>
			</div>

			<div className="ab-settings-card">
				<h3 className="ab-card-title">
					{ __( 'Send a test email', 'axiom-blocks' ) }
				</h3>
				<p className="ab-settings-row__desc">
					{ __(
						'Uses the saved settings. Save your changes first.',
						'axiom-blocks'
					) }
				</p>
				<div className="ab-test-row">
					<label
						htmlFor="ab-mail-test"
						className="screen-reader-text"
					>
						{ __( 'Send to', 'axiom-blocks' ) }
					</label>
					<div className="ab-input-icon">
						<MailIcon size={ 14 } />
						<input
							id="ab-mail-test"
							ref={ testRef }
							type="email"
							className="ab-input"
							value={ testTo }
							onChange={ ( e ) => setTestTo( e.target.value ) }
						/>
					</div>
					<button
						type="button"
						className="ab-btn-primary ab-focus"
						disabled={ test?.busy || dirty }
						onClick={ sendTest }
					>
						{ test?.busy && (
							<span className="ab-spinner" aria-hidden="true" />
						) }
						{ test?.busy
							? __( 'Sending…', 'axiom-blocks' )
							: __( 'Send test', 'axiom-blocks' ) }
					</button>
				</div>
				{ test && ! test.busy && test.ok && (
					<Msg tone="ok" icon={ <CheckIcon size={ 16 } /> }>
						{ sprintf(
							/* translators: 1: address, 2: route name. */
							__(
								'Sent to %1$s through %2$s. Check the inbox and the spam folder.',
								'axiom-blocks'
							),
							test.to,
							routeName( test.route )
						) }
					</Msg>
				) }
				{ test && ! test.busy && ! test.ok && (
					<Msg tone="err" icon={ <XCircleIcon size={ 16 } /> }>
						<strong>{ __( 'Not sent.', 'axiom-blocks' ) }</strong>{ ' ' }
						<span className="ab-mono">
							{ ( test.errors || [] ).join( ' ' ) }
						</span>
					</Msg>
				) }
			</div>
		</div>
	);
}
