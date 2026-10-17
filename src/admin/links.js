/**
 * Outbound links: one place for every docs, video and support URL the
 * dashboard shows, each tagged with where it was clicked from. The PHP mirror
 * is inc/Admin/Links.php; change a page in both.
 */

export const DOCS = 'https://www.wpaxiom.com/docs/axiom-blocks';

const PAGES = {
	docs: '',
	'getting-started': '', // /getting-started is not published yet.
	'how-blocks-work': '', // /how-blocks-work is not published yet.
	videos: 'https://www.youtube.com/playlist?list=PLNsJLdrHnJGs',
	'video-getting-started': 'https://youtu.be/V3Ilqfiymkc',
	'contact-form': '', // /contact-form-block is not published yet.
	'email-delivery': '', // /email-delivery is not published yet.
	'path-store': '', // /store is not published yet.
	'path-blog': '', // /blog is not published yet.
	'path-site': '', // /site is not published yet.
	support: 'https://wordpress.org/support/plugin/axiom-blocks/',
	review: 'https://wordpress.org/support/plugin/axiom-blocks/reviews/#new-post',
	bug: 'https://github.com/wpaxiom/axiom-blocks/issues/new',
	feature:
		'https://github.com/wpaxiom/axiom-blocks/issues/new?labels=enhancement',
};

const tag = ( url, place ) => {
	const [ base, hash ] = url.split( '#' );
	const sep = base.includes( '?' ) ? '&' : '?';
	const tagged = `${ base }${ sep }utm_source=plugin&utm_medium=${ place }`;
	return hash ? `${ tagged }#${ hash }` : tagged;
};

/**
 * A tagged URL for a named page.
 *
 * @param {string} page  Key of PAGES.
 * @param {string} place Where the link sits (utm_medium).
 * @return {string} URL.
 */
export const link = ( page, place ) => {
	const path = PAGES[ page ] ?? '';
	return tag( path.startsWith( 'https://' ) ? path : DOCS + path, place );
};

// Blocks whose docs page is not published yet; they link to the docs home.
const NO_DOCS = [ 'contact-form', 'social-share' ];

/**
 * The docs page for one block.
 *
 * @param {string} id    Block id.
 * @param {string} place Where the link sits.
 * @return {string} URL.
 */
export const blockDocs = ( id, place ) =>
	tag( NO_DOCS.includes( id ) ? DOCS : `${ DOCS }/${ id }-block`, place );
