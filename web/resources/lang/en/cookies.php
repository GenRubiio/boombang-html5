<?php

return [
    'title' => 'We use cookies',
    'intro' => 'This website uses cookies to improve the overall user experience.',
    'link' => 'Check our <a href=":url" target="_blank">Cookie Policy</a> for more information.',

    'essentials' => 'Essentials only',
    'all' => 'Accept all',
    'customize' => 'Customize',
    'manage' => 'Manage cookies',
    'details' => [
        'more' => 'More details',
        'less' => 'Less details',
    ],
    'save' => 'Save settings',
    'cookie' => 'Cookie',
    'purpose' => 'Purpose',
    'duration' => 'Duration',
    'year' => 'Year|Years',
    'day' => 'Day|Days',
    'hour' => 'Hour|Hours',
    'minute' => 'Minute|Minutes',
    'button_footer' => 'Cookie settings',

    'categories' => [
        'essentials' => [
            'title' => 'Essential cookies',
            'description' => 'There are some cookies that we have to include in order for certain web pages to work. For this reason, they do not require your consent.',
        ],
        'analytics' => [
            'title' => 'Analytics cookies',
            'description' => 'We use these cookies for internal research on how we can improve the service we provide to all our users. They assess how you interact with our website.',
        ],
        'optional' => [
            'title' => 'Optional cookies',
            'description' => 'These cookies enable features that could improve your user experience, but their absence will not affect your ability to browse our website.',
        ],
    ],

    'analitics' => [
        'title' => 'Google Tag Manager',
        'description' => 'Allows the management of Google Tag Manager tags to load analytics, marketing and conversion scripts with your consent.',
    ],

    'defaults' => [
        'consent' => 'Used to store the user\'s cookie consent preferences.',
        'session' => 'Used to identify the user\'s browsing session.',
        'csrf' => 'Used to protect both the user and our website against cross-site request forgery (CSRF) attacks.',
        '_ga' => 'Main cookie used by Google Analytics, allows a service to distinguish one visitor from another.',
        '_ga_ID' => 'Used by Google Analytics to maintain session state.',
        '_gid' => 'Used by Google Analytics to identify the user.',
        '_gat' => 'Used by Google Analytics to limit the request rate.',
    ],
];