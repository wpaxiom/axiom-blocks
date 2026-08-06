import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { ABSelectControl } from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../../components/BackgroundControl';
import { BlockIcon } from '../../../blockIcons';
import metadata from './block.json';

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

/* One wrapper part — the slide hosts InnerBlocks, so no typography (inner
 * blocks own their text). Background is the full shared control (color /
 * gradient / image + overlay); its color binds the shipped `bgColor` attr
 * (default colorKey), so a plain color slide is unchanged. */
const DESIGN = {
	block: 'slide',
	targets: [
		{
			noun: __( 'Slide', 'axiom-blocks' ),
			background: { full: true },
		},
	],
};

export function getSlideClasses( attributes ) {
	const { contentAlign, verticalAlign } = attributes;
	return [
		'ab-slide',
		`ab-slide--align-${ contentAlign || 'center' }`,
		`ab-slide--valign-${ verticalAlign || 'center' }`,
	];
}

/* Wrapper style: a slide with a background type renders via the shared
 * --ab-slide-bg var (+ layer vars) consumed by style.scss; a plain color
 * slide keeps the legacy inline `background-color` (no type ⇒ no var). */
export function getSlideStyle( attributes ) {
	if ( attributes.bgType ) {
		return getBackgroundVars( attributes, { varPrefix: '--ab-slide' } );
	}
	return { backgroundColor: attributes.bgColor || undefined };
}

function SlideEdit( { attributes, setAttributes } ) {
	const { contentAlign, verticalAlign } = attributes;

	const blockProps = useBlockProps( {
		className: getSlideClasses( attributes ).join( ' ' ),
		style: getSlideStyle( attributes ),
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

	const leading = (
		<PanelBody
			title={ __( 'Slide', 'axiom-blocks' ) }
			initialOpen={ true }
		>
			<ABSelectControl
				label={ __( 'Content alignment', 'axiom-blocks' ) }
				value={ contentAlign || 'center' }
				options={ ALIGN_OPTIONS }
				onChange={ ( v ) =>
					setAttributes( { contentAlign: v } )
				}
			/>
			<ABSelectControl
				label={ __( 'Vertical alignment', 'axiom-blocks' ) }
				value={ verticalAlign || 'center' }
				options={ VALIGN_OPTIONS }
				onChange={ ( v ) =>
					setAttributes( { verticalAlign: v } )
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
				style: getSlideStyle( attributes ),
			} );
			return (
				<div { ...blockProps }>
					<div className="ab-slide__content">
						<InnerBlocks.Content />
					</div>
				</div>
			);
		},
		deprecated: [
			{
				attributes: metadata.attributes,
				supports: metadata.supports,
				save: ( { attributes } ) => {
					const blockProps = useBlockProps.save( {
						className: getSlideClasses( attributes ).join( ' ' ),
						style: {
							backgroundColor: attributes.bgColor || undefined,
						},
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
		],
	},
};
