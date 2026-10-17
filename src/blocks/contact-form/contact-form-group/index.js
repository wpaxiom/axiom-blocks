import { __ } from '@wordpress/i18n';
import {
	InnerBlocks,
	RichText,
	useBlockProps,
	useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABRangeControl,
	ABTextControl,
	ABToggleControl,
} from '../../../components/ABControls';
import { ABInspectorGroups } from '../../../components/ABInspectorGroups';
import { ABResponsive } from '../../../components/ABResponsive';
import { useDeviceType } from '../../../components/responsive';
import { useSpacingStyle } from '../../../components/SpacingPanel';
import { safeTrackList } from '../../css-grid/tracks';
import { BlockIcon } from '../../../blockIcons';
import { PlacementRows } from '../FieldEdit';
import {
	columnCount,
	gridTemplate,
	placementVars,
	resolveForDevice,
} from '../shared';

const NAME = 'axiom-blocks/contact-form-group';

const ALLOWED = [
	'axiom-blocks/contact-form-text',
	'axiom-blocks/contact-form-email',
	'axiom-blocks/contact-form-phone',
	'axiom-blocks/contact-form-textarea',
	'axiom-blocks/contact-form-select',
	'axiom-blocks/contact-form-choices',
	'axiom-blocks/contact-form-consent',
	'axiom-blocks/contact-form-date',
	'axiom-blocks/contact-form-hidden',
	'axiom-blocks/contact-form-submit',
	'core/paragraph',
];

const TEMPLATE = [
	[
		'axiom-blocks/contact-form-text',
		{
			label: __( 'First name', 'axiom-blocks' ),
			autocomplete: 'given-name',
			span: 1,
		},
	],
	[
		'axiom-blocks/contact-form-text',
		{
			label: __( 'Last name', 'axiom-blocks' ),
			autocomplete: 'family-name',
			span: 1,
		},
	],
];

function GroupEdit( { attributes, setAttributes } ) {
	const device = useDeviceType();
	const resolved = resolveForDevice( NAME, attributes, device );
	const template = gridTemplate( resolved.columns, resolved.tracks );

	const blockProps = useBlockProps( {
		className: `ab-cf-group${
			columnCount( template ) === 1 ? ' is-stacked' : ''
		}`,
		style: {
			...placementVars( resolved ),
			'--ab-cf-cols': template,
			...useSpacingStyle( attributes ),
		},
	} );
	const innerProps = useInnerBlocksProps(
		{ className: 'ab-cf__fields' },
		{ allowedBlocks: ALLOWED, template: TEMPLATE, templateLock: false }
	);

	return (
		<>
			<ABInspectorGroups
				attributes={ attributes }
				setAttributes={ setAttributes }
				design={ { targets: [] } }
				leading={
					<>
						<PanelBody
							title={ __( 'Field Group', 'axiom-blocks' ) }
							initialOpen
						>
							<ABTextControl
								label={ __( 'Legend', 'axiom-blocks' ) }
								value={ attributes.legend }
								onChange={ ( v ) =>
									setAttributes( { legend: v } )
								}
							/>
							<ABToggleControl
								label={ __( 'Show legend', 'axiom-blocks' ) }
								help={ __(
									"A hidden legend is still read out by screen readers. Style it under the form's Group part.",
									'axiom-blocks'
								) }
								checked={ attributes.showLegend !== false }
								onChange={ ( v ) =>
									setAttributes( { showLegend: v } )
								}
							/>
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="columns"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABRangeControl
										label={ __(
											'Columns inside the group',
											'axiom-blocks'
										) }
										unit=""
										min={ 1 }
										max={ 6 }
										value={
											value === '' || value == null
												? inherited || 1
												: value
										}
										onChange={ setValue }
									/>
								) }
							</ABResponsive>
							<ABResponsive
								attributes={ attributes }
								setAttributes={ setAttributes }
								attrKey="tracks"
							>
								{ ( { value, setValue, inherited } ) => (
									<ABTextControl
										label={ __(
											'Custom columns',
											'axiom-blocks'
										) }
										help={
											value && ! safeTrackList( value )
												? __(
														'Not a valid column list, so equal columns are used.',
														'axiom-blocks'
												  )
												: __(
														'Optional, for example 2fr 1fr.',
														'axiom-blocks'
												  )
										}
										placeholder={ inherited || '' }
										value={ value }
										onChange={ setValue }
									/>
								) }
							</ABResponsive>
						</PanelBody>
						<PanelBody
							title={ __( 'Placement', 'axiom-blocks' ) }
							initialOpen={ false }
						>
							<PlacementRows
								{ ...{ attributes, setAttributes } }
							/>
						</PanelBody>
					</>
				}
			/>
			<fieldset { ...blockProps }>
				{ ( attributes.legend || attributes.showLegend !== false ) && (
					<RichText
						tagName="legend"
						className={ `ab-cf-legend${
							attributes.showLegend === false
								? ' screen-reader-text'
								: ''
						}` }
						value={ attributes.legend }
						allowedFormats={ [] }
						placeholder={ __( 'Group title', 'axiom-blocks' ) }
						onChange={ ( v ) => setAttributes( { legend: v } ) }
					/>
				) }
				<div { ...innerProps } />
			</fieldset>
		</>
	);
}

export const ContactFormGroup = {
	name: NAME,
	settings: {
		title: __( 'Field Group', 'axiom-blocks' ),
		description: __(
			'A fieldset with a legend that groups fields and lays them out in its own columns.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="contact-form-group" />,
		edit: GroupEdit,
		save: () => <InnerBlocks.Content />,
	},
};
