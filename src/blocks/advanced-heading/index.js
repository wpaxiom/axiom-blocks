import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABSubAccordion,
} from '../../components/ABControls';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { useDeviceType } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveAlignValue,
	responsiveVarValue,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';

/* Accent bar alignment is margin-based (auto margins), so it needs two maps. */
const ACCENT_ML_MAP = { left: '0', center: 'auto', right: 'auto' };
const ACCENT_MR_MAP = { left: 'auto', center: 'auto', right: '0' };
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import { HIGHLIGHT_FORMAT } from './format';
import metadata from './block.json';

/* Slider helpers: attributes store px strings ('' = inherit). */
const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

const TAG_OPTIONS = [
	{ label: 'H1', value: 'h1' },
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
	{ label: 'H5', value: 'h5' },
	{ label: 'H6', value: 'h6' },
	{ label: __( 'Paragraph', 'axiom-blocks' ), value: 'p' },
	{ label: __( 'Div', 'axiom-blocks' ), value: 'div' },
];

export function getHeadingVars( attributes ) {
	const {
		highlightColor,
		highlightBg,
		linkColor,
		linkHoverColor,
		accentColor,
		accentWidth,
		accentThickness,
	} = attributes;
	return {
		'--ab-ah-hl-color': highlightColor || undefined,
		'--ab-ah-hl-bg': highlightBg || undefined,
		'--ab-ah-link': linkColor || undefined,
		'--ab-ah-link-h': linkHoverColor || undefined,
		'--ab-ah-accent-color': accentColor || undefined,
		'--ab-ah-accent-w': accentWidth || undefined,
		'--ab-ah-accent-h': accentThickness || undefined,
	};
}

function AdvancedHeadingEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'advanced-heading' ) ) {
		return <DisabledBlockMessage blockName="Advanced Heading" />;
	}

	const {
		headingText,
		tagName,
		subEnabled,
		subText,
		subTag,
		subPosition,
		highlightColor,
		highlightBg,
		accentEnabled,
		accentPosition,
		accentAlign,
		accentWidth,
		accentThickness,
		accentColor,
		headingColor,
		subColor,
		linkColor,
		linkHoverColor,
	} = attributes;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: 'ab-ah',
		style: {
			...getHeadingVars( attributes ),
			...useSpacingStyle( attributes ),
			'--ab-ah-accent-w': responsiveVarValue(
				attributes,
				'accentWidth',
				device
			),
			'--ab-ah-accent-h': responsiveVarValue(
				attributes,
				'accentThickness',
				device
			),
		},
	} );

	const headingStyle = {
		color: headingColor || undefined,
		...useTypographyStyle( attributes, 'heading' ),
	};
	const subStyle = {
		color: subColor || undefined,
		...useTypographyStyle( attributes, 'sub' ),
	};

	const accent = accentEnabled && (
		<span
			className={ `ab-ah__accent is-accent-${ accentAlign }` }
			aria-hidden="true"
			style={ {
				marginLeft: responsiveAlignValue(
					attributes,
					'accentAlign',
					device,
					ACCENT_ML_MAP
				),
				marginRight: responsiveAlignValue(
					attributes,
					'accentAlign',
					device,
					ACCENT_MR_MAP
				),
			} }
		/>
	);

	const sub = subEnabled && (
		<RichText
			tagName={ subTag }
			className="ab-ah__sub"
			value={ subText }
			onChange={ ( v ) => setAttributes( { subText: v } ) }
			placeholder={ __( 'Sub-heading…', 'axiom-blocks' ) }
			style={ subStyle }
			allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
		/>
	);

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Heading', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'HTML tag', 'axiom-blocks' ) }
						value={ tagName }
						options={ TAG_OPTIONS }
						onChange={ ( v ) => setAttributes( { tagName: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Sub-heading', 'axiom-blocks' ) }
						checked={ !! subEnabled }
						onChange={ ( v ) => setAttributes( { subEnabled: v } ) }
						help={ __(
							'Adds a second line above or below the heading.',
							'axiom-blocks'
						) }
					/>
					{ subEnabled && (
						<>
							<ABSelectControl
								label={ __(
									'Sub-heading tag',
									'axiom-blocks'
								) }
								value={ subTag }
								options={ TAG_OPTIONS }
								onChange={ ( v ) =>
									setAttributes( { subTag: v } )
								}
							/>
							<ABSelectControl
								label={ __(
									'Sub-heading position',
									'axiom-blocks'
								) }
								value={ subPosition }
								options={ [
									{
										label: __(
											'Above heading',
											'axiom-blocks'
										),
										value: 'above',
									},
									{
										label: __(
											'Below heading',
											'axiom-blocks'
										),
										value: 'below',
									},
								] }
								onChange={ ( v ) =>
									setAttributes( { subPosition: v } )
								}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Highlight', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<p className="ab-ctrl__help" style={ { marginTop: 0 } }>
						{ __(
							'Select text in the heading and click the Highlight button in the toolbar. These colours style every highlight.',
							'axiom-blocks'
						) }
					</p>
					<ABColorControl
						label={ __( 'Highlight text', 'axiom-blocks' ) }
						color={ highlightColor }
						onChange={ ( v ) =>
							setAttributes( { highlightColor: v } )
						}
					/>
					<ABColorControl
						label={ __( 'Highlight background', 'axiom-blocks' ) }
						color={ highlightBg }
						onChange={ ( v ) =>
							setAttributes( { highlightBg: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Accent line', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show accent line', 'axiom-blocks' ) }
						checked={ !! accentEnabled }
						onChange={ ( v ) =>
							setAttributes( { accentEnabled: v } )
						}
					/>
					{ accentEnabled && (
						<>
							<ABSelectControl
								label={ __( 'Position', 'axiom-blocks' ) }
								value={ accentPosition }
								options={ [
									{
										label: __(
											'Above heading',
											'axiom-blocks'
										),
										value: 'above',
									},
									{
										label: __(
											'Below heading',
											'axiom-blocks'
										),
										value: 'below',
									},
								] }
								onChange={ ( v ) =>
									setAttributes( { accentPosition: v } )
								}
							/>
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="accentAlign"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABSelectControl
										label={ __( 'Alignment', 'axiom-blocks' ) }
										value={
											value !== '' && value != null
												? value
												: inherited ?? 'left'
										}
										options={ [
											{
												label: __(
													'Left',
													'axiom-blocks'
												),
												value: 'left',
											},
											{
												label: __(
													'Center',
													'axiom-blocks'
												),
												value: 'center',
											},
											{
												label: __(
													'Right',
													'axiom-blocks'
												),
												value: 'right',
											},
										] }
										onChange={ setValue }
									/>
								) }
							</ABResponsive>
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="accentWidth"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABRangeControl
										label={ __( 'Width', 'axiom-blocks' ) }
										value={ fromPx(
											value !== '' && value != null
												? value
												: inherited,
											60
										) }
										onChange={ ( v ) =>
											setValue( toPx( v ) )
										}
										min={ 10 }
										max={ 400 }
										step={ 1 }
										unit="px"
									/>
								) }
							</ABResponsive>
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="accentThickness"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABRangeControl
										label={ __(
											'Thickness',
											'axiom-blocks'
										) }
										value={ fromPx(
											value !== '' && value != null
												? value
												: inherited,
											4
										) }
										onChange={ ( v ) =>
											setValue( toPx( v ) )
										}
										min={ 1 }
										max={ 20 }
										step={ 1 }
										unit="px"
									/>
								) }
							</ABResponsive>
							<ABColorControl
								label={ __( 'Colour', 'axiom-blocks' ) }
								color={ accentColor }
								onChange={ ( v ) =>
									setAttributes( { accentColor: v } )
								}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Colours', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Heading', 'axiom-blocks' ) }
						color={ headingColor }
						onChange={ ( v ) =>
							setAttributes( { headingColor: v } )
						}
					/>
					{ subEnabled && (
						<ABColorControl
							label={ __( 'Sub-heading', 'axiom-blocks' ) }
							color={ subColor }
							onChange={ ( v ) =>
								setAttributes( { subColor: v } )
							}
						/>
					) }
					<ABColorControl
						label={ __( 'Link', 'axiom-blocks' ) }
						color={ linkColor }
						onChange={ ( v ) => setAttributes( { linkColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Link hover', 'axiom-blocks' ) }
						color={ linkHoverColor }
						onChange={ ( v ) =>
							setAttributes( { linkHoverColor: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion
							title={ __( 'Heading', 'axiom-blocks' ) }
							defaultOpen
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="heading"
								unwrapped
								responsive
							/>
						</ABSubAccordion>
						{ subEnabled && (
							<ABSubAccordion
								title={ __( 'Sub-heading', 'axiom-blocks' ) }
							>
								<TypographyPanel
									attributes={ attributes }
									setAttributes={ setAttributes }
									prefix="sub"
									unwrapped
									responsive
								/>
							</ABSubAccordion>
						) }
					</div>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ subEnabled && 'above' === subPosition && sub }
				{ accentEnabled && 'above' === accentPosition && accent }
				<RichText
					tagName={ tagName }
					className="ab-ah__heading"
					value={ headingText }
					onChange={ ( v ) => setAttributes( { headingText: v } ) }
					placeholder={ __( 'Heading…', 'axiom-blocks' ) }
					style={ headingStyle }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						'core/link',
						HIGHLIGHT_FORMAT,
					] }
				/>
				{ accentEnabled && 'below' === accentPosition && accent }
				{ subEnabled && 'below' === subPosition && sub }
			</div>
		</>
	);
}

export const AdvancedHeading = {
	name: 'axiom-blocks/advanced-heading',
	settings: {
		title: __( 'Advanced Heading', 'axiom-blocks' ),
		description: __(
			'Heading with highlight spans, an optional sub-heading, and an accent line.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="advanced-heading" />,
		edit: AdvancedHeadingEdit,
		save: ( { attributes } ) => {
			const {
				headingText,
				tagName,
				subEnabled,
				subText,
				subTag,
				subPosition,
			} = attributes;
			const blockProps = useBlockProps.save( { className: 'ab-ah' } );
			const sub =
				subEnabled && subText ? (
					<RichText.Content
						tagName={ subTag }
						className="ab-ah__sub"
						value={ subText }
					/>
				) : null;
			return (
				<div { ...blockProps }>
					{ 'above' === subPosition && sub }
					<RichText.Content
						tagName={ tagName }
						className="ab-ah__heading"
						value={ headingText }
					/>
					{ 'below' === subPosition && sub }
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
