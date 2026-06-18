import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABSubAccordion,
} from '../../components/ABControls';
import {
	SpacingPanel,
	SpacingControl,
	getSpacingStyle,
} from '../../components/SpacingPanel';
import { TypographyPanel } from '../../components/TypographyPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/counter' ];
const TEMPLATE = [
	[
		'axiom-blocks/counter',
		{ endValue: '250', suffix: '+', label: 'Happy clients', iconSlug: 'heart' },
	],
	[
		'axiom-blocks/counter',
		{ endValue: '99', suffix: '%', label: 'Satisfaction', iconSlug: 'star' },
	],
	[
		'axiom-blocks/counter',
		{ endValue: '12', label: 'Years in business', iconSlug: 'award' },
	],
];

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

export function getCounterGroupVars( attributes ) {
	const {
		columns,
		gap,
		dividerColor,
		numberColor,
		numberFontFamily,
		numberFontWeight,
		numberFontSize,
		numberLineHeight,
		numberLetterSpacing,
		numberTextTransform,
		numberTextDecoration,
		numberTextAlign,
		labelColor,
		labelFontFamily,
		labelFontWeight,
		labelFontSize,
		labelLineHeight,
		labelLetterSpacing,
		labelTextTransform,
		labelTextDecoration,
		labelTextAlign,
		iconColor,
		iconSize,
		numberHoverColor,
		labelHoverColor,
		iconHoverColor,
		cardBackground,
		cardBorderColor,
		cardBorderWidth,
		cardBorderRadius,
		cardPaddingTop,
		cardPaddingRight,
		cardPaddingBottom,
		cardPaddingLeft,
	} = attributes;
	return {
		'--ab-counter-cols': columns || undefined,
		'--ab-counter-gap': gap || undefined,
		'--ab-counter-divider': dividerColor || undefined,
		'--ab-counter-num-color': numberColor || undefined,
		'--ab-counter-num-ff': numberFontFamily || undefined,
		'--ab-counter-num-fw': numberFontWeight || undefined,
		'--ab-counter-num-fs': numberFontSize || undefined,
		'--ab-counter-num-lh': numberLineHeight || undefined,
		'--ab-counter-num-ls': numberLetterSpacing || undefined,
		'--ab-counter-num-tt': numberTextTransform || undefined,
		'--ab-counter-num-td': numberTextDecoration || undefined,
		'--ab-counter-num-ta': numberTextAlign || undefined,
		'--ab-counter-label-color': labelColor || undefined,
		'--ab-counter-label-ff': labelFontFamily || undefined,
		'--ab-counter-label-fw': labelFontWeight || undefined,
		'--ab-counter-label-fs': labelFontSize || undefined,
		'--ab-counter-label-lh': labelLineHeight || undefined,
		'--ab-counter-label-ls': labelLetterSpacing || undefined,
		'--ab-counter-label-tt': labelTextTransform || undefined,
		'--ab-counter-label-td': labelTextDecoration || undefined,
		'--ab-counter-label-ta': labelTextAlign || undefined,
		'--ab-counter-icon-color': iconColor || undefined,
		'--ab-counter-icon-size': iconSize || undefined,
		'--ab-counter-num-hover': numberHoverColor || undefined,
		'--ab-counter-label-hover': labelHoverColor || undefined,
		'--ab-counter-icon-hover': iconHoverColor || undefined,
		'--ab-counter-card-bg': cardBackground || undefined,
		'--ab-counter-card-bd-color': cardBorderColor || undefined,
		'--ab-counter-card-bd-width': cardBorderWidth || undefined,
		'--ab-counter-card-radius': cardBorderRadius || undefined,
		'--ab-counter-card-pt': cardPaddingTop || undefined,
		'--ab-counter-card-pr': cardPaddingRight || undefined,
		'--ab-counter-card-pb': cardPaddingBottom || undefined,
		'--ab-counter-card-pl': cardPaddingLeft || undefined,
	};
}

export function getCounterGroupClasses( attributes ) {
	const { iconPosition, labelPosition, stackOnMobile, showDivider, cardShadow } =
		attributes;
	return [
		'ab-counter-group',
		`ab-counter-group--icon-${ iconPosition || 'top' }`,
		`ab-counter-group--label-${ labelPosition || 'below' }`,
		stackOnMobile ? 'is-stack-mobile' : '',
		showDivider ? 'has-divider' : '',
		cardShadow ? `ab-counter-group--shadow-${ cardShadow }` : '',
	].filter( Boolean );
}

function CounterGroupEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'counter-group' ) ) {
		return <DisabledBlockMessage blockName="Counter" />;
	}

	const {
		columns,
		gap,
		stackOnMobile,
		showDivider,
		dividerColor,
		duration,
		thousandsSeparator,
		thousandsSeparatorChar,
		decimalSeparatorChar,
		easing,
		iconPosition,
		iconColor,
		iconHoverColor,
		iconSize,
		numberColor,
		numberHoverColor,
		labelPosition,
		labelColor,
		labelHoverColor,
		cardBackground,
		cardBorderColor,
		cardBorderWidth,
		cardBorderRadius,
		cardShadow,
	} = attributes;

	const blockProps = useBlockProps( {
		className: getCounterGroupClasses( attributes ).join( ' ' ),
		style: {
			...getCounterGroupVars( attributes ),
			...getSpacingStyle( attributes ),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'horizontal',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABRangeControl
						label={ __( 'Columns', 'axiom-blocks' ) }
						value={ columns ?? 3 }
						onChange={ ( v ) =>
							setAttributes( { columns: v ?? 1 } )
						}
						min={ 1 }
						max={ 6 }
						step={ 1 }
						unit=""
					/>
					<ABRangeControl
						label={ __( 'Gap', 'axiom-blocks' ) }
						value={ fromPx( gap, 24 ) }
						onChange={ ( v ) => setAttributes( { gap: toPx( v ) } ) }
						min={ 0 }
						max={ 80 }
						step={ 1 }
						unit="px"
					/>
					<ABToggleControl
						label={ __( 'Stack on mobile', 'axiom-blocks' ) }
						checked={ !! stackOnMobile }
						onChange={ ( v ) =>
							setAttributes( { stackOnMobile: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Dividers between stats', 'axiom-blocks' ) }
						checked={ !! showDivider }
						onChange={ ( v ) => setAttributes( { showDivider: v } ) }
					/>
					{ showDivider && (
						<ABColorControl
							label={ __( 'Divider colour', 'axiom-blocks' ) }
							color={ dividerColor }
							onChange={ ( v ) =>
								setAttributes( { dividerColor: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Animation', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABRangeControl
						label={ __( 'Duration', 'axiom-blocks' ) }
						value={ duration ?? 2000 }
						onChange={ ( v ) =>
							setAttributes( { duration: v ?? 0 } )
						}
						min={ 0 }
						max={ 6000 }
						step={ 100 }
						unit="ms"
					/>
					<ABSelectControl
						label={ __( 'Easing', 'axiom-blocks' ) }
						value={ easing || 'ease-out' }
						options={ [
							{
								label: __( 'Ease out', 'axiom-blocks' ),
								value: 'ease-out',
							},
							{
								label: __( 'Ease', 'axiom-blocks' ),
								value: 'ease',
							},
							{
								label: __( 'Linear', 'axiom-blocks' ),
								value: 'linear',
							},
							{
								label: __( 'Ease in-out', 'axiom-blocks' ),
								value: 'ease-in-out',
							},
						] }
						onChange={ ( v ) => setAttributes( { easing: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Thousands separator', 'axiom-blocks' ) }
						help={ __(
							'Group digits, e.g. 1,250.',
							'axiom-blocks'
						) }
						checked={ !! thousandsSeparator }
						onChange={ ( v ) =>
							setAttributes( { thousandsSeparator: v } )
						}
					/>
					{ thousandsSeparator && (
						<ABSelectControl
							label={ __( 'Group separator', 'axiom-blocks' ) }
							value={ thousandsSeparatorChar || ',' }
							options={ [
								{
									label: __( 'Comma (1,250)', 'axiom-blocks' ),
									value: ',',
								},
								{
									label: __( 'Period (1.250)', 'axiom-blocks' ),
									value: '.',
								},
								{
									label: __( 'Space (1 250)', 'axiom-blocks' ),
									value: ' ',
								},
								{
									label: __(
										'Apostrophe (1’250)',
										'axiom-blocks'
									),
									value: '’',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { thousandsSeparatorChar: v } )
							}
						/>
					) }
					<ABSelectControl
						label={ __( 'Decimal separator', 'axiom-blocks' ) }
						value={ decimalSeparatorChar || '.' }
						options={ [
							{
								label: __( 'Period (1.5)', 'axiom-blocks' ),
								value: '.',
							},
							{
								label: __( 'Comma (1,5)', 'axiom-blocks' ),
								value: ',',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { decimalSeparatorChar: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Position', 'axiom-blocks' ) }
						value={ iconPosition || 'top' }
						options={ [
							{
								label: __( 'Top', 'axiom-blocks' ),
								value: 'top',
							},
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { iconPosition: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Size', 'axiom-blocks' ) }
						value={ fromPx( iconSize, 32 ) }
						onChange={ ( v ) =>
							setAttributes( { iconSize: toPx( v ) } )
						}
						min={ 16 }
						max={ 80 }
						step={ 1 }
						unit="px"
					/>
					<ABColorControl
						label={ __( 'Colour', 'axiom-blocks' ) }
						color={ iconColor }
						onChange={ ( v ) => setAttributes( { iconColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Hover colour', 'axiom-blocks' ) }
						color={ iconHoverColor }
						onChange={ ( v ) =>
							setAttributes( { iconHoverColor: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Number', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Colour', 'axiom-blocks' ) }
						color={ numberColor }
						onChange={ ( v ) => setAttributes( { numberColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Hover colour', 'axiom-blocks' ) }
						color={ numberHoverColor }
						onChange={ ( v ) =>
							setAttributes( { numberHoverColor: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Label', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Position', 'axiom-blocks' ) }
						value={ labelPosition || 'below' }
						options={ [
							{
								label: __( 'Below number', 'axiom-blocks' ),
								value: 'below',
							},
							{
								label: __( 'Above number', 'axiom-blocks' ),
								value: 'above',
							},
							{
								label: __( 'Left of number', 'axiom-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Right of number', 'axiom-blocks' ),
								value: 'right',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { labelPosition: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Colour', 'axiom-blocks' ) }
						color={ labelColor }
						onChange={ ( v ) => setAttributes( { labelColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Hover colour', 'axiom-blocks' ) }
						color={ labelHoverColor }
						onChange={ ( v ) =>
							setAttributes( { labelHoverColor: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Box', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ cardBackground }
						onChange={ ( v ) =>
							setAttributes( { cardBackground: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Border colour', 'axiom-blocks' ) }
						color={ cardBorderColor }
						onChange={ ( v ) =>
							setAttributes( { cardBorderColor: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Border width', 'axiom-blocks' ) }
						value={ fromPx( cardBorderWidth, 0 ) }
						onChange={ ( v ) =>
							setAttributes( { cardBorderWidth: toPx( v ) } )
						}
						min={ 0 }
						max={ 10 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Border radius', 'axiom-blocks' ) }
						value={ fromPx( cardBorderRadius, 0 ) }
						onChange={ ( v ) =>
							setAttributes( { cardBorderRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 60 }
						step={ 1 }
						unit="px"
					/>
					<ABSelectControl
						label={ __( 'Shadow', 'axiom-blocks' ) }
						value={ cardShadow || '' }
						options={ [
							{
								label: __( 'None', 'axiom-blocks' ),
								value: '',
							},
							{
								label: __( 'Small', 'axiom-blocks' ),
								value: 'sm',
							},
							{
								label: __( 'Medium', 'axiom-blocks' ),
								value: 'md',
							},
							{
								label: __( 'Large', 'axiom-blocks' ),
								value: 'lg',
							},
						] }
						onChange={ ( v ) => setAttributes( { cardShadow: v } ) }
					/>
					<SpacingControl
						label={ __( 'PADDING', 'axiom-blocks' ) }
						type="cardPadding"
						attrs={ attributes }
						onChange={ ( update ) => setAttributes( update ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion
							title={ __( 'Number', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="number"
								unwrapped
							/>
						</ABSubAccordion>
						<ABSubAccordion title={ __( 'Label', 'axiom-blocks' ) }>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="label"
								unwrapped
							/>
						</ABSubAccordion>
					</div>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export const CounterGroup = {
	name: 'axiom-blocks/counter-group',
	settings: {
		title: __( 'Counter', 'axiom-blocks' ),
		description: __(
			'Animated count-up statistics with optional icons and labels.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="counter-group" />,
		edit: CounterGroupEdit,
		save: () => <InnerBlocks.Content />,
	},
};
