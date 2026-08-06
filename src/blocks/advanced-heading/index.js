import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
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
import {
	HIGHLIGHT_FORMAT,
	TEXT_COLOR_FORMAT,
	FONT_WEIGHT_FORMAT,
} from './format';
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

const POSITION_OPTIONS = [
	{ label: __( 'Above heading', 'axiom-blocks' ), value: 'above' },
	{ label: __( 'Below heading', 'axiom-blocks' ), value: 'below' },
];

export function getHeadingVars( attributes ) {
	const {
		highlightColor,
		highlightBg,
		highlightRadius,
		linkColor,
		linkHoverColor,
		accentColor,
		accentWidth,
		accentThickness,
		headingSubGap,
		headingMaxWidth,
	} = attributes;
	return {
		'--ab-ah-hl-color': highlightColor || undefined,
		'--ab-ah-hl-bg': highlightBg || undefined,
		'--ab-ah-hl-radius': highlightRadius || undefined,
		'--ab-ah-link': linkColor || undefined,
		'--ab-ah-link-h': linkHoverColor || undefined,
		'--ab-ah-accent-color': accentColor || undefined,
		'--ab-ah-accent-w': accentWidth || undefined,
		'--ab-ah-accent-h': accentThickness || undefined,
		'--ab-ah-sub-gap': headingSubGap || undefined,
		'--ab-ah-maxw': headingMaxWidth || undefined,
	};
}

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. Every binding maps to an
 * existing or additive attribute; the frozen save() markup is untouched. Built
 * per-render so the Sub-heading and Accent parts only appear when enabled. */
function buildDesign( { subEnabled, accentEnabled } ) {
	return {
		block: 'ah',
		targets: [
			{
				noun: __( 'Heading', 'axiom-blocks' ),
				colors: [
					{ label: __( 'Text', 'axiom-blocks' ), bind: 'headingColor' },
				],
				typography: 'heading',
				size: {
					bind: 'headingMaxWidth',
					label: __( 'Max width', 'axiom-blocks' ),
					responsive: true,
					defaultUnit: 'px',
				},
			},
			...( subEnabled
				? [
						{
							noun: __( 'Sub-heading', 'axiom-blocks' ),
							colors: [
								{
									label: __( 'Text', 'axiom-blocks' ),
									bind: 'subColor',
								},
							],
							typography: 'sub',
						},
				  ]
				: [] ),
			{
				noun: __( 'Highlight', 'axiom-blocks' ),
				colors: [
					{
						label: __( 'Text', 'axiom-blocks' ),
						bind: 'highlightColor',
					},
					{
						label: __( 'Background', 'axiom-blocks' ),
						bind: 'highlightBg',
					},
				],
				ranges: [
					{
						bind: 'highlightRadius',
						label: __( 'Radius', 'axiom-blocks' ),
						min: 0,
						max: 40,
						default: 0,
					},
				],
			},
			...( accentEnabled
				? [
						{
							noun: __( 'Accent', 'axiom-blocks' ),
							align: {
								bind: 'accentAlign',
								label: __( 'Alignment', 'axiom-blocks' ),
								responsive: true,
							},
							colors: [
								{
									label: __( 'Color', 'axiom-blocks' ),
									bind: 'accentColor',
								},
							],
							ranges: [
								{
									bind: 'accentWidth',
									label: __( 'Width', 'axiom-blocks' ),
									min: 10,
									max: 400,
									default: 60,
									responsive: true,
								},
								{
									bind: 'accentThickness',
									label: __( 'Thickness', 'axiom-blocks' ),
									min: 1,
									max: 20,
									default: 4,
									responsive: true,
								},
							],
						},
				  ]
				: [] ),
			{
				noun: __( 'Link', 'axiom-blocks' ),
				states: [ 'hover' ],
				colors: [
					{
						label: __( 'Color', 'axiom-blocks' ),
						bind: 'linkColor',
						stateBind: { hover: 'linkHoverColor' },
					},
				],
			},
		],
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
		accentEnabled,
		accentPosition,
		accentAlign,
		headingColor,
		subColor,
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
			'--ab-ah-sub-gap': responsiveVarValue(
				attributes,
				'headingSubGap',
				device
			),
			'--ab-ah-maxw': responsiveVarValue(
				attributes,
				'headingMaxWidth',
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
			className={ `ab-ah__sub ab-ah__sub--${
				'above' === subPosition ? 'above' : 'below'
			}` }
			value={ subText }
			onChange={ ( v ) => setAttributes( { subText: v } ) }
			placeholder={ __( 'Sub-heading…', 'axiom-blocks' ) }
			style={ subStyle }
			allowedFormats={ [
				'core/bold',
				'core/italic',
				'core/link',
				TEXT_COLOR_FORMAT,
				FONT_WEIGHT_FORMAT,
			] }
		/>
	);

	const settingsPanel = (
		<PanelBody title={ __( 'Heading', 'axiom-blocks' ) } initialOpen={ true }>
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
						label={ __( 'Sub-heading tag', 'axiom-blocks' ) }
						value={ subTag }
						options={ TAG_OPTIONS }
						onChange={ ( v ) => setAttributes( { subTag: v } ) }
					/>
					<ABSelectControl
						label={ __( 'Sub-heading position', 'axiom-blocks' ) }
						value={ subPosition }
						options={ POSITION_OPTIONS }
						onChange={ ( v ) =>
							setAttributes( { subPosition: v } )
						}
					/>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="headingSubGap"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Gap to heading', 'axiom-blocks' ) }
								value={ fromPx(
									value !== '' && value != null
										? value
										: inherited,
									7
								) }
								onChange={ ( v ) => setValue( toPx( v ) ) }
								min={ 0 }
								max={ 80 }
								step={ 1 }
								unit="px"
							/>
						) }
					</ABResponsive>
				</>
			) }
			<ABToggleControl
				label={ __( 'Show accent line', 'axiom-blocks' ) }
				checked={ !! accentEnabled }
				onChange={ ( v ) => setAttributes( { accentEnabled: v } ) }
			/>
			{ accentEnabled && (
				<ABSelectControl
					label={ __( 'Accent position', 'axiom-blocks' ) }
					value={ accentPosition }
					options={ POSITION_OPTIONS }
					onChange={ ( v ) => setAttributes( { accentPosition: v } ) }
				/>
			) }
		</PanelBody>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ buildDesign( { subEnabled, accentEnabled } ) }
				leading={ settingsPanel }
			/>

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
						TEXT_COLOR_FORMAT,
						FONT_WEIGHT_FORMAT,
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
