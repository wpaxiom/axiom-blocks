import { useState, useEffect, useRef } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { CheckIcon, KeyIcon, Toggle } from './ui';

const proActive = !! window.axiomBlocksData?.proActive;

const DEFAULT_SETTINGS = {
	woocommerce_integration: true,
	conditional_assets: true,
};

const formatExpiry = ( timestamp ) => {
	if ( ! timestamp ) return '';
	return new Date( timestamp * 1000 ).toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );
};

export function SettingsTab( {
	license,
	licenseLoading,
	onLicenseChange,
	settings,
	onSettingsChange,
	showToast,
} ) {
	const [ licenseKey, setLicenseKey ] = useState( license?.key || '' );
	const [ licenseBusy, setLicenseBusy ] = useState( false );
	const [ licenseError, setLicenseError ] = useState( '' );
	const [ draftSettings, setDraftSettings ] = useState( settings );
	const [ settingsBusy, setSettingsBusy ] = useState( false );
	const [ saveStatus, setSaveStatus ] = useState( 'idle' );
	const savedTimerRef = useRef( null );

	useEffect(
		() => () => {
			if ( savedTimerRef.current ) clearTimeout( savedTimerRef.current );
		},
		[]
	);

	// Keep input in sync when the parent fetch resolves or after activation.
	useEffect( () => {
		setLicenseKey( license?.key || '' );
	}, [ license?.key ] );

	useEffect( () => {
		setDraftSettings( settings );
	}, [ settings ] );

	const settingsDirty =
		draftSettings.woocommerce_integration !==
			settings.woocommerce_integration ||
		draftSettings.conditional_assets !== settings.conditional_assets;

	const draftAtDefaults =
		draftSettings.woocommerce_integration ===
			DEFAULT_SETTINGS.woocommerce_integration &&
		draftSettings.conditional_assets ===
			DEFAULT_SETTINGS.conditional_assets;

	const updateDraft = ( updater ) => {
		setDraftSettings( updater );
		if ( savedTimerRef.current ) {
			clearTimeout( savedTimerRef.current );
			savedTimerRef.current = null;
		}
		setSaveStatus( 'idle' );
	};

	const saveSettings = async () => {
		if ( savedTimerRef.current ) clearTimeout( savedTimerRef.current );
		setSettingsBusy( true );
		setSaveStatus( 'saving' );
		try {
			const res = await apiFetch( {
				path: '/axiom-blocks/v1/settings',
				method: 'POST',
				data: draftSettings,
			} );
			onSettingsChange( res );
			setSaveStatus( 'saved' );
			savedTimerRef.current = setTimeout(
				() => setSaveStatus( 'idle' ),
				2000
			);
		} catch {
			setSaveStatus( 'idle' );
			showToast?.(
				__( 'Failed to save settings.', 'axiom-blocks' ),
				'error'
			);
		} finally {
			setSettingsBusy( false );
		}
	};

	const resetSettings = async () => {
		if ( savedTimerRef.current ) clearTimeout( savedTimerRef.current );
		setSettingsBusy( true );
		setSaveStatus( 'idle' );
		try {
			const res = await apiFetch( {
				path: '/axiom-blocks/v1/settings',
				method: 'DELETE',
			} );
			onSettingsChange( res );
			showToast?.( __( 'Settings reset to defaults.', 'axiom-blocks' ) );
		} catch {
			showToast?.(
				__( 'Failed to reset settings.', 'axiom-blocks' ),
				'error'
			);
		} finally {
			setSettingsBusy( false );
		}
	};

	const renderSaveLabel = () => {
		if ( saveStatus === 'saving' ) {
			return (
				<>
					<span className="ab-spinner" aria-hidden="true" />
					{ __( 'Saving…', 'axiom-blocks' ) }
				</>
			);
		}
		if ( saveStatus === 'saved' ) {
			return (
				<>
					<CheckIcon size={ 14 } />
					{ __( 'Saved', 'axiom-blocks' ) }
				</>
			);
		}
		return __( 'Save Settings', 'axiom-blocks' );
	};

	const isActive = license?.status === 'active';
	const expiryLabel = formatExpiry( license?.expires_at );

	const activate = async () => {
		setLicenseBusy( true );
		setLicenseError( '' );
		try {
			const res = await apiFetch( {
				path: '/axiom-blocks/v1/license',
				method: 'POST',
				data: { key: licenseKey },
			} );
			onLicenseChange( res );
			if ( res?.status !== 'active' ) {
				setLicenseError(
					res?.message ||
						__(
							'Invalid license key — please check the key and try again.',
							'axiom-blocks'
						)
				);
			}
		} catch ( err ) {
			setLicenseError(
				err?.message ||
					__(
						'Could not reach the license server. Try again in a moment.',
						'axiom-blocks'
					)
			);
		} finally {
			setLicenseBusy( false );
		}
	};

	const deactivate = async () => {
		setLicenseBusy( true );
		setLicenseError( '' );
		try {
			const res = await apiFetch( {
				path: '/axiom-blocks/v1/license',
				method: 'DELETE',
			} );
			setLicenseKey( '' );
			onLicenseChange( res );
		} catch ( err ) {
			setLicenseError(
				err?.message ||
					__( 'Failed to deactivate license.', 'axiom-blocks' )
			);
		} finally {
			setLicenseBusy( false );
		}
	};

	const Row = ( { label, desc, children } ) => (
		<div className="ab-settings-row">
			<div>
				<div className="ab-settings-row__label">{ label }</div>
				{ desc && (
					<div className="ab-settings-row__desc">{ desc }</div>
				) }
			</div>
			{ children }
		</div>
	);

	const noticeMode = licenseError
		? 'error'
		: isActive
		? 'active'
		: 'inactive';
	const accentColor =
		noticeMode === 'active'
			? '#065f46'
			: noticeMode === 'error'
			? '#b91c1c'
			: '#b45309';

	return (
		<div className="ab-settings">
			{ /* License card — only when the Pro plugin is installed */ }
			{ proActive && (
				<div className="ab-settings-card">
					<div className="ab-settings-card__heading">
						<span style={ { color: accentColor } }>
							<KeyIcon size={ 15 } />
						</span>
						<span>{ __( 'Pro License', 'axiom-blocks' ) }</span>
					</div>

					{ licenseLoading ? (
						<div className="ab-license-checking">
							<span className="ab-spinner" aria-hidden="true" />
							<span>
								{ __( 'Checking license…', 'axiom-blocks' ) }
							</span>
						</div>
					) : (
						<>
							<div className="ab-license-input-row">
								<input
									type="text"
									className="ab-input ab-input--mono"
									placeholder={ __(
										'Enter license key…',
										'axiom-blocks'
									) }
									value={ licenseKey }
									onChange={ ( e ) => {
										setLicenseKey( e.target.value );
										if ( licenseError )
											setLicenseError( '' );
									} }
									disabled={ licenseBusy || isActive }
								/>
								{ isActive ? (
									<button
										className="ab-btn-ghost"
										onClick={ deactivate }
										disabled={ licenseBusy }
									>
										{ licenseBusy && (
											<span
												className="ab-spinner"
												aria-hidden="true"
											/>
										) }
										{ licenseBusy
											? __(
													'Deactivating…',
													'axiom-blocks'
											  )
											: __(
													'Deactivate',
													'axiom-blocks'
											  ) }
									</button>
								) : (
									<button
										className="ab-btn-primary"
										onClick={ activate }
										disabled={
											licenseBusy || ! licenseKey.trim()
										}
									>
										{ licenseBusy && (
											<span
												className="ab-spinner"
												aria-hidden="true"
											/>
										) }
										{ licenseBusy
											? __(
													'Activating…',
													'axiom-blocks'
											  )
											: __( 'Activate', 'axiom-blocks' ) }
									</button>
								) }
							</div>
							<div
								className={ `ab-license-notice ab-license-notice--${ noticeMode }` }
								role={
									noticeMode === 'error' ? 'alert' : undefined
								}
							>
								<KeyIcon
									size={ 12 }
									style={ {
										color: accentColor,
										flexShrink: 0,
									} }
								/>
								<span>
									{ noticeMode === 'error'
										? licenseError
										: noticeMode === 'active'
										? sprintf(
												/* translators: %s: human-readable expiry date */
												__(
													'License active — valid until %s.',
													'axiom-blocks'
												),
												expiryLabel ||
													__(
														'further notice',
														'axiom-blocks'
													)
										  )
										: __(
												'No license activated — Pro blocks are currently locked.',
												'axiom-blocks'
										  ) }
								</span>
							</div>
						</>
					) }
				</div>
			) }

			{ /* General settings */ }
			<div className="ab-settings-card">
				<Row
					label={ __( 'WooCommerce Integration', 'axiom-blocks' ) }
					desc={ __(
						'Enable WooCommerce-specific blocks when WC is active.',
						'axiom-blocks'
					) }
				>
					<Toggle
						on={ draftSettings.woocommerce_integration }
						onChange={ () =>
							updateDraft( ( d ) => ( {
								...d,
								woocommerce_integration:
									! d.woocommerce_integration,
							} ) )
						}
					/>
				</Row>
				<Row
					label={ __( 'Load Assets Conditionally', 'axiom-blocks' ) }
					desc={ __(
						'Only enqueue the Axiom Blocks stylesheet on pages that contain a Axiom Blocks block.',
						'axiom-blocks'
					) }
				>
					<Toggle
						on={ draftSettings.conditional_assets }
						onChange={ () =>
							updateDraft( ( d ) => ( {
								...d,
								conditional_assets: ! d.conditional_assets,
							} ) )
						}
					/>
				</Row>
				<div className="ab-settings-actions">
					<button
						className="ab-btn-primary"
						onClick={ saveSettings }
						disabled={ settingsBusy || ! settingsDirty }
					>
						{ renderSaveLabel() }
					</button>
					<button
						className="ab-btn-ghost ab-btn-ghost--lg"
						onClick={ resetSettings }
						disabled={ settingsBusy || draftAtDefaults }
					>
						{ __( 'Reset Defaults', 'axiom-blocks' ) }
					</button>
				</div>
			</div>
		</div>
	);
}
