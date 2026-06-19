=== Axiom Blocks - Page Builder & FSE Kit ===
Contributors: wpaxiom
Donate link: https://wpaxiom.com/donate
Tags: gutenberg, blocks, editor, page-builder, woocommerce
Requires at least: 6.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A collection of powerful Gutenberg blocks to enhance your WordPress content creation experience.

== Description ==

Axiom Blocks adds a powerful collection of Gutenberg blocks to help you build beautiful, professional layouts without any page builder bloat.

**All blocks are completely free.**

= Layout Blocks =

* **Advanced Section** - Full-width container with background images, gradients, video backgrounds, overlays with blend modes, shape dividers, and entrance animations.
* **Device Visibility** - Wrapper block to show or hide content based on device type (mobile, tablet, desktop).
* **Shape Divider** - Add beautiful shape dividers to the top or bottom of sections with 5 shapes: wave, curve, triangle, tilt, and slant.
* **Reading Progress Bar** - Sticky scroll progress indicator for long-form content.

= Content Blocks =

* **Advanced Heading** - Heading with inline highlight spans, an optional sub-heading, an accent line, and full typography control.
* **Advanced Button** - Button with leading or trailing icons, an optional sub-caption, style and size presets, and hover states.
* **Icon** - A single icon from the built-in library or your own SVG, with size, colour, shape background, and link controls.
* **Icon List** - A list with a custom icon on every row - for features, benefits, and checklists.
* **Accordion** - Collapsible panels for FAQs and disclosures, with single-open mode, first-panel-open, icon position/rotation, and automatic FAQ schema (JSON-LD).
* **Notice / Alert** - Dismissible info, success, warning, or error messages with presets, icons, and custom colours.
* **Counter** - Animated count-up statistics with icons, labels, custom separators, per-stat cards, and hover states.
* **Testimonials** - Grid, carousel, or marquee testimonials with author details, avatars, and star ratings.
* **Info Box** - A styled box that holds an icon, heading, text, and button as editable blocks, with predefined styles and a single control for the spacing between items.
* **Tabs** - Horizontal tabs container that accepts any blocks inside.
* **Countdown Timer** - Live countdown to a target date or time.
* **Copy to Clipboard** - Button that copies text or code snippets to the visitor's clipboard.
* **Star Rating** - 5-star display block perfect for reviews and testimonials.
* **Before/After Slider** - Drag-to-compare slider for two images.
* **Pricing Table** - Clean pricing plans with feature lists and call-to-action buttons.

= WooCommerce Blocks =

* **Trust Badges** - Payment, security, and service trust badges with curated presets and custom badge support.
* **Free Shipping Progress** - Cart progress bar showing how much more a customer needs to spend to qualify for free shipping.

= Features =

* Enable or disable individual blocks to keep your editor lightweight
* Responsive controls for all layout blocks
* Clean, semantic markup with no extra wrapper bloat
* Fully compatible with Full Site Editing (FSE) and block themes
* Optimized performance - only loads assets for active blocks
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

No. Axiom Blocks works on any WordPress site. The Trust Badges and Free Shipping Progress blocks are only shown in the block inserter when WooCommerce is active - you can also turn the integration off from **Axiom Blocks → Settings**.

== Screenshots ==

1. Axiom Blocks block manager - enable or disable individual blocks from a clean admin interface.
2. Pricing Table block with feature lists and CTAs.
3. Advanced Section block settings - backgrounds, overlays, shape dividers, and animations.
4. Before/After Slider block in action.

== Source Code ==

The unminified JavaScript and SCSS source for this plugin is included in the `src/` directory of the plugin package. The compiled files in `build/` are generated from `src/` using [@wordpress/scripts](https://www.npmjs.com/package/@wordpress/scripts).

Development happens on GitHub: https://github.com/wpaxiom/axiom-blocks. Bug reports and pull requests are welcome.

= Building from source =

1. Install Node.js (16.x or later) and npm.
2. From the plugin directory, run `npm install`.
3. Run `npm run build` to regenerate the compiled assets in `build/`.

= File layout =

* `src/` - JavaScript and SCSS source for all blocks and the admin dashboard.
* `inc/` - PHP source.
* `build/` - generated, do not edit by hand.
* `scripts/build.js` - entry point for `npm run build`.
* `webpack.config.js` - webpack configuration.
* `package.json` - npm dependencies and scripts.

== Privacy ==

During normal use, Axiom Blocks does not collect, store, or transmit any data, and makes no external connections.

The plugin includes one optional, opt-in connection to an external service:

**Deactivation feedback.** When you deactivate Axiom Blocks from the Plugins screen, a short form asks why. Only if you choose a reason and click "Submit & Deactivate" is anything sent. In that case the following is transmitted to our feedback service at insights.wpaxiom.com:

* the reason you selected and any comment you type;
* the plugin, WordPress, and PHP version numbers;
* your site's language/locale;
* a randomly generated, anonymous installation ID (used only to avoid counting the same response twice).

No personal data is sent - no name, no email address, no website URL, and none of your site's content. If you click "Skip & Deactivate" or close the form, nothing is sent at all.

This service is operated by the plugin author. Privacy policy: https://wpaxiom.com/privacy/ - Terms of service: https://wpaxiom.com/terms/

Developers can redirect the feedback to their own server - or disable it entirely by returning an empty string - using the `axiom_blocks_feedback_endpoint` filter.

== Changelog ==

= 1.0.3 =
* New block: Info Box - a styled box that holds an Icon, Advanced Heading, text, and Advanced Button as editable blocks, with predefined Default/Bordered/Card/Accent styles and a single gap control for the spacing between items, plus stack or row direction, alignment, background, border, corner radius, and shadow.

= 1.0.2 =
* New blocks: Accordion, Notice / Alert, Counter, and Testimonials.
* Accordion outputs FAQ schema (JSON-LD) for rich results, with single-open and first-panel-open options.
* Counter adds custom decimal/thousands separators, per-stat cards, hover colours, and label positioning.

= 1.0.1 =
* New blocks: Advanced Heading, Advanced Button, Icon, and Icon List.
* Added an optional, opt-in deactivation feedback form. No data is collected unless you choose a reason and submit it - see the Privacy section for exactly what is sent.

= 1.0.0 =
* Initial release.
* Added 12 free blocks: Advanced Section, Device Visibility, Shape Divider, Reading Progress Bar, Tabs, Countdown Timer, Copy to Clipboard, Star Rating, Before/After Slider, Pricing Table, Trust Badges, and Free Shipping Progress.
* Added block manager to enable/disable individual blocks.
* WooCommerce integration toggle - Trust Badges and Free Shipping Progress only load when WooCommerce is active.
* Full Site Editing (FSE) support.

== Upgrade Notice ==

= 1.0.3 =
Adds the Info Box block - a styled box holding an icon, heading, text, and button as blocks, with full control of the spacing between them.

= 1.0.2 =
Adds four new blocks: Accordion (with FAQ schema), Notice / Alert, Counter, and Testimonials.

= 1.0.1 =
Adds four new blocks (Advanced Heading, Advanced Button, Icon, and Icon List) and an optional, opt-in deactivation feedback form.

= 1.0.0 =
Initial release. Install and activate to start using Axiom Blocks blocks in the WordPress editor.

== Credits ==

* Icons powered by [Lucidicons](https://lucidicons.com/) and [WordPress Dashicons](https://developer.wordpress.org/resource/dashicons/)
* Built for the WordPress block editor (Gutenberg)