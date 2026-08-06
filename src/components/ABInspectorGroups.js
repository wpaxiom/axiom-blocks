/**
 * ABInspectorGroups — the part-first inspector frame (native Settings/Styles
 * tabs).
 *
 * Routes a block's inspector into WordPress's two native groups so the sidebar
 * shows real Settings / Styles tabs (no custom chrome):
 *   • Settings tab (default group) — the block-level `leading` panels
 *     (Behavior / content / part settings). The universal Device-Visibility
 *     control adds itself to the Advanced group here.
 *   • Styles tab (group="styles") — one style section per anatomy part (from the
 *     DESIGN declaration, via TargetSection), any `trailing` panels, then the
 *     shared Spacing panel.
 *
 * It is the single switch point the design system routes chrome through. A part
 * that is dual-kind (content + style) receives its content controls through
 * `contentSlots` keyed by the part's noun, and TargetSection shows a
 * [Content | Style] switch for it.
 *
 * Editor-only: this changes where controls render, never a block's saved markup.
 */

import { InspectorControls } from '@wordpress/block-editor';
import { useDeviceType } from './responsive';
import { TargetSection } from './TargetSection';
import { SpacingPanel } from './SpacingPanel';

export function ABInspectorGroups( {
	attributes,
	setAttributes,
	design,
	leading = null,
	trailing = null,
	contentSlots = {},
	spacing = true,
} ) {
	const device = useDeviceType();

	return (
		<>
			<InspectorControls>{ leading }</InspectorControls>
			<InspectorControls group="styles">
				{ design.targets.map( ( target ) => (
					<TargetSection
						key={ target.noun }
						target={ target }
						attributes={ attributes }
						setAttributes={ setAttributes }
						device={ device }
						content={ contentSlots[ target.noun ] || null }
					/>
				) ) }
				{ trailing }
				{ spacing && (
					<SpacingPanel
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				) }
			</InspectorControls>
		</>
	);
}
