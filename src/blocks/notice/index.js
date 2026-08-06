import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { ABSelectControl, ABToggleControl } from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { useTypographyStyle } from '../../components/TypographyPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { useDeviceType } from '../../components/responsive';
import { responsiveVarValue } from '../../components/responsiveProps';
import { IconControl } from '../../components/IconControl';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { useIconNode } from '../../components/useCustomIcons';
import { BlockIcon } from '../../blockIcons';
import {
	TEXT_COLOR_FORMAT,
	HIGHLIGHT_FORMAT,
	FONT_WEIGHT_FORMAT,
} from '../advanced-heading/format';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

const TYPE_ICON = {
	info: 'info',
	success: 'check-circle',
	warning: 'alert-triangle',
	error: 'circle-x',
};

export function getNoticeVars( attributes ) {
	const {
		bgColor,
		textColor,
		accentColor,
		borderRadius,
		iconColor,
		iconSize,
		radiusTopLeft,
		radiusTopRight,
		radiusBottomRight,
		radiusBottomLeft,
		noticeShadow,
		titleColor,
	} = attributes;
	return {
		'--ab-notice-bg': bgColor || undefined,
		'--ab-notice-color': textColor || undefined,
		'--ab-notice-accent': accentColor || undefined,
		'--ab-notice-icon': iconColor || undefined,
		'--ab-notice-icon-size': iconSize || undefined,
		// Radius — per-corner falls back to the legacy single `borderRadius`.
		'--ab-notice-radius-tl': radiusTopLeft || borderRadius || undefined,
		'--ab-notice-radius-tr': radiusTopRight || borderRadius || undefined,
		'--ab-notice-radius-br': radiusBottomRight || borderRadius || undefined,
		'--ab-notice-radius-bl': radiusBottomLeft || borderRadius || undefined,
		'--ab-notice-radius': borderRadius || undefined,
		'--ab-notice-shadow': noticeShadow || undefined,
		// Title color is independent and additive — CSS falls back to the shared
		// text color (`--ab-notice-title-color, var(--ab-notice-color)`).
		'--ab-notice-title-color': titleColor || undefined,
	};
}

const NOTICE_RADIUS = [
	'radiusTopLeft',
	'radiusTopRight',
	'radiusBottomRight',
	'radiusBottomLeft',
];

/* Anatomy-as-declaration — the part-first (Option C) Styles UI is rendered from
 * this config by ABInspectorGroups/TargetSection. Notice is a STATIC, non-
 * interactive block ⇒ no states ever. The Card part is a box (background + radius
 * + shadow + max-width); the Accent part is the type's left bar / border tint;
 * Title + Message are text parts (color + typography). save() is static
 * (RichText) + nullSaveDeprecation, so every new attr is additive — old saved
 * blocks stay byte-identical. */
const DESIGN = {
	block: 'notice',
	targets: [
		{
			noun: __( 'Card', 'axiom-blocks' ),
			background: { bind: 'bgColor' },
			radius: {
				keys: NOTICE_RADIUS,
				legacyRadius: 'borderRadius',
				max: 32,
			},
			shadow: { bind: 'noticeShadow' },
			size: {
				bind: 'maxWidth',
				label: __( 'Max width', 'axiom-blocks' ),
				responsive: true,
			},
		},
		{
			noun: __( 'Accent', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Color', 'axiom-blocks' ), bind: 'accentColor' },
			],
		},
		{
			noun: __( 'Icon', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Color', 'axiom-blocks' ), bind: 'iconColor' },
			],
			ranges: [
				{
					bind: 'iconSize',
					label: __( 'Size', 'axiom-blocks' ),
					min: 12,
					max: 48,
					default: 22,
					responsive: true,
				},
			],
		},
		{
			noun: __( 'Title', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'titleColor' },
			],
			typography: 'title',
		},
		{
			noun: __( 'Message', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'textColor' },
			],
			typography: 'content',
		},
	],
};

function NoticeEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'notice' ) ) {
		return <DisabledBlockMessage blockName="Notice / Alert" />;
	}

	const { noticeType, title, message, showIcon, iconSlug, dismissible } =
		attributes;

	const activeIcon = iconSlug || TYPE_ICON[ noticeType ] || 'info';
	const resolveIcon = useIconNode();

	const titleTypoStyle = useTypographyStyle( attributes, 'title' );
	const contentTypoStyle = useTypographyStyle( attributes, 'content' );

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: [
			'ab-notice',
			`ab-notice--${ noticeType }`,
			showIcon ? 'has-icon' : 'no-icon',
		].join( ' ' ),
		style: {
			...getNoticeVars( attributes ),
			...useSpacingStyle( attributes ),
			'--ab-notice-icon-size': responsiveVarValue(
				attributes,
				'iconSize',
				device
			),
			// Max-width is inline-only (content-slider / info-box pattern): unset
			// ⇒ inherits the layout width; ResponsiveProps adds the media rules.
			maxWidth: responsiveVarValue( attributes, 'maxWidth', device ),
		},
	} );

	const leading = (
		<>
			<PanelBody title={ __( 'Type', 'axiom-blocks' ) } initialOpen={ true }>
				<ABSelectControl
					label={ __( 'Notice type', 'axiom-blocks' ) }
					value={ noticeType }
					options={ [
						{
							label: __( 'Info', 'axiom-blocks' ),
							value: 'info',
						},
						{
							label: __( 'Success', 'axiom-blocks' ),
							value: 'success',
						},
						{
							label: __( 'Warning', 'axiom-blocks' ),
							value: 'warning',
						},
						{
							label: __( 'Error', 'axiom-blocks' ),
							value: 'error',
						},
					] }
					onChange={ ( v ) => setAttributes( { noticeType: v } ) }
				/>
				<ABToggleControl
					label={ __( 'Dismissible', 'axiom-blocks' ) }
					help={ __(
						'Show a close button on the front end.',
						'axiom-blocks'
					) }
					checked={ !! dismissible }
					onChange={ ( v ) => setAttributes( { dismissible: v } ) }
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
						<IconControl
							value={ activeIcon }
							onChange={ ( v ) =>
								setAttributes( { iconSlug: v } )
							}
						/>
						{ iconSlug && (
							<ABToggleControl
								label={ __(
									'Use default icon for type',
									'axiom-blocks'
								) }
								checked={ false }
								onChange={ () =>
									setAttributes( { iconSlug: '' } )
								}
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
				{ showIcon && (
					<span className="ab-notice__icon" contentEditable={ false }>
						{ resolveIcon( activeIcon ) || ICON_LIBRARY.info }
					</span>
				) }
				<div className="ab-notice__content">
					<RichText
						tagName="div"
						className="ab-notice__title"
						value={ title }
						onChange={ ( v ) => setAttributes( { title: v } ) }
						placeholder={ __( 'Notice title…', 'axiom-blocks' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
						style={ titleTypoStyle }
					/>
					<RichText
						tagName="div"
						className="ab-notice__message"
						value={ message }
						onChange={ ( v ) => setAttributes( { message: v } ) }
						placeholder={ __(
							'Add your message…',
							'axiom-blocks'
						) }
						allowedFormats={ [
							'core/bold',
							'core/italic',
							'core/link',
							TEXT_COLOR_FORMAT,
							HIGHLIGHT_FORMAT,
							FONT_WEIGHT_FORMAT,
						] }
						style={ contentTypoStyle }
					/>
				</div>
				{ dismissible && (
					<span
						className="ab-notice__dismiss"
						aria-hidden="true"
						contentEditable={ false }
					>
						{ ICON_LIBRARY.x }
					</span>
				) }
			</div>
		</>
	);
}

export const Notice = {
	name: 'axiom-blocks/notice',
	settings: {
		title: __( 'Notice / Alert', 'axiom-blocks' ),
		description: __(
			'Highlight an info, success, warning, or error message with an icon and optional dismiss button.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="notice" />,
		edit: NoticeEdit,
		save: ( { attributes } ) => {
			const { title, message } = attributes;
			const blockProps = useBlockProps.save();
			return (
				<div { ...blockProps }>
					<div className="ab-notice__content">
						{ title && (
							<RichText.Content
								tagName="strong"
								className="ab-notice__title"
								value={ title }
							/>
						) }
						{ message && (
							<RichText.Content
								tagName="div"
								className="ab-notice__message"
								value={ message }
							/>
						) }
					</div>
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
