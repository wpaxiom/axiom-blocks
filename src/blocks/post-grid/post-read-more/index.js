import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABToggleControl,
	ABSelectControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useTypographyStyle } from '../../../components/TypographyPanel';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { ICON_LIBRARY } from '../../../components/iconLibrary';
import { BlockIcon } from '../../../blockIcons';

const BTN_BW = [
	'btnBorderTopWidth',
	'btnBorderRightWidth',
	'btnBorderBottomWidth',
	'btnBorderLeftWidth',
];
const BTN_RADIUS = [
	'btnRadiusTopLeft',
	'btnRadiusTopRight',
	'btnRadiusBottomRight',
	'btnRadiusBottomLeft',
];

const ICON_POS = [
	{ label: __( 'Left', 'axiom-blocks' ), value: 'left' },
	{ label: __( 'Right', 'axiom-blocks' ), value: 'right' },
];

const ALIGN = [
	{ label: __( 'Default', 'axiom-blocks' ), value: '' },
	{ label: __( 'Left', 'axiom-blocks' ), value: 'left' },
	{ label: __( 'Center', 'axiom-blocks' ), value: 'center' },
	{ label: __( 'Right', 'axiom-blocks' ), value: 'right' },
];

const DESIGN = {
	block: 'pc-btn',
	targets: [
		{
			noun: __( 'Button', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'btnColor',
					fallback: '#7c3aed',
				},
			],
			background: { bind: 'btnBg' },
			typography: '',
			border: {
				widthKeys: BTN_BW,
				styleKey: 'btnBorderStyle',
				colorKey: 'btnBorderColor',
				stateBind: { hover: 'btnBorderColorHover' },
				max: 8,
			},
			radius: { keys: BTN_RADIUS, max: 999 },
			shadow: { bind: 'btnShadow' },
			padding: { type: 'btnPadding' },
			ranges: [
				{
					bind: 'iconGap',
					label: __( 'Icon gap', 'axiom-blocks' ),
					min: 0,
					max: 24,
					default: 6,
				},
			],
		},
	],
};

function PostReadMoreEdit( { attributes, setAttributes } ) {
	const {
		label,
		showIcon,
		iconPosition,
		linkTarget,
		fullWidth,
		btnAlign,
		btnColor,
		btnBg,
		iconGap,
	} = attributes;

	const typographyStyle = useTypographyStyle( attributes, '' );
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: [ 'ab-pc__more', fullWidth ? 'is-full' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: {
			...typographyStyle,
			...spacingStyle,
			'--ab-pc-btn-color': btnColor || undefined,
			'--ab-pc-btn-bg': btnBg || undefined,
			'--ab-pc-btn-icon-gap': iconGap || undefined,
			'--ab-pc-btn-justify': btnAlign
				? { left: 'flex-start', center: 'center', right: 'flex-end' }[
						btnAlign
				  ]
				: undefined,
		},
	} );

	const icon = showIcon ? (
		<span className="ab-pc__more-icon" aria-hidden="true">
			{ ICON_LIBRARY[ 'arrow-right' ] }
		</span>
	) : null;

	const leading = (
		<PanelBody title={ __( 'Button', 'axiom-blocks' ) } initialOpen>
			<ABTextControl
				label={ __( 'Label', 'axiom-blocks' ) }
				value={ label }
				onChange={ ( v ) => setAttributes( { label: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Show icon', 'axiom-blocks' ) }
				checked={ !! showIcon }
				onChange={ ( v ) => setAttributes( { showIcon: v } ) }
			/>
			{ showIcon && (
				<ABSelectControl
					label={ __( 'Icon position', 'axiom-blocks' ) }
					value={ iconPosition }
					options={ ICON_POS }
					onChange={ ( v ) => setAttributes( { iconPosition: v } ) }
				/>
			) }
			<ABSelectControl
				label={ __( 'Alignment', 'axiom-blocks' ) }
				value={ btnAlign }
				options={ ALIGN }
				onChange={ ( v ) => setAttributes( { btnAlign: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Full width', 'axiom-blocks' ) }
				checked={ !! fullWidth }
				onChange={ ( v ) => setAttributes( { fullWidth: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Open in new tab', 'axiom-blocks' ) }
				checked={ linkTarget === '_blank' }
				onChange={ ( v ) =>
					setAttributes( { linkTarget: v ? '_blank' : '' } )
				}
			/>
		</PanelBody>
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
				<span className="ab-pc__more-link">
					{ iconPosition === 'left' && icon }
					<span className="ab-pc__more-text">
						{ label || __( 'Read more', 'axiom-blocks' ) }
					</span>
					{ iconPosition !== 'left' && icon }
				</span>
			</div>
		</>
	);
}

export const PostReadMore = {
	name: 'axiom-blocks/post-read-more',
	settings: {
		title: __( 'Post Read More', 'axiom-blocks' ),
		description: __(
			'A link to the full post, styled as text or a button.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-read-more" />,
		edit: PostReadMoreEdit,
		save: () => null,
	},
};
