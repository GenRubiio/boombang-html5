@extends(backpack_view('blank'))

@php
    $widgets['before_content'][] = [
        'type'        => 'jumbotron',
            'heading'     => trans('admin.dashboard-welcome', ['name' => getUser()->name]),
            //'content'     => trans('backpack::base.use_sidebar'),
            'button_link' => backpack_url('logout'),
            'button_text' => trans('backpack::base.logout'),
    ];

	$pageCount = App\Models\Page::count();
	$userCount = App\Models\User::count();
	$articleCount = App\Models\BlogArticle::count();
	$lastArticle = App\Models\BlogArticle::orderBy('date', 'DESC')->first();
	$lastArticleDaysAgo = $lastArticle ? \Carbon\Carbon::parse($lastArticle->date)->diffInDays(\Carbon\Carbon::today()) :  null;

    Widget::add()->to('after_content')->type('div')->class('row')->content([
		// notice we use Widget::make() to add widgets as content (not in a group)
		Widget::make()
			->type('progress')
			->class('card border-0 text-white bg-primary')
			->progressClass('progress-bar')
			->value($userCount)
			->description('usuarios registrados')
			->progress(100)
            ->hint('&nbsp;'),
		Widget::add()
		    ->type('progress')
		    ->class('card border-0 text-white bg-success')
		    ->progressClass('progress-bar')
		    ->value($articleCount)
		    ->description('artículos en el blog')
		    ->progress(80)
		    ->hint('&nbsp;')
		    ->onlyHere(),
		Widget::make()
			->group('hidden')
		    ->type('progress')
		    ->class('card border-0 text-white bg-warning')
		    ->value(($lastArticleDaysAgo ? $lastArticleDaysAgo : 0) . ' días')
		    ->progressClass('progress-bar')
		    ->description('desde el último artículo.')
		    ->progress(30)
		    ->hint('&nbsp;'),
	    Widget::make([
			'type' => 'progress',
			'class'=> 'card border-0 text-white bg-dark',
			'progressClass' => 'progress-bar',
			'value' => $pageCount,
			'description' => 'páginas publicadas',
			'progress' => 100,
			'hint' => '&nbsp;',
		]),
	]);

    $widgets['after_content'][] = [
	  'type' => 'div',
	  'class' => 'row',
	  'content' => [ // widgets
	    	[
		        'type' => 'chart',
		        'wrapperClass' => 'col-md-4',
		        // 'class' => 'col-md-6',
		        'controller' => \App\Http\Controllers\Admin\Charts\Pies\BlogCategoriesPieController::class,
				'content' => [
				    'header' => 'Artículos por categoría', // optional
				    // 'body' => 'This chart should make it obvious how many new users have signed up in the past 7 days.<br><br>', // optional
		    	]
	    	],
	    	[
		        'type' => 'chart',
		        'wrapperClass' => 'col-md-4',
		        // 'class' => 'col-md-6',
		        'controller' => \App\Http\Controllers\Admin\Charts\Pies\RolesPieController::class,
				'content' => [
				    'header' => 'Usuarios por rol', // optional
				    // 'body' => 'This chart should make it obvious how many new users have signed up in the past 7 days.<br><br>', // optional
		    	]
	    	],
	    	[
		        'type' => 'chart',
		        'wrapperClass' => 'col-md-4',
		        // 'class' => 'col-md-6',
				'controller' => \App\Http\Controllers\Admin\Charts\Pies\PagesPieController::class,
				'content' => [
				    'header' => 'Páginas', // optional
				    // 'body' => 'This chart should make it obvious how many new users have signed up in the past 7 days.<br><br>', // optional
		    	]
	    	],

	  ]
	];
@endphp

@section('content')
@endsection
