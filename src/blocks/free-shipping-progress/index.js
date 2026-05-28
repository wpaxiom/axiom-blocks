import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	BSSelectControl,
	BSColorControl,
	BSToggleControl,
	BSTextControl,
	BSTextareaControl,
	BSRangeControl,
} from '../BSControls';
import { SpacingPanel, getSpacingStyle } from '../SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const PREVIEW_PERCENT = 55;

function FreeShippingProgressEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'free-shipping-progress' ) ) {
		return <DisabledBlockMessage blockName="Free Shipping Progress" />;
	}
	const {
		thresholdMode,
		customThreshold,
		messageBefore,
		messageQualified,
		barColor,
		barBackground,
		qualifiedColor,
		barHeight,
		borderRadius,
		textAlign,
		hideWhenQualified,
		hideWhenEmpty,
	} = attributes;

	const blockProps = useBlockProps( {
		className: `axiom-blocks-fsp-preview is-align-${ textAlign }`,
		style: getSpacingStyle( attributes ),
	} );

	const modeLabel =
		thresholdMode === 'auto'
			? __( 'auto', 'axiom-blocks' )
			: `${ customThreshold || 0 }`;

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Threshold', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<div className="ab-fsp-detected">
						{ thresholdMode === 'auto' ? (
							<>
								{ __( 'Reads the smallest', 'axiom-blocks' ) }{ ' ' }
								<code>min_amount</code>{ ' ' }
								{ __( 'from any active', 'axiom-blocks' ) }{ ' ' }
								<strong>
									{ __( 'Free shipping', 'axiom-blocks' ) }
								</strong>{ ' ' }
								{ __( 'shipping method.', 'axiom-blocks' ) }
							</>
						) : (
							__(
								'Using the custom threshold below — ignores shipping zones.',
								'axiom-blocks'
							)
						) }
					</div>
					<BSSelectControl
						label={ __( 'Detection mode', 'axiom-blocks' ) }
						value={ thresholdMode }
						options={ [
							{
								label: __(
									'Auto (from WooCommerce shipping zones)',
									'axiom-blocks'
								),
								value: 'auto',
							},
							{
								label: __( 'Custom amount', 'axiom-blocks' ),
								value: 'custom',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { thresholdMode: v } )
						}
					/>
					{ thresholdMode === 'custom' && (
						<BSTextControl
							label={ __( 'Custom threshold', 'axiom-blocks' ) }
							type="number"
							value={ customThreshold }
							onChange={ ( v ) =>
								setAttributes( {
									customThreshold: parseFloat( v ) || 0,
								} )
							}
							placeholder="75"
							help={ __(
								'Cart subtotal (excl. tax) needed to qualify.',
								'axiom-blocks'
							) }
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Messages', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSTextareaControl
						label={ __( 'Before qualifying', 'axiom-blocks' ) }
						value={ messageBefore }
						onChange={ ( v ) =>
							setAttributes( { messageBefore: v } )
						}
						rows={ 2 }
						help={ __(
							'Use {amount_left} for the remaining amount.',
							'axiom-blocks'
						) }
					/>
					<BSTextareaControl
						label={ __( 'After qualifying', 'axiom-blocks' ) }
						value={ messageQualified }
						onChange={ ( v ) =>
							setAttributes( { messageQualified: v } )
						}
						rows={ 2 }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSSelectControl
						label={ __( 'Text alignment', 'axiom-blocks' ) }
						value={ textAlign }
						options={ [
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Center', 'axiom-blocks' ),
								value: 'center',
							},
							{
								label: __( 'Right', 'axiom-blocks' ),
								value: 'right',
							},
						] }
						onChange={ ( v ) => setAttributes( { textAlign: v } ) }
					/>
					<BSRangeControl
						label={ __( 'Bar height', 'axiom-blocks' ) }
						value={ barHeight }
						min={ 2 }
						max={ 32 }
						step={ 1 }
						unit=""
						onChange={ ( v ) => setAttributes( { barHeight: v } ) }
					/>
					<BSRangeControl
						label={ __( 'Corner radius', 'axiom-blocks' ) }
						value={ borderRadius }
						min={ 0 }
						max={ 999 }
						step={ 1 }
						unit="px"
						onChange={ ( v ) =>
							setAttributes( { borderRadius: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Colors', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSColorControl
						label={ __( 'Progress fill', 'axiom-blocks' ) }
						color={ barColor }
						onChange={ ( c ) => setAttributes( { barColor: c } ) }
					/>
					<BSColorControl
						label={ __( 'Track', 'axiom-blocks' ) }
						color={ barBackground }
						onChange={ ( c ) =>
							setAttributes( { barBackground: c } )
						}
					/>
					<BSColorControl
						label={ __( 'Qualified fill', 'axiom-blocks' ) }
						color={ qualifiedColor }
						onChange={ ( c ) =>
							setAttributes( { qualifiedColor: c } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Visibility', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<BSToggleControl
						label={ __(
							'Hide when cart is empty',
							'axiom-blocks'
						) }
						checked={ hideWhenEmpty }
						onChange={ ( v ) =>
							setAttributes( { hideWhenEmpty: v } )
						}
					/>
					<BSToggleControl
						label={ __(
							'Hide once free shipping is unlocked',
							'axiom-blocks'
						) }
						checked={ hideWhenQualified }
						onChange={ ( v ) =>
							setAttributes( { hideWhenQualified: v } )
						}
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="axiom-blocks-fsp-preview__label">
					{ __( 'Free Shipping Progress', 'axiom-blocks' ) }
					<span className="axiom-blocks-fsp-preview__mode">
						{ modeLabel }
					</span>
				</div>
				<div
					className="axiom-blocks-fsp-preview__bar"
					style={ {
						background: barBackground,
						height: barHeight,
						borderRadius: `${ borderRadius }px`,
					} }
				>
					<div
						className="axiom-blocks-fsp-preview__fill"
						style={ {
							background: barColor,
							width: `${ PREVIEW_PERCENT }%`,
						} }
					/>
				</div>
				<p className="axiom-blocks-fsp-preview__hint">
					{ __(
						'Preview only. On the frontend the bar reads the live cart subtotal and updates when items are added or removed.',
						'axiom-blocks'
					) }
				</p>
			</div>
		</>
	);
}

export const FreeShippingProgress = {
	name: 'axiom-blocks/free-shipping-progress',
	settings: {
		title: __( 'Free Shipping Progress', 'axiom-blocks' ),
		description: __(
			'Cart progress bar showing how much more a customer needs to spend to qualify for free shipping.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="free-shipping-progress" />,
		edit: FreeShippingProgressEdit,
		save: () => null,
	},
};
