import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
} from '../../../components/ABControls';
import { BlockIcon } from '../../../blockIcons';

const ALIGN_OPTIONS = [
	{ label: __( 'Left', 'axiom-blocks' ), value: 'left' },
	{ label: __( 'Center', 'axiom-blocks' ), value: 'center' },
	{ label: __( 'Right', 'axiom-blocks' ), value: 'right' },
];

const VALIGN_OPTIONS = [
	{ label: __( 'Top', 'axiom-blocks' ), value: 'top' },
	{ label: __( 'Middle', 'axiom-blocks' ), value: 'center' },
	{ label: __( 'Bottom', 'axiom-blocks' ), value: 'bottom' },
];

export function getSlideClasses( attributes ) {
	const { contentAlign, verticalAlign } = attributes;
	return [
		'ab-slide',
		`ab-slide--align-${ contentAlign || 'center' }`,
		`ab-slide--valign-${ verticalAlign || 'center' }`,
	];
}

function SlideEdit( { attributes, setAttributes } ) {
	const { contentAlign, verticalAlign, bgColor } = attributes;

	const blockProps = useBlockProps( {
		className: getSlideClasses( attributes ).join( ' ' ),
		style: { backgroundColor: bgColor || undefined },
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'ab-slide__content' },
		{
			template: [
				[
					'core/paragraph',
					{
						placeholder: __( 'Add slide content…', 'axiom-blocks' ),
						align: 'center',
					},
				],
			],
			templateLock: false,
		}
	);

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Slide', 'axiom-blocks' ) } initialOpen={ true }>
					<ABSelectControl
						label={ __( 'Content alignment', 'axiom-blocks' ) }
						value={ contentAlign || 'center' }
						options={ ALIGN_OPTIONS }
						onChange={ ( v ) => setAttributes( { contentAlign: v } ) }
					/>
					<ABSelectControl
						label={ __( 'Vertical alignment', 'axiom-blocks' ) }
						value={ verticalAlign || 'center' }
						options={ VALIGN_OPTIONS }
						onChange={ ( v ) => setAttributes( { verticalAlign: v } ) }
					/>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ bgColor }
						onChange={ ( v ) => setAttributes( { bgColor: v } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<div { ...innerBlocksProps } />
			</div>
		</>
	);
}

export const Slide = {
	name: 'axiom-blocks/slide',
	settings: {
		title: __( 'Slide', 'axiom-blocks' ),
		description: __(
			'A single slide inside the Slider block. Holds any blocks.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="slide" />,
		edit: SlideEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: getSlideClasses( attributes ).join( ' ' ),
				style: { backgroundColor: attributes.bgColor || undefined },
			} );
			return (
				<div { ...blockProps }>
					<div className="ab-slide__content">
						<InnerBlocks.Content />
					</div>
				</div>
			);
		},
	},
};
