import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InspectorControls,
	RichText,
	MediaUpload,
	MediaUploadCheck,
} from '@wordpress/block-editor';
import { PanelBody } from '@wordpress/components';
import {
	ABTextControl,
	ABRangeControl,
	ABToggleControl,
	ABSelectControl,
} from '../../../components/ABControls';
import { BlockIcon } from '../../../blockIcons';
import { HIGHLIGHT_FORMAT } from '../../advanced-heading/format';

const QUOTE_SVG = (
	<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
		<path d="M7.5 7C5.6 7 4 8.6 4 10.5S5.6 14 7.5 14c.2 0 .4 0 .6-.1-.3 1.3-1.4 2.5-2.9 3-.4.1-.6.5-.5.9.1.3.4.5.7.5.1 0 .2 0 .3-.1 2.6-1 4.3-3.4 4.3-6.2V10.5C10 8.6 8.4 7 6.5 7h1zm9 0C14.6 7 13 8.6 13 10.5S14.6 14 16.5 14c.2 0 .4 0 .6-.1-.3 1.3-1.4 2.5-2.9 3-.4.1-.6.5-.5.9.1.3.4.5.7.5.1 0 .2 0 .3-.1 2.6-1 4.3-3.4 4.3-6.2V10.5C19 8.6 17.4 7 15.5 7h1z" />
	</svg>
);

const StarRow = () => (
	<>
		{ Array.from( { length: 5 } ).map( ( _, i ) => (
			<svg key={ i } viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
				<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
			</svg>
		) ) }
	</>
);

function initialsOf( name ) {
	return ( name || '' )
		.trim()
		.split( /\s+/ )
		.slice( 0, 2 )
		.map( ( w ) => w.charAt( 0 ).toUpperCase() )
		.join( '' );
}

function TestimonialEdit( { attributes, setAttributes } ) {
	const {
		quote,
		name,
		role,
		company,
		avatarUrl,
		avatarAlt,
		rating,
		reviewDate,
		sourcePlatform,
		sourceLabel,
		verified,
		linkUrl,
		linkNewTab,
	} = attributes;

	const blockProps = useBlockProps( { className: 'ab-testimonial' } );
	const initials = initialsOf( name );
	const fillPercent = ( Math.max( 0, Math.min( 5, rating || 0 ) ) / 5 ) * 100;

	return (
		<>
			<InspectorControls>
				<PanelBody
					title={ __( 'Rating', 'axiom-blocks' ) }
					initialOpen={ true }
				>
					<ABRangeControl
						label={ __( 'Stars', 'axiom-blocks' ) }
						value={ rating ?? 5 }
						onChange={ ( v ) =>
							setAttributes( { rating: v ?? 0 } )
						}
						min={ 0 }
						max={ 5 }
						step={ 0.5 }
						unit=""
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Avatar', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<span className="ab-ctrl__label">
						{ __( 'Image', 'axiom-blocks' ) }
					</span>
					{ avatarUrl && (
						// eslint-disable-next-line jsx-a11y/alt-text
						<img
							className="ab-tst-avatar-preview"
							src={ avatarUrl }
							alt={ avatarAlt || name }
						/>
					) }
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) =>
								setAttributes( {
									avatarUrl: media.url,
									avatarId: media.id,
									avatarAlt: media.alt || '',
								} )
							}
							allowedTypes={ [ 'image' ] }
							value={ attributes.avatarId }
							render={ ( { open } ) => (
								<div className="ab-btn-row ab-tst-avatar-buttons">
									<button
										type="button"
										className="ab-btn ab-btn--secondary"
										onClick={ open }
									>
										{ avatarUrl
											? __( 'Replace', 'axiom-blocks' )
											: __(
													'Select image',
													'axiom-blocks'
											  ) }
									</button>
									{ avatarUrl && (
										<button
											type="button"
											className="ab-btn ab-btn--danger"
											onClick={ () =>
												setAttributes( {
													avatarUrl: '',
													avatarId: 0,
													avatarAlt: '',
												} )
											}
										>
											{ __( 'Remove', 'axiom-blocks' ) }
										</button>
									) }
								</div>
							) }
						/>
					</MediaUploadCheck>
					{ ! avatarUrl && (
						<div className="ab-ctrl ab-block-note">
							<p className="ab-ctrl__help">
								{ __(
									'No image? A coloured monogram from the name is shown automatically.',
									'axiom-blocks'
								) }
							</p>
						</div>
					) }
					{ avatarUrl && (
						<ABTextControl
							label={ __( 'Alt text', 'axiom-blocks' ) }
							value={ avatarAlt }
							onChange={ ( v ) =>
								setAttributes( { avatarAlt: v } )
							}
						/>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Source & date', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABSelectControl
						label={ __( 'Source platform', 'axiom-blocks' ) }
						value={ sourcePlatform || 'none' }
						options={ [
							{
								label: __( 'None', 'axiom-blocks' ),
								value: 'none',
							},
							{ label: 'Google', value: 'google' },
							{ label: 'Trustpilot', value: 'trustpilot' },
							{ label: 'G2', value: 'g2' },
							{ label: 'Capterra', value: 'capterra' },
							{
								label: __( 'Custom…', 'axiom-blocks' ),
								value: 'custom',
							},
						] }
						onChange={ ( v ) =>
							setAttributes( { sourcePlatform: v } )
						}
					/>
					{ 'custom' === sourcePlatform && (
						<ABTextControl
							label={ __( 'Source label', 'axiom-blocks' ) }
							value={ sourceLabel }
							onChange={ ( v ) =>
								setAttributes( { sourceLabel: v } )
							}
						/>
					) }
					<ABToggleControl
						label={ __( 'Verified badge', 'axiom-blocks' ) }
						checked={ !! verified }
						onChange={ ( v ) => setAttributes( { verified: v } ) }
					/>
					<ABTextControl
						label={ __( 'Review date', 'axiom-blocks' ) }
						type="date"
						value={ reviewDate }
						onChange={ ( v ) =>
							setAttributes( { reviewDate: v } )
						}
					/>
				</PanelBody>

				<PanelBody
					title={ __( 'Link', 'axiom-blocks' ) }
					initialOpen={ false }
				>
					<ABTextControl
						label={ __( 'Link URL', 'axiom-blocks' ) }
						type="url"
						value={ linkUrl }
						placeholder="https://"
						onChange={ ( v ) => setAttributes( { linkUrl: v } ) }
					/>
					{ linkUrl && (
						<ABToggleControl
							label={ __( 'Open in new tab', 'axiom-blocks' ) }
							checked={ !! linkNewTab }
							onChange={ ( v ) =>
								setAttributes( { linkNewTab: v } )
							}
						/>
					) }
					<div className="ab-ctrl ab-block-note">
						<p className="ab-ctrl__help">
							{ __(
								'Layout, card style, avatar, colours and typography are set on the parent Testimonials block.',
								'axiom-blocks'
							) }
						</p>
					</div>
				</PanelBody>
			</InspectorControls>

			<div { ...blockProps }>
				<span
					className="ab-testimonial__quote-icon"
					aria-hidden="true"
					contentEditable={ false }
				>
					{ QUOTE_SVG }
				</span>
				<div
					className="ab-testimonial__rating"
					contentEditable={ false }
				>
					<span className="ab-testimonial__stars ab-testimonial__stars--empty">
						<StarRow />
					</span>
					<span
						className="ab-testimonial__stars ab-testimonial__stars--filled"
						style={ { width: `${ fillPercent }%` } }
					>
						<StarRow />
					</span>
				</div>
				<RichText
					tagName="blockquote"
					className="ab-testimonial__quote"
					value={ quote }
					onChange={ ( v ) => setAttributes( { quote: v } ) }
					placeholder={ __( 'Write the testimonial…', 'axiom-blocks' ) }
					allowedFormats={ [
						'core/bold',
						'core/italic',
						HIGHLIGHT_FORMAT,
					] }
				/>
				<div className="ab-testimonial__person">
					<span
						className="ab-testimonial__avatar"
						contentEditable={ false }
					>
						{ avatarUrl ? (
							// eslint-disable-next-line jsx-a11y/alt-text
							<img src={ avatarUrl } alt={ avatarAlt || name } />
						) : (
							initials && (
								<span className="ab-testimonial__initials">
									{ initials }
								</span>
							)
						) }
					</span>
					<span className="ab-testimonial__identity">
						<RichText
							tagName="span"
							className="ab-testimonial__name"
							value={ name }
							onChange={ ( v ) => setAttributes( { name: v } ) }
							placeholder={ __( 'Name', 'axiom-blocks' ) }
							allowedFormats={ [] }
						/>
						<span className="ab-testimonial__author-line">
							<RichText
								tagName="span"
								className="ab-testimonial__role"
								value={ role }
								onChange={ ( v ) =>
									setAttributes( { role: v } )
								}
								placeholder={ __( 'Role', 'axiom-blocks' ) }
								allowedFormats={ [] }
							/>
							<RichText
								tagName="span"
								className="ab-testimonial__company"
								value={ company }
								onChange={ ( v ) =>
									setAttributes( { company: v } )
								}
								placeholder={ __( 'Company', 'axiom-blocks' ) }
								allowedFormats={ [] }
							/>
						</span>
					</span>
				</div>
			</div>
		</>
	);
}

export const Testimonial = {
	name: 'axiom-blocks/testimonial',
	settings: {
		title: __( 'Testimonial Item', 'axiom-blocks' ),
		description: __(
			'A single testimonial inside the Testimonials block.',
			'axiom-blocks'
		),
		icon: <BlockIcon slug="testimonial" />,
		edit: TestimonialEdit,
		save: () => null,
	},
};
