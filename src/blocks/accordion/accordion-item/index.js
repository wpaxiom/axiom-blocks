import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InnerBlocks,
	RichText,
} from '@wordpress/block-editor';
import { ICON_LIBRARY } from '../../../components/iconLibrary';
import { useIconNode } from '../../../components/useCustomIcons';
import { BlockIcon } from '../../../blockIcons';
import { innerBlocksDeprecation } from '../../../components/deprecations';

function AccordionItemEdit( { attributes, setAttributes, context } ) {
	const { title } = attributes;
	const resolveIcon = useIconNode();
	const showIcon = context[ 'axiom-blocks/accordionShowIcon' ] !== false;
	const iconSlug =
		context[ 'axiom-blocks/accordionIconSlug' ] || 'chevron-down';
	const iconPosition =
		context[ 'axiom-blocks/accordionIconPosition' ] || 'right';
	const headingTag = context[ 'axiom-blocks/accordionHeadingLevel' ] || 'h3';

	const blockProps = useBlockProps( {
		className: `ab-accordion__item is-editor ab-accordion__item--icon-${ iconPosition }`,
	} );

	const bodyProps = useInnerBlocksProps(
		{ className: 'ab-accordion__body-inner' },
		{
			template: [
				[
					'core/paragraph',
					{
						placeholder: __(
							'Add content to this panel…',
							'axiom-blocks'
						),
					},
				],
			],
			templateLock: false,
		}
	);

	const icon = showIcon && (
		<span className="ab-accordion__icon" contentEditable={ false }>
			{ resolveIcon( iconSlug ) || ICON_LIBRARY[ 'chevron-down' ] }
		</span>
	);

	return (
		<div { ...blockProps }>
			<div className="ab-accordion__header">
				{ iconPosition === 'left' && icon }
				<RichText
					tagName={ headingTag }
					className="ab-accordion__title"
					value={ title }
					onChange={ ( v ) => setAttributes( { title: v } ) }
					placeholder={ __( 'Accordion title…', 'axiom-blocks' ) }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
				/>
				{ iconPosition !== 'left' && icon }
			</div>
			<div className="ab-accordion__body">
				<div { ...bodyProps } />
			</div>
		</div>
	);
}

export const AccordionItem = {
	name: 'axiom-blocks/accordion-item',
	settings: {
		title: __( 'Accordion Item', 'axiom-blocks' ),
		description: __(
			'A single collapsible panel inside the Accordion block.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="accordion-item" />,
		edit: AccordionItemEdit,
		save: ( { attributes } ) => {
			const blockProps = useBlockProps.save( {
				className: 'ab-accordion__item',
			} );
			return (
				<details { ...blockProps }>
					<summary className="ab-accordion__header">
						<RichText.Content
							tagName="span"
							className="ab-accordion__title"
							value={ attributes.title }
						/>
					</summary>
					<div className="ab-accordion__body">
						<div className="ab-accordion__body-inner">
							<InnerBlocks.Content />
						</div>
					</div>
				</details>
			);
		},
		deprecated: [
			innerBlocksDeprecation( {
				attributes: { title: { type: 'string', default: '' } },
				supports: { html: false, reusable: false, anchor: true },
			} ),
		],
	},
};
