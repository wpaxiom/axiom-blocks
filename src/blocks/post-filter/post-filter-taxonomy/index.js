import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { ABTextControl, ABToggleControl } from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { BlockIcon } from '../../../blockIcons';
import { FieldPanel } from '../FieldPanel';
import { selectVars, fieldClass, fieldVars, showsLabel } from '../shared';

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
	block: 'pff-tax',
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

function TaxonomyEdit( { attributes, setAttributes, context } ) {
	const { label, showAll, allLabel } = attributes;
	const taxonomy = context[ 'axiom-blocks/postFilterTaxonomy' ] || '';

	const terms = useSelect(
		( select ) => {
			if ( ! taxonomy ) {
				return [];
			}
			const recs = select( coreStore ).getEntityRecords(
				'taxonomy',
				taxonomy,
				{ per_page: -1 }
			);
			return ( recs || [] ).map( ( t ) => t.name );
		},
		[ taxonomy ]
	);

	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: `ab-pff ab-pff--taxonomy ab-pff--editor ${ fieldClass(
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
					title={ __( 'Taxonomy Filter', 'axiom-blocks' ) }
					attributes={ attributes }
					setAttributes={ setAttributes }
				>
					<ABTextControl
						label={ __( 'Label', 'axiom-blocks' ) }
						value={ label }
						onChange={ ( v ) => setAttributes( { label: v } ) }
					/>
					<ABToggleControl
						label={ __( 'Show "All" option', 'axiom-blocks' ) }
						checked={ showAll }
						onChange={ ( v ) => setAttributes( { showAll: v } ) }
					/>
					{ showAll && (
						<ABTextControl
							label={ __( '"All" label', 'axiom-blocks' ) }
							value={ allLabel }
							onChange={ ( v ) =>
								setAttributes( { allLabel: v } )
							}
						/>
					) }
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
					{ showAll && <option>{ allLabel }</option> }
					{ ( terms || [] ).map( ( name ) => (
						<option key={ name }>{ name }</option>
					) ) }
				</select>
			</div>
		</>
	);
}

export const PostFilterTaxonomy = {
	name: 'axiom-blocks/post-filter-taxonomy',
	settings: {
		title: __( 'Taxonomy Filter', 'axiom-blocks' ),
		description: __(
			'A taxonomy drop-down inside a Post Filter bar.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-filter-taxonomy" />,
		edit: TaxonomyEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: `ab-pff ab-pff--taxonomy ${ fieldClass(
					attributes
				) }`.trim(),
			} );
			const { label } = attributes;
			return (
				<div { ...blockProps }>
					{ showsLabel( attributes ) && (
						<span className="ab-pff__label">{ label }</span>
					) }
					<select name="ab_f_tax" className="ab-pff__control">
						<option value="">
							{ __( 'All', 'axiom-blocks' ) }
						</option>
					</select>
				</div>
			);
		},
	},
};
