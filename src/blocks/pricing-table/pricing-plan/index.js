import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	BlockControls,
	RichText,
	URLInput,
} from '@wordpress/block-editor';
import { PanelBody, ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';
import { useInstanceId } from '@wordpress/compose';
import { link as linkIcon, linkOff as unlinkIcon } from '@wordpress/icons';
import {
	ABTextControl,
	ABToggleControl,
	ABSubAccordion,
} from '../../../components/ABControls';
import {
	TypographyPanel,
	getTypographyStyle,
} from '../../../components/TypographyPanel';
import { BlockIcon } from '../../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../../components/DisabledBlockMessage';

const STROKE = {
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 1.6,
	strokeLinecap: 'round',
	strokeLinejoin: 'round',
};
const IconPlus = () => (
	<svg viewBox="0 0 16 16" { ...STROKE }>
		<path d="M8 3.5v9M3.5 8h9" />
	</svg>
);
const IconTrash = () => (
	<svg viewBox="0 0 24 24" { ...STROKE }>
		<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
		<path d="M3 6h18" />
		<path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
	</svg>
);

const newId = ( prefix = 'f' ) =>
	`${ prefix }-${ Math.random().toString( 36 ).slice( 2, 8 ) }`;

const FeatureCheckIcon = () => (
	<svg
		viewBox="0 0 20 20"
		width="16"
		height="16"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M4 10.5l3.5 3.5L16 6" />
	</svg>
);
const FeatureCrossIcon = () => (
	<svg
		viewBox="0 0 20 20"
		width="16"
		height="16"
		fill="none"
		stroke="currentColor"
		strokeWidth="2.2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M5 5l10 10M15 5L5 15" />
	</svg>
);
const FeatureDotIcon = () => (
	<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
		<circle cx="10" cy="10" r="3" fill="currentColor" />
	</svg>
);

const featureIcon = ( style, included ) => {
	if ( style === 'dot' ) return <FeatureDotIcon />;
	return included ? <FeatureCheckIcon /> : <FeatureCrossIcon />;
};

function PricingPlanEdit( { attributes, setAttributes, context, isSelected } ) {
	if ( ! isBlockEnabled( 'pricing-plan' ) ) {
		return <DisabledBlockMessage blockName="Pricing Plan" />;
	}
	const {
		name,
		badge,
		currency,
		price,
		period,
		description,
		showCurrency,
		showPeriod,
		isHighlight,
		features,
		ctaLabel,
		ctaUrl,
		ctaNewTab,
	} = attributes;

	const featureIconStyle =
		context[ 'axiom-blocks/featureIconStyle' ] || 'check';
	const hasLink = !! ( ctaUrl && ctaUrl !== '#' );

	/* ── Inline link UI: a normal positioned <div>, no Popover (avoids iframe quirks) ── */
	const [ isLinkOpen, setIsLinkOpen ] = useState( false );
	const linkBoxRef = useRef( null );
	const newTabId = useInstanceId( PricingPlanEdit, 'ab-pt-newtab' );

	/* Auto-close on outside click. */
	useEffect( () => {
		if ( ! isLinkOpen ) return undefined;
		const onDocClick = ( e ) => {
			if (
				linkBoxRef.current &&
				! linkBoxRef.current.contains( e.target )
			) {
				setIsLinkOpen( false );
			}
		};
		// Listen in the iframe document where the editor canvas lives.
		const doc = linkBoxRef.current?.ownerDocument || document;
		doc.addEventListener( 'mousedown', onDocClick, true );
		return () => doc.removeEventListener( 'mousedown', onDocClick, true );
	}, [ isLinkOpen ] );

	/* Close popover when block deselects. */
	useEffect( () => {
		if ( ! isSelected ) setIsLinkOpen( false );
	}, [ isSelected ] );

	/* Feature helpers */
	const updateFeature = ( featId, patch ) => {
		setAttributes( {
			features: features.map( ( f ) =>
				f.id === featId ? { ...f, ...patch } : f
			),
		} );
	};
	const addFeature = () => {
		setAttributes( {
			features: [
				...features,
				{
					id: newId( 'f' ),
					text: __( 'New feature', 'axiom-blocks' ),
					included: true,
				},
			],
		} );
	};
	const removeFeature = ( featId ) => {
		setAttributes( {
			features: features.filter( ( f ) => f.id !== featId ),
		} );
	};

	const blockProps = useBlockProps( {
		className: `ab-pt-plan ${ isHighlight ? 'is-highlight' : '' }`,
	} );

	const nameStyle = getTypographyStyle( attributes, 'name' );
	const priceStyle = getTypographyStyle( attributes, 'price' );
	const descStyle = getTypographyStyle( attributes, 'desc' );
	const featureStyle = getTypographyStyle( attributes, 'feature' );
	const ctaStyle = getTypographyStyle( attributes, 'cta' );

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						name="link"
						icon={ linkIcon }
						title={ __( 'Edit button link', 'axiom-blocks' ) }
						onClick={ () => setIsLinkOpen( ( v ) => ! v ) }
						isActive={ hasLink }
					/>
					{ hasLink && (
						<ToolbarButton
							name="unlink"
							icon={ unlinkIcon }
							title={ __( 'Remove button link', 'axiom-blocks' ) }
							onClick={ () => {
								setAttributes( {
									ctaUrl: '',
									ctaNewTab: false,
								} );
								setIsLinkOpen( false );
							} }
						/>
					) }
				</ToolbarGroup>
			</BlockControls>

			<InspectorControls>
				<PanelBody
					title={ __( 'Plan', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABToggleControl
						label={ __( 'Mark as recommended', 'axiom-blocks' ) }
						checked={ !! isHighlight }
						onChange={ ( v ) =>
							setAttributes( { isHighlight: v } )
						}
					/>
					<ABTextControl
						label={ __( 'Badge text', 'axiom-blocks' ) }
						value={ badge }
						onChange={ ( v ) => setAttributes( { badge: v } ) }
						placeholder={ __(
							'e.g. Most Popular',
							'axiom-blocks'
						) }
						help={ __(
							'Leave empty to hide the badge.',
							'axiom-blocks'
						) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Price display', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show currency', 'axiom-blocks' ) }
						checked={ showCurrency !== false }
						onChange={ ( v ) =>
							setAttributes( { showCurrency: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Show period', 'axiom-blocks' ) }
						checked={ showPeriod !== false }
						onChange={ ( v ) => setAttributes( { showPeriod: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Call to action', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABTextControl
						label={ __( 'Button URL', 'axiom-blocks' ) }
						value={ ctaUrl }
						onChange={ ( v ) => setAttributes( { ctaUrl: v } ) }
						placeholder="https://"
						type="url"
					/>
					<ABToggleControl
						label={ __( 'Open in new tab', 'axiom-blocks' ) }
						checked={ !! ctaNewTab }
						onChange={ ( v ) => setAttributes( { ctaNewTab: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion
							title={ __( 'Plan name', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="name"
								unwrapped
							/>
						</ABSubAccordion>
						<ABSubAccordion title={ __( 'Price', 'axiom-blocks' ) }>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="price"
								unwrapped
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'Description', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="desc"
								unwrapped
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'Features', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="feature"
								unwrapped
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'Button', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="cta"
								unwrapped
							/>
						</ABSubAccordion>
					</div>
				</PanelBody>
			</InspectorControls>

			<article { ...blockProps }>
				{ badge && <div className="ab-pt-plan__badge">{ badge }</div> }
				<RichText
					tagName="h3"
					className="ab-pt-plan__name"
					value={ name }
					onChange={ ( v ) => setAttributes( { name: v } ) }
					placeholder={ __( 'Plan name', 'axiom-blocks' ) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
					style={ nameStyle }
				/>
				<div className="ab-pt-plan__price" style={ priceStyle }>
					{ showCurrency !== false && (
						<RichText
							tagName="span"
							className="ab-pt-plan__currency"
							value={ currency }
							onChange={ ( v ) =>
								setAttributes( { currency: v } )
							}
							placeholder="$"
							allowedFormats={ [] }
						/>
					) }
					<RichText
						tagName="span"
						className="ab-pt-plan__amount"
						value={ price }
						onChange={ ( v ) => setAttributes( { price: v } ) }
						placeholder="0"
						allowedFormats={ [] }
					/>
					{ showPeriod !== false && (
						<RichText
							tagName="span"
							className="ab-pt-plan__period"
							value={ period }
							onChange={ ( v ) => setAttributes( { period: v } ) }
							placeholder={ __( '/month', 'axiom-blocks' ) }
							allowedFormats={ [] }
						/>
					) }
				</div>
				<RichText
					tagName="p"
					className="ab-pt-plan__desc"
					value={ description }
					onChange={ ( v ) => setAttributes( { description: v } ) }
					placeholder={ __(
						'Plan tagline (optional)',
						'axiom-blocks'
					) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
					style={ descStyle }
				/>
				<ul className="ab-pt-plan__features">
					{ features.map( ( f ) => (
						<li
							key={ f.id }
							className={ `ab-pt-feat ${
								f.included ? 'is-included' : 'is-excluded'
							}` }
						>
							<button
								type="button"
								className="ab-pt-feat__toggle"
								onClick={ () =>
									updateFeature( f.id, {
										included: ! f.included,
									} )
								}
								aria-label={
									f.included
										? __(
												'Mark as not included',
												'axiom-blocks'
										  )
										: __(
												'Mark as included',
												'axiom-blocks'
										  )
								}
								title={
									f.included
										? __(
												'Included — click to exclude',
												'axiom-blocks'
										  )
										: __(
												'Excluded — click to include',
												'axiom-blocks'
										  )
								}
							>
								{ featureIcon( featureIconStyle, f.included ) }
							</button>
							<RichText
								tagName="span"
								className="ab-pt-feat__text"
								value={ f.text }
								onChange={ ( v ) =>
									updateFeature( f.id, { text: v } )
								}
								placeholder={ __(
									'Feature description',
									'axiom-blocks'
								) }
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								style={ featureStyle }
							/>
							<button
								type="button"
								className="ab-pt-feat__remove"
								onClick={ () => removeFeature( f.id ) }
								aria-label={ __(
									'Remove feature',
									'axiom-blocks'
								) }
							>
								<IconTrash />
							</button>
						</li>
					) ) }
					<li className="ab-pt-feat-add-row">
						<button
							type="button"
							className="ab-pt-feat-add"
							onClick={ addFeature }
						>
							<IconPlus />
							<span>{ __( 'Add feature', 'axiom-blocks' ) }</span>
						</button>
					</li>
				</ul>

				<div className="ab-pt-plan__cta-area">
					<RichText
						tagName="span"
						className="ab-pt-plan__cta"
						value={ ctaLabel }
						onChange={ ( v ) => setAttributes( { ctaLabel: v } ) }
						placeholder={ __( 'Button label', 'axiom-blocks' ) }
						allowedFormats={ [] }
						style={ ctaStyle }
					/>

					{ isLinkOpen && (
						// eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events -- popover wrapper only swallows mousedown so the RichText above doesn't lose focus; not a control.
						<div
							ref={ linkBoxRef }
							className="ab-pt-link-popover"
							contentEditable={ false }
							onMouseDown={ ( e ) => e.stopPropagation() }
						>
							<form
								className="ab-pt-link-popover__form"
								onSubmit={ ( e ) => {
									e.preventDefault();
									setIsLinkOpen( false );
								} }
							>
								<URLInput
									value={ ctaUrl }
									onChange={ ( url ) =>
										setAttributes( { ctaUrl: url || '' } )
									}
									placeholder={ __(
										'Paste URL or search',
										'axiom-blocks'
									) }
									className="ab-pt-link-popover__input"
									__nextHasNoMarginBottom
								/>
								<button
									type="submit"
									className="ab-pt-link-popover__submit"
									aria-label={ __(
										'Apply link',
										'axiom-blocks'
									) }
									title={ __( 'Apply link', 'axiom-blocks' ) }
								>
									<svg
										viewBox="0 0 16 16"
										width="14"
										height="14"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<path d="M3 8l4 4 6-8" />
									</svg>
								</button>
							</form>
							<label
								htmlFor={ newTabId }
								className="ab-pt-link-popover__newtab"
							>
								<input
									id={ newTabId }
									type="checkbox"
									checked={ !! ctaNewTab }
									onChange={ ( e ) =>
										setAttributes( {
											ctaNewTab: e.target.checked,
										} )
									}
								/>
								<span>
									{ __( 'Open in new tab', 'axiom-blocks' ) }
								</span>
							</label>
						</div>
					) }
				</div>
			</article>
		</>
	);
}

export const PricingPlan = {
	name: 'axiom-blocks/pricing-plan',
	settings: {
		title: __( 'Pricing Plan', 'axiom-blocks' ),
		description: __(
			'A single plan card inside Pricing Table.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="pricing-table" />,
		edit: PricingPlanEdit,
		save: () => null,
	},
};
