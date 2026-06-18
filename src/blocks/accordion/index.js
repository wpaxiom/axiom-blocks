import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, Dropdown } from '@wordpress/components';
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
import { IconPicker } from '../../components/IconPicker';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/accordion-item' ];
const TEMPLATE = [
	[ 'axiom-blocks/accordion-item', { title: 'Accordion item one' } ],
];

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

export function getAccordionVars( attributes ) {
	const {
		headerBg,
		headerColor,
		activeHeaderBg,
		activeHeaderColor,
		headerPaddingTop,
		headerPaddingRight,
		headerPaddingBottom,
		headerPaddingLeft,
		bodyBg,
		bodyColor,
		bodyPaddingTop,
		bodyPaddingRight,
		bodyPaddingBottom,
		bodyPaddingLeft,
		borderColor,
		borderWidth,
		borderRadius,
		itemGap,
		containerBorderColor,
		containerBorderWidth,
		containerBorderRadius,
		iconColor,
		iconSize,
		headerFontFamily,
		headerFontWeight,
		headerFontSize,
		headerLineHeight,
		headerLetterSpacing,
		headerTextTransform,
		headerTextDecoration,
		headerTextAlign,
	} = attributes;
	return {
		'--ab-acc-header-bg': headerBg || undefined,
		'--ab-acc-header-color': headerColor || undefined,
		'--ab-acc-active-header-bg': activeHeaderBg || undefined,
		'--ab-acc-active-header-color': activeHeaderColor || undefined,
		'--ab-acc-header-pt': headerPaddingTop || undefined,
		'--ab-acc-header-pr': headerPaddingRight || undefined,
		'--ab-acc-header-pb': headerPaddingBottom || undefined,
		'--ab-acc-header-pl': headerPaddingLeft || undefined,
		'--ab-acc-body-bg': bodyBg || undefined,
		'--ab-acc-body-color': bodyColor || undefined,
		'--ab-acc-body-pt': bodyPaddingTop || undefined,
		'--ab-acc-body-pr': bodyPaddingRight || undefined,
		'--ab-acc-body-pb': bodyPaddingBottom || undefined,
		'--ab-acc-body-pl': bodyPaddingLeft || undefined,
		'--ab-acc-border-color': borderColor || undefined,
		'--ab-acc-border-width': borderWidth || undefined,
		'--ab-acc-radius': borderRadius || undefined,
		'--ab-acc-gap': itemGap || undefined,
		'--ab-acc-cont-bc': containerBorderColor || undefined,
		'--ab-acc-cont-bw': containerBorderWidth || undefined,
		'--ab-acc-cont-radius': containerBorderRadius || undefined,
		'--ab-acc-icon-color': iconColor || undefined,
		'--ab-acc-icon-size': iconSize || undefined,
		'--ab-acc-title-ff': headerFontFamily || undefined,
		'--ab-acc-title-fw': headerFontWeight || undefined,
		'--ab-acc-title-fs': headerFontSize || undefined,
		'--ab-acc-title-lh': headerLineHeight || undefined,
		'--ab-acc-title-ls': headerLetterSpacing || undefined,
		'--ab-acc-title-tt': headerTextTransform || undefined,
		'--ab-acc-title-td': headerTextDecoration || undefined,
		'--ab-acc-title-ta': headerTextAlign || undefined,
	};
}

export function getAccordionClasses( attributes ) {
	const { showIcon, iconPosition, rotateIcon } = attributes;
	return [
		'ab-accordion',
		showIcon ? 'has-icon' : 'no-icon',
		`ab-accordion--icon-${ iconPosition || 'right' }`,
		rotateIcon ? 'ab-accordion--rotate' : '',
	].filter( Boolean );
}

function AccordionEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'accordion' ) ) {
		return <DisabledBlockMessage blockName="Accordion" />;
	}

	const {
		closeOthers,
		firstItemOpen,
		headingLevel,
		faqSchema,
		transitionDuration,
		showExpandAll,
		deepLink,
		collapseOnMobile,
		showIcon,
		iconSlug,
		iconPosition,
		rotateIcon,
		iconColor,
		iconSize,
		headerBg,
		headerColor,
		activeHeaderBg,
		activeHeaderColor,
		bodyBg,
		bodyColor,
		borderColor,
		borderWidth,
		borderRadius,
		itemGap,
		containerBorderColor,
		containerBorderWidth,
		containerBorderRadius,
	} = attributes;

	const blockProps = useBlockProps( {
		className: getAccordionClasses( attributes ).join( ' ' ),
		style: {
			...getAccordionVars( attributes ),
			...getSpacingStyle( attributes ),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		template: TEMPLATE,
		templateLock: false,
		orientation: 'vertical',
		renderAppender: InnerBlocks.ButtonBlockAppender,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Behaviour', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABToggleControl
						label={ __(
							'Close others when opening',
							'axiom-blocks'
						) }
						help={ __(
							'Only one panel open at a time.',
							'axiom-blocks'
						) }
						checked={ !! closeOthers }
						onChange={ ( v ) =>
							setAttributes( { closeOthers: v } )
						}
					/>
					<ABToggleControl
						label={ __(
							'Open first item by default',
							'axiom-blocks'
						) }
						checked={ !! firstItemOpen }
						onChange={ ( v ) =>
							setAttributes( { firstItemOpen: v } )
						}
					/>
					<ABSelectControl
						label={ __( 'Heading level', 'axiom-blocks' ) }
						help={ __(
							'HTML tag for each item title (for accessibility and document outline).',
							'axiom-blocks'
						) }
						value={ headingLevel || 'h3' }
						options={ [
							{ label: 'H2', value: 'h2' },
							{ label: 'H3', value: 'h3' },
							{ label: 'H4', value: 'h4' },
							{ label: 'H5', value: 'h5' },
							{ label: 'H6', value: 'h6' },
						] }
						onChange={ ( v ) =>
							setAttributes( { headingLevel: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Output FAQ schema', 'axiom-blocks' ) }
						help={ __(
							'Add schema.org FAQPage structured data (item titles = questions, panel content = answers). Use only for genuine question-and-answer content.',
							'axiom-blocks'
						) }
						checked={ !! faqSchema }
						onChange={ ( v ) => setAttributes( { faqSchema: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Animation speed', 'axiom-blocks' ) }
						help={ __( '0 = instant (no animation).', 'axiom-blocks' ) }
						value={ transitionDuration ?? 300 }
						onChange={ ( v ) => setAttributes( { transitionDuration: v ?? 0 } ) }
						min={ 0 }
						max={ 1000 }
						step={ 50 }
						unit="ms"
					/>
					<ABToggleControl
						label={ __( 'Expand / collapse all button', 'axiom-blocks' ) }
						checked={ !! showExpandAll }
						onChange={ ( v ) => setAttributes( { showExpandAll: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Deep-link to items (URL anchor)', 'axiom-blocks' ) }
						help={ __( 'Open and scroll to the item whose HTML Anchor (set per item in the Advanced panel) matches the page URL, e.g. #shipping. The URL updates as items open. This is not a clickable link on the item.', 'axiom-blocks' ) }
						checked={ !! deepLink }
						onChange={ ( v ) => setAttributes( { deepLink: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Collapse on mobile', 'axiom-blocks' ) }
						help={ __( 'Start every panel closed on small screens.', 'axiom-blocks' ) }
						checked={ !! collapseOnMobile }
						onChange={ ( v ) => setAttributes( { collapseOnMobile: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show icon', 'axiom-blocks' ) }
						checked={ !! showIcon }
						onChange={ ( v ) => setAttributes( { showIcon: v } ) }
					/>
					{ showIcon && (
						<>
							<div className="ab-acc-icon-field">
								<span className="ab-acc-icon-field__label">
									{ __( 'Icon', 'axiom-blocks' ) }
								</span>
								<Dropdown
									className="ab-acc-icon-field__pick"
									popoverProps={ {
										placement: 'bottom-start',
									} }
									renderToggle={ ( { isOpen, onToggle } ) => (
										<button
											type="button"
											className="ab-acc-icon-field__btn"
											onClick={ onToggle }
											aria-expanded={ isOpen }
											aria-label={ __(
												'Choose icon',
												'axiom-blocks'
											) }
										>
											{ ICON_LIBRARY[ iconSlug ] ||
												ICON_LIBRARY[ 'chevron-down' ] }
										</button>
									) }
									renderContent={ () => (
										<div className="ab-acc-icon-pop">
											<IconPicker
												value={ iconSlug }
												onChange={ ( v ) =>
													setAttributes( {
														iconSlug: v,
													} )
												}
											/>
										</div>
									) }
								/>
							</div>
							<ABSelectControl
								label={ __( 'Icon position', 'axiom-blocks' ) }
								value={ iconPosition }
								options={ [
									{
										label: __( 'Left', 'axiom-blocks' ),
										value: 'left',
									},
									{
										label: __( 'Right', 'axiom-blocks' ),
										value: 'right',
									},
								] }
								onChange={ ( v ) =>
									setAttributes( { iconPosition: v } )
								}
							/>
							<ABToggleControl
								label={ __(
									'Rotate icon when open',
									'axiom-blocks'
								) }
								checked={ !! rotateIcon }
								onChange={ ( v ) =>
									setAttributes( { rotateIcon: v } )
								}
							/>
							<ABRangeControl
								label={ __( 'Icon size', 'axiom-blocks' ) }
								value={ fromPx( iconSize, 20 ) }
								onChange={ ( v ) =>
									setAttributes( { iconSize: toPx( v ) } )
								}
								min={ 10 }
								max={ 48 }
								step={ 1 }
								unit="px"
							/>
							<ABColorControl
								label={ __( 'Icon colour', 'axiom-blocks' ) }
								color={ iconColor }
								onChange={ ( v ) =>
									setAttributes( { iconColor: v } )
								}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Header', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ headerBg }
						onChange={ ( v ) => setAttributes( { headerBg: v } ) }
					/>
					<ABColorControl
						label={ __( 'Text', 'axiom-blocks' ) }
						color={ headerColor }
						onChange={ ( v ) =>
							setAttributes( { headerColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Active background', 'axiom-blocks' ) }
						color={ activeHeaderBg }
						onChange={ ( v ) =>
							setAttributes( { activeHeaderBg: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Active text', 'axiom-blocks' ) }
						color={ activeHeaderColor }
						onChange={ ( v ) =>
							setAttributes( { activeHeaderColor: v } )
						}
					/>
					<SpacingControl
						label={ __( 'Padding', 'axiom-blocks' ) }
						type="headerPadding"
						attrs={ attributes }
						onChange={ ( update ) => setAttributes( update ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Body', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ bodyBg }
						onChange={ ( v ) => setAttributes( { bodyBg: v } ) }
					/>
					<ABColorControl
						label={ __( 'Text', 'axiom-blocks' ) }
						color={ bodyColor }
						onChange={ ( v ) => setAttributes( { bodyColor: v } ) }
					/>
					<SpacingControl
						label={ __( 'Padding', 'axiom-blocks' ) }
						type="bodyPadding"
						attrs={ attributes }
						onChange={ ( update ) => setAttributes( update ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Border', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion
							title={ __( 'Items', 'axiom-blocks' ) }
						>
							<ABColorControl
								label={ __( 'Colour', 'axiom-blocks' ) }
								color={ borderColor }
								onChange={ ( v ) =>
									setAttributes( { borderColor: v } )
								}
							/>
							<ABRangeControl
								label={ __( 'Width', 'axiom-blocks' ) }
								value={ fromPx( borderWidth, 1 ) }
								onChange={ ( v ) =>
									setAttributes( {
										borderWidth: toPx( v ),
									} )
								}
								min={ 0 }
								max={ 6 }
								step={ 1 }
								unit="px"
							/>
							<ABRangeControl
								label={ __( 'Corner radius', 'axiom-blocks' ) }
								value={ fromPx( borderRadius, 8 ) }
								onChange={ ( v ) =>
									setAttributes( {
										borderRadius: toPx( v ),
									} )
								}
								min={ 0 }
								max={ 32 }
								step={ 1 }
								unit="px"
							/>
							<ABRangeControl
								label={ __(
									'Gap between items',
									'axiom-blocks'
								) }
								value={ fromPx( itemGap, 8 ) }
								onChange={ ( v ) =>
									setAttributes( { itemGap: toPx( v ) } )
								}
								min={ 0 }
								max={ 32 }
								step={ 1 }
								unit="px"
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'Container', 'axiom-blocks' ) }
						>
							<ABColorControl
								label={ __( 'Colour', 'axiom-blocks' ) }
								color={ containerBorderColor }
								onChange={ ( v ) =>
									setAttributes( {
										containerBorderColor: v,
									} )
								}
							/>
							<ABRangeControl
								label={ __( 'Width', 'axiom-blocks' ) }
								value={ fromPx( containerBorderWidth, 0 ) }
								onChange={ ( v ) =>
									setAttributes( {
										containerBorderWidth: toPx( v ),
									} )
								}
								min={ 0 }
								max={ 6 }
								step={ 1 }
								unit="px"
							/>
							<ABRangeControl
								label={ __( 'Corner radius', 'axiom-blocks' ) }
								value={ fromPx( containerBorderRadius, 0 ) }
								onChange={ ( v ) =>
									setAttributes( {
										containerBorderRadius: toPx( v ),
									} )
								}
								min={ 0 }
								max={ 32 }
								step={ 1 }
								unit="px"
							/>
						</ABSubAccordion>
					</div>
				</PanelBody>

				<TypographyPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
					prefix="header"
					title={ __( 'Header typography', 'axiom-blocks' ) }
				/>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export const Accordion = {
	name: 'axiom-blocks/accordion',
	settings: {
		title: __( 'Accordion', 'axiom-blocks' ),
		description: __(
			'Collapsible panels for FAQs and disclosures, built on native details/summary.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="accordion" />,
		edit: AccordionEdit,
		save: () => <InnerBlocks.Content />,
	},
};
