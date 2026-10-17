/**
 * Contact Form: the options list editor for Select and Choices fields.
 *
 * Each option has a label (what the visitor sees) and an optional value (what
 * the email and entry record). An empty value records the label.
 */

import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

export function OptionsControl( { options, onChange } ) {
	const list = Array.isArray( options ) ? options : [];

	const update = ( index, patch ) =>
		onChange(
			list.map( ( o, i ) => ( i === index ? { ...o, ...patch } : o ) )
		);
	const remove = ( index ) =>
		onChange( list.filter( ( o, i ) => i !== index ) );
	const move = ( index, dir ) => {
		const to = index + dir;
		if ( to < 0 || to >= list.length ) {
			return;
		}
		const next = [ ...list ];
		[ next[ index ], next[ to ] ] = [ next[ to ], next[ index ] ];
		onChange( next );
	};

	return (
		<div className="ab-ctrl ab-cf-options">
			<div className="ab-ctrl__label">
				{ __( 'Options', 'axiom-blocks' ) }
			</div>
			{ list.map( ( option, i ) => (
				<div className="ab-cf-options__row" key={ i }>
					<input
						type="text"
						className="ab-cf-options__label"
						aria-label={ sprintf(
							/* translators: %d: option number. */
							__( 'Option %d label', 'axiom-blocks' ),
							i + 1
						) }
						placeholder={ __( 'Label', 'axiom-blocks' ) }
						value={ option.label || '' }
						onChange={ ( e ) =>
							update( i, { label: e.target.value } )
						}
					/>
					<input
						type="text"
						className="ab-cf-options__value"
						aria-label={ sprintf(
							/* translators: %d: option number. */
							__( 'Option %d value', 'axiom-blocks' ),
							i + 1
						) }
						placeholder={ __( 'Value', 'axiom-blocks' ) }
						value={ option.value || '' }
						onChange={ ( e ) =>
							update( i, { value: e.target.value } )
						}
					/>
					<Button
						size="small"
						icon="arrow-up-alt2"
						label={ __( 'Move up', 'axiom-blocks' ) }
						disabled={ i === 0 }
						onClick={ () => move( i, -1 ) }
					/>
					<Button
						size="small"
						icon="arrow-down-alt2"
						label={ __( 'Move down', 'axiom-blocks' ) }
						disabled={ i === list.length - 1 }
						onClick={ () => move( i, 1 ) }
					/>
					<Button
						size="small"
						icon="no-alt"
						label={ __( 'Remove option', 'axiom-blocks' ) }
						onClick={ () => remove( i ) }
					/>
				</div>
			) ) }
			<Button
				variant="secondary"
				size="small"
				onClick={ () =>
					onChange( [
						...list,
						{
							label: sprintf(
								/* translators: %d: option number. */
								__( 'Option %d', 'axiom-blocks' ),
								list.length + 1
							),
							value: '',
						},
					] )
				}
			>
				{ __( 'Add option', 'axiom-blocks' ) }
			</Button>
			<p className="ab-ctrl__help">
				{ __(
					'Value is what the email records. Leave it empty to record the label.',
					'axiom-blocks'
				) }
			</p>
		</div>
	);
}
