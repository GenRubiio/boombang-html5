<?php

return [
    'title' => '쿠키를 사용합니다',
    'intro' => '이 웹사이트는 전반적인 사용자 경험을 개선하기 위해 쿠키를 사용합니다.',
    'link' => '자세한 내용은 <a href=":url" target="_blank">쿠키 정책</a>을 확인하십시오.',

    'essentials' => '필수 항목만',
    'all' => '모두 수락',
    'customize' => '사용자 정의',
    'manage' => '쿠키 관리',
    'details' => [
        'more' => '자세히 보기',
        'less' => '간략히 보기',
    ],
    'save' => '설정 저장',
    'cookie' => '쿠키',
    'purpose' => '목적',
    'duration' => '기간',
    'year' => '년',
    'day' => '일',
    'hour' => '시간',
    'minute' => '분',
    'button_footer' => '쿠키 설정',

    'categories' => [
        'essentials' => [
            'title' => '필수 쿠키',
            'description' => '특정 웹 페이지가 작동하려면 포함해야 하는 쿠키가 있습니다. 이러한 이유로 귀하의 동의가 필요하지 않습니다.',
        ],
        'analytics' => [
            'title' => '분석 쿠키',
            'description' => '당사는 모든 사용자에게 제공하는 서비스를 개선할 수 있는 방법에 대한 내부 조사를 위해 이러한 쿠키를 사용합니다. 귀하가 당사 웹사이트와 상호 작용하는 방식을 평가합니다.',
        ],
        'optional' => [
            'title' => '선택적 쿠키',
            'description' => '이러한 쿠키는 사용자 경험을 향상시킬 수 있는 기능을 활성화하지만, 없어도 당사 웹사이트를 탐색하는 데 영향을 미치지 않습니다.',
        ],
    ],

    'analitics' => [
        'title' => 'Google 태그 관리자',
        'description' => '귀하의 동의 하에 분석, 마케팅 및 전환 스크립트를 로드하기 위해 Google 태그 관리자 태그 관리를 허용합니다.',
    ],

    'defaults' => [
        'consent' => '사용자의 쿠키 동의 기본 설정을 저장하는 데 사용됩니다.',
        'session' => '사용자의 브라우징 세션을 식별하는 데 사용됩니다.',
        'csrf' => '교차 사이트 요청 위조(CSRF) 공격으로부터 사용자와 당사 웹사이트를 모두 보호하는 데 사용됩니다.',
        '_ga' => 'Google Analytics에서 사용하는 기본 쿠키로, 서비스가 한 방문자를 다른 방문자와 구별할 수 있도록 합니다.',
        '_ga_ID' => 'Google Analytics에서 세션 상태를 유지하는 데 사용됩니다.',
        '_gid' => 'Google Analytics에서 사용자를 식별하는 데 사용됩니다.',
        '_gat' => 'Google Analytics에서 요청 속도를 제한하는 데 사용됩니다.',
    ],
];