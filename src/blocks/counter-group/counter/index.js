import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABRangeControl,
} from '../../../components/ABControls';
import { IconControl } from '../../../components/IconControl';
import { useIconNode } from '../../../components/useCustomIcons';
import { BlockIcon } from '../../../blockIcons';
import { nullSaveDeprecation } from '../../../components/deprecations';
import metadata from './block.json';

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
	const resolveIcon = useIconNode();
	const iconNode = resolveIcon( iconSlug );
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
					<IconControl
						value={ iconSlug }
						onChange={ ( v ) =>
							setAttributes( { iconSlug: v } )
						}
						clearable
					/>
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
				{ iconSlug && iconNode && (
					<span
						className="ab-counter__icon"
						aria-hidden="true"
						contentEditable={ false }
					>
						{ iconNode }
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
		save: ( { attributes } ) => {
			const { endValue, prefix, suffix, label } = attributes;
			const blockProps = useBlockProps.save( { className: 'ab-counter' } );
			return (
				<div { ...blockProps }>
					<span className="ab-counter__number">{ prefix }{ endValue }{ suffix }</span>
					{ label && (
						<RichText.Content tagName="div" className="ab-counter__label" value={ label } />
					) }
				</div>
			);
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
