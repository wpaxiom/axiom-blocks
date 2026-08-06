/**
 * AlignControl — shared element-alignment capability.
 *
 * Positions the element itself within its container (left / center / right) or
 * stretches it to fill (full). This is NOT `text-align` (that lives in
 * TypographyPanel and aligns inline content inside a box); this aligns the box.
 * Element width / full-width of the block wrapper stays with WordPress native
 * align (none / wide / full) — `full` here means the element stretches
 * (`width:100%`), which native align cannot do.
 *
 * The control only writes the bound attribute; each block wires the CSS for its
 * own markup (wrapper text-align + element stretch), the same way colors and
 * borders are wired per block.
 *
 * Uses the standard `ab-ctrl` field wrapper + `ab-ctrl__label` (matching every
 * other inspector control's label + 16px spacing) with the shared `ab-tp-seg`
 * segmented buttons for the options.
 */

import { __ } from '@wordpress/i18n';

const Svg = ( { children } ) => (
	<svg
		className="ab-tp-icon"
		width="14"
		height="14"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="1.8"
		strokeLinecap="round"
		strokeLinejoin="round"
		aria-hidden="true"
	>
		{ children }
	</svg>
);

const IconNone = () => (
	<Svg>
		<line x1="5" y1="19" x2="19" y2="5" />
	</Svg>
);
const IconLeft = () => (
	<Svg>
		<line x1="4" y1="4" x2="4" y2="20" />
		<rect x="7" y="9" width="9" height="6" rx="1" />
	</Svg>
);
const IconCenter = () => (
	<Svg>
		<line x1="12" y1="4" x2="12" y2="20" />
		<rect x="6" y="9" width="12" height="6" rx="1" />
	</Svg>
);
const IconRight = () => (
	<Svg>
		<line x1="20" y1="4" x2="20" y2="20" />
		<rect x="8" y="9" width="9" height="6" rx="1" />
	</Svg>
);
const IconFull = () => (
	<Svg>
		<rect x="3" y="9" width="18" height="6" rx="1" />
	</Svg>
);

const OPTIONS = [
	{ value: '', title: __( 'Default', 'axiom-blocks' ), icon: <IconNone /> },
	{ value: 'left', title: __( 'Left', 'axiom-blocks' ), icon: <IconLeft /> },
	{
		value: 'center',
		title: __( 'Center', 'axiom-blocks' ),
		icon: <IconCenter />,
	},
	{
		value: 'right',
		title: __( 'Right', 'axiom-blocks' ),
		icon: <IconRight />,
	},
	{
		value: 'full',
		title: __( 'Full width', 'axiom-blocks' ),
		icon: <IconFull />,
	},
];

export function AlignControl( { value, onChange, label } ) {
	const resolvedLabel = label || __( 'Alignment', 'axiom-blocks' );
	return (
		<div className="ab-ctrl">
			<div className="ab-ctrl__label">{ resolvedLabel }</div>
			<div
				className="ab-tp-seg"
				role="radiogroup"
				aria-label={ resolvedLabel }
			>
				{ OPTIONS.map( ( opt ) => {
					const active = ( opt.value || '' ) === ( value || '' );
					return (
						<button
							key={ opt.value || 'default' }
							type="button"
							role="radio"
							aria-checked={ active }
							className={ `ab-tp-seg__btn${
								active ? ' is-active' : ''
							}` }
							title={ opt.title }
							onClick={ () => onChange( opt.value ) }
						>
							{ opt.icon }
						</button>
					);
				} ) }
			</div>
		</div>
	);
}
