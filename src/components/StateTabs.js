/**
 * StateTabs — segmented switch for a part's interaction states
 * (Normal / Hover / Active). Also the generic segmented control the design
 * layer reuses for Background type, Shadow preset, [Content | Style], and the
 * Device-Visibility segmented variant.
 *
 * Thin wrapper over the shipped `.ab-part-switch` styles — no new CSS. States
 * never combine with responsive (no per-breakpoint state value), so this is a
 * plain single-select with no device axis.
 *
 * `options` is an array of strings or `{ value, label, icon }`.
 */

export function StateTabs( { options, value, onChange, className = '' } ) {
	return (
		<div
			className={ `ab-part-switch${
				className ? ` ${ className }` : ''
			}` }
		>
			{ options.map( ( opt ) => {
				const val = typeof opt === 'string' ? opt : opt.value;
				const label = typeof opt === 'string' ? opt : opt.label;
				const icon = typeof opt === 'string' ? null : opt.icon;
				const isActive = val === value;

				return (
					<button
						key={ val }
						type="button"
						className={ `ab-part-switch__btn${
							isActive ? ' is-active' : ''
						}` }
						onClick={ () => onChange( val ) }
						aria-pressed={ isActive }
					>
						{ icon }
						{ label }
					</button>
				);
			} ) }
		</div>
	);
}
