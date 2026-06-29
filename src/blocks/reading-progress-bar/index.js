import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import { useDeviceType, resolveResponsiveAttrs } from '../../components/responsive';
import {
	ABSelectControl,
	ABRangeControl,
	ABColorControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABResponsive } from '../../components/ABResponsive';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseFloat( v );

function ReadingProgressBarEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'reading-progress-bar' ) ) {
		return <DisabledBlockMessage blockName="Reading Progress Bar" />;
	}
	const device = useDeviceType();
	const resolved = resolveResponsiveAttrs( attributes, [ 'height' ], device );
	const { position, height, color, backgroundColor, showTrack, zIndex } =
		resolved;

	const blockProps = useBlockProps( {
		className: 'axiom-blocks-reading-progress-bar-preview',
	} );

	return (
		<>
			<InspectorControls>
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
								label: __(
									'Bottom of viewport',
									'axiom-blocks'
								),
								value: 'bottom',
							},
						] }
						onChange={ ( v ) => setAttributes( { position: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Z-index', 'axiom-blocks' ) }
						value={ zIndex }
						onChange={ ( v ) =>
							setAttributes( { zIndex: v ?? 9999 } )
						}
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

				<PanelBody
					title={ __( 'Style', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="height"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Height', 'axiom-blocks' ) }
								value={ fromPx(
									value === '' ? inherited : value,
									4
								) }
								onChange={ ( v ) => setValue( toPx( v ) ) }
								min={ 1 }
								max={ 20 }
								step={ 1 }
								unit="px"
							/>
						) }
					</ABResponsive>
					<ABColorControl
						label={ __( 'Fill color', 'axiom-blocks' ) }
						color={ color }
						defaultColor="#7C3AED"
						onChange={ ( c ) => setAttributes( { color: c } ) }
					/>
					<ABToggleControl
						label={ __( 'Show track background', 'axiom-blocks' ) }
						checked={ showTrack }
						onChange={ ( v ) => setAttributes( { showTrack: v } ) }
					/>
					{ showTrack && (
						<ABColorControl
							label={ __( 'Track color', 'axiom-blocks' ) }
							color={ backgroundColor }
							defaultColor="#e5e7eb"
							onChange={ ( c ) =>
								setAttributes( { backgroundColor: c } )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>

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
						background: showTrack ? backgroundColor : 'transparent',
						height,
					} }
				>
					<div
						className="axiom-blocks-reading-progress-bar-preview__fill"
						style={ { background: color, width: '42%' } }
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
