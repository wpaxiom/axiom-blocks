import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { useDeviceType } from '../../components/responsive';
import { responsiveVarValue } from '../../components/responsiveProps';
import { ABResponsive } from '../../components/ABResponsive';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/slide' ];
const TEMPLATE = [
	[
		'axiom-blocks/slide',
		{},
		[
			[
				'core/paragraph',
				{
					placeholder: __( 'Slide one…', 'axiom-blocks' ),
					align: 'center',
				},
			],
		],
	],
];

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

/* Rendered defaults (mirror the CSS `var(…, fallback)` values) so the inspector
 * swatches show the real color instead of empty when nothing is set. */
const COLOR_DEFAULTS = {
	arrowColor: '#ffffff',
	arrowBg: 'rgba(17, 17, 17, 0.55)',
	dotColor: 'rgba(17, 17, 17, 0.28)',
	dotActiveColor: '#7c3aed',
};

const SLD_BW_KEYS = [
	'borderTopWidth',
	'borderRightWidth',
	'borderBottomWidth',
	'borderLeftWidth',
];
const SLD_RADIUS_KEYS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];
const ARROW_RADIUS_KEYS = [
	'arrowRadiusTopLeft',
	'arrowRadiusTopRight',
	'arrowRadiusBottomRight',
	'arrowRadiusBottomLeft',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. The legacy single-value
 * border attrs (`borderWidth`/`borderRadius`/`borderColor`) seed the per-side
 * longhands; arrow/dot colors are re-homed from the old Navigation panel. */
const DESIGN = {
	block: 'slider',
	targets: [
		{
			noun: __( 'Container', 'axiom-blocks' ),
			border: {
				widthKeys: SLD_BW_KEYS,
				styleKey: 'borderStyle',
				legacyWidth: 'borderWidth',
				colorKey: 'borderColor',
				max: 8,
			},
			radius: {
				keys: SLD_RADIUS_KEYS,
				legacyRadius: 'borderRadius',
				max: 48,
			},
			shadow: { bind: 'containerShadow' },
			size: {
				bind: 'maxWidth',
				label: __( 'Max width', 'axiom-blocks' ),
				responsive: true,
			},
			// NB: slider height stays in Settings › Layout (sliderHeight) — it's
			// coupled to vertical mode.
		},
		{
			noun: __( 'Arrows', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'arrowColor',
					fallback: COLOR_DEFAULTS.arrowColor,
				},
			],
			background: {
				bind: 'arrowBg',
				label: __( 'Background', 'axiom-blocks' ),
				fallback: COLOR_DEFAULTS.arrowBg,
			},
			radius: { prefix: 'arrow', keys: ARROW_RADIUS_KEYS, max: 40 },
		},
		{
			noun: __( 'Dots', 'axiom-blocks' ),
			states: [ 'active' ],
			colors: [
				{
					label: __( 'Color', 'axiom-blocks' ),
					bind: 'dotColor',
					stateBind: { active: 'dotActiveColor' },
					fallback: COLOR_DEFAULTS.dotColor,
				},
			],
		},
	],
};

/* Editor mock icons — mirror the frontend view-script SVGs. */
const ChevronPrev = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m15 18-6-6 6-6" />
	</svg>
);
const ChevronNext = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m9 18 6-6-6-6" />
	</svg>
);
const ChevronUp = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m18 15-6-6-6 6" />
	</svg>
);
const ChevronDown = (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="m6 9 6 6 6-6" />
	</svg>
);
const IconPause = (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<rect x="6" y="4" width="4" height="16" rx="1" />
		<rect x="14" y="4" width="4" height="16" rx="1" />
	</svg>
);

export function getSliderVars( attributes ) {
	const {
		gap,
		arrowColor,
		arrowBg,
		arrowOffset,
		dotColor,
		dotActiveColor,
		paginationGap,
		dotGap,
		borderColor,
		borderWidth,
		borderRadius,
		sliderHeight,
		borderStyle,
		borderTopWidth,
		borderRightWidth,
		borderBottomWidth,
		borderLeftWidth,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		containerShadow,
		arrowRadiusTopLeft,
		arrowRadiusTopRight,
		arrowRadiusBottomRight,
		arrowRadiusBottomLeft,
		arrowColorHover,
		arrowBgHover,
	} = attributes;
	// Concrete fallbacks (not `undefined`) so clearing a control resets the
	// inline custom property in the editor — React doesn't reliably remove
	// `--custom-properties`, which otherwise leaves a stale value (e.g. a
	// border that "won't turn off"). Colors keep `undefined` on purpose: their
	// CSS fallbacks differ per context (normal vs hover, dot vs fraction).
	return {
		'--ab-slider-gap': gap || '16px',
		'--ab-slider-arrow-color': arrowColor || undefined,
		'--ab-slider-arrow-bg': arrowBg || undefined,
		'--ab-slider-arrow-offset': arrowOffset || '10px',
		'--ab-slider-dot-color': dotColor || undefined,
		'--ab-slider-dot-active': dotActiveColor || undefined,
		'--ab-slider-pagination-gap': paginationGap || '14px',
		'--ab-slider-dot-gap': dotGap || '8px',
		'--ab-slider-bc': borderColor || 'transparent',
		'--ab-slider-bw': borderWidth || '0px',
		'--ab-slider-radius': borderRadius || '0',
		'--ab-slider-height': sliderHeight || undefined,
		// Per-side/per-corner longhands (L3 upgrade). The legacy single values
		// fold in as fallbacks so a saved single-width border renders on every
		// side until the longhands are edited.
		'--ab-slider-bs': borderStyle || undefined,
		'--ab-slider-bw-top': borderTopWidth || borderWidth || '0px',
		'--ab-slider-bw-right': borderRightWidth || borderWidth || '0px',
		'--ab-slider-bw-bottom': borderBottomWidth || borderWidth || '0px',
		'--ab-slider-bw-left': borderLeftWidth || borderWidth || '0px',
		'--ab-slider-radius-tl': radiusTopLeft || borderRadius || '0',
		'--ab-slider-radius-tr': radiusTopRight || borderRadius || '0',
		'--ab-slider-radius-br': radiusBottomRight || borderRadius || '0',
		'--ab-slider-radius-bl': radiusBottomLeft || borderRadius || '0',
		'--ab-slider-shadow': containerShadow || 'none',
		'--ab-slider-arrow-radius-tl': arrowRadiusTopLeft || '50%',
		'--ab-slider-arrow-radius-tr': arrowRadiusTopRight || '50%',
		'--ab-slider-arrow-radius-br': arrowRadiusBottomRight || '50%',
		'--ab-slider-arrow-radius-bl': arrowRadiusBottomLeft || '50%',
		'--ab-slider-arrow-color-hover': arrowColorHover || undefined,
		'--ab-slider-arrow-bg-hover': arrowBgHover || undefined,
	};
}

export function getSliderClasses( attributes ) {
	const { effect, orientation } = attributes;
	return [
		'ab-slider',
		`ab-slider--${ effect || 'slide' }`,
		orientation === 'vertical' ? 'ab-slider--vertical' : '',
		'is-editor',
	].filter( Boolean );
}

function SliderEdit( { attributes, setAttributes, clientId } ) {
	if ( ! isBlockEnabled( 'content-slider' ) ) {
		return <DisabledBlockMessage blockName="Content Slider" />;
	}

	const {
		effect,
		orientation,
		slidesPerView,
		slidesToScroll,
		gap,
		adaptiveHeight,
		autoplay,
		autoplaySpeed,
		loop,
		pauseOnHover,
		showPauseButton,
		slideSpeed,
		draggable,
		showArrows,
		arrowOffset,
		showDots,
		paginationType,
		paginationGap,
		dotGap,
		lightbox,
		sliderHeight,
	} = attributes;

	const isVertical = orientation === 'vertical';

	const device = useDeviceType();
	// Max width previews as a real inline declaration (not a CSS var) so an
	// unset value inherits the layout width — mirroring render.php.
	const maxWidthPreview = responsiveVarValue( attributes, 'maxWidth', device );
	const blockProps = useBlockProps( {
		className: getSliderClasses( attributes ).join( ' ' ),
		style: {
			...getSliderVars( attributes ),
			...useSpacingStyle( attributes ),
			...( maxWidthPreview ? { maxWidth: maxWidthPreview } : {} ),
		},
	} );

	/* ── Editor carousel (replicates the frontend one-slide-at-a-time view) ── */
	const slideCount =
		useSelect(
			( select ) =>
				select( 'core/block-editor' ).getBlockCount( clientId ),
			[ clientId ]
		) || 0;

	const perView = effect === 'fade' ? 1 : Math.max( 1, slidesPerView || 1 );
	const maxIndex = Math.max( 0, slideCount - perView );
	const [ active, setActive ] = useState( 0 );

	useEffect( () => {
		if ( active > maxIndex ) {
			setActive( maxIndex );
		}
	}, [ maxIndex, active ] );

	const goPrev = () =>
		setActive( ( a ) => ( a <= 0 ? ( loop ? maxIndex : 0 ) : a - 1 ) );
	const goNext = () =>
		setActive( ( a ) =>
			a >= maxIndex ? ( loop ? 0 : maxIndex ) : a + 1
		);

	const axis = isVertical ? 'Y' : 'X';
	const trackStyle = {
		transform: `translate${ axis }(calc(-${ active } * (100% + ${ fromPx(
			gap,
			16
		) }px) / ${ perView }))`,
		transition: `transform ${ slideSpeed ?? 500 }ms ease`,
	};
	const viewportStyle =
		isVertical && sliderHeight ? { height: sliderHeight } : undefined;

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'ab-slider__track',
			style: {
				...trackStyle,
				'--ab-editor-per-view': perView,
			},
		},
		{
			allowedBlocks: ALLOWED,
			template: TEMPLATE,
			templateLock: false,
			orientation: 'horizontal',
			renderAppender: InnerBlocks.ButtonBlockAppender,
		}
	);

	const multiPerView = effect !== 'fade';

	const pageCount = maxIndex + 1;
	const activePage = Math.min( active, maxIndex );

	/* ── Settings tab: structure/behaviour panels (colors live in Styles) ── */
	const leading = (
		<>
			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ true }
			>
				<ABSelectControl
					label={ __( 'Effect', 'axiom-blocks' ) }
					value={ effect || 'slide' }
					options={ [
						{
							label: __( 'Slide', 'axiom-blocks' ),
							value: 'slide',
						},
						{
							label: __( 'Fade', 'axiom-blocks' ),
							value: 'fade',
						},
						{
							label: __( 'Coverflow', 'axiom-blocks' ),
							value: 'coverflow',
						},
					] }
					onChange={ ( v ) => setAttributes( { effect: v } ) }
				/>
				{ effect === 'slide' && (
					<ABSelectControl
						label={ __( 'Orientation', 'axiom-blocks' ) }
						help={
							isVertical
								? __(
										'Vertical needs a slider height (set below).',
										'axiom-blocks'
								  )
								: undefined
						}
						value={ orientation || 'horizontal' }
						options={ [
							{
								label: __( 'Horizontal', 'axiom-blocks' ),
								value: 'horizontal',
							},
							{
								label: __( 'Vertical', 'axiom-blocks' ),
								value: 'vertical',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { orientation: v } )
						}
					/>
				) }
				{ multiPerView && (
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="slidesPerView"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __(
									'Slides per view',
									'axiom-blocks'
								) }
								help={
									device === 'Desktop'
										? __(
												'How many slides show at once.',
												'axiom-blocks'
										  )
										: __(
												'0 = inherit from a larger screen.',
												'axiom-blocks'
										  )
								}
								value={
									value === '' || value == null
										? device === 'Desktop'
											? inherited ?? 1
											: 0
										: value
								}
								onChange={ ( v ) => setValue( v ) }
								min={ device === 'Desktop' ? 1 : 0 }
								max={ 6 }
								step={ 1 }
								unit=""
							/>
						) }
					</ABResponsive>
				) }
				{ effect === 'slide' && (
					<ABRangeControl
						label={ __( 'Slides to scroll', 'axiom-blocks' ) }
						help={ __(
							'How many slides advance per arrow/swipe.',
							'axiom-blocks'
						) }
						value={ slidesToScroll ?? 1 }
						onChange={ ( v ) =>
							setAttributes( {
								slidesToScroll: Math.max( 1, v ?? 1 ),
							} )
						}
						min={ 1 }
						max={ 6 }
						step={ 1 }
						unit=""
					/>
				) }
				{ effect === 'fade' && (
					<p className="ab-help-note">
						{ __(
							'Fade shows one slide at a time.',
							'axiom-blocks'
						) }
					</p>
				) }
				<ABRangeControl
					label={ __( 'Gap between slides', 'axiom-blocks' ) }
					value={ fromPx( gap, 16 ) }
					onChange={ ( v ) =>
						setAttributes( { gap: toPx( v ) } )
					}
					min={ 0 }
					max={ 80 }
					step={ 1 }
					unit="px"
				/>
				<ABRangeControl
					label={ __( 'Slider height', 'axiom-blocks' ) }
					help={ __(
						'0 = auto (fit slide content).',
						'axiom-blocks'
					) }
					value={ fromPx( sliderHeight, 0 ) }
					onChange={ ( v ) =>
						setAttributes( {
							sliderHeight: v ? toPx( v ) : '',
						} )
					}
					min={ 0 }
					max={ 900 }
					step={ 10 }
					unit="px"
				/>
				{ effect !== 'coverflow' && ! isVertical && (
					<ABToggleControl
						label={ __( 'Adaptive height', 'axiom-blocks' ) }
						help={ __(
							'Resize the slider to the current slide instead of the tallest.',
							'axiom-blocks'
						) }
						checked={ !! adaptiveHeight }
						onChange={ ( v ) =>
							setAttributes( { adaptiveHeight: v } )
						}
					/>
				) }
			</PanelBody>

			<PanelBody
				title={ __( 'Behaviour', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Autoplay', 'axiom-blocks' ) }
					checked={ !! autoplay }
					onChange={ ( v ) => setAttributes( { autoplay: v } ) }
				/>
				{ autoplay && (
					<>
						<ABRangeControl
							label={ __( 'Autoplay delay', 'axiom-blocks' ) }
							value={ autoplaySpeed ?? 4000 }
							onChange={ ( v ) =>
								setAttributes( { autoplaySpeed: v ?? 0 } )
							}
							min={ 1000 }
							max={ 10000 }
							step={ 250 }
							unit="ms"
						/>
						<ABToggleControl
							label={ __( 'Pause on hover', 'axiom-blocks' ) }
							checked={ !! pauseOnHover }
							onChange={ ( v ) =>
								setAttributes( { pauseOnHover: v } )
							}
						/>
						<ABToggleControl
							label={ __(
								'Play / pause button',
								'axiom-blocks'
							) }
							help={ __(
								'Accessible control to stop the autoplay (recommended).',
								'axiom-blocks'
							) }
							checked={ !! showPauseButton }
							onChange={ ( v ) =>
								setAttributes( { showPauseButton: v } )
							}
						/>
					</>
				) }
				<ABToggleControl
					label={ __( 'Loop', 'axiom-blocks' ) }
					checked={ !! loop }
					onChange={ ( v ) => setAttributes( { loop: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Draggable / swipe', 'axiom-blocks' ) }
					checked={ !! draggable }
					onChange={ ( v ) => setAttributes( { draggable: v } ) }
				/>
				<ABRangeControl
					label={ __( 'Transition speed', 'axiom-blocks' ) }
					value={ slideSpeed ?? 500 }
					onChange={ ( v ) =>
						setAttributes( { slideSpeed: v ?? 0 } )
					}
					min={ 0 }
					max={ 2000 }
					step={ 50 }
					unit="ms"
				/>
				<ABToggleControl
					label={ __( 'Lightbox on click', 'axiom-blocks' ) }
					help={ __(
						'Click an image inside a slide to open it full-size.',
						'axiom-blocks'
					) }
					checked={ !! lightbox }
					onChange={ ( v ) => setAttributes( { lightbox: v } ) }
				/>
			</PanelBody>

			<PanelBody
				title={ __( 'Navigation', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABToggleControl
					label={ __( 'Show arrows', 'axiom-blocks' ) }
					checked={ !! showArrows }
					onChange={ ( v ) => setAttributes( { showArrows: v } ) }
				/>
				{ showArrows && (
					<ABRangeControl
						label={ __(
							'Arrow side spacing',
							'axiom-blocks'
						) }
						help={ __(
							'Distance from the left/right edge.',
							'axiom-blocks'
						) }
						value={ fromPx( arrowOffset, 10 ) }
						onChange={ ( v ) =>
							setAttributes( { arrowOffset: toPx( v ) } )
						}
						min={ 0 }
						max={ 60 }
						step={ 1 }
						unit="px"
					/>
				) }
				<ABToggleControl
					label={ __( 'Show pagination', 'axiom-blocks' ) }
					checked={ !! showDots }
					onChange={ ( v ) => setAttributes( { showDots: v } ) }
				/>
				{ showDots && (
					<>
						<ABSelectControl
							label={ __(
								'Pagination style',
								'axiom-blocks'
							) }
							value={ paginationType || 'bullets' }
							options={ [
								{
									label: __( 'Dots', 'axiom-blocks' ),
									value: 'bullets',
								},
								{
									label: __(
										'Fraction (1 / 5)',
										'axiom-blocks'
									),
									value: 'fraction',
								},
								{
									label: __(
										'Progress bar',
										'axiom-blocks'
									),
									value: 'progress',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { paginationType: v } )
							}
						/>
						<ABRangeControl
							label={ __(
								'Spacing above pagination',
								'axiom-blocks'
							) }
							help={ __(
								'Gap between the slide content and the pagination.',
								'axiom-blocks'
							) }
							value={ fromPx( paginationGap, 14 ) }
							onChange={ ( v ) =>
								setAttributes( {
									paginationGap: toPx( v ),
								} )
							}
							min={ 0 }
							max={ 80 }
							step={ 1 }
							unit="px"
						/>
						{ paginationType === 'bullets' && (
							<ABRangeControl
								label={ __(
									'Space between dots',
									'axiom-blocks'
								) }
								value={ fromPx( dotGap, 8 ) }
								onChange={ ( v ) =>
									setAttributes( { dotGap: toPx( v ) } )
								}
								min={ 0 }
								max={ 32 }
								step={ 1 }
								unit="px"
							/>
						) }
					</>
				) }
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ leading }
			/>

			<div { ...blockProps }>
				<div className="ab-slider__viewport" style={ viewportStyle }>
					<div { ...innerBlocksProps } />

					{ showArrows && slideCount > 1 && (
						<>
							<button
								type="button"
								className="ab-slider__arrow ab-slider__arrow--prev"
								aria-label={ __(
									'Previous slide',
									'axiom-blocks'
								) }
								onClick={ goPrev }
								disabled={ ! loop && active <= 0 }
							>
								{ isVertical ? ChevronUp : ChevronPrev }
							</button>
							<button
								type="button"
								className="ab-slider__arrow ab-slider__arrow--next"
								aria-label={ __(
									'Next slide',
									'axiom-blocks'
								) }
								onClick={ goNext }
								disabled={ ! loop && active >= maxIndex }
							>
								{ isVertical ? ChevronDown : ChevronNext }
							</button>
						</>
					) }

					{ autoplay && showPauseButton && (
						<button
							type="button"
							className="ab-slider__pause"
							aria-label={ __(
								'Pause autoplay',
								'axiom-blocks'
							) }
							tabIndex={ -1 }
						>
							{ IconPause }
						</button>
					) }
				</div>

				{ showDots && slideCount > 1 && (
					<div
						className={ `ab-slider__pagination ab-slider__pagination--${
							paginationType || 'bullets'
						}` }
					>
						{ paginationType === 'fraction' && (
							<>
								<span className="ab-slider__frac-current">
									{ activePage + 1 }
								</span>
								{ ' / ' }
								<span className="ab-slider__frac-total">
									{ slideCount }
								</span>
							</>
						) }
						{ paginationType === 'progress' && (
							<div
								className="ab-slider__progress-bar"
								style={ {
									width: `${
										maxIndex <= 0
											? 100
											: ( active / maxIndex ) * 100
									}%`,
								} }
							/>
						) }
						{ ( ! paginationType ||
							paginationType === 'bullets' ) &&
							Array.from( { length: pageCount } ).map(
								( _, i ) => (
									<button
										key={ i }
										type="button"
										className={ `ab-slider__dot${
											i === activePage ? ' is-active' : ''
										}` }
										aria-label={ __(
											'Go to slide',
											'axiom-blocks'
										) }
										onClick={ () => setActive( i ) }
									/>
								)
							) }
					</div>
				) }
			</div>
		</>
	);
}

export const ContentSlider = {
	name: 'axiom-blocks/content-slider',
	settings: {
		title: __( 'Content Slider', 'axiom-blocks' ),
		description: __(
			'A content slider with slide, fade, and coverflow effects — any blocks per slide.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="content-slider" />,
		edit: SliderEdit,
		save: () => <InnerBlocks.Content />,
	},
};
