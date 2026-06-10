=== Axiom Blocks - Page Builder & FSE Kit ===
Contributors: wpaxiom
Donate link: https://wpaxiom.com/donate
Tags: gutenberg, blocks, editor, page-builder, woocommerce
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A collection of powerful Gutenberg blocks to enhance your WordPress content creation experience.

== Description ==

Axiom Blocks adds a powerful collection of Gutenberg blocks to help you build beautiful, professional layouts without any page builder bloat.

**All blocks are completely free.**

= Layout Blocks =

* **Advanced Section** — Full-width container with background images, gradients, video backgrounds, overlays with blend modes, shape dividers, and entrance animations.
* **Device Visibility** — Wrapper block to show or hide content based on device type (mobile, tablet, desktop).
* **Shape Divider** — Add beautiful shape dividers to the top or bottom of sections with 5 shapes: wave, curve, triangle, tilt, and slant.
* **Reading Progress Bar** — Sticky scroll progress indicator for long-form content.

= Content Blocks =

* **Tabs** — Horizontal tabs container that accepts any blocks inside.
* **Countdown Timer** — Live countdown to a target date or time.
* **Copy to Clipboard** — Button that copies text or code snippets to the visitor's clipboard.
* **Star Rating** — 5-star display block perfect for reviews and testimonials.
* **Before/After Slider** — Drag-to-compare slider for two images.
* **Pricing Table** — Clean pricing plans with feature lists and call-to-action buttons.

= WooCommerce Blocks =

* **Trust Badges** — Payment, security, and service trust badges with curated presets and custom badge support.
* **Free Shipping Progress** — Cart progress bar showing how much more a customer needs to spend to qualify for free shipping.

= Features =

* Enable or disable individual blocks to keep your editor lightweight
* Responsive controls for all layout blocks
* Clean, semantic markup with no extra wrapper bloat
* Fully compatible with Full Site Editing (FSE) and block themes
* Optimized performance — only loads assets for active blocks
* WooCommerce blocks are hidden automatically when WooCommerce is not active

== Installation ==

= From WordPress Admin =

1. Go to **Plugins → Add New**
2. Search for "Axiom Blocks"
3. Click **Install Now**, then **Activate**

= Manual Upload =

1. Download the plugin zip file
2. Go to **Plugins → Add New → Upload Plugin**
3. Select the zip file and click **Install Now**
4. Click **Activate**

= Getting Started =

After activation, go to **Axiom Blocks → Blocks** in your WordPress admin to enable or disable individual blocks. Only enabled blocks will appear in the block inserter and load on your site.

== Frequently Asked Questions ==

= Can I disable blocks I don't use? =

Yes. Go to **Axiom Blocks → Blocks** in your WordPress admin to enable or disable individual blocks. Disabled blocks won't load any assets on your site.

= Does this work with Full Site Editing (FSE) themes? =

Yes. Axiom Blocks blocks work in posts, pages, and the Site Editor.

= Will this slow down my site? =

No. Axiom Blocks only loads frontend assets for blocks that are actually used on the page, and you can disable unused blocks entirely.

= Do I need a page builder? =

No. Axiom Blocks is designed to work natively with the WordPress block editor (Gutenberg).

= Do I need WooCommerce installed? =

No. Axiom Blocks works on any WordPress site. The Trust Badges and Free Shipping Progress blocks are only shown in the block inserter when WooCommerce is active — you can also turn the integration off from **Axiom Blocks → Settings**.

== Screenshots ==

1. Axiom Blocks block manager — enable or disable individual blocks from a clean admin interface.
2. Pricing Table block with feature lists and CTAs.
3. Advanced Section block settings — backgrounds, overlays, shape dividers, and animations.
4. Before/After Slider block in action.

== Source Code ==

The unminified JavaScript and SCSS source for this plugin is included in the `src/` directory of the plugin package. The compiled files in `build/` are generated from `src/` using [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts).

Development happens on GitHub: https://github.com/wpaxiom/axiom-blocks. Bug reports and pull requests are welcome.

= Building from source =

1. Install Node.js (16.x or later) and npm.
2. From the plugin directory, run `npm install`.
3. Run `npm run build` to regenerate the compiled assets in `build/`.

= File layout =

* `src/` — JavaScript and SCSS source for all blocks and the admin dashboard.
* `inc/` — PHP source.
* `build/` — generated, do not edit by hand.
* `scripts/build.js` — entry point for `npm run build`.
* `webpack.config.js` — webpack configuration.
* `package.json` — npm dependencies and scripts.

== Changelog ==

= 1.0.0 =
* Initial release.
* Added 12 free blocks: Advanced Section, Device Visibility, Shape Divider, Reading Progress Bar, Tabs, Countdown Timer, Copy to Clipboard, Star Rating, Before/After Slider, Pricing Table, Trust Badges, and Free Shipping Progress.
* Added block manager to enable/disable individual blocks.
* WooCommerce integration toggle — Trust Badges and Free Shipping Progress only load when WooCommerce is active.
* Full Site Editing (FSE) support.

== Upgrade Notice ==

= 1.0.0 =
Initial release. Install and activate to start using Axiom Blocks blocks in the WordPress editor.

== Credits ==

* Icons powered by [Lucidicons](https://lucidicons.com/) and [WordPress Dashicons](https://developer.wordpress.org/resource/dashicons/)
* Built for the WordPress block editor (Gutenberg)