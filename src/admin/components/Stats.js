/**
 * Stats Component
 * Dashboard statistics overview
 */

import { __ } from '@wordpress/i18n';
import { Card, CardBody, Flex, FlexItem } from '@wordpress/components';

export function Stats( { freeCount, proCount, enabledCount } ) {
	const stats = [
		{
			label: __( 'Free Blocks', 'axiom-blocks' ),
			value: freeCount,
			color: '#00a32a',
		},
		{
			label: __( 'Pro Blocks', 'axiom-blocks' ),
			value: proCount,
			color: '#2271b1',
		},
		{
			label: __( 'Active Blocks', 'axiom-blocks' ),
			value: enabledCount,
			color: '#d63638',
		},
	];

	return (
		<section className="axiom-blocks-section">
			<h2>{ __( 'Overview', 'axiom-blocks' ) }</h2>
			<Flex className="axiom-blocks-stats" gap={ 8 } justify="flex-start">
				{ stats.map( ( stat ) => (
					<FlexItem key={ stat.label }>
						<Card className="axiom-blocks-stat-card">
							<CardBody>
								<span
									className="axiom-blocks-stat-number"
									style={ { color: stat.color } }
								>
									{ stat.value }
								</span>
								<span className="axiom-blocks-stat-label">
									{ stat.label }
								</span>
							</CardBody>
						</Card>
					</FlexItem>
				) ) }
			</Flex>
		</section>
	);
}
