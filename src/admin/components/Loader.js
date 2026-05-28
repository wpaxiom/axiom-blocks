import { __ } from '@wordpress/i18n';

const Sk = ( { w, h = 13, r = 5, style = {} } ) => (
	<div
		className="ab-sk"
		style={ {
			width: w,
			height: h,
			borderRadius: r,
			flexShrink: 0,
			...style,
		} }
	/>
);

const HeaderSkeleton = () => (
	<div className="ab-header">
		<div className="ab-header__top">
			<Sk w={ 28 } h={ 28 } r={ 6 } />
			<div>
				<Sk w={ 120 } h={ 18 } style={ { marginBottom: 6 } } />
				<Sk w={ 240 } h={ 11 } />
			</div>
			<div style={ { flex: 1 } } />
			<Sk w={ 120 } h={ 30 } r={ 6 } />
		</div>
		<div className="ab-nav-tabs">
			<Sk w={ 130 } h={ 32 } r={ 6 } style={ { marginRight: 4 } } />
			<Sk w={ 100 } h={ 32 } r={ 6 } />
		</div>
	</div>
);

const StatRowSkeleton = () => (
	<div className="ab-stats-row">
		{ [ 0, 1, 2, 3 ].map( ( i ) => (
			<div key={ i } className="ab-stat-card">
				<div className="ab-stat-card__header">
					<Sk w={ 80 } h={ 11 } />
					<Sk w={ 30 } h={ 30 } r={ 7 } />
				</div>
				<Sk w={ 48 } h={ 28 } r={ 5 } style={ { marginBottom: 6 } } />
				<Sk w={ 90 } h={ 11 } />
			</div>
		) ) }
	</div>
);

const SectionHeaderSkeleton = () => (
	<div className="ab-section-bar" style={ { marginBottom: 12 } }>
		<Sk w={ 14 } h={ 14 } r={ 3 } />
		<Sk w={ 70 } h={ 13 } />
		<Sk w={ 26 } h={ 18 } r={ 99 } />
		<div style={ { flex: 1 } } />
		<Sk w={ 82 } h={ 26 } r={ 5 } />
		<Sk w={ 82 } h={ 26 } r={ 5 } />
	</div>
);

const CardSkeleton = () => (
	<div className="ab-card" style={ { gap: 10 } }>
		<div className="ab-card__top">
			<Sk w={ 32 } h={ 32 } r={ 7 } style={ { flexShrink: 0 } } />
			<div className="ab-card__info">
				<Sk w="65%" h={ 13 } style={ { marginBottom: 7 } } />
				<Sk w="88%" h={ 10 } style={ { marginBottom: 4 } } />
				<Sk w="55%" h={ 10 } />
			</div>
			<Sk w={ 40 } h={ 22 } r={ 11 } />
		</div>
		<div className="ab-card__footer">
			<Sk w={ 44 } h={ 18 } r={ 99 } />
			<Sk w={ 36 } h={ 12 } r={ 4 } />
		</div>
	</div>
);

const GridSkeleton = ( { count = 6 } ) => (
	<div className="ab-grid">
		{ Array.from( { length: count }, ( _, i ) => (
			<CardSkeleton key={ i } />
		) ) }
	</div>
);

export function Loader() {
	return (
		<div className="ab-loader-wrap">
			{ /* Animated logo overlay */ }
			<div className="ab-loader-overlay" aria-hidden="true">
				<div className="ab-loader-logo">
					<svg width="64" height="64" viewBox="0 0 24 24" fill="none">
						<rect
							className="ab-lb1"
							x="3"
							y="3"
							width="5.5"
							height="18"
							rx="1.8"
						/>
						<rect
							className="ab-lb2"
							x="10"
							y="3"
							width="8.5"
							height="8"
							rx="1.8"
						/>
						<rect
							className="ab-lb3"
							x="10"
							y="13"
							width="10"
							height="8"
							rx="1.8"
						/>
					</svg>
					<span className="ab-loader-name">Axiom Blocks</span>
					<span className="ab-loader-label">
						{ __( 'Loading blocks…', 'axiom-blocks' ) }
					</span>
				</div>
			</div>

			{ /* Skeleton content behind overlay */ }
			<div style={ { opacity: 0.45 } } aria-hidden="true">
				<HeaderSkeleton />
				<div className="ab-loader-body">
					<StatRowSkeleton />
					<div className="ab-section">
						<SectionHeaderSkeleton />
						<GridSkeleton count={ 6 } />
					</div>
					<div className="ab-section">
						<SectionHeaderSkeleton />
						<GridSkeleton count={ 3 } />
					</div>
				</div>
			</div>
		</div>
	);
}
