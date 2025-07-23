@foreach($cookies->getCategories() as $category)
<h3>{{ $category->title }}</h3>
<table>
    <thead>
        <th>@lang('cookies.cookie')</th>
        <th>@lang('cookies.purpose')</th>
        <th>@lang('cookies.duration')</th>
    </thead>
    <tbody>
    @foreach($category->getCookies() as $cookie)
        <tr>
            <td>{{ $cookie->name }}</td>
            <td>{{ $cookie->description }}</td>
            <td>{{ \Carbon\CarbonInterval::minutes($cookie->duration)->cascade() }}</td>
        </tr>
    @endforeach
    </tbody>
</table>
@endforeach
