import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABTextControl,
	ABRangeControl,
	ABSubAccordion,
} from '../../components/ABControls';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

const stripTags = ( html ) =>
	String( html || '' )
		.replace( /<[^>]+>/g, '' )
		.trim();

/* Real CSS fallbacks so the inspector swatches show the shipping defaults. */
const COLOR_DEFAULTS = {
	light: {
		bgColor: '#ffffff',
		textColor: '#475569',
		linkHoverColor: '#0f172a',
		activeColor: '#7c3aed',
		markerColor: '#94a3b8',
		progressColor: '#7c3aed',
		borderColor: '#e2e8f0',
	},
	dark: {
		bgColor: '#0f1e38',
		textColor: '#b7c4da',
		linkHoverColor: '#ffffff',
		activeColor: '#a78bfa',
		markerColor: '#64748b',
		progressColor: '#a78bfa',
		borderColor: '#22304f',
	},
};

const ChevronIcon = () => (
	<svg
		width="15"
		height="15"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M6 9l6 6 6-6" />
	</svg>
);

const UpIcon = () => (
	<svg
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		<path d="M12 19V5" />
		<path d="M5 12l7-7 7 7" />
	</svg>
);

export function getTocVars( attributes ) {
	const {
		bgColor,
		textColor,
		linkHoverColor,
		activeColor,
		markerColor,
		progressColor,
		borderColor,
		borderWidth,
		borderRadius,
		indent,
		itemGap,
	} = attributes;
	return {
		'--ab-toc-bg': bgColor || undefined,
		'--ab-toc-link': textColor || undefined,
		'--ab-toc-link-hover': linkHoverColor || undefined,
		'--ab-toc-active': activeColor || undefined,
		'--ab-toc-marker': markerColor || undefined,
		'--ab-toc-progress': progressColor || undefined,
		'--ab-toc-border': borderColor || undefined,
		'--ab-toc-bw': borderWidth || undefined,
		'--ab-toc-radius': borderRadius || undefined,
		'--ab-toc-indent': indent || undefined,
		'--ab-toc-gap': itemGap || undefined,
	};
}

function TocEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'table-of-contents' ) ) {
		return <DisabledBlockMessage blockName="Table of Contents" />;
	}

	const {
		eyebrow,
		title,
		showTitle,
		titleTag,
		colorScheme,
		markerType,
		numberPrefix,
		collapsible,
		showSectionCount,
		sticky,
		hideOnMobile,
		mobileDock,
		footerBackToTop,
		backToTop,
		sectionProgress,
	} = attributes;

	const isDark = colorScheme === 'dark';
	const swatchDefaults = COLOR_DEFAULTS[ isDark ? 'dark' : 'light' ];

	const levels = [ 1, 2, 3, 4, 5, 6 ].filter(
		( n ) => attributes[ `levelH${ n }` ]
	);
	const activeLevels = levels.length ? levels : [ 2, 3, 4 ];

	const headings = useSelect( ( select ) => {
		const store = select( 'core/block-editor' );
		const ids = store.getClientIdsWithDescendants();
		const out = [];
		ids.forEach( ( id ) => {
			const b = store.getBlock( id );
			if ( b && b.name === 'core/heading' ) {
				const text = stripTags( b.attributes.content );
				if ( text ) {
					out.push( {
						level: b.attributes.level || 2,
						text,
					} );
				}
			}
		} );
		return out;
	}, [] );

	const items = headings.filter( ( h ) => activeLevels.includes( h.level ) );
	const minLevel = items.length
		? Math.min( ...items.map( ( h ) => h.level ) )
		: 0;

	const blockProps = useBlockProps( {
		className: [ 'ab-toc', `ab-toc--${ markerType }` ]
			.concat( sectionProgress ? [ 'ab-toc--progress' ] : [] )
			.concat( collapsible ? [ 'ab-toc--collapsible' ] : [] )
			.concat( isDark ? [ 'ab-toc--dark' ] : [] )
			.join( ' ' ),
		style: {
			...getTocVars( attributes ),
			...useSpacingStyle( attributes ),
		},
	} );

	const titleTypoStyle = useTypographyStyle( attributes, 'title' );
	const contentTypoStyle = useTypographyStyle( attributes, 'content' );

	const levelToggle = ( n ) => (
		<ABToggleControl
			key={ n }
			label={ `H${ n }` }
			checked={ !! attributes[ `levelH${ n }` ] }
			onChange={ ( v ) => setAttributes( { [ `levelH${ n }` ]: v } ) }
		/>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Structure', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABTextControl
						label={ __( 'Eyebrow label', 'axiom-blocks' ) }
						value={ eyebrow }
						onChange={ ( v ) => setAttributes( { eyebrow: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Show title', 'axiom-blocks' ) }
						help={ __(
							'A larger heading below the eyebrow.',
							'axiom-blocks'
						) }
						checked={ !! showTitle }
						onChange={ ( v ) => setAttributes( { showTitle: v } ) }
					/>
					{ showTitle && (
						<ABSelectControl
							label={ __( 'Title tag', 'axiom-blocks' ) }
							value={ titleTag }
							options={ [
								{ label: 'H2', value: 'h2' },
								{ label: 'H3', value: 'h3' },
								{ label: 'H4', value: 'h4' },
								{ label: 'H5', value: 'h5' },
								{ label: 'H6', value: 'h6' },
								{
									label: __( 'Plain', 'axiom-blocks' ),
									value: 'div',
								},
							] }
							onChange={ ( v ) =>
								setAttributes( { titleTag: v } )
							}
						/>
					) }
					<p className="ab-toc__control-label">
						{ __( 'Include heading levels', 'axiom-blocks' ) }
					</p>
					<div className="ab-toc__level-grid">
						{ [ 1, 2, 3, 4, 5, 6 ].map( levelToggle ) }
					</div>
					<ABSelectControl
						label={ __( 'List marker', 'axiom-blocks' ) }
						value={ markerType }
						options={ [
							{
								label: __( 'Numbered', 'axiom-blocks' ),
								value: 'numbered',
							},
							{
								label: __( 'Bullet', 'axiom-blocks' ),
								value: 'bullet',
							},
							{
								label: __( 'None', 'axiom-blocks' ),
								value: 'none',
							},
						] }
						onChange={ ( v ) => setAttributes( { markerType: v } ) }
					/>
					{ markerType === 'numbered' && (
						<ABTextControl
							label={ __( 'Number prefix', 'axiom-blocks' ) }
							help={ __(
								'Text before each number, e.g. "Step ".',
								'axiom-blocks'
							) }
							value={ numberPrefix }
							onChange={ ( v ) =>
								setAttributes( { numberPrefix: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Behaviour', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Smooth scroll', 'axiom-blocks' ) }
						checked={ !! attributes.smoothScroll }
						onChange={ ( v ) =>
							setAttributes( { smoothScroll: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Scroll offset', 'axiom-blocks' ) }
						help={ __(
							'Extra space above the target â€” clear a fixed header.',
							'axiom-blocks'
						) }
						value={ attributes.scrollOffset || 0 }
						onChange={ ( v ) =>
							setAttributes( { scrollOffset: v } )
						}
						min={ 0 }
						max={ 200 }
						step={ 1 }
						unit="px"
					/>
					<ABToggleControl
						label={ __(
							'Highlight active section',
							'axiom-blocks'
						) }
						help={ __(
							'Marks the item for the section in view.',
							'axiom-blocks'
						) }
						checked={ !! attributes.scrollSpy }
						onChange={ ( v ) => setAttributes( { scrollSpy: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Reading-progress rail', 'axiom-blocks' ) }
						help={ __(
							'A sliding purple rail follows the section in view.',
							'axiom-blocks'
						) }
						checked={ !! sectionProgress }
						onChange={ ( v ) =>
							setAttributes( { sectionProgress: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Collapsible', 'axiom-blocks' ) }
						checked={ !! collapsible }
						onChange={ ( v ) =>
							setAttributes( { collapsible: v } )
						}
					/>
					{ collapsible && (
						<>
							<ABToggleControl
								label={ __(
									'Start collapsed',
									'axiom-blocks'
								) }
								checked={ !! attributes.initialCollapsed }
								onChange={ ( v ) =>
									setAttributes( { initialCollapsed: v } )
								}
							/>
							<ABToggleControl
								label={ __(
									'Show section count',
									'axiom-blocks'
								) }
								checked={ !! showSectionCount }
								onChange={ ( v ) =>
									setAttributes( { showSectionCount: v } )
								}
							/>
						</>
					) }
					<ABToggleControl
						label={ __( 'Sticky on scroll', 'axiom-blocks' ) }
						checked={ !! sticky }
						onChange={ ( v ) => setAttributes( { sticky: v } ) }
					/>
					{ sticky && (
						<>
							<ABRangeControl
								label={ __(
									'Sticky top offset',
									'axiom-blocks'
								) }
								value={ attributes.stickyOffset || 0 }
								onChange={ ( v ) =>
									setAttributes( { stickyOffset: v } )
								}
								min={ 0 }
								max={ 160 }
								step={ 1 }
								unit="px"
							/>
							<ABToggleControl
								label={ __(
									'Disable sticky on mobile',
									'axiom-blocks'
								) }
								checked={ !! hideOnMobile }
								onChange={ ( v ) =>
									setAttributes( { hideOnMobile: v } )
								}
							/>
							{ ! hideOnMobile && (
								<ABToggleControl
									label={ __(
										'Mobile dock bar',
										'axiom-blocks'
									) }
									help={ __(
										'On phones, dock as a bar that opens a bottom sheet.',
										'axiom-blocks'
									) }
									checked={ !! mobileDock }
									onChange={ ( v ) =>
										setAttributes( { mobileDock: v } )
									}
								/>
							) }
						</>
					) }
					<ABToggleControl
						label={ __( 'Copy-link on each item', 'axiom-blocks' ) }
						help={ __(
							'Adds a button to copy a direct link to the heading.',
							'axiom-blocks'
						) }
						checked={ !! attributes.copyLink }
						onChange={ ( v ) => setAttributes( { copyLink: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Footer back-to-top', 'axiom-blocks' ) }
						help={ __(
							'A "Back to top" link inside the panel footer.',
							'axiom-blocks'
						) }
						checked={ !! footerBackToTop }
						onChange={ ( v ) =>
							setAttributes( { footerBackToTop: v } )
						}
					/>
					<ABToggleControl
						label={ __(
							'Floating back-to-top button',
							'axiom-blocks'
						) }
						checked={ !! backToTop }
						onChange={ ( v ) => setAttributes( { backToTop: v } ) }
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Colours', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Colour scheme', 'axiom-blocks' ) }
						value={ colorScheme }
						options={ [
							{
								label: __( 'Light', 'axiom-blocks' ),
								value: 'light',
							},
							{
								label: __( 'Dark', 'axiom-blocks' ),
								value: 'dark',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { colorScheme: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ attributes.bgColor }
						fallbackColor={ swatchDefaults.bgColor }
						onChange={ ( v ) => setAttributes( { bgColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Link', 'axiom-blocks' ) }
						color={ attributes.textColor }
						fallbackColor={ swatchDefaults.textColor }
						onChange={ ( v ) => setAttributes( { textColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Link hover', 'axiom-blocks' ) }
						color={ attributes.linkHoverColor }
						fallbackColor={ swatchDefaults.linkHoverColor }
						onChange={ ( v ) =>
							setAttributes( { linkHoverColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Active section', 'axiom-blocks' ) }
						color={ attributes.activeColor }
						fallbackColor={ swatchDefaults.activeColor }
						onChange={ ( v ) =>
							setAttributes( { activeColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Marker', 'axiom-blocks' ) }
						color={ attributes.markerColor }
						fallbackColor={ swatchDefaults.markerColor }
						onChange={ ( v ) =>
							setAttributes( { markerColor: v } )
						}
					/>
					{ sectionProgress && (
						<ABColorControl
							label={ __( 'Progress', 'axiom-blocks' ) }
							color={ attributes.progressColor }
							fallbackColor={ swatchDefaults.progressColor }
							onChange={ ( v ) =>
								setAttributes( { progressColor: v } )
							}
						/>
					) }
					<ABColorControl
						label={ __( 'Border', 'axiom-blocks' ) }
						color={ attributes.borderColor }
						fallbackColor={ swatchDefaults.borderColor }
						onChange={ ( v ) =>
							setAttributes( { borderColor: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Border width', 'axiom-blocks' ) }
						value={ fromPx( attributes.borderWidth, 1 ) }
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
						value={ fromPx( attributes.borderRadius, 12 ) }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 32 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'List layout', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABRangeControl
						label={ __( 'Nesting indent', 'axiom-blocks' ) }
						value={ fromPx( attributes.indent, 20 ) }
						onChange={ ( v ) =>
							setAttributes( { indent: toPx( v ) } )
						}
						min={ 0 }
						max={ 48 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Item spacing', 'axiom-blocks' ) }
						value={ fromPx( attributes.itemGap, 2 ) }
						onChange={ ( v ) =>
							setAttributes( { itemGap: toPx( v ) } )
						}
						min={ 0 }
						max={ 32 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion title={ __( 'Title', 'axiom-blocks' ) }>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="title"
								unwrapped
								responsive
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'List items', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="content"
								unwrapped
								responsive
							/>
						</ABSubAccordion>
					</div>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<nav { ...blockProps }>
				<div className="ab-toc__head">
					<div className="ab-toc__head-titles">
						<RichText
							tagName="p"
							className="ab-toc__eyebrow"
							value={ eyebrow }
							onChange={ ( v ) =>
								setAttributes( { eyebrow: v } )
							}
							placeholder={ __( 'On this page', 'axiom-blocks' ) }
							allowedFormats={ [] }
						/>
						{ showTitle && (
							<RichText
								tagName={
									titleTag === 'div' ? 'div' : titleTag
								}
								className="ab-toc__title"
								value={ title }
								onChange={ ( v ) =>
									setAttributes( { title: v } )
								}
								placeholder={ __(
									'In this guide',
									'axiom-blocks'
								) }
								allowedFormats={ [
									'core/bold',
									'core/italic',
								] }
								style={ titleTypoStyle }
							/>
						) }
					</div>
					{ collapsible && (
						<button
							type="button"
							className="ab-toc__toggle"
							tabIndex={ -1 }
							aria-hidden="true"
						>
							<ChevronIcon />
						</button>
					) }
				</div>

				<div className="ab-toc__body">
					{ items.length === 0 ? (
						<div className="ab-toc__empty">
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
								<path d="M14 2v6h6" />
								<path d="M9 13h2" />
								<path d="M9 17h6" />
							</svg>
							<p>
								<strong>
									{ __( 'No headings yet', 'axiom-blocks' ) }
								</strong>
								{ __(
									'Add headings to your content and pick which levels to include â€” they will appear here automatically.',
									'axiom-blocks'
								) }
							</p>
						</div>
					) : (
						<ul
							className="ab-toc__list-ul"
							style={ contentTypoStyle }
						>
							{ items.map( ( h, i ) => (
								<li
									key={ i }
									className={ `ab-toc__item ab-toc__item--h${
										h.level
									}${ i === 0 ? ' is-active' : '' }` }
									style={ {
										'--ab-toc-depth': h.level - minLevel,
									} }
								>
									<span className="ab-toc__link">
										<span
											className="ab-toc__marker"
											aria-hidden="true"
											data-prefix={
												markerType === 'numbered' &&
												numberPrefix
													? numberPrefix
													: undefined
											}
										/>
										<span className="ab-toc__text">
											{ h.text }
										</span>
									</span>
								</li>
							) ) }
						</ul>
					) }
				</div>

				{ footerBackToTop && (
					<div className="ab-toc__foot">
						<button
							type="button"
							className="ab-toc__top"
							tabIndex={ -1 }
							aria-hidden="true"
						>
							<UpIcon />
							{ __( 'Back to top', 'axiom-blocks' ) }
						</button>
					</div>
				) }
			</nav>
		</>
	);
}

export const TableOfContents = {
	name: 'axiom-blocks/table-of-contents',
	settings: {
		title: __( 'Table of Contents', 'axiom-blocks' ),
		description: __(
			'Auto-generated table of contents from the page headings, with smooth scroll and active-section highlight.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="table-of-contents" />,
		edit: TocEdit,
		save: () => null,
	},
};
