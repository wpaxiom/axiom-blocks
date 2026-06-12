<?php
/**
 * Advanced Button — curated content icon set (Lucide outline, 24×24, 2px stroke).
 *
 * Keep in sync with icons.js, which renders the same set in the editor.
 *
 * @package AxiomBlocks
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$axiom_blocks_advbtn_svg_open = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

return array(
	'arrow-right'    => $axiom_blocks_advbtn_svg_open . '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
	'arrow-up-right' => $axiom_blocks_advbtn_svg_open . '<path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>',
	'chevron-right'  => $axiom_blocks_advbtn_svg_open . '<path d="m9 18 6-6-6-6"/></svg>',
	'external-link'  => $axiom_blocks_advbtn_svg_open . '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>',
	'download'       => $axiom_blocks_advbtn_svg_open . '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>',
	'cart'           => $axiom_blocks_advbtn_svg_open . '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>',
	'send'           => $axiom_blocks_advbtn_svg_open . '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
	'mail'           => $axiom_blocks_advbtn_svg_open . '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
	'phone'          => $axiom_blocks_advbtn_svg_open . '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
	'plus'           => $axiom_blocks_advbtn_svg_open . '<path d="M5 12h14"/><path d="M12 5v14"/></svg>',
	'check'          => $axiom_blocks_advbtn_svg_open . '<path d="M20 6 9 17l-5-5"/></svg>',
	'star'           => $axiom_blocks_advbtn_svg_open . '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
	'heart'          => $axiom_blocks_advbtn_svg_open . '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>',
	'play'           => $axiom_blocks_advbtn_svg_open . '<path d="m6 3 14 9-14 9V3z"/></svg>',
	'zap'            => $axiom_blocks_advbtn_svg_open . '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>',
);
