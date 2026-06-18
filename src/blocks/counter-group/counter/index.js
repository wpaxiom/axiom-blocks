import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody, Dropdown } from '@wordpress/components';
import {
	ABTextControl,
	ABRangeControl,
} from '../../../components/ABControls';
import { IconPicker } from '../../../components/IconPicker';
import { ICON_LIBRARY } from '../../../components/iconLibrary';
import { BlockIcon } from '../../../blockIcons';

function formatNumber( value, decimals, thousandsSep, decimalSep ) {
	const num = parseFloat( value ) || 0;
	const d = Math.max( 0, parseInt( decimals, 10 ) || 0 );
	const parts = num.toFixed( d ).split( '.' );
	if ( thousandsSep ) {
		parts[ 0 ] = parts[ 0 ].replace(
			/\B(?=(\d{3})+(?!\d))/g,
			thousandsSep
		);
	}
	return parts.length > 1 ? parts[ 0 ] + decimalSep + parts[ 1 ] : parts[ 0 ];
}

function CounterEdit( { attributes, setAttributes, context } ) {
	const { startValue, endValue, decimals, prefix, suffix, label, iconSlug } =
		attributes;
	const separator = context[ 'axiom-blocks/counterSeparator' ] !== false;
	const thousandsSep = separator
		? context[ 'axiom-blocks/counterThousandsSep' ] || ','
		: '';
	const decimalSep = context[ 'axiom-blocks/counterDecimalSep' ] || '.';

	const blockProps = useBlockProps( { className: 'ab-counter' } );

	const display =
		( prefix || '' ) +
		formatNumber( endValue, decimals, thousandsSep, decimalSep ) +
		( suffix || '' );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Value', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABTextControl
						label={ __( 'Start value', 'axiom-blocks' ) }
						type="number"
						value={ startValue }
						onChange={ ( v ) =>
							setAttributes( { startValue: v } )
						}
					/>
					<ABTextControl
						label={ __( 'End value', 'axiom-blocks' ) }
						type="number"
						value={ endValue }
						onChange={ ( v ) => setAttributes( { endValue: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Decimal places', 'axiom-blocks' ) }
						value={ parseInt( decimals, 10 ) || 0 }
						onChange={ ( v ) =>
							setAttributes( { decimals: String( v ?? 0 ) } )
						}
						min={ 0 }
						max={ 4 }
						step={ 1 }
						unit=""
					/>
					<ABTextControl
						label={ __( 'Prefix', 'axiom-blocks' ) }
						value={ prefix }
						placeholder="$"
						onChange={ ( v ) => setAttributes( { prefix: v } ) }
					/>
					<ABTextControl
						label={ __( 'Suffix', 'axiom-blocks' ) }
						value={ suffix }
						placeholder="+"
						onChange={ ( v ) => setAttributes( { suffix: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-counter-icon-field">
						<span className="ab-counter-icon-field__label">
							{ __( 'Icon', 'axiom-blocks' ) }
						</span>
						<Dropdown
							className="ab-counter-icon-field__pick"
							popoverProps={ { placement: 'bottom-start' } }
							renderToggle={ ( { isOpen, onToggle } ) => (
								<button
									type="button"
									className="ab-counter-icon-field__btn"
									onClick={ onToggle }
									aria-expanded={ isOpen }
									aria-label={ __(
										'Choose icon',
										'axiom-blocks'
									) }
								>
									{ iconSlug && ICON_LIBRARY[ iconSlug ] ? (
										ICON_LIBRARY[ iconSlug ]
									) : (
										<span className="ab-counter-icon-field__none">
											{ __( 'None', 'axiom-blocks' ) }
										</span>
									) }
								</button>
							) }
							renderContent={ () => (
								<div className="ab-counter-icon-pop">
									<IconPicker
										value={ iconSlug }
										onChange={ ( v ) =>
											setAttributes( { iconSlug: v } )
										}
									/>
								</div>
							) }
						/>
					</div>
					{ iconSlug && (
						<div className="ab-btn-row">
							<button
								type="button"
								className="ab-btn ab-btn--danger"
								onClick={ () =>
									setAttributes( { iconSlug: '' } )
								}
							>
								{ __( 'Remove icon', 'axiom-blocks' ) }
							</button>
						</div>
					) }
					<div className="ab-ctrl ab-block-note">
						<p className="ab-ctrl__help">
							{ __(
								'Icon size and colour, number/label styling, layout and animation are set on the parent Counter block.',
								'axiom-blocks'
							) }
						</p>
					</div>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				{ iconSlug && ICON_LIBRARY[ iconSlug ] && (
					<span
						className="ab-counter__icon"
						aria-hidden="true"
						contentEditable={ false }
					>
						{ ICON_LIBRARY[ iconSlug ] }
					</span>
				) }
				<span className="ab-counter__number" contentEditable={ false }>
					{ display }
				</span>
				<RichText
					tagName="div"
					className="ab-counter__label"
					value={ label }
					onChange={ ( v ) => setAttributes( { label: v } ) }
					placeholder={ __( 'Add a label…', 'axiom-blocks' ) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
				/>
			</div>
		</>
	);
}

export const Counter = {
	name: 'axiom-blocks/counter',
	settings: {
		title: __( 'Counter Item', 'axiom-blocks' ),
		description: __(
			'A single animated statistic inside the Counter block.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="counter" />,
		edit: CounterEdit,
		save: () => null,
	},
};
