/**
 * BS-styled native date picker. Wraps <input type="date"> so the value stays
 * a simple ISO string (YYYY-MM-DD) the PHP date_query can consume directly.
 */

export function ABDateControl( { label, value, onChange, help, min, max } ) {
	return (
		<div className="ab-ctrl">
			{ label && <div className="ab-ctrl__label">{ label }</div> }
			<input
				type="date"
				className="ab-ctrl__text-input"
				value={ value || '' }
				min={ min }
				max={ max }
				onChange={ ( e ) => onChange( e.target.value ) }
			/>
			{ help && <p className="ab-ctrl__help">{ help }</p> }
		</div>
	);
}
