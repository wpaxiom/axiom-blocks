import { __ } from '@wordpress/i18n';
import { blockDocs } from '../links';
import {
	Toggle,
	TierBadge,
	LockIcon,
	DocIcon,
	BlockIcon,
	InboxIcon,
	MailIcon,
} from './ui';

const proInstalled = !! window.axiomBlocksData?.proActive;
const entriesUrl = window.axiomBlocksData?.entries?.url;

export function BlockCard( { block, onToggle, onOpenTab } ) {
	const isPro = block.tier === 'pro' || block.tier === 'wc-pro';
	const locked = isPro && ! proInstalled;
	// The Contact Form card links to its entries and to the Email tab.
	const isForm = block.id === 'contact-form';

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
					{ isForm && (
						<div className="ab-card__links">
							{ entriesUrl && (
								<a className="ab-focus" href={ entriesUrl }>
									<InboxIcon size={ 11 } />
									{ __( 'Entries', 'axiom-blocks' ) }
								</a>
							) }
							<button
								type="button"
								className="ab-focus"
								onClick={ () => onOpenTab?.( 'email' ) }
							>
								<MailIcon size={ 11 } />
								{ __( 'Email settings', 'axiom-blocks' ) }
							</button>
						</div>
					) }
				</div>
				<Toggle
					on={ block.enabled }
					label={ block.name }
					onChange={ () => onToggle( block.id, ! block.enabled ) }
					disabled={ locked }
				/>
			</div>
			<div className="ab-card__footer">
				<div className="ab-card__badges">
					<TierBadge tier={ block.tier } />
				</div>
				<a
					href={ blockDocs( block.id, 'block-card' ) }
					target="_blank"
					rel="noopener noreferrer"
					className="ab-card__docs"
				>
					<DocIcon size={ 11 } /> { __( 'Docs', 'axiom-blocks' ) }
					<span className="screen-reader-text">
						{ __( '(opens in a new tab)', 'axiom-blocks' ) }
					</span>
				</a>
			</div>
		</div>
	);
}
