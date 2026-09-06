/**
 * ABTokenControl — kept as the name several blocks already import.
 *
 * The multi-select primitive now lives in ABControls as
 * `ABMultiSelectControl`, on the `.ab-ctrl` field scheme like every other
 * control. This module forwards to it, so anything importing the old name
 * keeps working and picks up the styled control. Props are unchanged, and the
 * value contract is identical: `value` is an array of option values and
 * onChange receives those values untouched.
 *
 * Prefer importing `ABMultiSelectControl` directly in new code.
 */

import { ABMultiSelectControl } from './ABControls';

export function ABTokenControl( props ) {
	return <ABMultiSelectControl { ...props } />;
}
