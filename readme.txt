=== Axiom Blocks - Page Builder Toolkit ===
Contributors: wpaxiom
Donate link: https://wpaxiom.com/donate
Tags: gutenberg blocks, gutenberg, blocks, page builder, block editor
Requires at least: 6.0
Tested up to: 7.1
Requires PHP: 7.4
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A collection of Gutenberg blocks: post grid, post filter, tabs, accordion, content slider, table of contents, counter, testimonials, pricing table.

== Description ==

Axiom Blocks adds the blocks the WordPress editor leaves out. Use core blocks for paragraphs, headings and images, and Axiom for the rest.

**[Try the live demo](https://wordpress.org/plugins/axiom-blocks/?preview=1)** - a full landing page built with these blocks, in a temporary WordPress you can open the editor on and change. Nothing to install.

[youtube https://www.youtube.com/watch?v=V3Ilqfiymkc]

[More Axiom Blocks video tutorials](https://www.youtube.com/playlist?list=PLNsJLdrHnJGs)

**[Documentation](https://www.wpaxiom.com/docs/axiom-blocks?utm_source=wporg&utm_medium=readme)** is on wpaxiom.com.

= Layout Blocks =

* **Advanced Section** - Full-width container with background images, gradients, video backgrounds, overlays with blend modes, shape dividers, and entrance animations.
* **CSS Grid** - A grid with unequal column tracks (for example 2fr 1fr 240px), row tracks, dense packing and full alignment control, all set per device. Each Grid Item can start at a chosen column or row, span several, and change order on tablet and mobile.
* **Device Visibility** - Wrapper block to show or hide content based on device type (mobile, tablet, desktop).
* **Shape Divider** - Add shape dividers to the top or bottom of sections with 5 shapes: wave, curve, triangle, tilt, and slant.
* **Reading Progress Bar** - Sticky scroll progress indicator for long-form content.

= Content Blocks =

* **Advanced Heading** - Heading with inline highlight spans, an optional sub-heading, an accent line, and full typography control.
* **Advanced Button** - Button with leading or trailing icons, an optional sub-caption, style and size presets, and hover states.
* **Icon** - A single icon from the built-in library or your own SVG, with size, color, shape background, and link controls.
* **Icon List** - A list with a custom icon on every row - for features, benefits, and checklists.
* **Accordion** - Collapsible panels for FAQs and disclosures, with single-open mode, first-panel-open, icon position/rotation, and automatic FAQ schema (JSON-LD).
* **Notice / Alert** - Dismissible info, success, warning, or error messages with presets, icons, and custom colors.
* **Counter** - Animated count-up statistics with icons, labels, custom separators, per-stat cards, and hover states.
* **Testimonials** - Grid, carousel, or marquee testimonials with author details, avatars, and star ratings.
* **Info Box** - A styled box that holds an icon, heading, text, and button as editable blocks, with predefined styles and a single control for the spacing between items.
* **Tabs** - Horizontal tabs container that accepts any blocks inside.
* **Content Slider** - A slider/carousel that holds any blocks per slide, with slide, fade, and coverflow effects, autoplay, arrows and dots, drag and swipe, keyboard control, responsive slides-per-view, and an optional click-to-zoom lightbox.
* **Table of Contents** - Auto-built from your page headings, with numbered/bullet/none markers, nesting, smooth scroll, active-section highlight, a sticky sidebar with internal scroll, a collapsible panel, a reading-progress rail, copy-link, back-to-top, a mobile dock bar, and light or dark schemes.
* **Countdown Timer** - Live countdown to a target date or time.
* **Copy to Clipboard** - Button that copies text or code snippets to the visitor's clipboard.
* **Star Rating** - 5-star display block for reviews and testimonials.
* **Before/After Slider** - Drag-to-compare slider for two images.
* **Pricing Table** - Clean pricing plans with feature lists and call-to-action buttons.

= Dynamic Blocks =

* **Post Grid** - Show your posts in a grid or list, with the card built from Post Image, Post Terms, Post Title, Post Meta, Post Excerpt, and Post Read More blocks you arrange and style yourself. Query by post type, taxonomy, or author, skip or exclude posts, and choose numbered or load-more pagination. Adds a featured card, a fallback image for posts without one, read time, per-field meta labels, and your own no-results message.
* **Post Filter** - Search, filter and sort a Post Grid without reloading the page.

= Form Blocks =

* **Contact Form** - A contact form you build from field blocks (text, email, phone, message, select, radio and checkbox choices, consent, date, hidden) with full control over layout and style: columns or custom column widths per device, labels above, beside, floating or hidden, icons inside fields, choices as buttons, and every part styled with hover, focus and error states. Every message is saved as an entry before the email goes out, so a failed email never loses one. Sends through your site's own mail (any SMTP plugin works) or through Resend. Works with JavaScript disabled, and has no nonce, so cached pages keep working.

= WooCommerce Blocks =

* **Trust Badges** - Payment, security, and service trust badges with curated presets and custom badge support.
* **Free Shipping Progress** - Cart progress bar showing how much more a customer needs to spend to qualify for free shipping.

= Features =

* Enable or disable individual blocks to keep your editor lightweight
* **Responsive controls** - typography (all blocks), columns, gap, alignment, and sizes with per-device overrides and live editor previews
* **Deactivation survival** - authored content from dynamic blocks stays visible on the page even if the plugin is deactivated (semantic save fallback + deprecation migration)
* **Shared icon system** - 136 curated Lucide icons plus custom SVG uploads, shared across all icon-supporting blocks
* **Advanced color picker** - every color control has an HSV canvas, theme palette, Hex/RGB/HSL inputs, alpha, eyedropper, and recent colors
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

After activation, open **Axiom Blocks → Dashboard** in your WordPress admin. The Help tab has three first steps, video tutorials, the docs for every block, and links to support. The Block Manager tab turns individual blocks on or off; only enabled blocks appear in the block inserter and load on your site.

== Frequently Asked Questions ==

= Can I disable blocks I don't use? =

Yes. Go to **Axiom Blocks → Dashboard → Block Manager** in your WordPress admin to enable or disable individual blocks. Disabled blocks won't load any assets on your site.

= Does this work with Full Site Editing (FSE) themes? =

Yes. Axiom Blocks blocks work in posts, pages, and the Site Editor.

= Will this slow down my site? =

No. Axiom Blocks only loads frontend assets for blocks that are actually used on the page, and you can disable unused blocks entirely.

= Do I need a page builder? =

No. Axiom Blocks is designed to work natively with the WordPress block editor (Gutenberg).

= How do I make sure form emails arrive? =

Many hosts do not deliver mail sent by WordPress. Either install an SMTP plugin (the Contact Form block uses it automatically) or choose Resend under **Axiom Blocks → Dashboard → Email** and add your API key. Then press **Send test** on the same tab. Every submission is saved under **Axiom Blocks → Form entries** before the email goes out, so a message is never lost when an email fails.

= Do I need WooCommerce installed? =

No. Axiom Blocks works on any WordPress site. The Trust Badges and Free Shipping Progress blocks are only shown in the block inserter when WooCommerce is active - you can also turn the integration off from **Axiom Blocks → Dashboard → Settings**.

== Screenshots ==

1. Axiom Blocks block manager - enable or disable individual blocks from a clean admin interface.
2. Before/After Slider - drag or hover to compare two images, horizontally or vertically.
3. Advanced Section - backgrounds, overlays, and a flex/grid layout engine, styled by part.
4. Pricing Table - every part styled from the Styles tab, with hover states.
5. Content Slider - any blocks as slides, with slide, fade, and coverflow effects.
6. Table of Contents - built automatically from the headings already on the page.
7. Testimonials - grid, carousel, or marquee, with ten styleable parts.
8. Accordion - the Header part carries Normal, Hover and Active states.
9. Counter - animated stats, with the icon chip styled like any other part.
10. Help - first steps, video tutorials, docs for every block, support links and system info.
11. Email - how form emails are sent, the last delivery result, and a test email.

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

Axiom Blocks makes no external connections unless you turn one on, and stores no visitor data except what a Contact Form collects.

**Contact Form entries.** When a visitor submits a Contact Form block, the plugin saves what they entered, the page they sent it from and the time, as a private entry only administrators can see (Axiom Blocks > Form entries), and emails it to the addresses set on the form. No IP address is stored. Entries are included in WordPress's personal data export and erase tools (Tools > Export Personal Data and Erase Personal Data), and can be deleted automatically after a number of days you set under Axiom Blocks > Settings > Email, where saving entries can also be switched off. The plugin suggests matching text for your privacy policy under Settings > Privacy.

The plugin includes two optional, opt-in connections to external services:

**Resend (email delivery).** Off by default. Only if an administrator chooses Resend under Axiom Blocks > Dashboard > Email and adds a Resend API key does the plugin send Contact Form emails through the Resend API (api.resend.com) instead of the site's own mail. Each submission then sends Resend the recipient, Cc and Bcc addresses set on the form, the From name and address, the visitor's email address as Reply-To, the subject, and the message body, which contains everything the visitor entered and the page it was sent from. The "Send test email" button sends a short test message the same way. Resend is operated by Resend, Inc. Terms of service: https://resend.com/legal/terms-of-service - Privacy policy: https://resend.com/legal/privacy-policy

**Deactivation feedback.** When you deactivate Axiom Blocks from the Plugins screen, a short form asks why. Only if you choose a reason and click "Submit & Deactivate" is anything sent. In that case the following is transmitted to our feedback service at insights.wpaxiom.com:

* the reason you selected and any comment you type;
* the plugin, WordPress, and PHP version numbers;
* your site's language/locale;
* a randomly generated, anonymous installation ID (used only to avoid counting the same response twice).

No personal data is sent - no name, no email address, no website URL, and none of your site's content. If you click "Skip & Deactivate" or close the form, nothing is sent at all.

This service is operated by the plugin author. Privacy policy: https://wpaxiom.com/privacy/ - Terms of service: https://wpaxiom.com/terms/

Developers can redirect the feedback to their own server - or disable it entirely by returning an empty string - using the `axiom_blocks_feedback_endpoint` filter.

== Changelog ==

= 1.1.0 =
* New Contact Form block with text, email, phone, message, select, choice, consent, date and hidden fields, plus field groups and a submit button. Forms support responsive layouts and field styling.
* Form submissions are saved as private entries before email delivery. Admins can view entries under Axiom Blocks > Form entries, and WordPress personal data export and erase tools include them.
* New Email tab for Contact Form delivery through WordPress mail or Resend, with a test email and delivery status.
* New Help tab with first steps, video and documentation links, support links and system information. A one-time notice and plugin-row Get started link lead to it after activation.

= 1.0.9 =
* New block: CSS Grid - a layout grid for the designs the core Grid cannot build. Columns can be equal, auto-fit to a minimum width, or custom tracks such as 2fr 1fr 240px, and rows, auto sizes, flow direction, dense packing, gaps and alignment are all set per device. Track values are checked against a small safe set of units, so a typo falls back to equal columns instead of breaking the layout.
* New block: Grid Item - goes inside CSS Grid and holds any blocks. Set the column and row it starts on, how many it spans, its order and its own alignment, separately for desktop, tablet and mobile.
* New grids start at 3 columns on desktop, 2 on tablet and 1 on mobile. On any device with a single column, items stack full width, so a span set for a wider screen never adds an extra column on a phone.
* Both blocks have background, border, radius, shadow and spacing controls, and Grid Item adds a minimum height. Turning CSS Grid off in the Block Manager turns off Grid Item too.
* Plugin renamed to "Axiom Blocks - Page Builder Toolkit", with updated tags.

= 1.0.8 =
* New block: Post Filter - a filter bar that narrows a Post Grid by search, taxonomy and sort, with Search Field, Taxonomy Filter, Sort Filter and Reset Filter blocks you arrange inside it. It is a real form, so it works with JavaScript disabled, and a filtered view has its own address you can bookmark or share.
* Post Filter never sends a query to the server. It sends the grid it is pointed at plus the filter you chose, and the server re-runs that grid's own saved query with your filter applied, so a filter can only narrow what the author already published.
* Post Filter bar layout - lay the fields out in a row or a column, set the gap between them and how they align, all per device. Each field can be full width, half width, automatic, or a width you set.
* Post Filter field labels - show or hide each label, place it above or beside its control, and style every label in the bar from one place.
* Post Grid cards can now be styled. The Post Card block gained a Card section with background (including gradients and images), border, radius, shadow, minimum height, content gap and a hover state. Existing cards are unchanged until you set something.
* Post Grid: filter by author. The setting was missing even though the block already supported it.
* Post Grid: content alignment and card vertical alignment in the Layout panel.
* Multi-select settings (Include terms, Exclude terms, Filter by author) now use the plugin's own control, matching the rest of the sidebar, with removable chips and a searchable list.
* Advanced Section now lets WordPress decide its width. The block used to write its own max-width, which outranked both the block width toolbar and the theme's content width, so a section ignored the content width setting and a section nested inside another ignored the width you gave it. Width now comes from the toolbar and from the parent's layout, the way it does on a core Group. The Container panel's Width and Max width controls are gone with it: a section that had one set now follows the toolbar instead. If a nested section looks narrower than before, turn off "Inner blocks use content width" on the section holding it.
* Fixed Advanced Section's Center horizontal alignment doing nothing unless the section had "Inner blocks use content width" turned on. It was relying on the centring that setting brings, so with it off the content sat against the left edge instead. Center now centres in every layout mode.
* Fixed Advanced Section putting an empty align class on every section that had no width chosen in the toolbar.
* Fixed the Advanced Section editor canvas drifting from the front of the site. The editor stylesheet carried its own copy of the block's layout rules, so it quietly overrode the real ones and only the canvas kept rendering the old behavior.
* Post Filter now sanitizes the search and sort values it reads from the address bar, and its result-count strings carry notes for translators.
* Fixed the Post Filter search field overflowing its bar at full width, and its button sitting under the input instead of beside it.
* Fixed per-device typography being discarded on the Post Filter fields.
* Fixed blocks losing part of their markup when placed inside an Advanced Section or a Button Group. A Post Filter bar inside a section rendered with no search box and no drop-downs, so filtering did nothing at all. Embedded videos and maps, the core Search block, and form blocks from other plugins were removed the same way. Both blocks now pass their inner blocks through untouched, the way the core Group block does. Your saved content is unchanged, and anything that was being removed simply appears again.
* Fixed form fields being removed from blocks placed inside a Pricing Table, Counter Group or Testimonials block.

= 1.0.7 =
* New block: Post Grid - show your posts in a grid or list, with the card built from Post Image, Post Terms, Post Title, Post Meta, Post Excerpt, and Post Read More blocks that you arrange and style individually. Query by post type, taxonomy, or author, order by date, title, comment count or random, skip or exclude posts, and choose how sticky posts are handled.
* Post Grid pagination - numbered page links or a Load more button, both working with JavaScript disabled. Load more is a real link to the next page and falls back to it if the request fails.
* Post Grid featured card - an optional second card template for the first or a chosen post, carrying its own padding, radius and typography rather than only different colors.
* Post Grid also adds a fallback image for posts with no featured image, read time, per-field labels on the meta row, an option to exclude the post currently being viewed, and an editable no-results message.
* The per-item blocks (Post Image, Post Terms, Post Title, Post Meta, Post Excerpt, Post Read More) work inside the core Query Loop block as well as inside Post Grid.

= 1.0.6 =
* Redesigned block settings across every block. Each block's sidebar is now split into Settings (what the block does) and Styles (how it looks), and the Styles tab is organised by the parts you can see - a Tab, a Card, an Icon, a Heading - instead of one long list of options. Border, shadow, and typography open in focused popovers, and rows show their current value at a glance.
* Normal / Hover / Active states on styleable parts. Hover colors, backgrounds, and borders are now real controls rather than something baked into a preset.
* A consistent styling stack on every part: colors, background (including gradients), border, radius, shadow, padding, size, and gap - with per-device values where it makes sense. Many parts that previously offered only a color now offer the full set.
* Every style control now shows the block's actual shipped default instead of "None", so resetting returns you to the original look rather than clearing the style.
* Removed the Tabs "Tab style" presets (Default/Pills/Underline/Boxed). Every look they produced is now built from the Styles rows on the Tab bar, Tab, and Panel parts. Existing tabs keep their design - the preset is converted once into those rows, so the look is preserved and now fully editable.
* Removed the Pricing Table "Card style" presets (Bordered/Filled/Minimal). Card styling now comes from the Styles > Cards rows (background, border, radius, shadow, padding, min height), with a Featured tab for the highlighted plan. Tables using Filled or Minimal revert to the Bordered look and need restyling.
* Tabs: new Tab padding, Tab shadow, and per-state Tab border controls, plus a "Tab bar fits content" layout option and a fully-round radius range.
* Tabs: separate gap controls for tab-to-tab spacing, icon-to-label spacing inside a tab, and the gap between the tab bar and the panel.
* Tabs: a chosen inactive tab color now renders at full strength instead of being dimmed by the built-in 75% fade.
* Trust Badges: the "Card background" and "Card border" toggles are gone - both are now ordinary Styles rows on the Card part. Existing badges keep their appearance.
* Reading Progress Bar: the fill accepts a gradient, and the block now supports HTML anchors.
* Testimonials: avatar/monogram size and weight moved to the block's Monogram part, so one setting styles every card.
* Fixed Advanced Button: outline-style buttons flickered on hover and showed the wrong border width. The button changed size between its normal and hover states, which shifted the layout out from under the pointer.
* Fixed Reading Progress Bar dropping a custom CSS class added in the editor.
* Fixed Table of Contents ignoring per-device typography settings.
* Fixed border controls reading "None" when a block's shipped border applies to only one side.

= 1.0.5 =
* New block: Content Slider - a slider/carousel that holds any blocks per slide, with slide, fade, and coverflow effects, autoplay with loop and pause-on-hover, arrows and dots, drag and swipe, keyboard control, responsive slides-per-view, adaptive height, and an optional click-to-zoom lightbox.
* New block: Table of Contents - auto-built from your page headings, with numbered/bullet/none markers, nesting, smooth scroll, active-section highlight, a sticky sidebar with internal scroll, a collapsible panel, a per-section reading-progress rail, copy-link, back-to-top, a mobile dock bar, and light or dark schemes.
* New color picker - every color control now uses a redesigned picker with an HSV canvas, theme palette, Hex/RGB/HSL inputs, alpha, an eyedropper, and recent colors.

= 1.0.4 =
* Deactivation survival for Accordion, Advanced Heading, Advanced Button, and Notice blocks.
* Responsive controls - per-device typography, columns, gap, alignment, and sizes with live editor previews.
* Shared custom icon library - upload an SVG once and use it across any icon-supporting block; Advanced Button upgraded to the full library.
* Advanced Section focal point controls replaced with native Axiom range controls.
* Fixed conditional-assets gate - 8 blocks no longer render unstyled when used as the only Axiom block on a page.
* Fixed testimonials marquee layout and shape divider transform issues.
* Color picker reset links now correctly match each field's default value; spacing and typography reset buttons updated for consistency.

= 1.0.3 =
* New block: Info Box - a styled box that holds an Icon, Advanced Heading, text, and Advanced Button as editable blocks, with predefined Default/Bordered/Card/Accent styles and a single gap control for the spacing between items, plus stack or row direction, alignment, background, border, corner radius, and shadow.

= 1.0.2 =
* New blocks: Accordion, Notice / Alert, Counter, and Testimonials.
* Accordion outputs FAQ schema (JSON-LD) for rich results, with single-open and first-panel-open options.
* Counter adds custom decimal/thousands separators, per-stat cards, hover colors, and label positioning.

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

= 1.1.0 =
Adds Contact Form, saved form entries, email delivery settings and a Help tab with first steps.

= 1.0.9 =
Adds the CSS Grid and Grid Item blocks for responsive grids with unequal columns and per-device item placement. Existing blocks and content are unchanged.

= 1.0.8 =
Adds the Post Filter block, a filter bar for Post Grid that works with JavaScript disabled. Advanced Section width now comes from the block width toolbar and your theme's content width, not the block's own setting, so a section with a width set may move. Post Grid cards can now be styled.

= 1.0.7 =
Adds the Post Grid block: your posts in a grid or list, built from separate Image, Terms, Title, Meta, Excerpt and Read More blocks you style individually, plus numbered or load-more pagination and an optional featured card. Nothing else changes and no existing content is affected.

= 1.0.6 =
If your Pricing Table used the Filled or Minimal style: those presets are gone, tables revert to Bordered and need restyling in Styles > Cards. Tabs presets are removed but existing tabs convert automatically and keep their design. Everything else is additive.

= 1.0.5 =
Adds two new blocks - Content Slider and Table of Contents - plus a redesigned color picker with an HSV canvas, alpha, eyedropper, and recent colors.

= 1.0.4 =
Adds responsive controls, deactivation survival, custom icon library, Advanced Section focal point improvements, and multiple bug fixes.

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
