import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { ABSelectControl, ABToggleControl } from '../../components/ABControls';
import { useSpacingStyle } from '../../components/SpacingPanel';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { useDeviceType } from '../../components/responsive';
import { responsiveVarValue } from '../../components/responsiveProps';
import { shapeGradient } from './gradient';
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

const COLOR_DEFAULT = '#ffffff';
const BAND_DEFAULT = '#f6f7f7';

/* Anatomy-as-declaration — one Shape part (the block is a single decorative
 * element). `color` is the shape fill, re-homed onto BackgroundControl so it
 * gains a gradient; image/overlay are off because an SVG `fill` can only take a
 * paint server, and a gradient is the one the tree asks for. `backgroundColor`
 * is the band behind the shape and rides along as a second color row. Static —
 * no states, ever. save() is null (fully dynamic) so nothing is saved. */
const DESIGN = {
	block: 'sd',
	targets: [
		{
			noun: __( 'Shape', 'axiom-blocks' ),
			background: {
				full: true,
				label: __( 'Fill', 'axiom-blocks' ),
				prefix: 'shape',
				colorKey: 'color',
				image: false,
				overlay: false,
				insertAfter: -1,
			},
			colors: [
				{
					label: __( 'Behind shape', 'axiom-blocks' ),
					bind: 'backgroundColor',
					fallback: BAND_DEFAULT,
				},
			],
			ranges: [
				{
					bind: 'height',
					label: __( 'Height', 'axiom-blocks' ),
					min: 10,
					max: 500,
					default: 80,
					responsive: true,
					units: [ 'px', 'rem', 'vh', '%' ],
					unitRange: {
						px: [ 10, 500 ],
						rem: [ 1, 30 ],
						vh: [ 1, 100 ],
						'%': [ 1, 100 ],
					},
				},
			],
		},
	],
};

export function getShapeDividerPath( shape, flipHorizontal, flipVertical ) {
	const d = SHAPE_PATHS[ shape ] || SHAPE_PATHS.wave;
	const transform =
		flipHorizontal || flipVertical
			? 'matrix(' +
			  [
					flipHorizontal ? -1 : 1,
					0,
					0,
					flipVertical ? -1 : 1,
					flipHorizontal ? 1200 : 0,
					flipVertical ? 120 : 0,
			  ].join( ' ' ) +
			  ')'
			: undefined;
	return { d, transform };
}

/* Mirrors the <defs> block in render.php. */
function GradientDefs( { gradient, id } ) {
	const stops = gradient.stops.map( ( s, i ) => (
		<stop
			key={ i }
			offset={ `${ s.position }%` }
			stopColor={ s.color }
			{ ...( s.opacity != null ? { stopOpacity: s.opacity } : {} ) }
		/>
	) );
	return (
		<defs>
			{ gradient.radial ? (
				<radialGradient id={ id } cx="0.5" cy="0.5" r="0.5">
					{ stops }
				</radialGradient>
			) : (
				<linearGradient
					id={ id }
					x1={ gradient.coords.x1 }
					y1={ gradient.coords.y1 }
					x2={ gradient.coords.x2 }
					y2={ gradient.coords.y2 }
				>
					{ stops }
				</linearGradient>
			) }
		</defs>
	);
}

function ShapeDividerEdit( { attributes, setAttributes, clientId } ) {
	if ( ! isBlockEnabled( 'shape-divider' ) ) {
		return <DisabledBlockMessage blockName="Shape Divider" />;
	}
	const { shape, color, backgroundColor, flipHorizontal, flipVertical } =
		attributes;

	const device = useDeviceType();
	const { d, transform } = getShapeDividerPath(
		shape,
		flipHorizontal,
		flipVertical
	);

	const gradient = shapeGradient( attributes );
	const gradientId = `ab-sd-grad-${ clientId.replace(
		/[^a-zA-Z0-9]/g,
		''
	) }`;

	const blockProps = useBlockProps( {
		className: `axiom-blocks-shape-divider axiom-blocks-shape-divider--${ shape } axiom-blocks-shape-divider--editor`,
		style: {
			height: responsiveVarValue( attributes, 'height', device ),
			backgroundColor: backgroundColor || undefined,
			...useSpacingStyle( attributes ),
		},
		'aria-hidden': 'true',
	} );

	const leading = (
		<PanelBody title={ __( 'Shape', 'axiom-blocks' ) } initialOpen={ true }>
			<ABSelectControl
				label={ __( 'Shape style', 'axiom-blocks' ) }
				value={ shape }
				options={ [
					{ label: __( 'Wave', 'axiom-blocks' ), value: 'wave' },
					{ label: __( 'Curve', 'axiom-blocks' ), value: 'curve' },
					{
						label: __( 'Triangle', 'axiom-blocks' ),
						value: 'triangle',
					},
					{ label: __( 'Tilt', 'axiom-blocks' ), value: 'tilt' },
					{ label: __( 'Slant', 'axiom-blocks' ), value: 'slant' },
				] }
				onChange={ ( v ) => setAttributes( { shape: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Flip horizontal', 'axiom-blocks' ) }
				checked={ flipHorizontal }
				onChange={ ( v ) => setAttributes( { flipHorizontal: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Flip vertical', 'axiom-blocks' ) }
				checked={ flipVertical }
				onChange={ ( v ) => setAttributes( { flipVertical: v } ) }
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
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 1200 120"
					preserveAspectRatio="none"
					className="axiom-blocks-shape-divider__svg"
				>
					{ gradient && (
						<GradientDefs gradient={ gradient } id={ gradientId } />
					) }
					<path
						d={ d }
						fill={
							gradient
								? `url(#${ gradientId })`
								: color || COLOR_DEFAULT
						}
						transform={ transform }
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
