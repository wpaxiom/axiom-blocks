import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABColorControl,
	ABToggleControl,
	ABRangeControl,
	ABSubAccordion,
} from '../../components/ABControls';
import { SpacingPanel, useSpacingStyle } from '../../components/SpacingPanel';
import {
	TypographyPanel,
	useTypographyStyle,
} from '../../components/TypographyPanel';
import { IconControl } from '../../components/IconControl';
import { ICON_LIBRARY } from '../../components/iconLibrary';
import { useIconNode } from '../../components/useCustomIcons';
import { useDeviceType } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import { responsiveVarValue } from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';
import { nullSaveDeprecation } from '../../components/deprecations';
import metadata from './block.json';

const TYPE_ICON = {
	info: 'info',
	success: 'check-circle',
	warning: 'alert-triangle',
	error: 'circle-x',
};

const toPx = ( v ) => ( v === '' || v == null ? '' : `${ v }px` );
const fromPx = ( v, fallback ) =>
	v === '' || v == null ? fallback : parseInt( v, 10 ) || 0;

export function getNoticeVars( attributes ) {
	const { bgColor, textColor, accentColor, borderRadius, iconColor, iconSize } =
		attributes;
	return {
		'--ab-notice-bg': bgColor || undefined,
		'--ab-notice-color': textColor || undefined,
		'--ab-notice-accent': accentColor || undefined,
		'--ab-notice-radius': borderRadius || undefined,
		'--ab-notice-icon': iconColor || undefined,
		'--ab-notice-icon-size': iconSize || undefined,
	};
}

function NoticeEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'notice' ) ) {
		return <DisabledBlockMessage blockName="Notice / Alert" />;
	}

	const {
		noticeType,
		title,
		message,
		showIcon,
		iconSlug,
		iconColor,
		dismissible,
		bgColor,
		textColor,
		accentColor,
		borderRadius,
	} = attributes;

	const activeIcon = iconSlug || TYPE_ICON[ noticeType ] || 'info';
	const resolveIcon = useIconNode();

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: [
			'ab-notice',
			`ab-notice--${ noticeType }`,
			showIcon ? 'has-icon' : 'no-icon',
		].join( ' ' ),
		style: {
			...getNoticeVars( attributes ),
			...useSpacingStyle( attributes ),
			'--ab-notice-icon-size': responsiveVarValue(
				attributes,
				'iconSize',
				device
			),
		},
	} );

	const titleTypoStyle = useTypographyStyle( attributes, 'title' );
	const contentTypoStyle = useTypographyStyle( attributes, 'content' );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Type', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Notice type', 'axiom-blocks' ) }
						value={ noticeType }
						options={ [
							{
								label: __( 'Info', 'axiom-blocks' ),
								value: 'info',
							},
							{
								label: __( 'Success', 'axiom-blocks' ),
								value: 'success',
							},
							{
								label: __( 'Warning', 'axiom-blocks' ),
								value: 'warning',
							},
							{
								label: __( 'Error', 'axiom-blocks' ),
								value: 'error',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { noticeType: v } )
						}
					/>
					<ABToggleControl
						label={ __( 'Dismissible', 'axiom-blocks' ) }
						help={ __(
							'Show a close button on the front end.',
							'axiom-blocks'
						) }
						checked={ !! dismissible }
						onChange={ ( v ) =>
							setAttributes( { dismissible: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Icon', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABToggleControl
						label={ __( 'Show icon', 'axiom-blocks' ) }
						checked={ !! showIcon }
						onChange={ ( v ) => setAttributes( { showIcon: v } ) }
					/>
					{ showIcon && (
						<>
							<IconControl
								value={ activeIcon }
								onChange={ ( v ) =>
									setAttributes( { iconSlug: v } )
								}
							/>
							{ iconSlug && (
								<ABToggleControl
									label={ __(
										'Use default icon for type',
										'axiom-blocks'
									) }
									checked={ false }
									onChange={ () =>
										setAttributes( { iconSlug: '' } )
									}
								/>
							) }
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="iconSize"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABRangeControl
										label={ __( 'Icon size', 'axiom-blocks' ) }
										value={ fromPx(
											value === '' ? inherited : value,
											22
										) }
										onChange={ ( v ) => setValue( toPx( v ) ) }
										min={ 12 }
										max={ 48 }
										step={ 1 }
										unit="px"
									/>
								) }
							</ABResponsive>
							<ABColorControl
								label={ __( 'Icon colour', 'axiom-blocks' ) }
								color={ iconColor }
								onChange={ ( v ) =>
									setAttributes( { iconColor: v } )
								}
							/>
						</>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Colours', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABColorControl
						label={ __( 'Background', 'axiom-blocks' ) }
						color={ bgColor }
						onChange={ ( v ) => setAttributes( { bgColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Text', 'axiom-blocks' ) }
						color={ textColor }
						onChange={ ( v ) => setAttributes( { textColor: v } ) }
					/>
					<ABColorControl
						label={ __( 'Accent / border', 'axiom-blocks' ) }
						color={ accentColor }
						onChange={ ( v ) =>
							setAttributes( { accentColor: v } )
						}
					/>
					<ABRangeControl
						label={ __( 'Corner radius', 'axiom-blocks' ) }
						value={ fromPx( borderRadius, 8 ) }
						onChange={ ( v ) =>
							setAttributes( { borderRadius: toPx( v ) } )
						}
						min={ 0 }
						max={ 32 }
						step={ 1 }
						unit="px"
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Typography', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<div className="ab-sub-acc-list">
						<ABSubAccordion title={ __( 'Title', 'axiom-blocks' ) }>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="title"
								unwrapped
								responsive
							/>
						</ABSubAccordion>
						<ABSubAccordion
							title={ __( 'Message', 'axiom-blocks' ) }
						>
							<TypographyPanel
								attributes={ attributes }
								setAttributes={ setAttributes }
								prefix="content"
								unwrapped
								responsive
							/>
						</ABSubAccordion>
					</div>
				</PanelBody>

				<SpacingPanel
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			</InspectorControls>

			<div { ...blockProps }>
				{ showIcon && (
					<span className="ab-notice__icon" contentEditable={ false }>
						{ resolveIcon( activeIcon ) || ICON_LIBRARY[ 'info' ] }
					</span>
				) }
				<div className="ab-notice__content">
					<RichText
						tagName="div"
						className="ab-notice__title"
						value={ title }
						onChange={ ( v ) => setAttributes( { title: v } ) }
						placeholder={ __( 'Notice title…', 'axiom-blocks' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
						style={ titleTypoStyle }
					/>
					<RichText
						tagName="div"
						className="ab-notice__message"
						value={ message }
						onChange={ ( v ) => setAttributes( { message: v } ) }
						placeholder={ __(
							'Add your message…',
							'axiom-blocks'
						) }
						allowedFormats={ [
							'core/bold',
							'core/italic',
							'core/link',
						] }
						style={ contentTypoStyle }
					/>
				</div>
				{ dismissible && (
					<span
						className="ab-notice__dismiss"
						aria-hidden="true"
						contentEditable={ false }
					>
						{ ICON_LIBRARY[ 'x' ] }
					</span>
				) }
			</div>
		</>
	);
}

export const Notice = {
	name: 'axiom-blocks/notice',
	settings: {
		title: __( 'Notice / Alert', 'axiom-blocks' ),
		description: __(
			'Highlight an info, success, warning, or error message with an icon and optional dismiss button.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="notice" />,
		edit: NoticeEdit,
		save: ( { attributes } ) => {
			const { title, message } = attributes;
			const blockProps = useBlockProps.save();
			return (
				<div { ...blockProps }>
					<div className="ab-notice__content">
						{ title && (
							<RichText.Content
								tagName="strong"
								className="ab-notice__title"
								value={ title }
							/>
						) }
						{ message && (
							<RichText.Content
								tagName="div"
								className="ab-notice__message"
								value={ message }
							/>
						) }
					</div>
				</div>
			);
		},
		deprecated: [
			nullSaveDeprecation( {
				attributes: metadata.attributes,
				supports: metadata.supports,
			} ),
		],
	},
};
