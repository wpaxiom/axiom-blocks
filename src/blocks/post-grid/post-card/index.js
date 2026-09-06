import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
} from '@wordpress/block-editor';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../../components/BackgroundControl';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import {
	useDeviceType,
	resolveResponsiveAttrs,
} from '../../../components/responsive';
import { BlockIcon } from '../../../blockIcons';

const ALLOWED = null;

const CARD_BW = [
	'cardBorderTopWidth',
	'cardBorderRightWidth',
	'cardBorderBottomWidth',
	'cardBorderLeftWidth',
];
const CARD_RADIUS = [
	'cardRadiusTopLeft',
	'cardRadiusTopRight',
	'cardRadiusBottomRight',
	'cardRadiusBottomLeft',
];

const RESPONSIVE_KEYS = [ 'cardMinHeight', 'cardGap' ];

const DESIGN = {
	block: 'pc',
	targets: [
		{
			noun: __( 'Card', 'axiom-blocks' ),
			states: [ 'hover' ],
			background: {
				full: true,
				prefix: 'card',
				colorKey: 'cardBg',
				statePrefix: { hover: 'cardHover' },
				stateColorKey: { hover: 'cardBgHover' },
			},
			border: {
				widthKeys: CARD_BW,
				styleKey: 'cardBorderStyle',
				colorKey: 'cardBorderColor',
				stateBind: { hover: 'cardBorderColorHover' },
				max: 12,
			},
			radius: { keys: CARD_RADIUS, max: 64 },
			shadow: { bind: 'cardShadow', stateBind: 'Hover' },
			size: {
				bind: 'cardMinHeight',
				label: __( 'Min height', 'axiom-blocks' ),
				responsive: true,
				defaultUnit: 'px',
			},
			ranges: [
				{
					bind: 'cardGap',
					label: __( 'Gap', 'axiom-blocks' ),
					responsive: true,
					units: [ 'px', 'em', 'rem' ],
					max: 80,
					default: 12,
				},
			],
		},
	],
};

/* Mirrors the map in render.php. */
export function cardVars( attributes ) {
	const vars = {
		...getBackgroundVars( attributes, {
			prefix: 'card',
			varName: '--ab-pc-bg',
			colorKey: 'cardBg',
		} ),
		...getBackgroundVars( attributes, {
			prefix: 'cardHover',
			varName: '--ab-pc-bg-hover',
			colorKey: 'cardBgHover',
		} ),
	};

	const set = ( name, val ) => {
		if ( val != null && val !== '' ) {
			vars[ name ] = val;
		}
	};

	set( '--ab-pc-bw-t', attributes.cardBorderTopWidth );
	set( '--ab-pc-bw-r', attributes.cardBorderRightWidth );
	set( '--ab-pc-bw-b', attributes.cardBorderBottomWidth );
	set( '--ab-pc-bw-l', attributes.cardBorderLeftWidth );
	set( '--ab-pc-bs', attributes.cardBorderStyle );
	set( '--ab-pc-bc', attributes.cardBorderColor );
	set( '--ab-pc-bc-h', attributes.cardBorderColorHover );
	set( '--ab-pc-radius-tl', attributes.cardRadiusTopLeft );
	set( '--ab-pc-radius-tr', attributes.cardRadiusTopRight );
	set( '--ab-pc-radius-br', attributes.cardRadiusBottomRight );
	set( '--ab-pc-radius-bl', attributes.cardRadiusBottomLeft );
	set( '--ab-pc-shadow', attributes.cardShadow );
	set( '--ab-pc-shadow-h', attributes.cardShadowHover );
	set( '--ab-pc-min-h', attributes.cardMinHeight );
	set( '--ab-pc-gap', attributes.cardGap );

	return vars;
}

function PostCardEdit( { attributes, setAttributes } ) {
	const { cardRole } = attributes;
	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs(
		attributes,
		RESPONSIVE_KEYS,
		device
	);
	const spacingStyle = useSpacingStyle( attributes );

	const blockProps = useBlockProps( {
		className: [ 'ab-pc', cardRole === 'featured' ? 'ab-pc--featured' : '' ]
			.filter( Boolean )
			.join( ' ' ),
		style: { ...spacingStyle, ...cardVars( resolved ) },
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED,
		templateLock: false,
	} );

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
			/>
			<div { ...innerBlocksProps } />
		</>
	);
}

export const PostCard = {
	name: 'axiom-blocks/post-card',
	settings: {
		title: __( 'Post Card', 'axiom-blocks' ),
		description: __(
			'The card template repeated for every post in a Post Grid. Holds any blocks.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="post-card" />,
		edit: PostCardEdit,
		save: () => <InnerBlocks.Content />,
	},
};
