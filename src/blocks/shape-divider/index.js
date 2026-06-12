import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABTextControl,
	ABColorControl,
	ABToggleControl,
} from '../../components/ABControls';
import { SpacingPanel, getSpacingStyle } from '../../components/SpacingPanel';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const SHAPE_PATHS = {
	wave: 'M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z',
	curve: 'M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z',
	triangle: 'M0,120 L600,0 L1200,120 Z',
	tilt: 'M0,120 L1200,0 L1200,120 Z',
	slant: 'M0,120 L0,0 L1200,120 Z',
};

function ShapeDividerEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'shape-divider' ) ) {
		return <DisabledBlockMessage blockName="Shape Divider" />;
	}
	const {
		shape,
		height,
		color,
		backgroundColor,
		flipHorizontal,
		flipVertical,
	} = attributes;

	const transforms = [];
	if ( flipHorizontal ) transforms.push( 'scaleX(-1)' );
	if ( flipVertical ) transforms.push( 'scaleY(-1)' );

	const blockProps = useBlockProps( {
		className: `axiom-blocks-shape-divider axiom-blocks-shape-divider--${ shape } axiom-blocks-shape-divider--editor`,
		style: {
			height,
			background: backgroundColor,
			...getSpacingStyle( attributes ),
		},
		'aria-hidden': 'true',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Shape', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Shape style', 'axiom-blocks' ) }
						value={ shape }
						options={ [
							{
								label: __( 'Wave', 'axiom-blocks' ),
								value: 'wave',
							},
							{
								label: __( 'Curve', 'axiom-blocks' ),
								value: 'curve',
							},
							{
								label: __( 'Triangle', 'axiom-blocks' ),
								value: 'triangle',
							},
							{
								label: __( 'Tilt', 'axiom-blocks' ),
								value: 'tilt',
							},
							{
								label: __( 'Slant', 'axiom-blocks' ),
								value: 'slant',
							},
						] }
						onChange={ ( v ) => setAttributes( { shape: v } ) }
					/>
					<ABTextControl
						label={ __( 'Height', 'axiom-blocks' ) }
						value={ height }
						onChange={ ( v ) => setAttributes( { height: v } ) }
						help={ __( 'e.g. 80px, 6rem, 120px', 'axiom-blocks' ) }
					/>
					<ABToggleControl
						label={ __( 'Flip horizontal', 'axiom-blocks' ) }
						checked={ flipHorizontal }
						onChange={ ( v ) =>
							setAttributes( { flipHorizontal: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Flip vertical', 'axiom-blocks' ) }
						checked={ flipVertical }
						onChange={ ( v ) =>
							setAttributes( { flipVertical: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Color', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Shape color', 'axiom-blocks' ) }
						color={ color }
						onChange={ ( c ) => setAttributes( { color: c } ) }
					/>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={
							backgroundColor === 'transparent'
								? '#ffffff'
								: backgroundColor
						}
						onChange={ ( c ) =>
							setAttributes( { backgroundColor: c } )
						}
					/>
					<ABToggleControl
						label={ __( 'Transparent background', 'axiom-blocks' ) }
						checked={ backgroundColor === 'transparent' }
						onChange={ ( v ) =>
							setAttributes( {
								backgroundColor: v ? 'transparent' : '#ffffff',
							} )
						}
					/>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1200 120"
					preserveAspectRatio="none"
					className="axiom-blocks-shape-divider__svg"
					style={ { transform: transforms.join( ' ' ) || undefined } }
				>
					<path
						d={ SHAPE_PATHS[ shape ] || SHAPE_PATHS.wave }
						fill={ color }
					/>
				</svg>
			</div>
		</>
	);
}

export const ShapeDivider = {
	name: 'axiom-blocks/shape-divider',
	settings: {
		title: __( 'Shape Divider', 'axiom-blocks' ),
		description: __(
			'Decorative SVG divider between sections.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="shape-divider" />,
		edit: ShapeDividerEdit,
		save: () => null,
	},
};
