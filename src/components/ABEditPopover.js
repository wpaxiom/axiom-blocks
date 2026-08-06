/**
 * ABEditPopover — the shared popover shell for composite design controls
 * (Background, Border, Typography, Size, Shadow, Date). One affordance
 * everywhere: a summary row (glyph + current-value summary + caret) opens a
 * workspace whose header carries the title, an optional device switcher, and a
 * Reset action; the body slot holds the capability's controls.
 *
 * Generalizes the IconControl Dropdown pattern — the trigger reuses the shipped
 * `.ab-icon-control__btn`; only the shell head/body are new
 * (`.ab-edit-popover` in src/editor.scss). WP's Popover supplies the outer
 * frame, so the shell adds no border/shadow of its own.
 *
 * The popover uses `shift: true` so it auto-pushes toward the main viewport
 * when it overlaps the top or bottom edge — no cut-off controls.
 */

import { __ } from '@wordpress/i18n';
import { Dropdown } from '@wordpress/components';
import { Caret } from './Caret';

export function ABEditPopover( {
	label,
	glyph = null,
	summary,
	isDefault = false,
	placeholder = __( 'None', 'axiom-blocks' ),
	title,
	device = null,
	onReset,
	resetLabel = __( 'Reset', 'axiom-blocks' ),
	popoverProps = {},
	children,
} ) {
	const heading = title || label;

	return (
		<div className="ab-icon-control">
			{ label && (
				<span className="ab-icon-control__label">{ label }</span>
			) }
			<Dropdown
				className="ab-icon-control__pick"
				popoverProps={ {
					placement: 'left-start',
					shift: true,
					// WP's Popover defaults to z-index 1000000, which sits ABOVE
					// the media modal (160000) — so the popover would cover the
					// media library. Drop it below the modal (and other WP
					// overlays) but above the editor chrome.
					className: 'ab-edit-popover-frame',
					...popoverProps,
				} }
				renderToggle={ ( { isOpen, onToggle } ) => (
					<button
						type="button"
						className="ab-icon-control__btn"
						onClick={ onToggle }
						aria-expanded={ isOpen }
					>
						{ glyph && (
							<span className="ab-icon-control__glyph">
								{ glyph }
							</span>
						) }
						<span
							className={ `ab-icon-control__name${
								isDefault ? ' is-placeholder' : ''
							}` }
						>
							{ isDefault ? placeholder : summary }
						</span>
						<Caret className="ab-icon-control__chevron" />
					</button>
				) }
				renderContent={ () => (
					<div className="ab-edit-popover">
						<div className="ab-edit-popover__head">
							<span className="ab-edit-popover__title">
								{ heading }
							</span>
							{ ( device || onReset ) && (
								<div className="ab-edit-popover__actions">
									{ device }
									{ onReset && (
										<button
											type="button"
											className="ab-ctrl__reset"
											onClick={ onReset }
										>
											{ resetLabel }
										</button>
									) }
								</div>
							) }
						</div>
						<div className="ab-edit-popover__body">
							{ children }
						</div>
					</div>
				) }
			/>
		</div>
	);
}
