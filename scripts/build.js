#!/usr/bin/env node
/**
 * Axiom Blocks build orchestrator.
 *
 * Phase 1: runs wp-scripts build (captured; only surfaces output on failure).
 * Phase 2: copies per-block runtime files (block.json, render.php, assets/*.js)
 *          that wp-scripts doesn't know about.
 *
 * TTY mode renders an animated multi-line panel — one row per phase with
 * spinner / status icon / detail text. Non-TTY mode prints milestone lines.
 */

const { spawn } = require( 'child_process' );
const fs = require( 'fs' );
const path = require( 'path' );

const ROOT = path.resolve( __dirname, '..' );

/** Blocks that ship runtime files beyond the JS/CSS bundle. */
const BLOCKS = [
	{
		id: 'tabs',
		files: [ 'block.json', 'render.php', 'assets/tabs.js' ],
		extras: [
			[ 'tab-panel/block.json', 'tab-panel/block.json' ],
			[ 'tab-panel/render.php', 'tab-panel/render.php' ],
		],
	},
	{
		id: 'advanced-section',
		files: [ 'block.json', 'render.php', 'assets/parallax.js' ],
	},
	{
		id: 'countdown-timer',
		files: [ 'block.json', 'render.php', 'assets/countdown.js' ],
	},
	{
		id: 'copy-to-clipboard',
		files: [ 'block.json', 'render.php', 'assets/copy.js' ],
	},
	{ id: 'star-rating', files: [ 'block.json', 'render.php' ] },
	{
		id: 'reading-progress-bar',
		files: [ 'block.json', 'render.php', 'assets/progress.js' ],
	},
	{ id: 'shape-divider', files: [ 'block.json', 'render.php' ] },
	{
		id: 'before-after-slider',
		files: [ 'block.json', 'render.php', 'assets/slider.js' ],
	},
	{
		id: 'pricing-table',
		files: [ 'block.json', 'render.php' ],
		extras: [
			[ 'pricing-plan/block.json', 'pricing-plan/block.json' ],
			[ 'pricing-plan/render.php', 'pricing-plan/render.php' ],
		],
	},
	{
		id: 'trust-badges',
		files: [ 'block.json', 'render.php', 'badges.php', 'assets/' ],
	},
	{
		id: 'free-shipping-progress',
		files: [
			'block.json',
			'render.php',
			'helper.php',
			'assets/free-shipping-progress.js',
		],
	},
];

/** Non-block files copied to build/. */
const ROOT_COPIES = [ [ 'src/animations.js', 'build/animations.js' ] ];

const TTY = process.stdout.isTTY;
const C = {
	reset: TTY ? '\x1b[0m' : '',
	bold: TTY ? '\x1b[1m' : '',
	dim: TTY ? '\x1b[2m' : '',
	red: TTY ? '\x1b[31m' : '',
	green: TTY ? '\x1b[32m' : '',
	cyan: TTY ? '\x1b[36m' : '',
	yellow: TTY ? '\x1b[33m' : '',
	gray: TTY ? '\x1b[90m' : '',
};

const SPINNER_FRAMES = [ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏' ];
const LABEL_WIDTH = 30;
const DETAIL_MAX_LENGTH = 70;

// ---- Phase state model --------------------------------------------------

const phases = [
	{
		id: 'bundle',
		label: 'Bundling JS + CSS',
		status: 'waiting',
		detail: '',
		startedAt: 0,
		doneAt: 0,
	},
	{
		id: 'copy',
		label: 'Copying per-block files',
		status: 'waiting',
		detail: '',
		startedAt: 0,
		doneAt: 0,
	},
];

let spinnerFrame = 0;
let spinnerInterval = null;
let lastRenderedLines = 0;
let cursorHidden = false;

function hideCursor() {
	if ( TTY && ! cursorHidden ) {
		process.stdout.write( '\x1b[?25l' );
		cursorHidden = true;
	}
}

function showCursor() {
	if ( TTY && cursorHidden ) {
		process.stdout.write( '\x1b[?25h' );
		cursorHidden = false;
	}
}

function truncate( s, max ) {
	return s.length > max ? s.slice( 0, max - 1 ) + '…' : s;
}

function renderPanel() {
	if ( ! TTY ) return;

	// Move cursor back up to the top of the panel if we've drawn it before.
	if ( lastRenderedLines > 0 ) {
		process.stdout.write( `\x1b[${ lastRenderedLines }A` );
	}

	for ( const phase of phases ) {
		let icon;
		let labelColor = '';
		let suffix = '';

		if ( phase.status === 'waiting' ) {
			icon = C.gray + '○' + C.reset;
			labelColor = C.dim;
		} else if ( phase.status === 'active' ) {
			icon = C.cyan + SPINNER_FRAMES[ spinnerFrame ] + C.reset;
			labelColor = C.bold;
			if ( phase.detail ) {
				suffix =
					'  ' +
					C.dim +
					truncate( phase.detail, DETAIL_MAX_LENGTH ) +
					C.reset;
			}
		} else if ( phase.status === 'done' ) {
			icon = C.green + '✓' + C.reset;
			const elapsed = (
				( phase.doneAt - phase.startedAt ) /
				1000
			).toFixed( 1 );
			const detailPart = phase.detail ? phase.detail + ' ' : '';
			suffix = '  ' + C.dim + detailPart + `(${ elapsed }s)` + C.reset;
		} else {
			icon = C.red + '✗' + C.reset;
			labelColor = C.red;
		}

		// \x1b[K clears the rest of the line so a shorter new label doesn't
		// leave tail characters from a longer previous one.
		const labelText = phase.label.padEnd( LABEL_WIDTH );
		process.stdout.write(
			`${ icon } ${ labelColor }${ labelText }${ C.reset }${ suffix }\x1b[K\n`
		);
	}

	lastRenderedLines = phases.length;
}

function startSpinner() {
	if ( ! TTY || spinnerInterval ) return;
	hideCursor();
	spinnerInterval = setInterval( () => {
		spinnerFrame = ( spinnerFrame + 1 ) % SPINNER_FRAMES.length;
		renderPanel();
	}, 80 );
}

function stopSpinner() {
	if ( spinnerInterval ) {
		clearInterval( spinnerInterval );
		spinnerInterval = null;
	}
}

function setPhase( id, fields ) {
	const phase = phases.find( ( p ) => p.id === id );
	if ( ! phase ) return;
	if ( fields.status === 'active' && phase.status === 'waiting' ) {
		phase.startedAt = Date.now();
	}
	if ( fields.status === 'done' ) {
		phase.doneAt = Date.now();
	}
	Object.assign( phase, fields );
	renderPanel();
}

/**
 * Print a line above the active panel (used for one-off messages and the
 * final error dump). Clears the panel, prints the line, then leaves the
 * panel-drawing state reset so the next renderPanel() call redraws fresh.
 * @param msg
 */
function printAbovePanel( msg ) {
	if ( TTY && lastRenderedLines > 0 ) {
		process.stdout.write( `\x1b[${ lastRenderedLines }A\x1b[J` );
		lastRenderedLines = 0;
	}
	process.stdout.write( msg + '\n' );
}

// ---- Filesystem helpers -------------------------------------------------

function mkdirp( p ) {
	fs.mkdirSync( p, { recursive: true } );
}

function copyFile( src, dest ) {
	const absSrc = path.join( ROOT, src );
	const absDest = path.join( ROOT, dest );
	if ( ! fs.existsSync( absSrc ) ) return false;
	mkdirp( path.dirname( absDest ) );

	if ( src.endsWith( '/' ) ) {
		copyDir( absSrc, absDest );
		return true;
	}

	fs.copyFileSync( absSrc, absDest );
	return true;
}

function copyDir( srcDir, destDir ) {
	mkdirp( destDir );
	for ( const entry of fs.readdirSync( srcDir, { withFileTypes: true } ) ) {
		const srcPath = path.join( srcDir, entry.name );
		const destPath = path.join( destDir, entry.name );
		if ( entry.isDirectory() ) {
			copyDir( srcPath, destPath );
		} else {
			fs.copyFileSync( srcPath, destPath );
		}
	}
}

// ---- Webpack progress parser --------------------------------------------

/**
 * Parses webpack --progress lines, e.g. "<s> [webpack.Progress] 42% building 1/3 modules".
 * The "[webpack.Progress]" marker is required so we don't match stray "99%" in webpack
 * stats output. Returns { pct, label } or null.
 * @param line
 */
function parseProgress( line ) {
	const m = /\[webpack\.Progress\]\s*(\d{1,3})%\s*(.*)/.exec( line );
	if ( ! m ) return null;
	return { pct: parseInt( m[ 1 ], 10 ), label: m[ 2 ].trim() };
}

// ---- Phase 1: bundler ---------------------------------------------------

function runBundler() {
	return new Promise( ( resolve, reject ) => {
		setPhase( 'bundle', {
			status: 'active',
			detail: 'starting webpack...',
		} );
		startSpinner();

		const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
		const proc = spawn(
			npm,
			[ 'run', 'build:assets', '--silent', '--', '--progress' ],
			{ cwd: ROOT, shell: true }
		);

		let output = '';

		// Non-TTY: print a milestone at ~20% jumps so CI logs stay readable.
		const MILESTONES = [ 20, 40, 60, 80, 99 ];
		let nextMilestone = 0;

		function processBuffer( buf ) {
			const parts = buf.split( /[\r\n]+/ );
			const tail = parts.pop();
			for ( const line of parts ) {
				if ( ! line.trim() ) continue;
				const p = parseProgress( line );
				if ( ! p ) continue;

				const detail = `${ p.pct }% ${ p.label }`;
				if ( TTY ) {
					setPhase( 'bundle', { detail } );
				} else {
					while (
						nextMilestone < MILESTONES.length &&
						p.pct >= MILESTONES[ nextMilestone ]
					) {
						const pct = String(
							MILESTONES[ nextMilestone ]
						).padStart( 3, ' ' );
						process.stdout.write(
							`  ${ C.dim }[${ pct }%]${ C.reset } ${ p.label }\n`
						);
						nextMilestone++;
					}
				}
			}
			return tail;
		}

		let stdoutBuf = '';
		let stderrBuf = '';
		proc.stdout.on( 'data', ( d ) => {
			const s = d.toString();
			output += s;
			stdoutBuf = processBuffer( stdoutBuf + s );
		} );
		proc.stderr.on( 'data', ( d ) => {
			const s = d.toString();
			output += s;
			stderrBuf = processBuffer( stderrBuf + s );
		} );

		if ( ! TTY )
			process.stdout.write(
				`${ C.bold }→${ C.reset } Bundling JS + CSS...\n`
			);

		proc.on( 'exit', ( code ) => {
			if ( code === 0 ) {
				setPhase( 'bundle', { status: 'done', detail: '' } );
				if ( ! TTY )
					process.stdout.write(
						`  ${ C.green }✓${ C.reset } Bundled JS + CSS\n`
					);
				resolve();
			} else {
				stopSpinner();
				setPhase( 'bundle', { status: 'error' } );
				printAbovePanel( '' );
				printAbovePanel(
					`${ C.red }✗ wp-scripts failed (exit ${ code }):${ C.reset }`
				);
				printAbovePanel( output.trim() );
				reject( new Error( 'wp-scripts failed' ) );
			}
		} );
	} );
}

// ---- Phase 2: copy per-block runtime files ------------------------------

function copyBlockFiles() {
	setPhase( 'copy', { status: 'active', detail: '' } );

	const tasks = [];
	for ( const block of BLOCKS ) {
		tasks.push( { label: block.id, block } );
	}
	for ( const [ src, dest ] of ROOT_COPIES ) {
		tasks.push( { label: path.basename( src ), file: [ src, dest ] } );
	}

	let copied = 0;
	let skipped = 0;
	const total = tasks.length;

	for ( let i = 0; i < tasks.length; i++ ) {
		const task = tasks[ i ];
		setPhase( 'copy', {
			detail: `${ task.label } (${ i + 1 }/${ total })`,
		} );

		if ( task.block ) {
			const srcDir = `src/blocks/${ task.block.id }`;
			const destDir = `build/blocks/${ task.block.id }`;
			for ( const f of task.block.files ) {
				if ( copyFile( `${ srcDir }/${ f }`, `${ destDir }/${ f }` ) )
					copied++;
				else skipped++;
			}
			for ( const [ rel, outRel ] of task.block.extras || [] ) {
				if (
					copyFile(
						`${ srcDir }/${ rel }`,
						`${ destDir }/${ outRel }`
					)
				)
					copied++;
				else skipped++;
			}
		} else {
			const [ src, dest ] = task.file;
			if ( copyFile( src, dest ) ) copied++;
			else skipped++;
		}
	}

	const detail = skipped
		? `${ copied } file${ copied === 1 ? '' : 's' } (${ skipped } skipped)`
		: `${ copied } file${ copied === 1 ? '' : 's' }`;
	setPhase( 'copy', { status: 'done', detail } );
	if ( ! TTY )
		process.stdout.write(
			`  ${ C.green }✓${ C.reset } Copied ${ detail }\n`
		);
}

// ---- Orchestration ------------------------------------------------------

async function main() {
	const t0 = Date.now();
	process.stdout.write( '\n' );
	process.stdout.write( `${ C.bold }Axiom Blocks build${ C.reset }\n` );
	process.stdout.write( '\n' );

	// Reserve panel lines so the first spinner tick has somewhere to redraw.
	renderPanel();

	await runBundler();
	copyBlockFiles();

	stopSpinner();
	showCursor();

	const elapsed = ( ( Date.now() - t0 ) / 1000 ).toFixed( 1 );
	process.stdout.write( '\n' );
	process.stdout.write(
		`${ C.green }${ C.bold }✓ Build complete${ C.reset } ${ C.dim }(${ elapsed }s)${ C.reset }\n`
	);
	process.stdout.write( '\n' );
}

// Always restore the cursor on exit, even on crashes / Ctrl-C.
process.on( 'exit', showCursor );
process.on( 'SIGINT', () => {
	stopSpinner();
	showCursor();
	process.exit( 130 );
} );

main().catch( ( err ) => {
	stopSpinner();
	showCursor();
	process.stdout.write( '\n' );
	process.stdout.write(
		`${ C.red }${ C.bold }✗ Build failed${ C.reset } ${ C.dim }${ err.message }${ C.reset }\n`
	);
	process.exit( 1 );
} );
