@php
	if (!isset($field['wrapperAttributes']) || !isset($field['wrapperAttributes']['class'])) {
		$field['wrapperAttributes']['class'] = "form-group col-md-12 image";
	}
	elseif (!str_contains($field['wrapperAttributes']['class'], 'image')) {
		$field['wrapperAttributes']['class'] .= ' image';
	}
	$prefix = isset($field['prefix']) ? $field['prefix'] : '';
@endphp
@if ($field['object'])
	@foreach ($field['object']->allImages as $gallery)
		@php
			$value = old('galleries.'.$gallery->id.'.image') ? old('galleries.'.$gallery->id.'.image') : (!is_null($gallery->image) ? $gallery->image : (isset($field['default']) ? $field['default'] : '') );

			$image_url = $value ? preg_match('/^data\:image\//', $value) ? $value : (isset($field['disk']) ? Storage::disk($field['disk'])->url($prefix.$value) : url($prefix.$value)) : ''; // if validation failed, tha value will be base64, so no need to create a URL for it
		@endphp
		<div class="form-group col-md-12 container_gallery_image py-3" id="container_{{$gallery->id}}">
			<!-- image input -->
			@include('crud::fields.inc.wrapper_start')
			<div data-preview="#image_{{ $gallery->id }}" data-aspectRatio="{{ isset($field['aspect_ratio']) ? $field['aspect_ratio'] : 0 }}" data-crop="{{ isset($field['crop']) ? $field['crop'] : false }}">
				<div>
					<label>{!! $field['label'] !!}</label>
					@include('crud::fields.inc.translatable_icon')
				</div>
				<!-- Wrap the image or canvas element with a block element (container) -->
				<div class="row">
					<div class="col-sm-6" style="margin-bottom: 20px;">
						<img class="mainImage" src="{{ $image_url }}">
					</div>
					@if(isset($field['crop']) && $field['crop'])
						<div class="col-sm-3">
							<div class="docs-preview clearfix">
								<div id="image_{{ $gallery->id }}" class="img-preview preview-lg">
									<img src="" style="display: block; min-width: 0px !important; min-height: 0px !important; max-width: none !important; max-height: none !important; margin-left: -32.875px; margin-top: -18.4922px; transform: none;">
								</div>
							</div>
						</div>
					@endif
				</div>
				<div class="btn-group">
					<div class="btn btn-light btn-sm btn-file">
						{{ trans('backpack::crud.choose_file') }} <input type="file" accept="image/*" class="uploadImage"  @include('crud::fields.inc.attributes', ['default_class' => 'hide'])>
						<input type="hidden" class="hiddenImage" name="gallery[{{$gallery->id}}][image]">
					</div>
					@if(isset($field['crop']) && $field['crop'])
						<button class="btn btn-light btn-sm rotateLeft" type="button" style="display: none;"><i class="la la-rotate-left"></i></button>
						<button class="btn btn-light btn-sm rotateRight" type="button" style="display: none;"><i class="la la-rotate-right"></i></button>
						<button class="btn btn-light btn-sm zoomIn" type="button" style="display: none;"><i class="la la-search-plus"></i></button>
						<button class="btn btn-light btn-sm zoomOut" type="button" style="display: none;"><i class="la la-search-minus"></i></button>
						<button class="btn btn-warning btn-sm reset" type="button" style="display: none;"><i class="la la-times"></i></button>
					@endif
					<button class="btn btn-light btn-sm remove removeGalleryImage" type="button"><i class="la la-trash"></i></button>
				</div>
			</div>
			@include('crud::fields.inc.wrapper_end')

			<!-- text input -->
			@include('crud::fields.inc.wrapper_start')
				<label>{{trans('admin.gallery_image_name')}}</label>
				@include('crud::fields.inc.translatable_icon')

				@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
					@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
					<input
						type="text"
						name="gallery[{{$gallery->id}}][name]"
						value="{{ old(square_brackets_to_dots($field['name'])) ?? $gallery->name ?? $field['default'] ?? '' }}"
						@include('crud::fields.inc.attributes') readonly="readonly"
					>
					@if(isset($field['suffix'])) <div class="input-group-append"><span class="input-group-text">{!! $field['suffix'] !!}</span></div> @endif
					@if(isset($field['prefix']) || isset($field['suffix'])) </div> @endif

				{{-- HINT --}}
				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
			@include('crud::fields.inc.wrapper_end')
			<!-- enum -->
			<div class="form-group col-sm-12">
				<label>{{trans('admin.gallery_image_type')}}</label>
				@include('crud::fields.inc.translatable_icon')
				@php
					$entity_model = new \App\Models\Gallery();
                    $possible_values = $entity_model::getPossibleEnumValues('type');
					$nameEnum = 'gallery['.$gallery->id.'][type]';
				@endphp
				<select
					name="gallery[{{$gallery->id}}][type]"
					@include('crud::fields.inc.attributes')
				>
					<option value="content">-</option>
					@if (count($possible_values))
						@foreach ($possible_values as $possible_value)
							<option value="{{ $possible_value }}"
								@if (( old(square_brackets_to_dots($nameEnum)) &&  old(square_brackets_to_dots($nameEnum)) == $possible_value) || (isset($gallery->type) && $gallery->type==$possible_value))
								selected
								@endif
							>{{ ucfirst($possible_value) }}</option>
						@endforeach
					@endif
				</select>

				{{-- HINT --}}
				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
			</div>

			<!-- alt input -->
			@include('crud::fields.inc.wrapper_start')
				<label>{{trans('admin.gallery_image_alt')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

				@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
					@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
					<input
						type="text"
						name="gallery[{{$gallery->id}}][alt]"
						value="{{ old(square_brackets_to_dots($field['name'])) ?? $gallery->alt ?? $field['default'] ?? '' }}"
						@include('crud::fields.inc.attributes')
					>
					@if(isset($field['suffix'])) <div class="input-group-append"><span class="input-group-text">{!! $field['suffix'] !!}</span></div> @endif
					@if(isset($field['prefix']) || isset($field['suffix'])) </div> @endif

				{{-- HINT --}}
				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
			@include('crud::fields.inc.wrapper_end')

			<!-- title input -->
			@include('crud::fields.inc.wrapper_start')
				<label>{{trans('admin.gallery_image_title')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

				@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
					@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
					<input
						type="text"
						name="gallery[{{$gallery->id}}][title]"
						value="{{ old(square_brackets_to_dots($field['name'])) ?? $gallery->title ?? $field['default'] ?? '' }}"
						@include('crud::fields.inc.attributes')
					>
					@if(isset($field['suffix'])) <div class="input-group-append"><span class="input-group-text">{!! $field['suffix'] !!}</span></div> @endif
					@if(isset($field['prefix']) || isset($field['suffix'])) </div> @endif

				{{-- HINT --}}
				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
			@include('crud::fields.inc.wrapper_end')

			<!-- active radio -->
			@php
				$optionPointer = 0;
				$optionValue = old(square_brackets_to_dots($field['name'])) ?? $gallery->active ?? $field['default'] ?? '';
				// if the class isn't overwritten, use 'radio'
				if (!isset($field['attributes']['class'])) {
					$field['attributes']['class'] = 'radio';
				}
				$field['options'] = [
					1 => trans('backpack::crud.yes'),
					0 => trans('backpack::crud.no')
				];

			@endphp

			@include('crud::fields.inc.wrapper_start')
				<div>
					<label>{{trans('admin.active')}}</label>
					@include('crud::fields.inc.translatable_icon')
				</div>
				@if( isset($field['options']) && $field['options'] = (array)$field['options'] )
					@foreach ($field['options'] as $value => $label )
						@php ($optionPointer++) @endphp
						<div class="form-check form-check-inline">
							<input  type="radio"
								class="form-check-input"
								id="{{$field['name']}}_{{$optionPointer}}"
								name="gallery[{{$gallery->id}}][active]"
								value="{{$value}}"
								@include('crud::fields.inc.attributes')
								{{$optionValue == $value ? ' checked': ''}}
							>
							<label class="radio-inline form-check-label font-weight-normal" for="{{$field['name']}}_{{$optionPointer}}">{!! $label !!}</label>
						</div>
					@endforeach
				@endif
				{{-- HINT --}}
				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
				@php
					if (isset($field['attributes']['class']) && $field['attributes']['class'] == "radio") {
                        unset($field['attributes']['class']);
                    }
					if (isset($field['attributes']['options'])) {
                        unset($field['attributes']['options']);
                    }
				@endphp
			@include('crud::fields.inc.wrapper_end')

		</div>
	@endforeach
@endif
@if (!isset($field['max_num']) || (isset($field['max_num']) && isset($field['object']) && count($field['object']->allImages) < $field['max_num']) || !isset($field['object']))
	<div class="form-group col-md-12 container_gallery_image py-3" id="container_new_image_0">
		<!-- image input -->
		@include('crud::fields.inc.wrapper_start')
		<div data-preview="#image_new_image_0" data-aspectRatio="{{ isset($field['aspect_ratio']) ? $field['aspect_ratio'] : 0 }}" data-crop="{{ isset($field['crop']) ? $field['crop'] : false }}">
			<div>
				<label>{!! $field['label'] !!}</label>
				@include('crud::fields.inc.translatable_icon')
			</div>
			<!-- Wrap the image or canvas element with a block element (container) -->
			<div class="row">
				<div class="col-sm-6 bg-image-new" style="margin-bottom: 20px;">
					<img class="mainImage" src="">
				</div>
				@if(isset($field['crop']) && $field['crop'])
					<div class="col-sm-3">
						<div class="docs-preview clearfix">
							<div id="image_new_image_0" class="img-preview preview-lg">
								<img src="" style="display: block; min-width: 0px !important; min-height: 0px !important; max-width: none !important; max-height: none !important; margin-left: -32.875px; margin-top: -18.4922px; transform: none;">
							</div>
						</div>
					</div>
				@endif
			</div>
			<div class="btn-group">
				<div class="btn btn-light btn-sm btn-file">
					{{ trans('backpack::crud.choose_file') }} <input type="file" accept="image/*" class="uploadImage"  @include('crud::fields.inc.attributes', ['default_class' => 'hide'])>
					<input type="hidden" class="hiddenImage" name="gallery[new_image_0][image]">
				</div>
				@if(isset($field['crop']) && $field['crop'])
					<button class="btn btn-light btn-sm rotateLeft" type="button" style="display: none;"><i class="la la-rotate-left"></i></button>
					<button class="btn btn-light btn-sm rotateRight" type="button" style="display: none;"><i class="la la-rotate-right"></i></button>
					<button class="btn btn-light btn-sm zoomIn" type="button" style="display: none;"><i class="la la-search-plus"></i></button>
					<button class="btn btn-light btn-sm zoomOut" type="button" style="display: none;"><i class="la la-search-minus"></i></button>
					<button class="btn btn-warning btn-sm reset" type="button" style="display: none;"><i class="la la-times"></i></button>
				@endif
				<button class="btn btn-light btn-sm remove removeGalleryImage" type="button"><i class="la la-trash"></i></button>
			</div>
		</div>
		@include('crud::fields.inc.wrapper_end')

		<!-- text input -->
		@php
			$field['wrapperAttributes']['showAsterisk'] = 1;
		@endphp
		<div class="form-group col-sm-12 required">
			<label>{{trans('admin.gallery_image_new_name')}}</label>
			@include('crud::fields.inc.translatable_icon')

			@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
				@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
				<input
					type="text"
					name="gallery[new_image_0][name]"
					value="{{ old(square_brackets_to_dots($field['name'])) ?? '' ?? $field['default'] ?? '' }}"
					@include('crud::fields.inc.attributes')
				>
				@if(isset($field['suffix'])) <div class="input-group-append"><span class="input-group-text">{!! $field['suffix'] !!}</span></div> @endif
				@if(isset($field['prefix']) || isset($field['suffix'])) </div> @endif

			{{-- HINT --}}
			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
		</div>

		<!-- enum -->
		<div class="form-group col-sm-12">
			<label>{{trans('admin.gallery_image_type')}}</label>
			@include('crud::fields.inc.translatable_icon')
			@php
				$entity_model = new \App\Models\Gallery();
                $possible_values = $entity_model::getPossibleEnumValues('type');
			@endphp
			<select
				name="gallery[new_image_0][type]"
				@include('crud::fields.inc.attributes')
			>
				@if ($entity_model::isColumnNullable($field['name']))
					<option value="content">-</option>
				@endif

				@if (count($possible_values))
					@foreach ($possible_values as $possible_value)
						<option value="{{ $possible_value }}"
							@if (( old(square_brackets_to_dots($field['name'])) &&  old(square_brackets_to_dots($field['name'])) == $possible_value) || (isset($field['value']) && $field['value']==$possible_value))
							selected
							@endif
						>{{ ucfirst($possible_value) }}</option>
					@endforeach
				@endif
			</select>

			{{-- HINT --}}
			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
		</div>

		<!-- alt input -->
		@include('crud::fields.inc.wrapper_start')
			<label>{{trans('admin.gallery_image_alt')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

			@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
				@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
				<input
						type="text"
						name="gallery[new_image_0][alt]"
						value="{{ old(square_brackets_to_dots($field['name'])) ?? '' ?? $field['default'] ?? '' }}"
						@include('crud::fields.inc.attributes')
				>
				@if(isset($field['suffix'])) <div class="input-group-append"><span class="input-group-text">{!! $field['suffix'] !!}</span></div> @endif
				@if(isset($field['prefix']) || isset($field['suffix'])) </div> @endif

			{{-- HINT --}}
			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
		@include('crud::fields.inc.wrapper_end')

		<!-- title input -->
		@include('crud::fields.inc.wrapper_start')
			<label>{{trans('admin.gallery_image_title')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

			@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
				@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
				<input
					type="text"
					name="gallery[new_image_0][title]"
					value="{{ old(square_brackets_to_dots($field['name'])) ?? '' ?? $field['default'] ?? '' }}"
					@include('crud::fields.inc.attributes')
				>
				@if(isset($field['suffix'])) <div class="input-group-append"><span class="input-group-text">{!! $field['suffix'] !!}</span></div> @endif
				@if(isset($field['prefix']) || isset($field['suffix'])) </div> @endif

			{{-- HINT --}}
			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
		@include('crud::fields.inc.wrapper_end')

		<!-- active radio -->
		@php
			$optionPointer = 0;
            $optionValue = old(square_brackets_to_dots($field['name'])) ?? 0 ?? $field['default'] ?? '';
            // if the class isn't overwritten, use 'radio'
            if (!isset($field['attributes']['class'])) {
                $field['attributes']['class'] = 'radio';
            }
            $field['options'] = [
				1 => trans('backpack::crud.yes'),
				0 => trans('backpack::crud.no')
			];

		@endphp
		@include('crud::fields.inc.wrapper_start')
			<div>
				<label>{{trans('admin.active')}}</label>
				@include('crud::fields.inc.translatable_icon')
			</div>
			@if( isset($field['options']) && $field['options'] = (array)$field['options'] )
				@foreach ($field['options'] as $value => $label )
					@php ($optionPointer++) @endphp
					<div class="form-check form-check-inline">
						<input  type="radio"
							class="form-check-input"
							id="{{$field['name']}}_{{$optionPointer}}"
							name="gallery[new_image_0][active]"
							value="{{$value}}"
							@include('crud::fields.inc.attributes')
							{{$optionValue == $value ? ' checked': ''}}
						>
						<label class="radio-inline form-check-label font-weight-normal" for="{{$field['name']}}_{{$optionPointer}}">{!! $label !!}</label>
					</div>
				@endforeach
			@endif
			{{-- HINT --}}
			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
			@php
				if (isset($field['attributes']['class']) && $field['attributes']['class'] == "radio") {
                    unset($field['attributes']['class']);
                }
                if (isset($field['attributes']['options'])) {
                    unset($field['attributes']['options']);
                }
			@endphp
		@include('crud::fields.inc.wrapper_end')

	</div>
@endif

@if (!isset($field['max_num']) || (isset($field['max_num']) && isset($field['object']) && count($field['object']->allImages) < $field['max_num'] && $field['max_num'] > 1))
	<div class="form-group col-12">
		<div class="pull-right">
			<button class="btn btn-success btn-sm addGalleryImage" type="button" data-max-num="{{(isset($field['max_num']))?$field['max_num']:'inf'}}"><i class="la la-plus"></i></button>
		</div>
	</div>
@endif


{{-- Extra CSS and JS for this particular field --}}
{{-- If a field type is shown multiple times on a form, the CSS and JS will only be loaded once --}}
@if ($crud->checkIfFieldIsFirstOfItsType($field, $fields))

    {{-- FIELD CSS - will be loaded in the after_styles section --}}
    @push('crud_fields_styles')
        {{-- YOUR CSS HERE --}}
		<link href="{{ 'https://unpkg.com/cropperjs@1.5.13/dist/cropper.min.css' }}" rel="stylesheet" type="text/css" />
        <style>
			.container_gallery_image{
				border-bottom: 2px solid #aaa;
			}
			.hide {
				display: none;
			}
			.image .btn-group {
				margin-top: 10px;
			}
			img {
				max-width: 100%; /* This rule is very important, please do not ignore this! */
			}
			.img-container, .img-preview {
				width: 100%;
				text-align: center;
			}
			.img-preview {
				float: left;
				margin-right: 10px;
				margin-bottom: 10px;
				overflow: hidden;
			}
			.preview-lg {
				width: 263px;
				height: 148px;
			}

			.btn-file {
				position: relative;
				overflow: hidden;
			}
			.btn-file input[type=file] {
				position: absolute;
				top: 0;
				right: 0;
				min-width: 100%;
				min-height: 100%;
				font-size: 100px;
				text-align: right;
				filter: alpha(opacity=0);
				opacity: 0;
				outline: none;
				background: white;
				cursor: inherit;
				display: block;
			}
			.bg-image-new{
				background-image:url('https://via.placeholder.com/600x200?text=Image');
				background-size: cover;
				background-repeat: no-repeat;
				background-position: center center;
			}
        </style>
    @endpush

    {{-- FIELD JS - will be loaded in the after_scripts section --}}
    @push('crud_fields_scripts')
        {{-- YOUR JS HERE --}}
		<script src="{{ 'https://unpkg.com/cropperjs@1.5.13/dist/cropper.min.js' }}"></script>
		<script src="{{ 'https://unpkg.com/jquery-cropper@1.0.1/dist/jquery-cropper.min.js' }}"></script>
        <script>
			function cropInitialization(element){
				// Find DOM elements under this form-group element
				var $mainImage = $(element).find('.mainImage');
				var $uploadImage = $(element).find(".uploadImage");
				var $hiddenImage = $(element).find(".hiddenImage");
				var $rotateLeft = $(element).find(".rotateLeft")
				var $rotateRight = $(element).find(".rotateRight")
				var $zoomIn = $(element).find(".zoomIn")
				var $zoomOut = $(element).find(".zoomOut")
				var $reset = $(element).find(".reset")
				var $remove = $(element).find(".remove")
				// Options either global for all image type fields, or use 'data-*' elements for options passed in via the CRUD controller
				var options = {
					viewMode: 2,
					checkOrientation: false,
					autoCropArea: 1,
					responsive: true,
					preview : $(element).attr('data-preview'),
					aspectRatio : $(element).attr('data-aspectRatio')
				};
				var crop = $(element).attr('data-crop');

				// Hide 'Remove' button if there is no image saved
				if (!$mainImage.attr('src')){
					$remove.hide();
				}
				// Initialise hidden form input in case we submit with no change
				$hiddenImage.val($mainImage.attr('src'));

				// Only initialize cropper plugin if crop is set to true
				if(crop){

					$remove.click(function() {
						$mainImage.cropper("destroy");
						$mainImage.attr('src','');
						$hiddenImage.val('');
						$rotateLeft.hide();
						$rotateRight.hide();
						$zoomIn.hide();
						$zoomOut.hide();
						$reset.hide();
						$remove.hide();
					});
				} else {

					$(element).find(".remove").click(function() {
						$mainImage.attr('src','');
						$hiddenImage.val('');
						$remove.hide();
					});
				}

				$uploadImage.change(function() {
					var fileReader = new FileReader(),
							files = this.files,
							file;

					if (!files.length) {
						return;
					}
					file = files[0];

					if (/^image\/\w+$/.test(file.type)) {
						fileReader.readAsDataURL(file);
						fileReader.onload = function () {
							$uploadImage.val("");
							if(crop){
								$mainImage.cropper(options).cropper("reset", true).cropper("replace", this.result);
								// Override form submit to copy canvas to hidden input before submitting
								$('form').submit(function() {
									var imageURL = $mainImage.cropper('getCroppedCanvas').toDataURL(file.type);
									$hiddenImage.val(imageURL);
									return true; // return false to cancel form action
								});
								$rotateLeft.click(function() {
									$mainImage.cropper("rotate", 90);
								});
								$rotateRight.click(function() {
									$mainImage.cropper("rotate", -90);
								});
								$zoomIn.click(function() {
									$mainImage.cropper("zoom", 0.1);
								});
								$zoomOut.click(function() {
									$mainImage.cropper("zoom", -0.1);
								});
								$reset.click(function() {
									$mainImage.cropper("reset");
								});
								$rotateLeft.show();
								$rotateRight.show();
								$zoomIn.show();
								$zoomOut.show();
								$reset.show();
								$remove.show();

							} else {
								$mainImage.attr('src',this.result);
								$hiddenImage.val(this.result);
								$remove.show();
							}
						};
					} else {
						alert("Please choose an image file.");
					}
				});
			}
			function loadCropPlugin(){
				$('.form-group.image').each(function(index, element){
                    cropInitialization(element);
                });
			}

            jQuery(document).ready(function($) {
                // Loop through all instances of the image field
                loadCropPlugin();
				var html_template = $('.container_gallery_image:last').html();

				$('.removeGalleryImage').on('click', function(){
					$(this).closest(".container_gallery_image").hide();
				});

				$('.addGalleryImage').on('click', function(){
					var replace = 'new_image_' + $('.container_gallery_image').length;
					var html_new_element = html_template;

					html_new_element = html_new_element.replace(/new_image_(\d+)/g, replace);
					var container = $('<div class="form-group col-md-12 container_gallery_image py-3" id="container_'+replace+'">'+html_new_element+'</div>');

					$(container).insertBefore($('.addGalleryImage').closest(".form-group.col-12"));

					cropInitialization(container.find('.form-group.image'));

					var topPos = document.getElementById(container.attr('id')).offsetTop;
					$('html, body').animate({scrollTop: topPos}, 500);

					if ($(this).data('maxNum') != 'inf' && $('.container_gallery_image').length >= $(this).data('maxNum')) {
						$(this).hide();
					}
				});
            });
        </script>
    @endpush
@endif
