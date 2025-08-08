<?php

return [
    'title' => '我们使用 Cookie',
    'intro' => '本网站使用 Cookie 来改善整体用户体验。',
    'link' => '请查看我们的<a href=":url" target="_blank">Cookie 政策</a>以获取更多信息。',

    'essentials' => '仅限必要的',
    'all' => '全部接受',
    'customize' => '自定义',
    'manage' => '管理 Cookie',
    'details' => [
        'more' => '更多详情',
        'less' => '更少详情',
    ],
    'save' => '保存设置',
    'cookie' => 'Cookie',
    'purpose' => '目的',
    'duration' => '持续时间',
    'year' => '年',
    'day' => '天',
    'hour' => '小时',
    'minute' => '分钟',
    'button_footer' => 'Cookie 设置',

    'categories' => [
        'essentials' => [
            'title' => '必要的 Cookie',
            'description' => '为了使某些网页正常工作，我们必须包含一些 Cookie。因此，它们不需要您的同意。',
        ],
        'analytics' => [
            'title' => '分析型 Cookie',
            'description' => '我们使用这些 Cookie 进行内部研究，以了解如何改进我们为所有用户提供的服务。它们评估您如何与我们的网站互动。',
        ],
        'optional' => [
            'title' => '可选 Cookie',
            'description' => '这些 Cookie 启用了一些可以改善您用户体验的功能，但它们的缺失不会影响您浏览我们网站的能力。',
        ],
    ],

    'analitics' => [
        'title' => 'Google Tag Manager',
        'description' => '允许管理 Google Tag Manager 标签，以便在您同意的情况下加载分析、营销和转化脚本。',
    ],

    'defaults' => [
        'consent' => '用于存储用户的 Cookie 同意偏好。',
        'session' => '用于识别用户的浏览会话。',
        'csrf' => '用于保护用户和我们的网站免受跨站请求伪造 (CSRF) 攻击。',
        '_ga' => 'Google Analytics 使用的主要 Cookie，允许服务区分不同的访问者。',
        '_ga_ID' => '由 Google Analytics 用于维护会话状态。',
        '_gid' => '由 Google Analytics 用于识别用户。',
        '_gat' => '由 Google Analytics 用于限制请求速率。',
    ],
];