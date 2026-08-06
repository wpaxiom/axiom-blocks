/**
 * ABChildOrder — per-device flex/grid order for a block that lives inside a
 * flex/grid Advanced Section (L6 child reorder). Stores `abOrder` (+ Tablet /
 * Mobile via ABResponsive). render_block (inc/Blocks/ChildOrder.php) emits the
 * `order` CSS; lower = earlier. Only mounted when the parent is a flex/grid
 * section (see src/childOrder.js), so it never clutters other blocks.
 */

import { __ } from '@wordpress/i18n';
import { ABRangeControl } from './ABControls';
import { ABResponsive } from './ABResponsive';

export function ABChildOrder( { attributes, setAttributes } ) {
	return (
		<ABResponsive
			attributes={ attributes }
			setAttributes={ setAttributes }
			attrKey="abOrder"
		>
			{ ( { value, setValue, inherited } ) => (
				<ABRangeControl
					label={ __( 'Order', 'axiom-blocks' ) }
					help={ __(
						'Reorder this item within its flex/grid section. Lower = earlier. Set a different value per device to reorder on mobile.',
						'axiom-blocks'
					) }
					value={
						value === '' || value == null
							? inherited || 0
							: value
					}
					onChange={ ( v ) => setValue( v ?? 0 ) }
					min={ -10 }
					max={ 10 }
					step={ 1 }
					unit=""
				/>
			) }
		</ABResponsive>
	);
}
