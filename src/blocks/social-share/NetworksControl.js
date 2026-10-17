/**
 * Social Share: the networks list in the inspector.
 *
 * Each row is one network from networks.json, in display order. A row opens to
 * override its label and icon; "Add network" offers the networks not yet in
 * the list.
 */

import { __, sprintf } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useState } from '@wordpress/element';
import { ABSelectControl, ABTextControl } from '../../components/ABControls';
import { IconControl } from '../../components/IconControl';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { NETWORKS } from './shared';

export function NetworksControl( { items, onChange } ) {
	const list = ( Array.isArray( items ) ? items : [] ).filter(
		( item ) => item && NETWORKS[ item.network ]
	);
	const [ open, setOpen ] = useState( -1 );

	const update = ( index, patch ) =>
		onChange(
			list.map( ( item, i ) =>
				i === index ? { ...item, ...patch } : item
			)
		);
	const remove = ( index ) => {
		setOpen( -1 );
		onChange( list.filter( ( item, i ) => i !== index ) );
	};
	const move = ( index, dir ) => {
		const to = index + dir;
		if ( to < 0 || to >= list.length ) {
			return;
		}
		const next = [ ...list ];
		[ next[ index ], next[ to ] ] = [ next[ to ], next[ index ] ];
		setOpen( open === index ? to : -1 );
		onChange( next );
	};

	const used = new Set( list.map( ( item ) => item.network ) );
	const unused = Object.keys( NETWORKS ).filter(
		( key ) => ! used.has( key )
	);

	return (
		<div className="ab-ctrl ab-ss-networks">
			<div className="ab-ctrl__label">
				{ __( 'Networks', 'axiom-blocks' ) }
			</div>
			{ list.map( ( item, i ) => {
				const net = NETWORKS[ item.network ];
				const name = item.label || net.label;
				return (
					<div className="ab-ss-networks__row" key={ item.network }>
						<div className="ab-ss-networks__head">
							<button
								type="button"
								className="ab-ss-networks__name"
								aria-expanded={ open === i }
								onClick={ () => setOpen( open === i ? -1 : i ) }
							>
								<span
									className="ab-ss-networks__glyph"
									style={ { color: net.color } }
								>
									{ ICON_LIBRARY[ item.icon || net.icon ] }
								</span>
								<span>{ name }</span>
							</button>
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
								label={ sprintf(
									/* translators: %s: network name. */
									__( 'Remove %s', 'axiom-blocks' ),
									name
								) }
								onClick={ () => remove( i ) }
							/>
						</div>
						{ open === i && (
							<div className="ab-ss-networks__body">
								<ABTextControl
									label={ __( 'Label', 'axiom-blocks' ) }
									value={ item.label || '' }
									placeholder={ net.label }
									onChange={ ( v ) =>
										update( i, { label: v } )
									}
								/>
								<IconControl
									label={ __( 'Icon', 'axiom-blocks' ) }
									value={ item.icon || '' }
									fallback={ net.icon }
									clearable
									placeholder={ __(
										'Default',
										'axiom-blocks'
									) }
									onChange={ ( v ) =>
										update( i, { icon: v || '' } )
									}
								/>
							</div>
						) }
					</div>
				);
			} ) }
			{ unused.length > 0 && (
				<ABSelectControl
					label={ __( 'Add network', 'axiom-blocks' ) }
					value=""
					options={ [
						{ label: __( 'Choose…', 'axiom-blocks' ), value: '' },
						...unused.map( ( key ) => ( {
							label: NETWORKS[ key ].label,
							value: key,
						} ) ),
					] }
					onChange={ ( key ) =>
						key && onChange( [ ...list, { network: key } ] )
					}
				/>
			) }
		</div>
	);
}
