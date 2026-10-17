import { __, sprintf } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABTextControl,
	ABTextareaControl,
	ABToggleControl,
} from '../../components/ABControls';
import { ABInspectorGroups } from '../../components/ABInspectorGroups';
import { ABResponsive } from '../../components/ABResponsive';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { useDeviceType } from '../../components/responsive';
import { useSpacingStyle } from '../../components/SpacingPanel';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { BlockIcon } from '../../blockIcons';
import { NetworksControl } from './NetworksControl';
import { NAME, NETWORKS, resolveForDevice, ssClasses, ssVars } from './shared';

const sides = ( p ) =>
	[ 'Top', 'Right', 'Bottom', 'Left' ].map(
		( s ) => `${ p }Border${ s }Width`
	);
const corners = ( p ) =>
	[ 'TopLeft', 'TopRight', 'BottomRight', 'BottomLeft' ].map(
		( c ) => `${ p }Radius${ c }`
	);
const px = ( bind, label, max, extra = {} ) => ( {
	bind,
	label,
	min: 0,
	max,
	units: [ 'px', 'em', 'rem' ],
	...extra,
} );

const DESIGN = {
	block: 'ss',
	targets: [
		{
			noun: __( 'Bar', 'axiom-blocks' ),
			background: {
				full: true,
				prefix: 'bar',
				colorKey: 'barBg',
				overlay: false,
			},
			border: {
				widthKeys: sides( 'bar' ),
				styleKey: 'barBorderStyle',
				colorKey: 'barBorderColor',
				max: 12,
			},
			radius: { keys: corners( 'bar' ), max: 64 },
			shadow: { bind: 'barShadow' },
			ranges: [
				px( 'gap', __( 'Space between buttons', 'axiom-blocks' ), 64, {
					responsive: true,
				} ),
			],
		},
		{
			noun: __( 'Lead text', 'axiom-blocks' ),
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'leadColor' },
			],
			typography: 'lead',
			ranges: [
				px( 'leadGap', __( 'Space to buttons', 'axiom-blocks' ), 64 ),
			],
		},
		{
			noun: __( 'Button', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{ label: __( 'Text', 'axiom-blocks' ), bind: 'btnColor' },
				{
					label: __( 'Copied background', 'axiom-blocks' ),
					bind: 'copiedBg',
					static: true,
				},
			],
			background: { bind: 'btnBg' },
			typography: 'btn',
			border: {
				widthKeys: sides( 'btn' ),
				styleKey: 'btnBorderStyle',
				colorKey: 'btnBorderColor',
				stateBind: {},
				max: 12,
			},
			radius: { keys: corners( 'btn' ), max: 64 },
			shadow: { bind: 'btnShadow' },
			padding: { type: 'btnPadding' },
			ranges: [
				px( 'btnSize', __( 'Button size', 'axiom-blocks' ), 120, {
					responsive: true,
				} ),
				px(
					'btnGap',
					__( 'Space between icon and label', 'axiom-blocks' ),
					40
				),
			],
		},
		{
			noun: __( 'Icon', 'axiom-blocks' ),
			states: [ 'hover' ],
			colors: [
				{ label: __( 'Color', 'axiom-blocks' ), bind: 'iconColor' },
			],
			ranges: [
				px( 'iconSize', __( 'Size', 'axiom-blocks' ), 64, {
					responsive: true,
				} ),
			],
		},
	],
};

const JUSTIFY = [
	{ label: __( 'Start', 'axiom-blocks' ), value: 'flex-start' },
	{ label: __( 'Center', 'axiom-blocks' ), value: 'center' },
	{ label: __( 'End', 'axiom-blocks' ), value: 'flex-end' },
	{ label: __( 'Space between', 'axiom-blocks' ), value: 'space-between' },
];

const DIRECTION = [
	{ label: __( 'Row', 'axiom-blocks' ), value: 'row' },
	{ label: __( 'Column', 'axiom-blocks' ), value: 'column' },
];

function ResponsiveSelect( {
	attributes,
	setAttributes,
	attrKey,
	label,
	options,
	fallback,
} ) {
	return (
		<ABResponsive
			attributes={ attributes }
			setAttributes={ setAttributes }
			attrKey={ attrKey }
		>
			{ ( { value, setValue, inherited } ) => (
				<ABSelectControl
					label={ label }
					value={ value || inherited || fallback }
					options={ options }
					onChange={ setValue }
				/>
			) }
		</ABResponsive>
	);
}

function SocialShareEdit( { attributes, setAttributes, context } ) {
	if ( ! isBlockEnabled( 'social-share' ) ) {
		return <DisabledBlockMessage blockName="Social Share" />;
	}

	const set = ( key ) => ( value ) => setAttributes( { [ key ]: value } );
	const device = useDeviceType();
	const resolved = resolveForDevice( attributes, device );
	const {
		items,
		shareSource,
		shareUrl,
		shareTitle,
		shareText,
		xVia,
		hashtags,
		openIn,
		display,
		showLead,
		leadText,
		shape,
		variant,
		brandColors,
		hoverEffect,
		wrap,
		equalWidth,
		floating,
		floatOffset,
		floatMobile,
		copiedText,
	} = attributes;

	const blockProps = useBlockProps( {
		className: ssClasses( attributes ),
		style: {
			...useSpacingStyle( attributes ),
			...ssVars( resolved ),
		},
	} );

	const list = ( Array.isArray( items ) ? items : [] ).filter(
		( item ) => item && NETWORKS[ item.network ]
	);
	const inContext = !! context?.postId;

	const leading = (
		<>
			<PanelBody title={ __( 'Networks', 'axiom-blocks' ) }>
				<NetworksControl items={ items } onChange={ set( 'items' ) } />
			</PanelBody>
			<PanelBody
				title={ __( 'Share', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'What to share', 'axiom-blocks' ) }
					value={ shareSource }
					options={ [
						{
							label: __( 'This post or page', 'axiom-blocks' ),
							value: 'post',
						},
						{
							label: __( 'A custom URL', 'axiom-blocks' ),
							value: 'custom',
						},
					] }
					onChange={ set( 'shareSource' ) }
					help={
						'post' === shareSource
							? __(
									'Inside a post grid or query loop, each row shares its own post.',
									'axiom-blocks'
							  )
							: undefined
					}
				/>
				{ 'custom' === shareSource && (
					<>
						<ABTextControl
							label={ __( 'URL', 'axiom-blocks' ) }
							value={ shareUrl }
							placeholder="https://"
							onChange={ set( 'shareUrl' ) }
						/>
						<ABTextControl
							label={ __( 'Title', 'axiom-blocks' ) }
							value={ shareTitle }
							onChange={ set( 'shareTitle' ) }
						/>
					</>
				) }
				<ABTextareaControl
					label={ __( 'Message', 'axiom-blocks' ) }
					value={ shareText }
					onChange={ set( 'shareText' ) }
					help={ __(
						'Used by X, WhatsApp, Telegram, Bluesky, Threads, Mastodon, email and SMS. Leave empty to use the title.',
						'axiom-blocks'
					) }
				/>
				<ABTextControl
					label={ __( 'X: via @handle', 'axiom-blocks' ) }
					value={ xVia }
					placeholder="@"
					onChange={ set( 'xVia' ) }
				/>
				<ABTextControl
					label={ __( 'X: hashtags', 'axiom-blocks' ) }
					value={ hashtags }
					placeholder={ __( 'news, design', 'axiom-blocks' ) }
					onChange={ set( 'hashtags' ) }
				/>
				<ABSelectControl
					label={ __( 'Open share links in', 'axiom-blocks' ) }
					value={ openIn }
					options={ [
						{
							label: __( 'A popup window', 'axiom-blocks' ),
							value: 'popup',
						},
						{
							label: __( 'A new tab', 'axiom-blocks' ),
							value: 'tab',
						},
					] }
					onChange={ set( 'openIn' ) }
				/>
				<ABTextControl
					label={ __( 'Copied message', 'axiom-blocks' ) }
					value={ copiedText }
					onChange={ set( 'copiedText' ) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Display', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ABSelectControl
					label={ __( 'Show', 'axiom-blocks' ) }
					value={ display }
					options={ [
						{ label: __( 'Icon', 'axiom-blocks' ), value: 'icon' },
						{
							label: __( 'Icon and label', 'axiom-blocks' ),
							value: 'icon-label',
						},
						{
							label: __( 'Label', 'axiom-blocks' ),
							value: 'label',
						},
					] }
					onChange={ set( 'display' ) }
				/>
				<ABToggleControl
					label={ __( 'Lead text', 'axiom-blocks' ) }
					checked={ showLead }
					onChange={ set( 'showLead' ) }
				/>
				{ showLead && (
					<ABTextControl
						label={ __( 'Text', 'axiom-blocks' ) }
						value={ leadText }
						onChange={ set( 'leadText' ) }
					/>
				) }
				<ABSelectControl
					label={ __( 'Shape', 'axiom-blocks' ) }
					value={ shape }
					options={ [
						{
							label: __( 'Square', 'axiom-blocks' ),
							value: 'square',
						},
						{
							label: __( 'Rounded', 'axiom-blocks' ),
							value: 'rounded',
						},
						{
							label: __( 'Round', 'axiom-blocks' ),
							value: 'circle',
						},
					] }
					onChange={ set( 'shape' ) }
				/>
				<ABSelectControl
					label={ __( 'Style', 'axiom-blocks' ) }
					value={ variant }
					options={ [
						{
							label: __( 'Filled', 'axiom-blocks' ),
							value: 'filled',
						},
						{
							label: __( 'Outline', 'axiom-blocks' ),
							value: 'outline',
						},
						{ label: __( 'Soft', 'axiom-blocks' ), value: 'soft' },
						{
							label: __( 'Plain', 'axiom-blocks' ),
							value: 'plain',
						},
					] }
					onChange={ set( 'variant' ) }
				/>
				<ABToggleControl
					label={ __( 'Brand colors', 'axiom-blocks' ) }
					checked={ brandColors !== false }
					onChange={ set( 'brandColors' ) }
					help={ __(
						'Each button wears its network color. Colors set under Styles override it.',
						'axiom-blocks'
					) }
				/>
				<ABSelectControl
					label={ __( 'Hover effect', 'axiom-blocks' ) }
					value={ hoverEffect }
					options={ [
						{ label: __( 'None', 'axiom-blocks' ), value: 'none' },
						{ label: __( 'Lift', 'axiom-blocks' ), value: 'lift' },
						{ label: __( 'Grow', 'axiom-blocks' ), value: 'grow' },
					] }
					onChange={ set( 'hoverEffect' ) }
				/>
			</PanelBody>
			<PanelBody
				title={ __( 'Layout', 'axiom-blocks' ) }
				initialOpen={ false }
			>
				<ResponsiveSelect
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="direction"
					label={ __( 'Direction', 'axiom-blocks' ) }
					options={ DIRECTION }
					fallback="row"
				/>
				<ResponsiveSelect
					attributes={ attributes }
					setAttributes={ setAttributes }
					attrKey="justify"
					label={ __( 'Justify', 'axiom-blocks' ) }
					options={ JUSTIFY }
					fallback="flex-start"
				/>
				<ABToggleControl
					label={ __( 'Wrap onto new lines', 'axiom-blocks' ) }
					checked={ wrap !== false }
					onChange={ set( 'wrap' ) }
				/>
				<ABToggleControl
					label={ __( 'Equal width buttons', 'axiom-blocks' ) }
					checked={ !! equalWidth }
					onChange={ set( 'equalWidth' ) }
				/>
				<ABSelectControl
					label={ __( 'Floating', 'axiom-blocks' ) }
					value={ floating }
					options={ [
						{ label: __( 'Off', 'axiom-blocks' ), value: '' },
						{
							label: __( 'Left edge', 'axiom-blocks' ),
							value: 'left',
						},
						{
							label: __( 'Right edge', 'axiom-blocks' ),
							value: 'right',
						},
					] }
					onChange={ set( 'floating' ) }
					help={
						floating
							? __(
									'Fixed to the edge of the screen on the published page. The editor shows it in place.',
									'axiom-blocks'
							  )
							: undefined
					}
				/>
				{ floating && (
					<>
						<ABTextControl
							label={ __( 'Offset from top', 'axiom-blocks' ) }
							value={ floatOffset }
							placeholder="30%"
							onChange={ set( 'floatOffset' ) }
						/>
						<ABSelectControl
							label={ __( 'On small screens', 'axiom-blocks' ) }
							value={ floatMobile }
							options={ [
								{
									label: __( 'Bottom bar', 'axiom-blocks' ),
									value: 'bar',
								},
								{
									label: __(
										'In place, not floating',
										'axiom-blocks'
									),
									value: 'inline',
								},
								{
									label: __( 'Hidden', 'axiom-blocks' ),
									value: 'hide',
								},
							] }
							onChange={ set( 'floatMobile' ) }
						/>
					</>
				) }
			</PanelBody>
		</>
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ DESIGN }
				leading={ leading }
			/>
			<div { ...blockProps }>
				{ floating && (
					<span className="ab-ss__badge">
						{ 'left' === floating
							? __( 'Floating: left edge', 'axiom-blocks' )
							: __( 'Floating: right edge', 'axiom-blocks' ) }
					</span>
				) }
				{ showLead && leadText && (
					<span className="ab-ss__lead">{ leadText }</span>
				) }
				<ul className="ab-ss__list">
					{ list.map( ( item ) => {
						const net = NETWORKS[ item.network ];
						const name = item.label || net.label;
						const glyph = ICON_LIBRARY[ item.icon || net.icon ];
						return (
							<li className="ab-ss__item" key={ item.network }>
								<span
									className={ `ab-ss__btn ab-ss__btn--${ item.network }` }
									style={ { '--ab-ss-brand': net.color } }
									title={
										'native' === item.network
											? __(
													'Shown only in browsers with a share sheet.',
													'axiom-blocks'
											  )
											: sprintf(
													/* translators: %s: network name. */
													__(
														'Share on %s',
														'axiom-blocks'
													),
													name
											  )
									}
								>
									{ 'label' !== display && glyph && (
										<span className="ab-ss__icon">
											{ glyph }
										</span>
									) }
									{ 'icon' !== display && (
										<span className="ab-ss__label">
											{ name }
										</span>
									) }
								</span>
							</li>
						);
					} ) }
				</ul>
				{ ! list.length && (
					<p className="ab-ss__empty">
						{ __(
							'Add a network in the block settings.',
							'axiom-blocks'
						) }
					</p>
				) }
				{ inContext && 'post' === shareSource && (
					<span className="screen-reader-text">
						{ __( 'Shares this post.', 'axiom-blocks' ) }
					</span>
				) }
			</div>
		</>
	);
}

const VARIATIONS = [
	{
		name: 'icons',
		title: __( 'Share icons', 'axiom-blocks' ),
		description: __(
			'A row of share icons in brand colors.',
			'axiom-blocks'
		),
		isDefault: true,
		attributes: {},
		scope: [ 'inserter', 'block' ],
	},
	{
		name: 'buttons',
		title: __( 'Share buttons with labels', 'axiom-blocks' ),
		description: __(
			'Pill buttons with the network name and a lead text.',
			'axiom-blocks'
		),
		attributes: {
			display: 'icon-label',
			shape: 'circle',
			showLead: true,
			items: [
				{ network: 'facebook' },
				{ network: 'x' },
				{ network: 'linkedin' },
				{ network: 'copy' },
				{ network: 'native' },
			],
		},
		scope: [ 'inserter', 'block' ],
	},
	{
		name: 'floating',
		title: __( 'Floating share bar', 'axiom-blocks' ),
		description: __(
			'A column of icons fixed to the left edge, and a bar at the bottom on phones.',
			'axiom-blocks'
		),
		attributes: {
			floating: 'left',
			direction: 'column',
			shape: 'square',
		},
		scope: [ 'inserter', 'block' ],
	},
];

export const SocialShare = {
	name: NAME,
	settings: {
		icon: <BlockIcon slug="social-share" />,
		edit: SocialShareEdit,
		save: () => null,
		variations: VARIATIONS,
	},
};
