@section('title'){{ $object->title ?? '' }}@endsection
@section('meta-title'){{ $object->meta_title ?? '' }}@endsection
@section('meta-description'){{ $object->meta_description ?? '' }}@endsection
@section('meta-keywords'){{ $object->meta_keywords ?? '' }}@endsection
@section('og-title'){{ $object->og_title ?? '' }}@endsection
@section('og-description'){{ $object->og_description ?? '' }}@endsection
@section('og-image'){{ empty($object->og_image) ? asset(config('settings.logo')) : $object->og_image }}@endsection
@section('tw-title'){{ $object->tw_title ?? '' }}@endsection
@section('tw-description'){{ $object->tw_description ?? '' }}@endsection
@section('tw-image'){{ empty($object->tw_image) ? asset(config('settings.logo')) : $object->tw_image }}@endsection
