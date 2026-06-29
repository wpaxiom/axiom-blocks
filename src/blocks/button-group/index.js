import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
	InnerBlocks,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABSelectControl,
	ABToggleControl,
	ABRangeControl,
} from '../../components/ABControls';
import { useDeviceType } from '../../components/responsive';
import { ABResponsive } from '../../components/ABResponsive';
import {
	responsiveVarValue,
	responsiveAlignValue,
} from '../../components/responsiveProps';
import { BlockIcon } from '../../blockIcons';

/* justify includes Space between, so it carries its own map (not ALIGN_FLEX_MAP). */
const JUSTIFY_MAP = {
	left: 'flex-start',
	center: 'center',
	right: 'flex-end',
	'space-between': 'space-between',
};
import {
	DisabledBlockMessage,
	isBlockEnabled,
} from '../../components/DisabledBlockMessage';

const DEFAULT_BUTTONS = [
	[
		'axiom-blocks/advanced-button',
		{
			text: __( 'Get started', 'axiom-blocks' ),
			icon: 'arrow-right',
		},
	],
	[
		'axiom-blocks/advanced-button',
		{
			text: __( 'Learn more', 'axiom-blocks' ),
			stylePreset: 'outline',
		},
	],
];

export function getGroupClasses( attributes ) {
	const { orientation, justify, stackOnMobile } = attributes;
	return [
		'axiom-blocks-button-group',
		'vertical' === orientation ? 'is-vertical' : '',
		`is-justify-${ justify || 'left' }`,
		stackOnMobile ? 'is-stack-mobile' : '',
	].filter( Boolean );
}

function ButtonGroupEdit( { attributes, setAttributes } ) {
	if ( ! isBlockEnabled( 'advanced-button' ) ) {
		return <DisabledBlockMessage blockName="Button Group" />;
	}
	const { orientation, stackOnMobile } = attributes;

	const device = useDeviceType();
	const blockProps = useBlockProps( {
		className: getGroupClasses( attributes ).join( ' ' ),
		style: {
			'--ab-btng-gap': responsiveVarValue(
				attributes,
				'gap',
				device,
				'px'
			),
			justifyContent: responsiveAlignValue(
				attributes,
				'justify',
				device,
				JUSTIFY_MAP
			),
		},
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: [ 'axiom-blocks/advanced-button' ],
		template: DEFAULT_BUTTONS,
		templateLock: false,
		renderAppender: InnerBlocks.ButtonBlockAppender,
		orientation: 'vertical' === orientation ? 'vertical' : 'horizontal',
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Layout', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABSelectControl
						label={ __( 'Orientation', 'axiom-blocks' ) }
						value={ orientation }
						options={ [
							{
								label: __( 'Horizontal', 'axiom-blocks' ),
								value: 'horizontal',
							},
							{
								label: __( 'Vertical', 'axiom-blocks' ),
								value: 'vertical',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { orientation: v } )
						}
					/>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="justify"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABSelectControl
								label={ __( 'Alignment', 'axiom-blocks' ) }
								value={
									value !== '' && value != null
										? value
										: inherited ?? 'left'
								}
								options={ [
									{
										label: __( 'Left', 'axiom-blocks' ),
										value: 'left',
									},
									{
										label: __( 'Center', 'axiom-blocks' ),
										value: 'center',
									},
									{
										label: __( 'Right', 'axiom-blocks' ),
										value: 'right',
									},
									{
										label: __(
											'Space between',
											'axiom-blocks'
										),
										value: 'space-between',
									},
								] }
								onChange={ setValue }
							/>
						) }
					</ABResponsive>
					<ABResponsive
						attributes={ attributes }
						setAttributes={ setAttributes }
						attrKey="gap"
					>
						{ ( { value, setValue, inherited } ) => (
							<ABRangeControl
								label={ __( 'Gap', 'axiom-blocks' ) }
								value={
									value !== '' && value != null
										? value
										: inherited ?? 0
								}
								onChange={ ( v ) => setValue( v ?? 0 ) }
								min={ 0 }
								max={ 64 }
								step={ 1 }
								unit="px"
							/>
						) }
					</ABResponsive>
					{ 'horizontal' === orientation && (
						<ABToggleControl
							label={ __( 'Stack on mobile', 'axiom-blocks' ) }
							checked={ !! stackOnMobile }
							onChange={ ( v ) =>
								setAttributes( { stackOnMobile: v } )
							}
						/>
					) }
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}

export const ButtonGroup = {
	name: 'axiom-blocks/button-group',
	settings: {
		title: __( 'Button Group', 'axiom-blocks' ),
		description: __(
			'Arrange Advanced Buttons in a row or stack with alignment and gap controls.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="button-group" />,
		edit: ButtonGroupEdit,
		save: () => <InnerBlocks.Content />,
	},
};
