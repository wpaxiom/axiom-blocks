import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	useDeviceType,
	resolveResponsiveAttrs,
} from '../../components/responsive';
import {
	ABSelectControl,
	ABRangeControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { getBackgroundVars } from '../../components/BackgroundControl';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const TRACK_DEFAULT = '#e5e7eb';
const BG_VAR = '--ab-rpb-bar-bg';

/* Mirrors Background::value() in render.php — the fill is a plain `background`
 * declaration in both, so the two must resolve the same string. */
const barBackground = ( attrs ) =>
	getBackgroundVars( attrs, {
		prefix: 'bar',
		varName: BG_VAR,
		colorKey: 'color',
	} )[ BG_VAR ] ||
	attrs.color ||
	'';

/* Anatomy-as-declaration — one Bar part (the block is a single decorative
 * element). `color` is the fill, re-homed onto BackgroundControl so it gains a
 * gradient; image/overlay are off — the bar is a few pixels tall, and the
 * control documents this exact case. `backgroundColor` is the track behind the
 * fill and rides along as a second color row, shown only while the track is on.
 * Static — no states, ever. save() is null (fully dynamic) so nothing is saved. */
const designFor = ( { showTrack } ) => ( {
	block: 'rpb',
	targets: [
		{
			noun: __( 'Bar', 'axiom-blocks' ),
			background: {
				full: true,
				label: __( 'Fill', 'axiom-blocks' ),
				prefix: 'bar',
				colorKey: 'color',
				image: false,
				overlay: false,
				insertAfter: -1,
			},
			colors: showTrack
				? [
						{
							label: __( 'Track', 'axiom-blocks' ),
							bind: 'backgroundColor',
							fallback: TRACK_DEFAULT,
						},
				  ]
				: [],
			ranges: [
				{
					bind: 'height',
					label: __( 'Height', 'axiom-blocks' ),
					min: 1,
					max: 20,
					default: 4,
					responsive: true,
				},
			],
		},
	],
} );

function ReadingProgressBarEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'reading-progress-bar' ) ) {
		return <DisabledBlockMessage blockName="Reading Progress Bar" />;
	}
	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs( attributes, [ 'height' ], device );
	const { position, height, backgroundColor, showTrack, zIndex } = resolved;

	const blockProps = useBlockProps( {
		className: 'axiom-blocks-reading-progress-bar-preview',
	} );

	const leading = (
		<PanelBody
			title={ __( 'Position', 'axiom-blocks' ) }
			initialOpen={ true }
		>
			<ABSelectControl
				label={ __( 'Position', 'axiom-blocks' ) }
				value={ position }
				options={ [
					{
						label: __( 'Top of viewport', 'axiom-blocks' ),
						value: 'top',
					},
					{
						label: __( 'Bottom of viewport', 'axiom-blocks' ),
						value: 'bottom',
					},
				] }
				onChange={ ( v ) => setAttributes( { position: v } ) }
			/>
			<ABToggleControl
				label={ __( 'Show track background', 'axiom-blocks' ) }
				checked={ showTrack }
				onChange={ ( v ) => setAttributes( { showTrack: v } ) }
				help={ __(
					'The unfilled part of the bar. Its color lives in Styles → Bar.',
					'axiom-blocks'
				) }
			/>
			<ABRangeControl
				label={ __( 'Z-index', 'axiom-blocks' ) }
				value={ zIndex }
				onChange={ ( v ) => setAttributes( { zIndex: v ?? 9999 } ) }
				min={ 1 }
				max={ 99999 }
				step={ 1 }
				unit=""
				help={ __(
					'Raise if the bar is hidden behind sticky headers.',
					'axiom-blocks'
				) }
			/>
		</PanelBody>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ designFor( attributes ) }
				leading={ leading }
				spacing={ false }
			/>

			<div { ...blockProps }>
				<div className="axiom-blocks-reading-progress-bar-preview__label">
					{ __( 'Reading Progress Bar', 'axiom-blocks' ) }
					<span className="axiom-blocks-reading-progress-bar-preview__pos">
						{ position === 'top'
							? __( 'fixed to top', 'axiom-blocks' )
							: __( 'fixed to bottom', 'axiom-blocks' ) }
					</span>
				</div>
				<div
					className="axiom-blocks-reading-progress-bar-preview__bar"
					style={ {
						background: showTrack
							? backgroundColor || undefined
							: 'transparent',
						height,
					} }
				>
					<div
						className="axiom-blocks-reading-progress-bar-preview__fill"
						style={ {
							background: barBackground( attributes ),
							width: '42%',
						} }
					/>
				</div>
				<p className="axiom-blocks-reading-progress-bar-preview__hint">
					{ __(
						'Preview only. On the frontend the bar is fixed to the viewport and fills as visitors scroll.',
						'axiom-blocks'
					) }
				</p>
			</div>
		</>
	);
}

export const ReadingProgressBar = {
	name: 'axiom-blocks/reading-progress-bar',
	settings: {
		title: __( 'Reading Progress Bar', 'axiom-blocks' ),
		description: __(
			'Sticky bar that fills as the reader scrolls through the page.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="reading-progress-bar" />,
		edit: ReadingProgressBarEdit,
		save: () => null,
	},
};
