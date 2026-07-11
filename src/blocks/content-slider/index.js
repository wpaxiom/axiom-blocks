import { __ } from '@wordpress/i18n';
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
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
} from '../../components/ABControls';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import { useDeviceType } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const ALLOWED = [ 'axiom-blocks/slide' ];
const TEMPLATE = [
	[ 'axiom-blocks/slide', {}, [ [ 'core/paragraph', { placeholder: __( 'Slide one…', 'axiom-blocks' ), align: 'center' } ] ] ],
];

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

/* Rendered defaults (mirror the CSS `var(…, fallback)` values) so the inspector
 * swatches show the real colour instead of empty when nothing is set. */
const COLOR_DEFAULTS = {
	arrowColor: '#ffffff',
	arrowBg: 'rgba(17, 17, 17, 0.55)',
	dotColor: 'rgba(17, 17, 17, 0.28)',
	dotActiveColor: '#7c3aed',
};

/* Editor mock icons — mirror the frontend view-script SVGs. */
const ChevronPrev = (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
);
const ChevronNext = (
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
);
const IconPause = (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
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
	} = attributes;
	// Concrete fallbacks (not `undefined`) so clearing a control resets the
	// inline custom property in the editor — React doesn't reliably remove
	// `--custom-properties`, which otherwise leaves a stale value (e.g. a
	// border that "won't turn off"). Colours keep `undefined` on purpose: their
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
		arrowColor,
		arrowBg,
		dotColor,
		dotActiveColor,
		borderColor,
		borderWidth,
		borderRadius,
	} = attributes;

	const isVertical = orientation === 'vertical';

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: getSliderClasses( attributes ).join( ' ' ),
		style: {
			...getSliderVars( attributes ),
			...useSpacingStyle( attributes ),
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
		transform: `translate${ axis }(calc(-${ active } * (100% + ${
			fromPx( gap, 16 )
		}px) / ${ perView }))`,
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

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Effect', 'axiom-blocks' ) }
						value={ effect || 'slide' }
						options={ [
							{ label: __( 'Slide', 'axiom-blocks' ), value: 'slide' },
							{ label: __( 'Fade', 'axiom-blocks' ), value: 'fade' },
							{ label: __( 'Coverflow', 'axiom-blocks' ), value: 'coverflow' },
						] }
						onChange={ ( v ) => setAttributes( { effect: v } ) }
					/>
					{ effect === 'slide' && (
						<ABSelectControl
							label={ __( 'Orientation', 'axiom-blocks' ) }
							help={
								isVertical
									? __( 'Vertical needs a slider height (set below).', 'axiom-blocks' )
									: undefined
							}
							value={ orientation || 'horizontal' }
							options={ [
								{ label: __( 'Horizontal', 'axiom-blocks' ), value: 'horizontal' },
								{ label: __( 'Vertical', 'axiom-blocks' ), value: 'vertical' },
							] }
							onChange={ ( v ) => setAttributes( { orientation: v } ) }
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
									label={ __( 'Slides per view', 'axiom-blocks' ) }
									help={
										device === 'Desktop'
											? __( 'How many slides show at once.', 'axiom-blocks' )
											: __( '0 = inherit from a larger screen.', 'axiom-blocks' )
									}
									value={
										value === '' || value == null
											? ( device === 'Desktop' ? ( inherited ?? 1 ) : 0 )
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
							help={ __( 'How many slides advance per arrow/swipe.', 'axiom-blocks' ) }
							value={ slidesToScroll ?? 1 }
							onChange={ ( v ) =>
								setAttributes( { slidesToScroll: Math.max( 1, v ?? 1 ) } )
							}
							min={ 1 }
							max={ 6 }
							step={ 1 }
							unit=""
						/>
					) }
					{ effect === 'fade' && (
						<p className="ab-help-note">
							{ __( 'Fade shows one slide at a time.', 'axiom-blocks' ) }
						</p>
					) }
					<ABRangeControl
						label={ __( 'Gap between slides', 'axiom-blocks' ) }
						value={ fromPx( gap, 16 ) }
						onChange={ ( v ) => setAttributes( { gap: toPx( v ) } ) }
						min={ 0 }
						max={ 80 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Slider height', 'axiom-blocks' ) }
						help={ __( '0 = auto (fit slide content).', 'axiom-blocks' ) }
						value={ fromPx( sliderHeight, 0 ) }
						onChange={ ( v ) =>
							setAttributes( { sliderHeight: v ? toPx( v ) : '' } )
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
							onChange={ ( v ) => setAttributes( { adaptiveHeight: v } ) }
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
								label={ __( 'Play / pause button', 'axiom-blocks' ) }
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
						onChange={ ( v ) => setAttributes( { slideSpeed: v ?? 0 } ) }
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
						<>
							<ABColorControl
								label={ __( 'Arrow colour', 'axiom-blocks' ) }
								color={ arrowColor }
								fallbackColor={ COLOR_DEFAULTS.arrowColor }
								onChange={ ( v ) =>
									setAttributes( { arrowColor: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Arrow background', 'axiom-blocks' ) }
								color={ arrowBg }
								fallbackColor={ COLOR_DEFAULTS.arrowBg }
								onChange={ ( v ) =>
									setAttributes( { arrowBg: v } )
								}
							/>
							<ABRangeControl
								label={ __( 'Arrow side spacing', 'axiom-blocks' ) }
								help={ __( 'Distance from the left/right edge.', 'axiom-blocks' ) }
								value={ fromPx( arrowOffset, 10 ) }
								onChange={ ( v ) =>
									setAttributes( { arrowOffset: toPx( v ) } )
								}
								min={ 0 }
								max={ 60 }
								step={ 1 }
								unit="px"
							/>
						</>
					) }
					<ABToggleControl
						label={ __( 'Show pagination', 'axiom-blocks' ) }
						checked={ !! showDots }
						onChange={ ( v ) => setAttributes( { showDots: v } ) }
					/>
					{ showDots && (
						<>
							<ABSelectControl
								label={ __( 'Pagination style', 'axiom-blocks' ) }
								value={ paginationType || 'bullets' }
								options={ [
									{ label: __( 'Dots', 'axiom-blocks' ), value: 'bullets' },
									{ label: __( 'Fraction (1 / 5)', 'axiom-blocks' ), value: 'fraction' },
									{ label: __( 'Progress bar', 'axiom-blocks' ), value: 'progress' },
								] }
								onChange={ ( v ) =>
									setAttributes( { paginationType: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Pagination colour', 'axiom-blocks' ) }
								color={ dotColor }
								fallbackColor={ COLOR_DEFAULTS.dotColor }
								onChange={ ( v ) =>
									setAttributes( { dotColor: v } )
								}
							/>
							<ABColorControl
								label={ __( 'Active colour', 'axiom-blocks' ) }
								color={ dotActiveColor }
								fallbackColor={ COLOR_DEFAULTS.dotActiveColor }
								onChange={ ( v ) =>
									setAttributes( { dotActiveColor: v } )
								}
							/>
							<ABRangeControl
								label={ __( 'Spacing above pagination', 'axiom-blocks' ) }
								help={ __( 'Gap between the slide content and the pagination.', 'axiom-blocks' ) }
								value={ fromPx( paginationGap, 14 ) }
								onChange={ ( v ) =>
									setAttributes( { paginationGap: toPx( v ) } )
								}
								min={ 0 }
								max={ 80 }
								step={ 1 }
								unit="px"
							/>
							{ paginationType === 'bullets' && (
								<ABRangeControl
									label={ __( 'Space between dots', 'axiom-blocks' ) }
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

				<PanelBody
					title={ __( 'Border', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Colour', 'axiom-blocks' ) }
						color={ borderColor }
						onChange={ ( v ) => setAttributes( { borderColor: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Width', 'axiom-blocks' ) }
						value={ fromPx( borderWidth, 0 ) }
						onChange={ ( v ) =>
							setAttributes( { borderWidth: toPx( v ) } )
						}
						min={ 0 }
						max={ 8 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Corner radius', 'axiom-blocks' ) }
						value={ fromPx( borderRadius, 0 ) }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 48 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<div className="ab-slider__viewport" style={ viewportStyle }>
					<div { ...innerBlocksProps } />

					{ showArrows && slideCount > 1 && (
						<>
							<button
								type="button"
								className="ab-slider__arrow ab-slider__arrow--prev"
								aria-label={ __( 'Previous slide', 'axiom-blocks' ) }
								onClick={ goPrev }
								disabled={ ! loop && active <= 0 }
							>
								{ ChevronPrev }
							</button>
							<button
								type="button"
								className="ab-slider__arrow ab-slider__arrow--next"
								aria-label={ __( 'Next slide', 'axiom-blocks' ) }
								onClick={ goNext }
								disabled={ ! loop && active >= maxIndex }
							>
								{ ChevronNext }
							</button>
						</>
					) }

					{ autoplay && showPauseButton && (
						<button
							type="button"
							className="ab-slider__pause"
							aria-label={ __( 'Pause autoplay', 'axiom-blocks' ) }
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
							Array.from( { length: pageCount } ).map( ( _, i ) => (
								<button
									key={ i }
									type="button"
									className={ `ab-slider__dot${
										i === activePage ? ' is-active' : ''
									}` }
									aria-label={ __( 'Go to slide', 'axiom-blocks' ) }
									onClick={ () => setActive( i ) }
								/>
							) ) }
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
