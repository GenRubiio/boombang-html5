@if ($field['object'])
	@foreach ($field['object']->allFiles as $gallery)
		<div class="form-group col-md-12 container_gallery_{{$field['group']}}" id="container_{{$gallery->id}}">
			@include('crud::fields.inc.wrapper_start')
				<label>{!! $field['label'] !!}</label>
				@include('crud::fields.inc.translatable_icon')

				@if (!is_null($gallery->{$field['group']}))
					<div class="well well-sm">
						@if (isset($field['disk']))
							<a target="_blank" href="{{ (asset(\Storage::disk($field['disk'])->url(Arr::get($field, 'prefix', '').$gallery->{$field['group']}))) }}">
						@else
							<a target="_blank" href="{{ (asset(Arr::get($field, 'prefix', '').$gallery->{$field['group']})) }}">
						@endif
							{{ $gallery->{$field['group']} }}
						</a>
						<button id="file_{{$field['group']}}_{{ $gallery->id }}_file_clear_button" type="button" class="btn btn-light btn-sm pull-sm-right file_clear_button" title="Clear file"><i class="la la-trash"></i></button>
						<div class="clearfix"></div>
					</div>
				@endif

				@php
					$value = old("gallery.{$gallery->id}.file") ? old("gallery.{$gallery->id}.file") : (!is_null($gallery->{$field['group']}) ? $gallery->{$field['group']} : (isset($field['default']) ? $field['default'] : '' ));
				@endphp
				<input type="file" id="file_{{$field['group']}}_{{ $gallery->id }}_file_input" class="file_input" name="gallery[{{$gallery->id}}][{{$field['group']}}]" value="{{ $value }}" @include('crud::fields.inc.attributes', ['default_class' => !is_null($gallery->{$field['group']}) ? 'form-control hidden' : 'form-control'])>

				@if (isset($field['hint']))
					<p class="help-block">{!! $field['hint'] !!}</p>
				@endif
			@include('crud::fields.inc.wrapper_end')

			<!-- text input -->
			@include('crud::fields.inc.wrapper_start')
			<label>{{trans('admin.gallery_file_name')}}</label>
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
			<div class="form-group">
				<label>{{trans('admin.gallery_file_type')}}</label>
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
				<label>{{trans('admin.gallery_file_alt')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

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
			<label>{{trans('admin.gallery_file_title')}}</label><i class="la la-flag-checkered pull-{{ config('backpack.crud.translatable_field_icon_position') }}" style="margin-top: 3px;" title="This field is translatable."></i>

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
@if (!isset($field['max_num']) || (isset($field['max_num']) && isset($field['object']) && count($field['object']->allFiles) < $field['max_num']) || !isset($field['object']))
	<div class="form-group col-md-12 container_gallery_{{$field['group']}}" id="container_new_{{$field['group']}}_0">
		@include('crud::fields.inc.wrapper_start')
			<label>{!! $field['label'] !!}</label>
			@include('crud::fields.inc.translatable_icon')
			<br>
			<input type="file" id="file_new_{{$field['group']}}_0_file_input" class="file_input" value="" name="gallery[new_file_0][file]" @include('crud::fields.inc.attributes', ['default_class' => 'form-control'])>

			@if (isset($field['hint']))
				<p class="help-block">{!! $field['hint'] !!}</p>
			@endif
		@include('crud::fields.inc.wrapper_end')

		<!-- text input -->
		@php
			$field['wrapperAttributes']['showAsterisk'] = 1;
		@endphp
		<div class="form-group required">
			<label>{{trans('admin.gallery_file_new_name')}}</label>
			@include('crud::fields.inc.translatable_icon')

			@if(isset($field['prefix']) || isset($field['suffix'])) <div class="input-group"> @endif
				@if(isset($field['prefix'])) <div class="input-group-prepend"><span class="input-group-text">{!! $field['prefix'] !!}</span></div> @endif
				<input
					type="text"
					name="gallery[new_file_0][name]"
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
		<div class="form-group">
			<label>{{trans('admin.gallery_file_type')}}</label>
			@include('crud::fields.inc.translatable_icon')
			@php
				$entity_model = new \App\Models\Gallery();
                $possible_values = $entity_model::getPossibleEnumValues('type');
			@endphp
			<select
				name="gallery[new_file_0][type]"
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
					name="gallery[new_file_0][alt]"
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
				name="gallery[new_file_0][title]"
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
						name="gallery[new_file_0][active]"
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
@if (!isset($field['max_num']) || (isset($field['max_num']) && isset($field['object']) && count($field['object']->allFiles) < $field['max_num'] && $field['max_num'] > 1))
	<div class="form-group col-12">
		<div class="pull-right">
			<button class="btn btn-success btn-sm addGallery{{$field['group']}}" type="button" data-max-num="{{(isset($field['max_num']))?$field['max_num']:'inf'}}"><i class="la la-plus"></i></button>
		</div>
	</div>
@endif

@if ($crud->checkIfFieldIsFirstOfItsType($field, $fields))
	{{-- FIELD CSS - will be loaded in the after_styles section --}}
	@push('crud_fields_styles')
		{{-- YOUR CSS HERE --}}
		<style media="screen">
			.container_gallery_file{
				border-bottom: 2px solid #aaa;
			}
		</style>
	@endpush

	@push('crud_fields_scripts')
		<!-- no scripts -->
		<script>
		$(document).on('click', '.file_clear_button', function(){
			$(this).parent().before('<br />');
			$(this).parent().addClass('d-none');
			var id_input_selector = $(this).attr('id').replace('file_clear_button', 'file_input');
			var input = $("#"+id_input_selector);
			input.removeClass('d-none');
			input.attr("value", "").replaceWith(input.clone(true));
			// add a hidden input with the same name, so that the setXAttribute method is triggered
			$("<input type='hidden' name='"+input.attr('name')+"' value=''>").insertAfter("#"+id_input_selector);
		});

		$(".file_input").change(function() {
			// remove the hidden input, so that the setXAttribute method is no longer triggered
			$(this).next("input[type=hidden]").remove();
		});

		jQuery(document).ready(function($) {
			// Loop through all instances of the file field
			var add_gallery_selector = ".addGallery{!!$field['group']!!}";
			var html_template = $('.container_gallery_{!!$field['group']!!}:last').html();

			$(add_gallery_selector).on('click', function(){
				var replace_from = /new_{!!$field['group']!!}_(\d+)/g
				var replace_with = 'new_{!!$field['group']!!}_' + $('.container_gallery_{!!$field['group']!!}').length;
				var html_new_element = html_template;

				html_new_element = html_new_element.replace(replace_from, replace_with);
				var container = $('<div class="form-group col-md-12 container_gallery_{!!$field['group']!!}" id="container_'+replace_with+'">'+html_new_element+'</div>');

				$(container).insertBefore($(add_gallery_selector).closest(".form-group.col-12"));

				var topPos = document.getElementById(container.attr('id')).offsetTop;
				$('html, body').animate({scrollTop: topPos}, 500);

				if ($(this).data('maxNum') != 'inf' && $('.container_gallery_{!!$field['group']!!}').length >= $(this).data('maxNum')) {
					$(this).hide();
				}
			});
		});
		</script>
	@endpush
@endif
