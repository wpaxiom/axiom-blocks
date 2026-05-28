/**
 * Axiom Blocks - Main entry file
 * Registers all blocks for the plugin
 */

// Import WordPress dependencies
import { registerBlockType, updateCategory } from '@wordpress/blocks';

// Import blocks
import { AdvancedSection } from './blocks/advanced-section';
import { DeviceVisibility } from './blocks/device-visibility';
import { CountdownTimer } from './blocks/countdown-timer';
import { CopyToClipboard } from './blocks/copy-to-clipboard';
import { StarRating } from './blocks/star-rating';
import { ReadingProgressBar } from './blocks/reading-progress-bar';
import { ShapeDivider } from './blocks/shape-divider';
import { Tabs } from './blocks/tabs';
import { TabPanel } from './blocks/tabs/tab-panel';
import { BeforeAfterSlider } from './blocks/before-after-slider';
import { PricingTable } from './blocks/pricing-table';
import { PricingPlan } from './blocks/pricing-table/pricing-plan';
import { TrustBadges } from './blocks/trust-badges';
import { FreeShippingProgress } from './blocks/free-shipping-progress';

// Import styles
import './style.scss';
import './editor.scss';

// Get enabled blocks from settings
const settings = window.axiomBlocksSettings || {};
const enabledBlocks = settings.enabledBlocks || {};

// All available blocks
const blocks = [
	AdvancedSection,
	DeviceVisibility,
	CountdownTimer,
	CopyToClipboard,
	StarRating,
	ReadingProgressBar,
	ShapeDivider,
	Tabs,
	TabPanel,
	BeforeAfterSlider,
	PricingTable,
	PricingPlan,
	TrustBadges,
	FreeShippingProgress,
];

/**
 * Check if a block is enabled
 * @param {string} blockId - The block ID (e.g., 'advanced-section')
 * @return {boolean}
 */
function isBlockEnabled( blockId ) {
	// Default to true if not in settings
	return enabledBlocks[ blockId ] !== false;
}

/**
 * Register blocks with WordPress
 */
blocks.forEach( ( block ) => {
	registerBlockType( block.name, block.settings );
} );

/**
 * Export disabled block helper for use in block edit functions
 */
export { isBlockEnabled };

/**
 * Block-inserter category icon: the Axiom Blocks plugin logo — four staggered
 * rounded tiles in brand purple with descending opacity. Sourced from the
 * design system header in preview/block-icons.html.
 */
updateCategory( 'axiom-blocks', {
	icon: (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={ 24 }
			height={ 24 }
			viewBox="0 0 24 24"
			fill="none"
		>
			<rect x="3" y="3" width="9" height="9" rx="2.5" fill="#7C3AED" />
			<rect
				x="14"
				y="3"
				width="7"
				height="7"
				rx="2"
				fill="#7C3AED"
				fillOpacity=".65"
			/>
			<rect
				x="3"
				y="14"
				width="7"
				height="7"
				rx="2"
				fill="#7C3AED"
				fillOpacity=".4"
			/>
			<rect
				x="14"
				y="12"
				width="7"
				height="9"
				rx="2"
				fill="#7C3AED"
				fillOpacity=".22"
			/>
		</svg>
	),
} );

/**
 * Export blocks for potential external use
 */
export {
	AdvancedSection,
	DeviceVisibility,
	CountdownTimer,
	CopyToClipboard,
	StarRating,
	ReadingProgressBar,
	ShapeDivider,
	Tabs,
	TabPanel,
	BeforeAfterSlider,
	PricingTable,
	PricingPlan,
	TrustBadges,
	FreeShippingProgress,
};
