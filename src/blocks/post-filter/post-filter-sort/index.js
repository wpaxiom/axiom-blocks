import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { ABTextControl } from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';
import { FieldPanel } from '../FieldPanel';
import { selectVars, fieldClass, fieldVars, showsLabel } from '../shared';

const SORTS = [
	{ label: __( 'Newest first', 'axiom-blocks' ), value: 'date|desc' },
	{ label: __( 'Oldest first', 'axiom-blocks' ), value: 'date|asc' },
	{ label: __( 'Title A-Z', 'axiom-blocks' ), value: 'title|asc' },
	{ label: __( 'Title Z-A', 'axiom-blocks' ), value: 'title|desc' },
	{ label: __( 'Last modified', 'axiom-blocks' ), value: 'modified|desc' },
	{
		label: __( 'Most comments', 'axiom-blocks' ),
		value: 'comment_count|desc',
	},
];

const SELECT_BW = [
	'selectBorderTopWidth',
	'selectBorderRightWidth',
	'selectBorderBottomWidth',
	'selectBorderLeftWidth',
];
const SELECT_RADIUS = [
	'selectRadiusTopLeft',
	'selectRadiusTopRight',
	'selectRadiusBottomRight',
	'selectRadiusBottomLeft',
];

const DESIGN = {
	block: 'pff-sort',
	targets: [
		{
			noun: __( 'Select', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{
					label: __( 'Text', 'axiom-blocks' ),
					bind: 'selectColor',
				},
			],
			background: { bind: 'selectBg' },
			typography: '',
			border: {
				widthKeys: SELECT_BW,
				styleKey: 'selectBorderStyle',
				colorKey: 'selectBorderColor',
				stateBind: { hover: 'selectBorderColorHover' },
				max: 8,
			},
			radius: { keys: SELECT_RADIUS, max: 64 },
			shadow: { bind: 'selectShadow' },
			padding: { type: 'selectPadding' },
		},
	],
};

function SortEdit( { attributes, setAttributes } ) {
	const { label, defaultLabel } = attributes;

	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: `ab-pff ab-pff--sort ab-pff--editor ${ fieldClass(
			attributes
		) }`.trim(),
		style: {
			...spacingStyle,
			...fieldVars( attributes ),
			...selectVars( attributes ),
		},
	} );

	const inspector = (
		<ABInspectorGroups
			attributes={ attributes }
			setAttributes={ setAttributes }
			design={ DESIGN }
			leading={
				<FieldPanel
					title={ __( 'Sort Filter', 'axiom-blocks' ) }
					attributes={ attributes }
					setAttributes={ setAttributes }
				>
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
					<ABTextControl
						label={ __( 'Default "Sort by" text', 'axiom-blocks' ) }
						value={ defaultLabel }
						onChange={ ( v ) =>
							setAttributes( { defaultLabel: v } )
						}
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
				<select className="ab-pff__control" disabled>
					<option>
						{ defaultLabel || __( 'Sort by', 'axiom-blocks' ) }
					</option>
					{ SORTS.map( ( s ) => (
						<option key={ s.value }>{ s.label }</option>
					) ) }
				</select>
			</div>
		</>
	);
}

export const PostFilterSort = {
	name: 'axiom-blocks/post-filter-sort',
	settings: {
		title: __( 'Sort Filter', 'axiom-blocks' ),
		description: __(
			'A sort drop-down inside a Post Filter bar.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-filter-sort" />,
		edit: SortEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: `ab-pff ab-pff--sort ${ fieldClass(
					attributes
				) }`.trim(),
			} );
			const { label, defaultLabel } = attributes;
			return (
				<div { ...blockProps }>
					{ showsLabel( attributes ) && (
						<span className="ab-pff__label">{ label }</span>
					) }
					<select name="ab_f_sort" className="ab-pff__control">
						<option value="">
							{ defaultLabel || __( 'Sort by', 'axiom-blocks' ) }
						</option>
					</select>
				</div>
			);
		},
	},
};
