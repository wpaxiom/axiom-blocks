/**
 * ABPosition — universal position / z-index / offset control (L9), wrapped in
 * an ABEditPopover trigger (same affordance as Border / Typography).
 *
 * Injected into every Axiom block's Advanced group. Stores `abPosition`
 * (relative/absolute/fixed/sticky), four offsets (`abOffsetTop/Right/Bottom/Left`,
 * px strings) and `abZIndex`. The block's root gets inline `position` + offsets +
 * `z-index` via render_block on the frontend (inc/Blocks/Position.php); an unset
 * position ⇒ no output ⇒ byte-identical. Offsets/z-index only apply once a
 * position is chosen.
 */

import { __ } from '@wordpress/i18n';
import { ABSelectControl, ABRangeControl } from './ABControls';
import { ABEditPopover } from './ABEditPopover';

const POSITION_OPTIONS = [
	{ label: __( 'Default', 'axiom-blocks' ), value: '' },
	{ label: __( 'Relative', 'axiom-blocks' ), value: 'relative' },
	{ label: __( 'Absolute', 'axiom-blocks' ), value: 'absolute' },
	{ label: __( 'Fixed', 'axiom-blocks' ), value: 'fixed' },
	{ label: __( 'Sticky', 'axiom-blocks' ), value: 'sticky' },
];

const OFFSETS = [
	[ 'abOffsetTop', __( 'Top', 'axiom-blocks' ) ],
	[ 'abOffsetRight', __( 'Right', 'axiom-blocks' ) ],
	[ 'abOffsetBottom', __( 'Bottom', 'axiom-blocks' ) ],
	[ 'abOffsetLeft', __( 'Left', 'axiom-blocks' ) ],
];

const PositionIcon = () => (
	<svg
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.5"
		strokeLinecap="round"
		strokeLinejoin="round"
		style={ { width: 20, height: 20, minWidth: 20, flexShrink: 0 } }
	>
		<path d="M12 3v18M3 12h18" />
		<circle cx="12" cy="12" r="2.5" />
	</svg>
);

export function ABPosition( { attributes, setAttributes } ) {
	const position = attributes.abPosition || '';
	const num = ( v ) => parseInt( v, 10 ) || 0;

	const hasPosition = !!position;
	const posLabel = POSITION_OPTIONS.find(
		( o ) => o.value === position
	)?.label;

	const hasAnyValue =
		hasPosition ||
		OFFSETS.some( ( [ key ] ) => attributes[ key ] ) ||
		!!attributes.abZIndex;

	const reset = () => {
		const update = { abPosition: '', abZIndex: '' };
		OFFSETS.forEach( ( [ key ] ) => {
			update[ key ] = '';
		} );
		setAttributes( update );
	};

	// Absolute floats the block from its own spot, so Bottom has no effect
	// (see inc/Blocks/Position.php); hide it in that mode.
	const offsets =
		position === 'absolute'
			? OFFSETS.filter( ( [ key ] ) => key !== 'abOffsetBottom' )
			: OFFSETS;

	return (
		<ABEditPopover
			label={ __( 'Position', 'axiom-blocks' ) }
			title={ __( 'Position', 'axiom-blocks' ) }
			glyph={ <PositionIcon /> }
			summary={ hasPosition ? posLabel : '' }
			isDefault={ ! hasPosition }
			placeholder={ __( 'None', 'axiom-blocks' ) }
			onReset={ hasAnyValue ? reset : undefined }
		>
			<ABSelectControl
				label={ __( 'Position', 'axiom-blocks' ) }
				value={ position }
				options={ POSITION_OPTIONS }
				onChange={ ( v ) => setAttributes( { abPosition: v } ) }
			/>
			{ position === 'fixed' && (
				<p className="ab-ctrl__help">
					{ __(
						'Fixed positioning previews on the frontend only.',
						'axiom-blocks'
					) }
				</p>
			) }
			{ position && (
				<>
					{ offsets.map( ( [ key, label ] ) => (
						<ABRangeControl
							key={ key }
							label={ label }
							value={ num( attributes[ key ] ) }
							onChange={ ( v ) =>
								setAttributes( {
									// Store 0 too — an offset of 0 (e.g. top:0)
									// pins the block to an edge; it is a real
									// value, not "unset".
									[ key ]: Number.isFinite( v )
										? `${ v }px`
										: '',
								} )
							}
							min={ -500 }
							max={ 500 }
							unit="px"
						/>
					) ) }
					<ABRangeControl
						label={ __( 'Z-index', 'axiom-blocks' ) }
						value={ num( attributes.abZIndex ) }
						onChange={ ( v ) =>
							setAttributes( {
								abZIndex: v ? String( v ) : '',
							} )
						}
						min={ 0 }
						max={ 999 }
						unit=""
					/>
				</>
			) }
		</ABEditPopover>
	);
}
