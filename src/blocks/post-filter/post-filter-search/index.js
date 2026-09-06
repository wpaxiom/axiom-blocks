import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { ABTextControl } from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';
import { FieldPanel } from '../FieldPanel';
import {
	searchInputVars,
	searchBtnVars,
	fieldClass,
	fieldVars,
	showsLabel,
} from '../shared';

const INPUT_BW = [
	'inputBorderTopWidth',
	'inputBorderRightWidth',
	'inputBorderBottomWidth',
	'inputBorderLeftWidth',
];
const INPUT_RADIUS = [
	'inputRadiusTopLeft',
	'inputRadiusTopRight',
	'inputRadiusBottomRight',
	'inputRadiusBottomLeft',
];
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

const DESIGN = {
	block: 'pff-search',
	targets: [
		{
			noun: __( 'Input', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'inputColor',
				},
				{
					label: __( 'Placeholder', 'axiom-blocks' ),
					bind: 'inputPlaceholderColor',
					static: true,
				},
			],
			background: { bind: 'inputBg' },
			typography: '',
			border: {
				widthKeys: INPUT_BW,
				styleKey: 'inputBorderStyle',
				colorKey: 'inputBorderColor',
				stateBind: { hover: 'inputBorderColorHover' },
				max: 8,
			},
			radius: { keys: INPUT_RADIUS, max: 64 },
			shadow: { bind: 'inputShadow' },
			padding: { type: 'inputPadding' },
		},
		{
			noun: __( 'Button', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'btnColor',
				},
			],
			background: { bind: 'btnBg' },
			typography: 'btn',
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
		},
	],
};

function SearchEdit( { attributes, setAttributes } ) {
	const { label, placeholder, buttonText } = attributes;

	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: `ab-pff ab-pff--search ab-pff--editor ${ fieldClass(
			attributes
		) }`.trim(),
		style: {
			...spacingStyle,
			...fieldVars( attributes ),
			...searchInputVars( attributes ),
			...searchBtnVars( attributes ),
		},
	} );

	const inspector = (
		<ABInspectorGroups
			attributes={ attributes }
			setAttributes={ setAttributes }
			design={ DESIGN }
			leading={
				<FieldPanel
					title={ __( 'Search Field', 'axiom-blocks' ) }
					attributes={ attributes }
					setAttributes={ setAttributes }
				>
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
					<ABTextControl
						label={ __( 'Placeholder', 'axiom-blocks' ) }
						value={ placeholder }
						onChange={ ( v ) =>
							setAttributes( { placeholder: v } )
						}
					/>
					<ABTextControl
						label={ __( 'Button text', 'axiom-blocks' ) }
						value={ buttonText }
						onChange={ ( v ) => setAttributes( { buttonText: v } ) }
					/>
				</FieldPanel>
			}
		/>
	);

	return (
		<>
			{ inspector }
			<div { ...blockProps }>
				{ showsLabel( attributes ) && (
					<span className="ab-pff__label">{ label }</span>
				) }
				<input
					type="text"
					className="ab-pff__control"
					disabled
					placeholder={
						placeholder || __( 'Search…', 'axiom-blocks' )
					}
				/>
				<button type="button" className="ab-pff__btn" disabled>
					{ buttonText }
				</button>
			</div>
		</>
	);
}

export const PostFilterSearch = {
	name: 'axiom-blocks/post-filter-search',
	settings: {
		title: __( 'Search Field', 'axiom-blocks' ),
		description: __(
			'A keyword search box inside a Post Filter bar.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-filter-search" />,
		edit: SearchEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: `ab-pff ab-pff--search ${ fieldClass(
					attributes
				) }`.trim(),
			} );
			const { label, placeholder, buttonText } = attributes;
			return (
				<div { ...blockProps }>
					{ showsLabel( attributes ) && (
						<span className="ab-pff__label">{ label }</span>
					) }
					<input
						type="text"
						className="ab-pff__control"
						name="ab_f_s"
						placeholder={ placeholder }
					/>
					<button type="submit" className="ab-pff__btn">
						{ buttonText }
					</button>
				</div>
			);
		},
	},
};
