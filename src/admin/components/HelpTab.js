/**
 * Help tab.
 *
 * The one place for docs, videos and support:
 *
 * - First steps: three simple step cards and a checklist worked out on the
 *   server. Once everything is done it folds down to one line.
 * - Video tutorials: the episode that is out, with its YouTube thumbnail, and
 *   cards for the next ones. Each opens the docs page that embeds it.
 * - Documentation: the guides, plus one card per block from the block list.
 * - Get support: forum, bug report, feature request, review.
 * - System info: versions and settings to paste into a support request.
 */

import { useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { blockDocs, link } from '../links';
import {
	AlertIcon,
	BlockIcon,
	BookIcon,
	ChatIcon,
	CheckIcon,
	ExternalIcon,
	PlayIcon,
	SparkIcon,
	SR,
	StarIcon,
	TickIcon,
	VideoIcon,
} from './ui';

const NEW_TAB = __( '(opens in a new tab)', 'axiom-blocks' );

const CATEGORY = {
	layout: __( 'Layout', 'axiom-blocks' ),
	content: __( 'Content', 'axiom-blocks' ),
	dynamic: __( 'Dynamic', 'axiom-blocks' ),
	form: __( 'Forms', 'axiom-blocks' ),
	woocommerce: __( 'WooCommerce', 'axiom-blocks' ),
};

function SectionHead( { id, title, intro, action } ) {
	return (
		<div className="ab-help-head">
			<div>
				<h2 id={ id }>{ title }</h2>
				{ intro && <p>{ intro }</p> }
			</div>
			{ action }
		</div>
	);
}

function OutLink( { href, className = '', children } ) {
	return (
		<a
			className={ `${ className } ab-focus` }
			href={ href }
			target="_blank"
			rel="noopener noreferrer"
		>
			{ children }
			<SR>{ NEW_TAB }</SR>
		</a>
	);
}

function Step( { n, title, text, done, children } ) {
	return (
		<li className="ab-gs-step">
			<div className="ab-gs-step__head">
				<span
					className={ `ab-gs-step__num${ done ? ' is-done' : '' }` }
					aria-hidden="true"
				>
					{ done ? <TickIcon size={ 16 } strokeWidth={ 3 } /> : n }
				</span>
				<span className="ab-gs-step__eyebrow">
					{ sprintf(
						/* translators: %d: step number. */
						__( 'Step %d of 3', 'axiom-blocks' ),
						n
					) }
				</span>
				{ done && (
					<span className="ab-pill ab-pill--ok">
						{ __( 'Done', 'axiom-blocks' ) }
					</span>
				) }
			</div>
			<h3 className="ab-gs-step__title">{ title }</h3>
			<p className="ab-gs-step__text">{ text }</p>
			<div className="ab-gs-step__action">{ children }</div>
		</li>
	);
}

function FirstSteps( { state, newPageUrl } ) {
	const checklist = state?.checklist || {};
	const items = [
		{
			key: 'block',
			label: __( 'Used an Axiom block on a page', 'axiom-blocks' ),
		},
		{ key: 'test', label: __( 'Sent a test email', 'axiom-blocks' ) },
		state?.formOn && {
			key: 'entry',
			label: __( 'Received your first form entry', 'axiom-blocks' ),
		},
	].filter( Boolean );
	const doneCount = items.filter( ( i ) => checklist[ i.key ] ).length;
	const allDone = doneCount === items.length;
	const [ open, setOpen ] = useState( ! allDone );

	const progress = sprintf(
		/* translators: 1: items done, 2: items in total. */
		__( '%1$d of %2$d done', 'axiom-blocks' ),
		doneCount,
		items.length
	);

	if ( allDone && ! open ) {
		return (
			<section className="ab-help-done" aria-labelledby="ab-help-steps">
				<CheckIcon size={ 18 } />
				<h2 id="ab-help-steps">
					{ __(
						'First steps done. You know your way around.',
						'axiom-blocks'
					) }
				</h2>
				<button
					type="button"
					className="ab-link-button ab-focus"
					onClick={ () => setOpen( true ) }
					aria-expanded="false"
				>
					{ __( 'Show the steps', 'axiom-blocks' ) }
				</button>
			</section>
		);
	}

	return (
		<section className="ab-help-section" aria-labelledby="ab-help-steps">
			<SectionHead
				id="ab-help-steps"
				title={ __( 'First steps', 'axiom-blocks' ) }
				intro={ __(
					'Three steps to your first page. Your progress is saved as you go.',
					'axiom-blocks'
				) }
				action={
					allDone ? (
						<button
							type="button"
							className="ab-link-button ab-focus"
							onClick={ () => setOpen( false ) }
							aria-expanded="true"
						>
							{ __( 'Hide the steps', 'axiom-blocks' ) }
						</button>
					) : (
						<span className="ab-help-progress">{ progress }</span>
					)
				}
			/>

			<ol
				className="ab-gs-steps"
				aria-label={ __( 'First steps', 'axiom-blocks' ) }
			>
				<Step
					n={ 1 }
					done={ !! checklist.block }
					title={ __( 'Add your first block', 'axiom-blocks' ) }
					text={ __(
						'Open a new page, type / and pick a block with the purple icon.',
						'axiom-blocks'
					) }
				>
					<a className="ab-btn-primary ab-focus" href={ newPageUrl }>
						{ __( 'Create a page', 'axiom-blocks' ) }
					</a>
				</Step>
				<Step
					n={ 2 }
					title={ __(
						'Learn how every block works',
						'axiom-blocks'
					) }
					text={ __(
						'Settings, Styles, devices and hover states work the same way in every block. Learn them once.',
						'axiom-blocks'
					) }
				>
					<OutLink
						className="ab-btn-ghost ab-btn-ghost--lg"
						href={ link( 'videos', 'help-steps' ) }
					>
						{ __( 'Watch the short video', 'axiom-blocks' ) }
						<ExternalIcon size={ 13 } />
					</OutLink>
				</Step>
				<Step
					n={ 3 }
					title={ __( 'Pick what you are building', 'axiom-blocks' ) }
					text={ __(
						'A short guide names the blocks to use for each kind of site.',
						'axiom-blocks'
					) }
				>
					{ [
						[ 'path-store', __( 'Online store', 'axiom-blocks' ) ],
						[ 'path-blog', __( 'Blog', 'axiom-blocks' ) ],
						[ 'path-site', __( 'Business site', 'axiom-blocks' ) ],
					].map( ( [ page, label ] ) => (
						<OutLink
							key={ page }
							className="ab-gs-step__link"
							href={ link( page, 'help-steps' ) }
						>
							{ label }
						</OutLink>
					) ) }
				</Step>
			</ol>

			<div className="ab-gs-check">
				<div className="ab-gs-check__bar" aria-hidden="true">
					<div
						className={ allDone ? 'is-done' : '' }
						style={ {
							width: `${ ( doneCount / items.length ) * 100 }%`,
						} }
					/>
				</div>
				<ul className="ab-gs-check__list">
					{ items.map( ( item ) => {
						const done = !! checklist[ item.key ];
						return (
							<li
								key={ item.key }
								className={ done ? 'is-done' : '' }
							>
								<span
									className="ab-gs-check__mark"
									aria-hidden="true"
								>
									{ done && (
										<TickIcon
											size={ 13 }
											strokeWidth={ 3 }
										/>
									) }
								</span>
								<span className="ab-gs-check__label">
									{ item.label }
								</span>
								<span className="ab-gs-check__state">
									{ done
										? __( 'Done', 'axiom-blocks' )
										: __( 'Not done', 'axiom-blocks' ) }
								</span>
							</li>
						);
					} ) }
				</ul>
			</div>
		</section>
	);
}

function Videos( { thumb } ) {
	const upcoming = [
		__(
			'How every block works: Settings, Styles, devices and hover',
			'axiom-blocks'
		),
		__( 'Build your first section: a hero with buttons', 'axiom-blocks' ),
	];
	return (
		<section className="ab-help-section" aria-labelledby="ab-help-videos">
			<SectionHead
				id="ab-help-videos"
				title={ __( 'Video tutorials', 'axiom-blocks' ) }
				intro={ __(
					'Short videos, each on a docs page with the written steps beside it.',
					'axiom-blocks'
				) }
				action={
					<OutLink
						className="ab-help-more"
						href={ link( 'videos', 'help-videos' ) }
					>
						{ __( 'See all videos', 'axiom-blocks' ) }
						<ExternalIcon size={ 12 } />
					</OutLink>
				}
			/>
			<div className="ab-help-videos">
				<OutLink
					className="ab-help-video"
					href={ link( 'video-getting-started', 'help-videos' ) }
				>
					<span className="ab-help-video__thumb" aria-hidden="true">
						{ thumb && <img src={ thumb } alt="" /> }
						<span className="ab-help-video__play">
							<PlayIcon size={ 26 } />
						</span>
					</span>
					<span className="ab-help-video__body">
						<span className="ab-help-video__eyebrow">
							{ __( 'Episode 1', 'axiom-blocks' ) }
						</span>
						<span className="ab-help-video__title">
							{ __(
								'Install Axiom Blocks and publish your first block',
								'axiom-blocks'
							) }
						</span>
					</span>
				</OutLink>
				{ upcoming.map( ( title, i ) => (
					<div key={ title } className="ab-help-video is-upcoming">
						<span
							className="ab-help-video__thumb"
							aria-hidden="true"
						>
							<span className="ab-help-video__soon">
								<VideoIcon size={ 22 } />
							</span>
						</span>
						<span className="ab-help-video__body">
							<span className="ab-help-video__eyebrow">
								{ sprintf(
									/* translators: %d: episode number. */
									__( 'Episode %d', 'axiom-blocks' ),
									i + 2
								) }
								<span className="ab-pill">
									{ __( 'Coming soon', 'axiom-blocks' ) }
								</span>
							</span>
							<span className="ab-help-video__title">
								{ title }
							</span>
						</span>
					</div>
				) ) }
			</div>
		</section>
	);
}

function Docs( { blocks } ) {
	const guides = [
		[ 'getting-started', __( 'Getting started', 'axiom-blocks' ) ],
		[ 'path-store', __( 'Online store', 'axiom-blocks' ) ],
		[ 'path-blog', __( 'Blog', 'axiom-blocks' ) ],
		[ 'path-site', __( 'Business site', 'axiom-blocks' ) ],
		[ 'email-delivery', __( 'Email delivery', 'axiom-blocks' ) ],
	];
	return (
		<section className="ab-help-section" aria-labelledby="ab-help-docs">
			<SectionHead
				id="ab-help-docs"
				title={ __( 'Documentation', 'axiom-blocks' ) }
				intro={ __(
					'A guide for each kind of site, and a page for every block.',
					'axiom-blocks'
				) }
				action={
					<OutLink
						className="ab-help-more"
						href={ link( 'docs', 'help-docs' ) }
					>
						{ __( 'Open the docs', 'axiom-blocks' ) }
						<ExternalIcon size={ 12 } />
					</OutLink>
				}
			/>
			<div className="ab-help-guides">
				<BookIcon size={ 15 } />
				{ guides.map( ( [ page, label ] ) => (
					<OutLink
						key={ page }
						className="ab-gs-step__link"
						href={ link( page, 'help-docs' ) }
					>
						{ label }
					</OutLink>
				) ) }
			</div>
			<ul className="ab-help-blocks">
				{ blocks.map( ( b ) => (
					<li key={ b.id }>
						<OutLink
							className="ab-help-block"
							href={ blockDocs( b.id, 'help-docs' ) }
						>
							<span className="ab-card__icon-wrap">
								<BlockIcon slug={ b.id } size={ 16 } />
							</span>
							<span className="ab-help-block__text">
								<span className="ab-help-block__name">
									{ b.name }
								</span>
								<span className="ab-help-block__cat">
									{ CATEGORY[ b.category ] || b.category }
								</span>
							</span>
						</OutLink>
					</li>
				) ) }
			</ul>
		</section>
	);
}

function Support() {
	const cards = [
		{
			page: 'support',
			icon: <ChatIcon size={ 18 } />,
			title: __( 'Support forum', 'axiom-blocks' ),
			text: __(
				'Ask a question on the WordPress.org forum. Paste the system info below with it.',
				'axiom-blocks'
			),
		},
		{
			page: 'bug',
			icon: <AlertIcon size={ 18 } />,
			title: __( 'Report a bug', 'axiom-blocks' ),
			text: __(
				'Something broken? Open an issue on GitHub with the steps to see it.',
				'axiom-blocks'
			),
		},
		{
			page: 'feature',
			icon: <SparkIcon size={ 18 } />,
			title: __( 'Request a feature', 'axiom-blocks' ),
			text: __(
				'Tell us which block or control you need next.',
				'axiom-blocks'
			),
		},
		{
			page: 'review',
			icon: <StarIcon size={ 18 } />,
			title: __( 'Leave a review', 'axiom-blocks' ),
			text: __(
				'A review on WordPress.org helps other people find the plugin.',
				'axiom-blocks'
			),
		},
	];
	return (
		<section className="ab-help-section" aria-labelledby="ab-help-support">
			<SectionHead
				id="ab-help-support"
				title={ __( 'Get support', 'axiom-blocks' ) }
			/>
			<div className="ab-help-support">
				{ cards.map( ( c ) => (
					<OutLink
						key={ c.page }
						className="ab-help-card"
						href={ link( c.page, 'help-support' ) }
					>
						<span className="ab-help-card__icon">{ c.icon }</span>
						<span className="ab-help-card__title">
							{ c.title }
							<ExternalIcon size={ 12 } />
						</span>
						<span className="ab-help-card__text">{ c.text }</span>
					</OutLink>
				) ) }
			</div>
		</section>
	);
}

const copyText = ( text ) => {
	if ( window.navigator?.clipboard?.writeText ) {
		return window.navigator.clipboard.writeText( text );
	}
	// Older browsers and plain-http sites have no clipboard API.
	const area = document.createElement( 'textarea' );
	area.value = text;
	area.setAttribute( 'readonly', '' );
	area.style.position = 'fixed';
	area.style.opacity = '0';
	document.body.appendChild( area );
	area.select();
	const ok = document.execCommand( 'copy' );
	document.body.removeChild( area );
	return ok ? Promise.resolve() : Promise.reject();
};

function SystemInfo( { rows, showToast } ) {
	const text = rows.map( ( r ) => `${ r.label }: ${ r.value }` ).join( '\n' );
	const copy = () =>
		copyText( text )
			.then( () =>
				showToast?.( __( 'System info copied.', 'axiom-blocks' ) )
			)
			.catch( () =>
				showToast?.(
					__(
						'Could not copy. Select the text and copy it by hand.',
						'axiom-blocks'
					),
					'error'
				)
			);
	return (
		<section className="ab-help-section" aria-labelledby="ab-help-system">
			<SectionHead
				id="ab-help-system"
				title={ __( 'System info', 'axiom-blocks' ) }
				intro={ __(
					'Add this to a support request. It lists versions and settings only, and nothing is sent anywhere.',
					'axiom-blocks'
				) }
				action={
					<button
						type="button"
						className="ab-btn-ghost ab-btn-ghost--lg ab-focus"
						onClick={ copy }
					>
						{ __( 'Copy system info', 'axiom-blocks' ) }
					</button>
				}
			/>
			<dl className="ab-help-system">
				{ rows.map( ( r ) => (
					<div key={ r.label }>
						<dt>{ r.label }</dt>
						<dd>{ r.value }</dd>
					</div>
				) ) }
			</dl>
		</section>
	);
}

export function HelpTab( {
	state,
	blocks,
	newPageUrl,
	videoThumb,
	systemInfo,
	showToast,
} ) {
	return (
		<div className="ab-help">
			<FirstSteps state={ state } newPageUrl={ newPageUrl } />
			<Videos thumb={ videoThumb } />
			<Docs blocks={ blocks } />
			<Support />
			<SystemInfo rows={ systemInfo || [] } showToast={ showToast } />
		</div>
	);
}
