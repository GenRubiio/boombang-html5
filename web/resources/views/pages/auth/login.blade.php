@extends('layouts.auth')

@php
    if(isset($items)){
        extract($items);
    }
    if(!isset($page)){
        $page = getPageByName('Login');
    }
@endphp

{{-- Meta injections --}}
@if(isset($page))
	@section('title'){{$page->title}}@endsection
	@section('meta-title'){{$page->meta_title}}@endsection
	@section('meta-description'){{$page->meta_description}}@endsection
	@section('meta-keywords'){{$page->meta_keywords}}@endsection
	@section('og-title'){{!empty($page->og_title) ? $page->og_title : $page->meta_title}}@endsection
	@section('og-description'){{!empty($page->og_description) ? $page->og_description : $page->meta_description}}@endsection
	@if(!is_null($page->og_image)) @section('og-image'){{asset($page->og_image)}} @endsection @endif
	@section('tw-title'){{!empty($page->tw_title) ? $page->tw_title : $page->meta_title}}@endsection
	@section('tw-description'){{!empty($page->tw_description) ? $page->tw_description : $page->meta_description}}@endsection
	@if(!is_null($page->tw_image)) @section('tw-image'){{asset($page->tw_image)}}@endsection @endif
@endif

@section('content')
	<div class="container h-100 mt-5">
		<div class="d-flex justify-content-center h-100">
			<div class="user_card">
				<div class="d-flex justify-content-center">
					<div class="brand_logo_container">
						<img src="{{asset('images/logo.png')}}" class="brand_logo" alt="Logo" loading="lazy">
					</div>
				</div>
				<div class="d-flex justify-content-center form_container">
					<form method="POST" action="{{route('post-login')}}">
						{{ csrf_field() }}
						@if($errors->any())
							<div class="w-100">
								@foreach($errors->all() as $error)
									<h4 class="text-danger h6">{{ucfirst($error)}}</h4>
								@endforeach
							</div>
						@endif
						<div class="input-group mb-3">
							<div class="input-group-append">
								<span class="input-group-text d-block"><i class="fas fa-fw fa-user"></i></span>
							</div>
							<input id="email" type="email"
								   class="form-control input_user @error('email') is-invalid @enderror" name="email"
								   value="{{ old('email') }}" placeholder="Email" required>
						</div>
						<div class="input-group mb-2">
							<div class="input-group-append">
								<span class="input-group-text d-block"><i class="fas fa-fw fa-key"></i></span>
							</div>
							<input id="password" type="password"
								   class="form-control input_pass @error('password') is-invalid @enderror"
								   name="password"
								   autocomplete="off" placeholder="Contraseña">
						</div>
						<div class="form-group">
							<div class="custom-control custom-checkbox">
								<input type="checkbox" class="custom-control-input" id="customControlInline" name="remember">
								<label class="custom-control-label pt-1" for="customControlInline">Recordar</label>
							</div>
						</div>
						<div class="d-flex justify-content-center mt-3 login_container">
							<button type="submit" class="btn login_btn">Login</button>
						</div>
					</form>
				</div>

				{{-- <div class="mt-4">
                    <div class="d-flex justify-content-center links">
                        Don't have an account? <a href="#" class="ml-2">Sign Up</a>
                    </div>
                    <div class="d-flex justify-content-center links">
                        <a href="#">Forgot your password?</a>
                    </div>
                </div> --}}
			</div>
		</div>
	</div>
@endsection
