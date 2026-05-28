import { __ } from '@wordpress/i18n';
import { Toggle, TierBadge, LockIcon, DocIcon, BlockIcon } from './ui';

const proInstalled = !! window.axiomBlocksData?.proActive;

export function BlockCard( { block, onToggle } ) {
	const isPro = block.tier === 'pro' || block.tier === 'wc-pro';
	const locked = isPro && ! proInstalled;

	return (
		<div className={ `ab-card ${ locked ? 'ab-card--disabled' : '' }` }>
			<div className="ab-card__top">
				<div className="ab-card__icon-wrap">
					<BlockIcon slug={ block.id } size={ 18 } />
				</div>
				<div className="ab-card__info">
					<div className="ab-card__name-row">
						<span className="ab-card__name">{ block.name }</span>
						{ locked && (
							<span className="ab-card__pro-badge">
								<LockIcon size={ 9 } />{ ' ' }
								{ __( 'GO PRO', 'axiom-blocks' ) }
							</span>
						) }
					</div>
					<p className="ab-card__desc">{ block.description }</p>
				</div>
				<Toggle
					on={ block.enabled }
					onChange={ () => onToggle( block.id, ! block.enabled ) }
					disabled={ locked }
				/>
			</div>
			<div className="ab-card__footer">
				<div className="ab-card__badges">
					<TierBadge tier={ block.tier } />
				</div>
				<a
					href={ `https://www.wpaxiom.com/docs/axiom-blocks/${ block.id }-block` }
					target="_blank"
					rel="noopener noreferrer"
					className="ab-card__docs"
				>
					<DocIcon size={ 11 } /> { __( 'Docs', 'axiom-blocks' ) }
				</a>
			</div>
		</div>
	);
}
