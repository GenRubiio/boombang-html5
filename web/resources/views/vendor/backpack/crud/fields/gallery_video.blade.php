@php
	$prefix = isset($field['prefix']) ? $field['prefix'] : '';
@endphp
@if ($field['object'])
	@foreach ($field['object']->allVideos as $gallery)
		@php
			$field['group'] = "video";
			$value = old("gallery.{$gallery->id}.video") ? old("gallery.{$gallery->id}.video") : (!is_null($gallery->video) ? $gallery->video : (isset($field['default']) ? $field['default'] : '' ));
			// if attribute casting is used, convert to JSON
			if (is_array($value)) { $value = json_encode((object)$value); }
			elseif (is_object($value)) { $value = json_encode($value); }
			else { $value = $value; }
		@endphp
		<div data-video class="form-group col-md-12 container_gallery_video" id="container_{{$gallery->id}}">
			@include('crud::fields.inc.wrapper_start')
				<label for="video_{{ $gallery->id }}_link">{!! $field['label'] !!}</label>
				@include('crud::fields.inc.translatable_icon')
				<input class="video-json" type="hidden" name="gallery[{{ $gallery->id }}][video]" value="{{ $value }}" id="video_{{$field['group']}}_{{ $gallery->id }}_video_input">
				<div class="input-group">
					<input @include('crud::fields.inc.attributes', ['default_class' => 'video-link form-control']) type="text" id="video_{{ $gallery->id }}_link">
					<div class="input-group-addon video-previewSuffix video-noPadding">
						<div class="video-preview">
							<span class="video-previewImage"></span>
							<a class="video-previewLink hidden" target="_blank" href="">
								<i class="la video-previewIcon"></i>
							</a>
						</div>
						<div class="video-dummy">
							<a class="video-previewLink youtube dummy" target="_blank" href="">
								<i class="la la-youtube video-previewIcon dummy"></i>
							</a>
							<a class="video-previewLink vimeo dummy" target="_blank" href="">
								<i class="la la-vimeo video-previewIcon dummy"></i>
							</a>
						</div>
					</div>
					<button id="video_{{$field['group']}}_{{ $gallery->id }}_video_clear_button" data-video-id="{{ $gallery->id }}" type="button" class="btn btn-light btn-sm pull-sm-right video_clear_button" title="Clear video"><i class="la la-trash"></i></button>
				</div>

				{{-- HINT --}}
				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
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
			<div style="display: none">
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
			</div>

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
@if (!isset($field['max_num']) || (isset($field['max_num']) && isset($field['object']) && count($field['object']->allVideos) < $field['max_num']) || !isset($field['object']))
	<div data-video class="form-group col-md-12 container_gallery_video" id="container_new_video_0">
		@include('crud::fields.inc.wrapper_start')
			<label for="new_video_0_link">{!! $field['label'] !!}</label>
			@include('crud::fields.inc.translatable_icon')
			<input class="video-json" type="hidden" name="gallery[new_video_0][video]" value="">
			<div class="input-group">
				<input @include('crud::fields.inc.attributes', ['default_class' => 'video-link form-control']) type="text" id="new_video_0_link">
				<div class="input-group-addon video-previewSuffix video-noPadding">
					<div class="video-preview">
						<span class="video-previewImage"></span>
						<a class="video-previewLink hidden" target="_blank" href="">
							<i class="la video-previewIcon"></i>
						</a>
					</div>
					<div class="video-dummy">
						<a class="video-previewLink youtube dummy" target="_blank" href="">
							<i class="la la-youtube video-previewIcon dummy"></i>
						</a>
						<a class="video-previewLink vimeo dummy" target="_blank" href="">
							<i class="la la-vimeo video-previewIcon dummy"></i>
						</a>
					</div>
				</div>
				{{--<button id="video_{{$field['group']}}_0_video_clear_button" data-video-id="0" type="button" class="btn btn-light btn-sm pull-sm-right video_clear_button d-none" title="Clear video"><i class="la la-trash"></i></button>--}}
			</div>

			{{-- HINT --}}
			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
		@include('crud::fields.inc.wrapper_end')

		<!-- text input -->
		@php
			$field['wrapperAttributes']['showAsterisk'] = 1;
		@endphp
		<div class="form-group col-sm-12 required">
			<label>{{trans('admin.gallery_video_new_name')}}</label>
			@include('crud::fields.inc.translatable_icon')

			@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
				@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
				<input
						type="text"
						name="gallery[new_video_0][name]"
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
			<label>{{trans('admin.gallery_videos_type')}}</label>
			@include('crud::fields.inc.translatable_icon')
			@php
				$entity_model = new \App\Models\Gallery();
                $possible_values = $entity_model::getPossibleEnumValues('type');
			@endphp
			<select
				name="gallery[new_video_0][type]"
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
		<div style="display: none">
			@include('crud::fields.inc.wrapper_start')
			<label>{{trans('admin.gallery_image_alt')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

			@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
				@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
				<input
					type="text"
					name="gallery[new_video_0][alt]"
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
		</div>
		<!-- title input -->
		@include('crud::fields.inc.wrapper_start')
		<label>{{trans('admin.gallery_image_title')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

		@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
			@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
			<input
				type="text"
				name="gallery[new_video_0][title]"
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
						name="gallery[new_video_0][active]"
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
@if (!isset($field['max_num']) || (isset($field['max_num']) && isset($field['object']) && count($field['object']->allVideos) < $field['max_num'] && $field['max_num'] > 1))
	<div class="form-group col-12">
		<div class="pull-right">
			<button class="btn btn-success btn-sm addGalleryVideo" type="button" data-max-num="{{(isset($field['max_num']))?$field['max_num']:'inf'}}"><i class="la la-plus"></i></button>
		</div>
	</div>
@endif

@if ($crud->checkIfFieldIsFirstOfItsType($field, $fields))

	{{-- FIELD CSS - will be loaded in the after_styles section --}}
	@push('crud_fields_styles')
		{{-- YOUR CSS HERE --}}
		<style media="screen">
			.container_gallery_video{
				border-bottom: 2px solid #aaa;
			}
			.video-previewSuffix {
				border: 0;
				min-width: 68px; }
			.video-noPadding {
				padding: 0; }
			.video-preview {
				display: none; }
			.video-previewLink {
				color: #fff;
				display: block;
				width: 2.375rem; height: 2.375rem;
				text-align: center;
				float: left; }
			.video-previewLink.youtube {
				background: #DA2724; }
			.video-previewLink.vimeo {
				background: #00ADEF; }
			.video-previewIcon {
				transform: translateY(7px); }
			.video-previewImage {
				float: left;
				display: block;
				width: 2.375rem; height: 2.375rem;
				background-size: cover;
				background-position: center center; }
		</style>
	@endpush
	{{-- FIELD JS - will be loaded in the after_scripts section --}}
	@push('crud_fields_scripts')
		{{-- YOUR JS HERE --}}
		<script>

			$(document).on('click', '.video_clear_button', function(){
				$(this).parent().before('<br />');

				var id_input_selector_fake = $(this).attr('data-video-id');
				var input_fake = $("#video_"+id_input_selector_fake+"_link");
				input_fake.val("");
				input_fake.siblings('.video-previewSuffix').find('.video-preview').css('display', 'none');
				input_fake.siblings('.video-previewSuffix').find('.video-dummy').css('display', 'block');
				input_fake.siblings('#'+$(this).attr('id')).addClass('d-none');

				var id_input_selector = $(this).attr('id').replace('video_clear_button', 'video_input');
				var input = $("#"+id_input_selector);
				input.removeClass('d-none');
				input.attr("value", "").replaceWith(input.clone(true));
				// add a hidden input with the same name, so that the setXAttribute method is triggered
				$("<input type='hidden' name='"+input.attr('name')+"' value=''>").insertAfter("#"+id_input_selector);
			});


		var videoParsing = false;
		var tryYouTube = function( link ){

			var id = null;

			// RegExps for YouTube link forms
			var youtubeStandardExpr = /^https?:\/\/(www\.)?youtube.com\/watch\?v=([^?&]+)/i; // Group 2 is video ID
			var youtubeAlternateExpr = /^https?:\/\/(www\.)?youtube.com\/v\/([^\/\?]+)/i; // Group 2 is video ID
			var youtubeShortExpr = /^https?:\/\/youtu.be\/([^\/]+)/i; // Group 1 is video ID
			var youtubeEmbedExpr = /^https?:\/\/(www\.)?youtube.com\/embed\/([^\/]+)/i; // Group 2 is video ID

			var match = link.match(youtubeStandardExpr);

			if (match != null){
				id = match[2];
			}
			else {
				match = link.match(youtubeAlternateExpr);

				if (match != null) {
					id = match[2];
				}
				else {
					match = link.match(youtubeShortExpr);

					if (match != null){
						id = match[1];
					}
					else {
						match = link.match(youtubeEmbedExpr);

						if (match != null){
							id = match[2];
						}
					}
				}
			}

			return id;
		};

		var tryVimeo = function( link ){

			var id = null;
			var regExp = /(http|https):\/\/(www\.)?vimeo.com\/(\d+)($|\/)/;

			var match = link.match(regExp);

			if (match){
				id = match[3];
			}

			return id;
		};

		var fetchYouTube = function( videoId, callback ){

			var api = 'https://www.googleapis.com/youtube/v3/videos?id='+videoId+'&key={{env('GMAPS_API_KEY')}}&part=snippet';

			var video = {
				provider: 'youtube',
				id: null,
				title: null,
				image: null,
				url: null
			};

			$.getJSON(api, function( data ){

				if (typeof(data.items[0]) != "undefined") {
					var v = data.items[0].snippet;

					video.id = videoId;
					video.title = v.title;
					video.image = v.thumbnails.maxres ? v.thumbnails.maxres.url : v.thumbnails.default.url;
					video.url = 'https://www.youtube.com/watch?v=' + video.id;

					callback(video);
				}
			});
		};

		var fetchVimeo = function( videoId, callback ){

			var api = 'https://vimeo.com/api/v2/video/' + videoId + '.json?callback=?';

			var video = {
				provider: 'vimeo',
				id: null,
				title: null,
				image: null,
				url: null
			};

			$.getJSON(api, function( data ){

				if (typeof(data[0]) != "undefined") {
					var v = data[0];

					video.id = v.id;
					video.title = v.title;
					video.image = v.thumbnail_large || v.thumbnail_small;
					video.url = v.url;

					callback(video);
				}
			});
		};

		var parseVideoLink = function( link, callback ){

			var response = {success: false, message: 'unknown error occured, please try again', data: [] };

			try {
				var parser = document.createElement('a');
			} catch(e){
				response.message = 'Please post a valid youtube/vimeo url';
				return response;
			}


			var id = tryYouTube(link);

			if( id ){

				return fetchYouTube(id, function(video){

					if( video ){
						response.success = true;
						response.message = 'video found';
						response.data = video;
					}

					callback(response);
				});
			}
			else {

				id = tryVimeo(link);

				if( id ){

					return fetchVimeo(id, function(video){

						if( video ){
							response.success = true;
							response.message = 'video found';
							response.data = video;
						}

						callback(response);
					});
				}
			}

			response.message = 'We could not detect a YouTube or Vimeo ID, please try obtain the URL again'
			return callback(response);
		};

		var updateVideoPreview = function(video, container){

			var pWrap = container.find('.video-preview'),
			pLink = container.find('.video-previewLink').not('.dummy'),
			pImage = container.find('.video-previewImage').not('dummy'),
			pIcon  = container.find('.video-previewIcon').not('.dummy'),
			pSuffix = container.find('.video-previewSuffix'),
			pDummy  = container.find('.video-dummy');

			pDummy.hide();

			pLink
			.attr('href', video.url)
			.removeClass('youtube vimeo hidden')
			.addClass(video.provider);

			pImage
			.css('backgroundImage', 'url('+video.image+')');

			pIcon
			.removeClass('la-vimeo la-youtube')
			.addClass('la-' + video.provider);
			pWrap.fadeIn();

			pWrap.parent().siblings('.video_clear_button').removeClass('d-none');

		};

		function videoInitialization(element){
			var $this = $(element),
			jsonField = $this.find('.video-json'),
			linkField = $this.find('.video-link'),
			pDummy = $this.find('.video-dummy'),
			pWrap = $this.find('.video-preview');

			try {
				var videoJson = JSON.parse(jsonField.val());
				jsonField.val( JSON.stringify(videoJson) );
				linkField.val( videoJson.url );
				updateVideoPreview(videoJson, $this);
			}
			catch(e){
				pDummy.show();
				pWrap.hide();
				jsonField.val('');
				linkField.val('');
			}

			linkField.on('focus', function(){
				linkField.originalState = linkField.val();
			});

			linkField.on('change', function(){

				if( linkField.originalState != linkField.val() ){

					if( linkField.val().length ){

						videoParsing = true;

						parseVideoLink( linkField.val(), function( videoJson ){

							if( videoJson.success ){
								linkField.val( videoJson.data.url );
								jsonField.val( JSON.stringify(videoJson.data) );
								updateVideoPreview(videoJson.data, $this);
							}
							else {
								pDummy.show();
								pWrap.hide();
								alert(videoJson.message);
							}

							videoParsing = false;
						});
					}
					else {
						videoParsing = false;
						jsonField.val('');
						$this.find('.video-preview').fadeOut();
						pDummy.show();
						pWrap.hide();
					}
				}
			});
		}

		function loadDataVideo(){
			// Loop through all instances of the video field
			$("[data-video]").each(function(index, element){
				videoInitialization(element);
			});
		}

		function delete_recoverGalleryVideo(obj){
			var url = obj.data('url');
			$.ajax({
				type: "GET",
				url: url,
				success: function(data){
					$('[data-url="'+url+'"]').toggleClass('deleteGalleryVideo').toggleClass('recoverGalleryVideo').find('.fa').toggleClass('la-trash').toggleClass('la-undo');
				}
			});
		}

		jQuery(document).ready(function($) {
			loadDataVideo();

			$('form').on('submit', function(e){
				if( videoParsing ){
					alert('Video details are still loading, please wait a moment and try again');
					e.preventDefault();
					return false;
				}
			})

			var add_gallery_selector = ".addGalleryVideo";
			var html_template = $('.container_gallery_video:last').html();

			$(add_gallery_selector).on('click', function(){
				var replace_from = /new_video_(\d+)/g
				var replace_with = 'new_video_' + $('.container_gallery_video').length;
				var html_new_element = html_template;

				html_new_element = html_new_element.replace(replace_from, replace_with);
				var container = $('<div data-video class="form-group col-md-12 container_gallery_video" id="container_'+replace_with+'">'+html_new_element+'</div>');

				$(container).insertBefore($(add_gallery_selector).closest(".form-group.col-12"));

				videoInitialization(container);

				var topPos = document.getElementById(container.attr('id')).offsetTop;
				$('html, body').animate({scrollTop: topPos}, 500);

				if ($(this).data('maxNum') != 'inf' && $('.container_gallery_video').length >= $(this).data('maxNum')) {
					$(this).hide();
				}
			});

			$('.deleteGalleryVideo, recoverGalleryVideo').on('click', function(){
				delete_recoverGalleryVideo($(this));
			});
		});
		</script>
	@endpush
@endif
