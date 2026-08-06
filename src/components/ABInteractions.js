/**
 * ABInteractions — universal hover-interaction control (hover lift + transition).
 *
 * Injected into every Axiom block's Advanced group. Stores `abHoverLift`
 * (px string) + `abTransition` (seconds). The block's root gets a `.ab-has-hover`
 * class + `--ab-hover-lift` / `--ab-hover-tr` vars (via render_block on the
 * frontend, editor.BlockListBlock in the editor); a static `:hover` rule in
 * style.scss applies the translate. Lift 0 ⇒ no class ⇒ zero output.
 */

import { __ } from '@wordpress/i18n';
import { ABRangeControl, ABSelectControl } from './ABControls';

const TR_OPTIONS = [
	{ label: __( 'Fast', 'axiom-blocks' ), value: '0.15s' },
	{ label: __( 'Normal', 'axiom-blocks' ), value: '0.25s' },
	{ label: __( 'Slow', 'axiom-blocks' ), value: '0.4s' },
];

export function ABInteractions( { attributes, setAttributes } ) {
	const lift = parseInt( attributes.abHoverLift, 10 ) || 0;
	return (
		<>
			<ABRangeControl
				label={ __( 'Hover lift', 'axiom-blocks' ) }
				value={ lift }
				onChange={ ( v ) =>
					setAttributes( { abHoverLift: v ? `${ v }px` : '' } )
				}
				min={ 0 }
				max={ 40 }
				unit="px"
			/>
			{ lift > 0 && (
				<ABSelectControl
					label={ __( 'Transition', 'axiom-blocks' ) }
					value={ attributes.abTransition || '0.25s' }
					onChange={ ( v ) => setAttributes( { abTransition: v } ) }
					options={ TR_OPTIONS }
				/>
			) }
		</>
	);
}
