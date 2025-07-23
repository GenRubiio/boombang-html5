<?php

return [
    'title' => 'Utilitzem cookies',
    'intro' => 'Aquest lloc web utilitza cookies per millorar l’experiència general de l’usuari.',
    'link' => 'Consulta la nostra <a href=":url" target="_blank">Política de Cookies</a> per a més informació.',

    'essentials' => 'Només essencials',
    'all' => 'Acceptar totes',
    'customize' => 'Personalitzar',
    'manage' => 'Gestionar cookies',
    'details' => [
        'more' => 'Més detalls',
        'less' => 'Menys detalls',
    ],
    'save' => 'Desar configuració',
    'cookie' => 'Cookie',
    'purpose' => 'Propòsit',
    'duration' => 'Durada',
    'year' => 'Any|Anys',
    'day' => 'Dia|Dies',
    'hour' => 'Hora|Hores',
    'minute' => 'Minut|Minuts',
    'button_footer' => 'Configuració de cookies',

    'categories' => [
        'essentials' => [
            'title' => 'Cookies essencials',
            'description' => 'Hi ha algunes cookies que hem d’incloure perquè certes pàgines web funcionin. Per aquest motiu, no requereixen el teu consentiment.',
        ],
        'analytics' => [
            'title' => 'Cookies analítiques',
            'description' => 'Utilitzem aquestes cookies per a investigacions internes sobre com podem millorar el servei que oferim a tots els nostres usuaris. Avaluen com interactues amb el nostre lloc web.',
        ],
        'optional' => [
            'title' => 'Cookies opcionals',
            'description' => 'Aquestes cookies activen funcions que podrien millorar la teva experiència d’usuari, però la seva absència no afectarà la teva capacitat de navegar pel nostre lloc web.',
        ],
    ],

    'analitics' => [
        'title' => 'Google Tag Manager',
        'description' => 'Permet la gestió d’etiquetes de Google Tag Manager per carregar scripts d’analítica, màrqueting i conversió després del teu consentiment.',
    ],

    'defaults' => [
        'consent' => 'S’utilitza per emmagatzemar les preferències de consentiment de cookies de l’usuari.',
        'session' => 'S’utilitza per identificar la sessió de navegació de l’usuari.',
        'csrf' => 'S’utilitza per protegir tant l’usuari com el nostre lloc web contra atacs de falsificació de peticions entre llocs (CSRF).',
        '_ga' => 'Cookie principal utilitzada per Google Analytics, permet a un servei distingir un visitant d’un altre.',
        '_ga_ID' => 'Utilitzada per Google Analytics per mantenir l’estat de la sessió.',
        '_gid' => 'Utilitzada per Google Analytics per identificar l’usuari.',
        '_gat' => 'Utilitzada per Google Analytics per limitar la taxa de sol·licituds.',
    ],
];
