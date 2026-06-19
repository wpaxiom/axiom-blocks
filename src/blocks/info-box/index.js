import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABRangeControl,
} from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

/* Default contents — built from our own blocks plus a core paragraph. */
const TEMPLATE = [
	[ 'axiom-blocks/icon', {} ],
	[
		'axiom-blocks/advanced-heading',
		{ headingText: __( 'Feature title', 'axiom-blocks' ), tagName: 'h3' },
	],
	[
		'core/paragraph',
		{ placeholder: __( 'Describe this feature…', 'axiom-blocks' ) },
	],
	[
		'axiom-blocks/advanced-button',
		{ text: __( 'Learn more', 'axiom-blocks' ) },
	],
];

/* Predefined block styles (the Styles panel). CSS lives in style.scss. */
const STYLES = [
	{
		name: 'default',
		label: __( 'Default', 'axiom-blocks' ),
		isDefault: true,
	},
	{ name: 'bordered', label: __( 'Bordered', 'axiom-blocks' ) },
	{ name: 'card', label: __( 'Card', 'axiom-blocks' ) },
	{ name: 'accent', label: __( 'Accent', 'axiom-blocks' ) },
];

/* Inserter hover preview — also powers the Styles-panel thumbnails. */
const EXAMPLE = {
	attributes: { direction: 'column', contentAlign: 'center' },
	innerBlocks: [
		{ name: 'axiom-blocks/icon', attributes: { iconSlug: 'star' } },
		{
			name: 'axiom-blocks/advanced-heading',
			attributes: {
				headingText: __( 'Fast & reliable', 'axiom-blocks' ),
				tagName: 'h3',
			},
		},
		{
			name: 'core/paragraph',
			attributes: {
				content: __(
					'Everything you need, nothing you don’t.',
					'axiom-blocks'
				),
			},
		},
		{
			name: 'axiom-blocks/advanced-button',
			attributes: { text: __( 'Learn more', 'axiom-blocks' ) },
		},
	],
};

export function getInfoBoxVars( attributes ) {
	const { gap, bgColor, borderColor, borderWidth, borderRadius } = attributes;
	return {
		'--ab-ibox-gap': gap || undefined,
		'--ab-ibox-bg': bgColor || undefined,
		'--ab-ibox-bc': borderColor || undefined,
		'--ab-ibox-bw': borderWidth || undefined,
		'--ab-ibox-radius': borderRadius || undefined,
	};
}

function InfoBoxEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'info-box' ) ) {
		return <DisabledBlockMessage blockName="Info Box" />;
	}

	const {
		direction,
		gap,
		contentAlign,
		boxShadow,
		bgColor,
		borderColor,
		borderWidth,
		borderRadius,
	} = attributes;

	const blockProps = useBlockProps( {
		className: [
			'ab-ibox',
			`ab-ibox--${ direction }`,
			`ab-ibox--align-${ contentAlign }`,
			`has-shadow-${ boxShadow }`,
		].join( ' ' ),
		style: {
			...getInfoBoxVars( attributes ),
			...getSpacingStyle( attributes ),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		template: TEMPLATE,
		templateLock: false,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Direction', 'axiom-blocks' ) }
						value={ direction }
						options={ [
							{
								label: __( 'Stack (vertical)', 'axiom-blocks' ),
								value: 'column',
							},
							{
								label: __( 'Row (horizontal)', 'axiom-blocks' ),
								value: 'row',
							},
						] }
						onChange={ ( v ) => setAttributes( { direction: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Gap between items', 'axiom-blocks' ) }
						value={ fromPx( gap, 16 ) }
						onChange={ ( v ) =>
							setAttributes( { gap: toPx( v ) } )
						}
						min={ 0 }
						max={ 80 }
						step={ 1 }
						unit="px"
						help={ __(
							'Space between the icon, heading, text, and button.',
							'axiom-blocks'
						) }
					/>
					<ABSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={ contentAlign }
						options={ [
							{
								label: __( 'Left', 'axiom-blocks' ),
								value: 'left',
							},
							{
								label: __( 'Center', 'axiom-blocks' ),
								value: 'center',
							},
							{
								label: __( 'Right', 'axiom-blocks' ),
								value: 'right',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { contentAlign: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Box', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ bgColor }
						onChange={ ( v ) => setAttributes( { bgColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Border colour', 'axiom-blocks' ) }
						color={ borderColor }
						onChange={ ( v ) =>
							setAttributes( { borderColor: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Border width', 'axiom-blocks' ) }
						value={ fromPx( borderWidth, 0 ) }
						onChange={ ( v ) =>
							setAttributes( { borderWidth: toPx( v ) } )
						}
						min={ 0 }
						max={ 12 }
						step={ 1 }
						unit="px"
					/>
					<ABRangeControl
						label={ __( 'Corner radius', 'axiom-blocks' ) }
						value={ fromPx( borderRadius, 12 ) }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 48 }
						step={ 1 }
						unit="px"
					/>
					<ABSelectControl
						label={ __( 'Shadow', 'axiom-blocks' ) }
						value={ boxShadow }
						options={ [
							{
								label: __( 'None', 'axiom-blocks' ),
								value: 'none',
							},
							{
								label: __( 'Small', 'axiom-blocks' ),
								value: 'sm',
							},
							{
								label: __( 'Medium', 'axiom-blocks' ),
								value: 'md',
							},
							{
								label: __( 'Large', 'axiom-blocks' ),
								value: 'lg',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { boxShadow: v } )
						}
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export const InfoBox = {
	name: 'axiom-blocks/info-box',
	settings: {
		title: __( 'Info Box', 'axiom-blocks' ),
		description: __(
			'A styled box holding an icon, heading, text, and button as editable blocks — with full control over spacing between them.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="info-box" />,
		example: EXAMPLE,
		styles: STYLES,
		edit: InfoBoxEdit,
		save: () => <InnerBlocks.Content />,
	},
};
