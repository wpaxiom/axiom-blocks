import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	getTypographyStyle,
} from '../../components/TypographyPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

/* ── Default plans inserted when the block is first added ──────────────── */
const DEFAULT_PLANS = [
	[
		'axiom-blocks/pricing-plan',
		{
			name: __( 'Starter', 'axiom-blocks' ),
			currency: '$',
			price: '9',
			period: __( '/month', 'axiom-blocks' ),
			description: __(
				'For individuals just getting started.',
				'axiom-blocks'
			),
			features: [
				{
					id: 'f-s-1',
					text: __( 'Up to 5 projects', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-s-2',
					text: __( 'Community support', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-s-3',
					text: __( 'Priority support', 'axiom-blocks' ),
					included: false,
				},
				{
					id: 'f-s-4',
					text: __( 'Advanced analytics', 'axiom-blocks' ),
					included: false,
				},
			],
			ctaLabel: __( 'Get started', 'axiom-blocks' ),
		},
	],
	[
		'axiom-blocks/pricing-plan',
		{
			name: __( 'Pro', 'axiom-blocks' ),
			badge: __( 'Most Popular', 'axiom-blocks' ),
			currency: '$',
			price: '29',
			period: __( '/month', 'axiom-blocks' ),
			description: __( 'Everything you need to grow.', 'axiom-blocks' ),
			isHighlight: true,
			features: [
				{
					id: 'f-p-1',
					text: __( 'Unlimited projects', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-p-2',
					text: __( 'Priority support', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-p-3',
					text: __( 'Advanced analytics', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-p-4',
					text: __( 'Custom integrations', 'axiom-blocks' ),
					included: false,
				},
			],
			ctaLabel: __( 'Start free trial', 'axiom-blocks' ),
		},
	],
	[
		'axiom-blocks/pricing-plan',
		{
			name: __( 'Business', 'axiom-blocks' ),
			currency: '$',
			price: '79',
			period: __( '/month', 'axiom-blocks' ),
			description: __(
				'For teams that need more power.',
				'axiom-blocks'
			),
			features: [
				{
					id: 'f-b-1',
					text: __( 'Unlimited everything', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-b-2',
					text: __( 'Dedicated support', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-b-3',
					text: __( 'Custom integrations', 'axiom-blocks' ),
					included: true,
				},
				{
					id: 'f-b-4',
					text: __( 'SSO & advanced security', 'axiom-blocks' ),
					included: true,
				},
			],
			ctaLabel: __( 'Contact sales', 'axiom-blocks' ),
		},
	],
];

function PricingTableEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'pricing-table' ) ) {
		return <DisabledBlockMessage blockName="Pricing Table" />;
	}
	const {
		columns,
		gap,
		cardStyle,
		accentColor,
		featureIconStyle,
		headingShow,
		headingText,
		headingAlign,
	} = attributes;

	const blockProps = useBlockProps( {
		className: [
			'axiom-blocks-pricing-table',
			`is-card-${ cardStyle }`,
			`is-feat-${ featureIconStyle }`,
		]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			'--ab-pt-columns': Math.max( 1, Math.min( 4, columns || 3 ) ),
			'--ab-pt-gap': `${ gap || 0 }px`,
			'--ab-pt-accent': accentColor || '#7C3AED',
			...getSpacingStyle( attributes ),
		},
	} );

	const headingStyle = {
		// Legacy fallback — typography spread overrides if headingTextAlign is set.
		textAlign: headingAlign || undefined,
		...getTypographyStyle( attributes, 'heading' ),
	};

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'axiom-blocks-pricing-table__grid' },
		{
			allowedBlocks: [ 'axiom-blocks/pricing-plan' ],
			template: DEFAULT_PLANS,
			templateLock: false,
			renderAppender: InnerBlocks.ButtonBlockAppender,
			orientation: 'horizontal',
		}
	);

	return (
		<>
			<InspectorControls>
				{ /* ── Layout ────────────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABRangeControl
						label={ __( 'Columns', 'axiom-blocks' ) }
						value={ columns }
						onChange={ ( v ) =>
							setAttributes( {
								columns: Math.max( 1, Math.min( 4, v || 1 ) ),
							} )
						}
						min={ 1 }
						max={ 4 }
						step={ 1 }
						unit=""
					/>
					<ABRangeControl
						label={ __( 'Gap', 'axiom-blocks' ) }
						value={ gap }
						onChange={ ( v ) => setAttributes( { gap: v ?? 0 } ) }
						min={ 0 }
						max={ 64 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				{ /* ── Heading ───────────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Heading', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show heading', 'axiom-blocks' ) }
						checked={ headingShow }
						onChange={ ( v ) =>
							setAttributes( { headingShow: v } )
						}
					/>
					{ headingShow && (
						<>
							<ABTextControl
								label={ __( 'Heading text', 'axiom-blocks' ) }
								value={ headingText }
								onChange={ ( v ) =>
									setAttributes( { headingText: v } )
								}
							/>
							<ABSelectControl
								label={ __(
									'Heading alignment',
									'axiom-blocks'
								) }
								value={
									attributes.headingTextAlign ||
									headingAlign ||
									''
								}
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
								onChange={ ( v ) =>
									setAttributes( { headingTextAlign: v } )
								}
							/>
						</>
					) }
				</PanelBody>

				{ headingShow && (
					<TypographyPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
						prefix="heading"
						title={ __( 'Heading typography', 'axiom-blocks' ) }
					/>
				) }

				{ /* ── Cards ─────────────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Cards', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Card style', 'axiom-blocks' ) }
						value={ cardStyle }
						options={ [
							{
								label: __( 'Bordered', 'axiom-blocks' ),
								value: 'bordered',
							},
							{
								label: __( 'Filled', 'axiom-blocks' ),
								value: 'filled',
							},
							{
								label: __( 'Minimal', 'axiom-blocks' ),
								value: 'minimal',
							},
						] }
						onChange={ ( v ) => setAttributes( { cardStyle: v } ) }
					/>
					<ABColorControl
						label={ __( 'Accent color', 'axiom-blocks' ) }
						color={ accentColor }
						onChange={ ( v ) =>
							setAttributes( { accentColor: v } )
						}
					/>
				</PanelBody>

				{ /* ── Features ──────────────────────────────────────────── */ }
				<PanelBody
					title={ __( 'Features', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Feature icon style', 'axiom-blocks' ) }
						value={ featureIconStyle }
						options={ [
							{
								label: __( 'Check / cross', 'axiom-blocks' ),
								value: 'check',
							},
							{
								label: __( 'Dot', 'axiom-blocks' ),
								value: 'dot',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { featureIconStyle: v } )
						}
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ headingShow && headingText && (
					<div
						className="axiom-blocks-pricing-table__heading"
						style={ headingStyle }
					>
						{ headingText }
					</div>
				) }
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}

export const PricingTable = {
	name: 'axiom-blocks/pricing-table',
	settings: {
		title: __( 'Pricing Table', 'axiom-blocks' ),
		description: __(
			'Pricing plans with feature lists, CTAs, and a highlighted recommendation.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="pricing-table" />,
		edit: PricingTableEdit,
		save: () => <InnerBlocks.Content />,
	},
};
