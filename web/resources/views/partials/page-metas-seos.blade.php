@section('title'){{ (!is_array($object) && (isset($object->seo_title) && empty($object->seo_title)) ? $object->title : !is_array($object)) ? $object->seo_title : '' }}@endsection
@section('meta-title'){{ !is_array($object) && isset($object->meta_title) ? $object->meta_title : '' }}@endsection
@section('meta-description'){{ !is_array($object) && isset($object->meta_description) ? $object->meta_description : '' }}@endsection
@section('meta-keywords'){{ !is_array($object) && isset($object->meta_keywords) ? $object->meta_keywords : '' }}@endsection
@section('og-title'){{ !is_array($object) && isset($object->og_title) ? $object->og_title : '' }}@endsection
@section('og-description'){{ !is_array($object) && isset($object->og_description) ? $object->og_description : '' }}@endsection
@section('og-image'){{ !is_array($object) && isset($object->og_image) ? $object->og_image : '' }}@endsection
@section('tw-title'){{ !is_array($object) && isset($object->tw_title) ? $object->tw_title : '' }}@endsection
@section('tw-description'){{ !is_array($object) && isset($object->tw_description) ? $object->tw_description : '' }}@endsection
@section('tw-image'){{ !is_array($object) && isset($object->tw_image) ? $object->tw_image : '' }}@endsection
