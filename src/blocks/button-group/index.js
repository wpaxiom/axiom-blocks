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
import { BlockIcon } from '../../blockIcons';
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
	const { orientation, justify, gap, stackOnMobile } = attributes;

	const blockProps = useBlockProps( {
		className: getGroupClasses( attributes ).join( ' ' ),
		style: { '--ab-btng-gap': `${ gap ?? 12 }px` },
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
					<ABSelectControl
						label={ __( 'Alignment', 'axiom-blocks' ) }
						value={ justify }
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
								label: __( 'Space between', 'axiom-blocks' ),
								value: 'space-between',
							},
						] }
						onChange={ ( v ) => setAttributes( { justify: v } ) }
					/>
					<ABRangeControl
						label={ __( 'Gap', 'axiom-blocks' ) }
						value={ gap }
						onChange={ ( v ) => setAttributes( { gap: v ?? 0 } ) }
						min={ 0 }
						max={ 64 }
						step={ 1 }
						unit="px"
					/>
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
