/**
 * Axiom Blocks - Main entry file
 * Registers all blocks for the plugin
 */

// Import WordPress dependencies
import { registerBlockType, updateCategory } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import { SPACING_ATTRS } from './components/SpacingPanel';
import { responsiveTypographyAttrs } from './components/typographyTargets';
import { responsivePropsAttrs } from './components/responsiveProps';

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
import { ButtonGroup } from './blocks/button-group';
import { AdvancedButton } from './blocks/advanced-button';
import { AdvancedHeading } from './blocks/advanced-heading';
import { Icon } from './blocks/icon';
import { IconList } from './blocks/icon-list';
import { Accordion } from './blocks/accordion';
import { AccordionItem } from './blocks/accordion/accordion-item';
import { Notice } from './blocks/notice';
import { CounterGroup } from './blocks/counter-group';
import { Counter } from './blocks/counter-group/counter';
import { Testimonials } from './blocks/testimonials';
import { Testimonial } from './blocks/testimonials/testimonial';
import { InfoBox } from './blocks/info-box';
import { ContentSlider } from './blocks/content-slider';
import { PostGrid } from './blocks/post-grid';
import { PostCard } from './blocks/post-grid/post-card';
import { PostTitle } from './blocks/post-grid/post-title';
import { PostExcerpt } from './blocks/post-grid/post-excerpt';
import { PostImage } from './blocks/post-grid/post-image';
import { PostTerms } from './blocks/post-grid/post-terms';
import { PostMeta } from './blocks/post-grid/post-meta';
import { PostReadMore } from './blocks/post-grid/post-read-more';
import { PostPagination } from './blocks/post-grid/post-pagination';
import { PostNoResults } from './blocks/post-grid/post-no-results';
import { Slide } from './blocks/content-slider/slide';
import { TableOfContents } from './blocks/table-of-contents';
import { TrustBadges } from './blocks/trust-badges';
import { FreeShippingProgress } from './blocks/free-shipping-progress';

// Import styles
import './style.scss';
import './editor.scss';

// Universal editor wiring: hide-on-device control on every Axiom block.
import './deviceVisibility';

// Universal editor wiring: hover lift + transition on every Axiom block.
import './interactions';

// Universal editor wiring: position / z-index / offsets on every Axiom block.
import './position';

// Universal editor wiring: scroll-in entrance animation on every Axiom block.
import './entrance';

// Universal editor wiring: per-child flex/grid order (L6 reorder).
import './childOrder';

/**
 * Inject responsive spacing attributes (*Tablet / *Mobile) into every Axiom block
 * that has spacing, client-side — mirrors the PHP register_block_type_args filter
 * so the editor can edit and save per-device values. Idempotent.
 */
addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/responsive-spacing-attrs',
	( blockSettings, name ) => {
		if ( ! name || name.indexOf( 'axiom-blocks/' ) !== 0 ) {
			return blockSettings;
		}
		const attrs = blockSettings.attributes;
		if ( ! attrs || ! attrs.paddingTop ) {
			return blockSettings;
		}
		const extra = {};
		Object.keys( SPACING_ATTRS ).forEach( ( base ) => {
			[ 'Tablet', 'Mobile' ].forEach( ( device ) => {
				const key = base + device;
				if ( ! attrs[ key ] ) {
					extra[ key ] = { type: 'string', default: '' };
				}
			} );
		} );
		if ( ! Object.keys( extra ).length ) {
			return blockSettings;
		}
		return {
			...blockSettings,
			attributes: { ...attrs, ...extra },
		};
	}
);

/**
 * Inject responsive typography attributes (*Tablet / *Mobile) for each typography
 * group a registered block exposes — mirrors the PHP register_block_type_args
 * filter so the editor can edit and save per-device values. Idempotent.
 */
addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/responsive-typography-attrs',
	( blockSettings, name ) => {
		const extra = responsiveTypographyAttrs(
			name,
			blockSettings.attributes
		);
		if ( ! Object.keys( extra ).length ) {
			return blockSettings;
		}
		return {
			...blockSettings,
			attributes: { ...blockSettings.attributes, ...extra },
		};
	}
);

/**
 * Inject responsive per-block prop attributes (*Tablet / *Mobile) for single
 * controls (columns, …) — mirrors the PHP register_block_type_args filter so the
 * editor can edit and save per-device values. Idempotent.
 */
addFilter(
	'blocks.registerBlockType',
	'axiom-blocks/responsive-props-attrs',
	( blockSettings, name ) => {
		const extra = responsivePropsAttrs( name, blockSettings.attributes );
		if ( ! Object.keys( extra ).length ) {
			return blockSettings;
		}
		return {
			...blockSettings,
			attributes: { ...blockSettings.attributes, ...extra },
		};
	}
);

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
	ButtonGroup,
	AdvancedButton,
	AdvancedHeading,
	Icon,
	IconList,
	Accordion,
	AccordionItem,
	Notice,
	CounterGroup,
	Counter,
	Testimonials,
	Testimonial,
	InfoBox,
	ContentSlider,
	PostGrid,
	PostCard,
	PostTitle,
	PostExcerpt,
	PostImage,
	PostTerms,
	PostMeta,
	PostReadMore,
	PostPagination,
	PostNoResults,
	Slide,
	TableOfContents,
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
	ButtonGroup,
	AdvancedButton,
	TrustBadges,
	FreeShippingProgress,
};
