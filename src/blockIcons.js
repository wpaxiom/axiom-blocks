/**
 * Axiom Blocks block icons — single source of truth.
 *
 * Outline / Heroicon style (1.6px stroke, 24×24 viewBox, currentColor)
 * copied verbatim from the Axiom Blocks Design System
 * (preview/block-icons.html — 32 canonical icons).
 *
 * Consumed in two places:
 *   1. Admin dashboard block cards — via <BlockIcon slug={block.id} />
 *   2. Gutenberg block-inserter    — via icon: <BlockIcon slug="..." /> in
 *                                     each block's registerBlockType settings
 *
 * Adding a new block? Append its slug + inner SVG children to BLOCK_ICONS.
 * The wrapper <svg> is rendered once here; never re-declare it per icon.
 */

export const BLOCK_ICONS = {
	'trust-badges': (
		<>
			<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
			<path d="m9 12 2 2 4-4" />
		</>
	),
	'device-visibility': (
		<>
			<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
			<path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
			<path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
			<path d="m2 2 20 20" />
		</>
	),
	'advanced-section': (
		<>
			<rect x="2" y="3" width="20" height="5" rx="1.5" />
			<rect x="2" y="10" width="20" height="5" rx="1.5" opacity=".55" />
			<rect x="2" y="17" width="20" height="4" rx="1.5" opacity=".25" />
		</>
	),
	'shape-divider': (
		<>
			<path d="M16 12v2a2 2 0 0 1-2 2H9a1 1 0 0 0-1 1v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h0" />
			<path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a1 1 0 0 1-1 1h-5a2 2 0 0 0-2 2v2" />
		</>
	),
	'reading-progress-bar': (
		<>
			<rect x="2" y="3" width="20" height="3.5" rx="1.75" />
			<rect
				x="2"
				y="3"
				width="14"
				height="3.5"
				rx="1.75"
				fill="currentColor"
				stroke="none"
			/>
			<line x1="4" y1="11" x2="20" y2="11" />
			<line x1="4" y1="15" x2="17" y2="15" />
			<line x1="4" y1="19" x2="13" y2="19" />
		</>
	),
	'masonry-grid': (
		<>
			<rect x="3" y="3" width="7" height="9" rx="1" />
			<rect x="14" y="3" width="7" height="5" rx="1" />
			<rect x="14" y="12" width="7" height="9" rx="1" />
			<rect x="3" y="16" width="7" height="5" rx="1" />
		</>
	),
	'sticky-elements': (
		<>
			<rect x="4" y="13" width="16" height="8" rx="1.5" />
			<line x1="12" y1="3" x2="12" y2="13" />
			<polyline points="8,7 12,3 16,7" />
			<line
				x1="7"
				y1="17"
				x2="17"
				y2="17"
				strokeWidth="1.2"
				opacity=".5"
			/>
		</>
	),
	'off-canvas-panel': (
		<>
			<rect x="2" y="3" width="20" height="18" rx="1.5" />
			<line x1="15" y1="3" x2="15" y2="21" />
			<line x1="5" y1="9" x2="12" y2="9" />
			<line x1="5" y1="13" x2="12" y2="13" />
			<line x1="5" y1="17" x2="10" y2="17" />
		</>
	),
	'background-video': (
		<>
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<polygon
				points="10,9 10,15 16,12"
				fill="currentColor"
				stroke="none"
			/>
		</>
	),
	'video-background-section': (
		<>
			<rect x="2" y="4" width="20" height="16" rx="2" />
			<path d="M2 8h20" />
			<circle cx="8" cy="14" r="2" />
			<path d="M8 12h8" />
			<circle cx="16" cy="14" r="2" />
		</>
	),
	tabs: (
		<>
			<rect x="2" y="8" width="20" height="13" rx="1.5" />
			<path d="M2 8h5V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V8" />
			<line
				x1="6"
				y1="14"
				x2="18"
				y2="14"
				strokeWidth="1.3"
				opacity=".5"
			/>
			<line
				x1="6"
				y1="18"
				x2="14"
				y2="18"
				strokeWidth="1.3"
				opacity=".5"
			/>
		</>
	),
	'tab-panel': (
		<>
			<rect x="2" y="8" width="20" height="13" rx="1.5" />
			<path d="M2 8h5V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V8" />
			<line
				x1="6"
				y1="14"
				x2="18"
				y2="14"
				strokeWidth="1.3"
				opacity=".5"
			/>
		</>
	),
	'countdown-timer': (
		<>
			<line x1="10" x2="14" y1="2" y2="2" />
			<line x1="12" x2="15" y1="14" y2="11" />
			<circle cx="12" cy="14" r="8" />
		</>
	),
	'star-rating': (
		<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
	),
	'copy-to-clipboard': (
		<>
			<path d="m12 15 2 2 4-4" />
			<rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</>
	),
	'before-after-slider': (
		<>
			<path d="M16 12h6" />
			<path d="M8 12H2" />
			<path d="M12 2v2" />
			<path d="M12 8v2" />
			<path d="M12 14v2" />
			<path d="M12 20v2" />
			<path d="m19 15 3-3-3-3" />
			<path d="m5 9-3 3 3 3" />
		</>
	),
	'pricing-table': (
		<>
			<path d="M10.5 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5.5" />
			<path d="m14.3 19.6 1-.4" />
			<path d="M15 3v7.5" />
			<path d="m15.2 16.9-.9-.3" />
			<path d="m16.6 21.7.3-.9" />
			<path d="m16.8 15.3-.4-1" />
			<path d="m19.1 15.2.3-.9" />
			<path d="m19.6 21.7-.4-1" />
			<path d="m20.7 16.8 1-.4" />
			<path d="m21.7 19.4-.9-.3" />
			<path d="M9 3v18" />
			<circle cx="18" cy="18" r="3" />
		</>
	),
	'hotspot-image': (
		<>
			<path d="M16 5h6" />
			<path d="M19 2v6" />
			<path d="M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" />
			<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
			<circle cx="9" cy="9" r="2" />
		</>
	),
	timeline: (
		<>
			<line x1="12" y1="3" x2="12" y2="21" />
			<circle cx="12" cy="6" r="2" fill="currentColor" stroke="none" />
			<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
			<circle cx="12" cy="18" r="2" fill="currentColor" stroke="none" />
			<line x1="14" y1="6" x2="19" y2="6" strokeWidth="1.3" />
			<line x1="5" y1="12" x2="10" y2="12" strokeWidth="1.3" />
			<line x1="14" y1="18" x2="19" y2="18" strokeWidth="1.3" />
		</>
	),
	'animated-counter': (
		<>
			<rect x="3" y="7" width="18" height="10" rx="2" />
			<line x1="9" y1="7" x2="9" y2="17" strokeWidth="1" opacity=".3" />
			<line x1="15" y1="7" x2="15" y2="17" strokeWidth="1" opacity=".3" />
			<path d="M5.5 3L3 7M18.5 3L21 7" strokeWidth="1.3" opacity=".5" />
			<line x1="8" y1="12" x2="11" y2="12" strokeWidth="2" />
			<line
				x1="13"
				y1="12"
				x2="16"
				y2="12"
				strokeWidth="2"
				opacity=".4"
			/>
		</>
	),
	'comparison-table': (
		<>
			<path d="M12 3v18" />
			<rect width="18" height="18" x="3" y="3" rx="2" />
			<path d="M3 9h18" />
			<path d="M3 15h18" />
		</>
	),
	'notification-banner': (
		<>
			<rect x="2" y="7" width="20" height="10" rx="2" />
			<circle cx="7" cy="12" r="1.5" fill="currentColor" stroke="none" />
			<line x1="10.5" y1="11" x2="17.5" y2="11" strokeWidth="1.3" />
			<line
				x1="10.5"
				y1="14"
				x2="15"
				y2="14"
				strokeWidth="1.3"
				opacity=".5"
			/>
			<line
				x1="18.5"
				y1="9.5"
				x2="21.5"
				y2="6.5"
				strokeWidth="1.3"
				opacity=".4"
			/>
			<line
				x1="18.5"
				y1="14.5"
				x2="21.5"
				y2="17.5"
				strokeWidth="1.3"
				opacity=".4"
			/>
		</>
	),
	'stock-urgency-bar': (
		<>
			<rect x="2" y="16" width="20" height="5" rx="2.5" />
			<rect
				x="2"
				y="16"
				width="8"
				height="5"
				rx="2.5"
				fill="currentColor"
				stroke="none"
			/>
			<path d="M12 3 Q14 7 11 9.5 Q15.5 9 13 14" strokeWidth="1.8" />
		</>
	),
	'variation-swatches': (
		<>
			<circle
				cx="7"
				cy="12"
				r="4"
				fill="currentColor"
				strokeWidth="2.5"
			/>
			<polyline
				points="5.2,12 6.5,13.3 9.2,10.5"
				stroke="white"
				strokeWidth="1.6"
				fill="none"
			/>
			<circle cx="17" cy="12" r="4" />
			<circle cx="17" cy="6" r="2.5" />
		</>
	),
	'free-shipping-progress': (
		<>
			<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
			<path d="M15 18H9" />
			<path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
			<circle cx="17" cy="18" r="2" />
			<circle cx="7" cy="18" r="2" />
		</>
	),
	'product-badges': (
		<>
			<rect x="2" y="2" width="20" height="20" rx="2" />
			<rect
				x="2"
				y="2"
				width="10"
				height="8"
				rx="2"
				fill="currentColor"
				stroke="none"
			/>
			<line
				x1="2"
				y1="14"
				x2="22"
				y2="14"
				strokeWidth="1"
				opacity=".25"
			/>
			<line
				x1="6"
				y1="17.5"
				x2="18"
				y2="17.5"
				strokeWidth="1.3"
				opacity=".5"
			/>
			<line
				x1="6"
				y1="20.5"
				x2="14"
				y2="20.5"
				strokeWidth="1.3"
				opacity=".3"
			/>
		</>
	),
	'stock-status-badge': (
		<>
			<rect x="3" y="9" width="18" height="12" rx="1.5" />
			<path d="M7 9V6a5 5 0 0 1 10 0v3" />
			<circle cx="12" cy="15" r="2" fill="currentColor" stroke="none" />
			<line x1="12" y1="17" x2="12" y2="18.5" strokeWidth="1.5" />
		</>
	),
	'payment-icons-row': (
		<>
			<rect x="1.5" y="8" width="6" height="8" rx="1.5" />
			<rect x="9" y="8" width="6" height="8" rx="1.5" />
			<rect x="16.5" y="8" width="6" height="8" rx="1.5" />
			<line x1="1.5" y1="11.5" x2="7.5" y2="11.5" strokeWidth="1.3" />
			<line x1="9" y1="11.5" x2="15" y2="11.5" strokeWidth="1.3" />
			<line x1="16.5" y1="11.5" x2="22.5" y2="11.5" strokeWidth="1.3" />
		</>
	),
	'product-custom-tabs': (
		<>
			<rect x="2" y="9" width="20" height="12" rx="1.5" />
			<path d="M2 9h5V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2h8" />
			<line
				x1="5"
				y1="15"
				x2="19"
				y2="15"
				strokeWidth="1.3"
				opacity=".4"
			/>
			<line
				x1="5"
				y1="18.5"
				x2="14"
				y2="18.5"
				strokeWidth="1.3"
				opacity=".4"
			/>
		</>
	),
	'sticky-add-to-cart': (
		<>
			<rect x="2" y="15" width="20" height="7" rx="1.5" />
			<path d="M2 3h2l2.5 9H17l2.5-7H6" />
			<circle
				cx="8.5"
				cy="19"
				r="1.2"
				fill="currentColor"
				stroke="none"
			/>
			<circle
				cx="15.5"
				cy="19"
				r="1.2"
				fill="currentColor"
				stroke="none"
			/>
			<line
				x1="5"
				y1="15"
				x2="5"
				y2="12"
				strokeWidth="1.3"
				strokeDasharray="2 1.5"
				opacity=".5"
			/>
		</>
	),
	'shoppable-image': (
		<>
			<rect x="2" y="3" width="20" height="14" rx="2" />
			<path d="M2 13l5-4 4 4 3-2.5 8 5" />
			<circle
				cx="7.5"
				cy="8.5"
				r="1.5"
				fill="currentColor"
				stroke="none"
			/>
			<circle cx="16" cy="7" r="2.2" />
			<line x1="16" y1="3" x2="16" y2="4.8" />
			<path
				d="M14.5 19h5a1 1 0 0 1 0 2h-5a1 1 0 0 1 0-2z"
				fill="currentColor"
				stroke="none"
			/>
		</>
	),
	'product-comparison': (
		<>
			<rect x="2" y="2" width="9" height="20" rx="1.5" />
			<rect x="13" y="2" width="9" height="20" rx="1.5" />
			<line x1="2" y1="8" x2="11" y2="8" />
			<line x1="13" y1="8" x2="22" y2="8" />
			<polyline points="4.5,13 6,14.5 9,11.5" strokeWidth="1.5" />
			<polyline points="15.5,13 17,14.5 20,11.5" strokeWidth="1.5" />
			<line
				x1="4.5"
				y1="18"
				x2="9"
				y2="18"
				strokeWidth="1.3"
				opacity=".4"
			/>
			<line
				x1="15.5"
				y1="18"
				x2="20"
				y2="18"
				strokeWidth="1.3"
				opacity=".4"
				strokeDasharray="2 1.5"
			/>
		</>
	),
	'recently-viewed': (
		<>
			<path d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.2 2.5" />
			<polyline points="3,3 3,8 8,8" />
			<line x1="12" y1="8" x2="12" y2="12" />
			<line x1="12" y1="12" x2="15" y2="14.5" />
		</>
	),
	'quick-view-modal': (
		<>
			<rect x="2" y="2" width="20" height="20" rx="2" opacity=".25" />
			<rect x="5" y="5" width="14" height="14" rx="1.5" fill="white" />
			<rect x="5" y="5" width="14" height="14" rx="1.5" />
			<line x1="5" y1="9" x2="19" y2="9" />
			<circle cx="8" cy="7" r=".9" fill="currentColor" stroke="none" />
			<circle cx="11" cy="7" r=".9" fill="currentColor" stroke="none" />
			<circle cx="14" cy="7" r=".9" fill="currentColor" stroke="none" />
			<line x1="8" y1="12.5" x2="16" y2="12.5" strokeWidth="1.3" />
			<line
				x1="8"
				y1="15.5"
				x2="13"
				y2="15.5"
				strokeWidth="1.3"
				opacity=".5"
			/>
		</>
	),
	'dynamic-text': (
		<>
			<path d="M9 4H7a2 2 0 0 0-2 2v4a2 2 0 0 1-2 2 2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h2" />
			<path d="M15 4h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2 2 2 0 0 0-2 2v4a2 2 0 0 1-2 2h-2" />
			<circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
		</>
	),
	'business-hours': (
		<>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 7.5v4.7l3.2 1.9" />
		</>
	),
	'advanced-button': (
		<>
			<rect x="2" y="7.5" width="20" height="9" rx="4.5" />
			<path d="M8 12h7" />
			<path d="m12.5 9.5 2.5 2.5-2.5 2.5" />
		</>
	),
	'button-group': (
		<>
			<rect x="2" y="9" width="9" height="6" rx="3" />
			<rect x="13" y="9" width="9" height="6" rx="3" opacity=".55" />
		</>
	),
	'advanced-heading': (
		<>
			<path d="M6 12h12" />
			<path d="M6 20V4" />
			<path d="M18 20V4" />
		</>
	),
	icon: (
		<>
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
		</>
	),
	'icon-list': (
		<>
			<path d="M9 6h11" />
			<path d="M9 12h11" />
			<path d="M9 18h11" />
			<path d="m3.5 5 1 1 1.5-2" />
			<path d="m3.5 11 1 1 1.5-2" />
			<path d="m3.5 17 1 1 1.5-2" />
		</>
	),
	accordion: (
		<>
			<path d="M21 5H3" />
			<path d="M10 12H3" />
			<path d="M10 19H3" />
			<path d="M15 12.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997a1 1 0 0 1-1.517-.86z" />
		</>
	),
	'accordion-item': (
		<>
			<path d="M8 5h13" />
			<path d="M13 12h8" />
			<path d="M13 19h8" />
			<path d="M3 10a2 2 0 0 0 2 2h3" />
			<path d="M3 5v12a2 2 0 0 0 2 2h3" />
		</>
	),
	notice: (
		<>
			<path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
			<line x1="12" x2="12" y1="8" y2="12" />
			<line x1="12" x2="12.01" y1="16" y2="16" />
		</>
	),
	'counter-group': (
		<>
			<path d="M13 17V9" />
			<path d="M18 17V5" />
			<path d="M3 3v16a2 2 0 0 0 2 2h16" />
			<path d="M8 17v-3" />
		</>
	),
	counter: (
		<>
			<path d="M16 7h6v6" />
			<path d="m22 7-8.5 8.5-5-5L2 17" />
		</>
	),
	testimonials: (
		<>
			<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2Z" />
			<path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
		</>
	),
	testimonial: (
		<>
			<path d="M14 14a2 2 0 0 0 2-2V8h-2" />
			<path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
			<path d="M8 14a2 2 0 0 0 2-2V8H8" />
		</>
	),
	'info-box': (
		<>
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<circle cx="8" cy="9" r="1.5" />
			<path d="M13 8.5h5" />
			<path d="M13 11.5h5" />
			<path d="M6 15h12" />
		</>
	),
};

const DEFAULT_ICON = (
	<>
		<rect x="3" y="3" width="7" height="7" rx="1.5" />
		<rect x="14" y="3" width="7" height="7" rx="1.5" />
		<rect x="3" y="14" width="7" height="7" rx="1.5" />
		<rect x="14" y="14" width="7" height="7" rx="1.5" />
	</>
);

/**
 * Renders a block icon by slug. Falls back to DEFAULT_ICON for unknown slugs.
 * @param root0
 * @param root0.slug
 * @param root0.size
 */
export const BlockIcon = ( { slug, size = 20 } ) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={ size }
		height={ size }
		viewBox="0 0 24 24"
		fillOpacity={ 0 }
		strokeWidth="1.6"
		stroke="currentColor"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		{ BLOCK_ICONS[ slug ] || DEFAULT_ICON }
	</svg>
);
