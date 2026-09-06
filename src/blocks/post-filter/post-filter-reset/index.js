import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { ABTextControl } from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';
import { FieldPanel } from '../FieldPanel';
import { resetBtnVars, fieldClass, fieldVars } from '../shared';

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
	block: 'pff-reset',
	targets: [
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
		},
	],
};

function ResetEdit( { attributes, setAttributes } ) {
	const { label } = attributes;

	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: `ab-pff ab-pff--reset ab-pff--editor ${ fieldClass(
			attributes
		) }`.trim(),
		style: {
			...spacingStyle,
			...fieldVars( attributes ),
			...resetBtnVars( attributes ),
		},
	} );

	const inspector = (
		<ABInspectorGroups
			attributes={ attributes }
			setAttributes={ setAttributes }
			design={ DESIGN }
			leading={
				<FieldPanel
					title={ __( 'Reset Filter', 'axiom-blocks' ) }
					attributes={ attributes }
					setAttributes={ setAttributes }
					labelRows={ false }
				>
					<ABTextControl
						label={ __( 'Button text', 'axiom-blocks' ) }
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
				</FieldPanel>
			}
		/>
	);

	return (
		<>
			{ inspector }
			<div { ...blockProps }>
				<button
					type="button"
					className="ab-pff__btn ab-pff__btn--ghost"
					disabled
				>
					{ label }
				</button>
			</div>
		</>
	);
}

export const PostFilterReset = {
	name: 'axiom-blocks/post-filter-reset',
	settings: {
		title: __( 'Reset Filter', 'axiom-blocks' ),
		description: __(
			'Clears a Post Filter bar back to its unfiltered grid.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-filter-reset" />,
		edit: ResetEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: `ab-pff ab-pff--reset ${ fieldClass(
					attributes
				) }`.trim(),
			} );
			return (
				<div { ...blockProps }>
					<button
						type="reset"
						className="ab-pff__btn ab-pff__btn--ghost"
					>
						{ attributes.label }
					</button>
				</div>
			);
		},
	},
};
