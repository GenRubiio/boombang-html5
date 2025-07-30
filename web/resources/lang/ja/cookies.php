<?php

return [
    'title' => 'Usamos cookies',
    'intro' => 'Este sitio web utiliza cookies para mejorar la experiencia general del usuario.',
    'link' => 'Consulta nuestra <a href=":url" target="_blank">Política de Cookies</a> para más información.',

    'essentials' => 'Solo esenciales',
    'all' => 'Aceptar todas',
    'customize' => 'Personalizar',
    'manage' => 'Gestionar cookies',
    'details' => [
        'more' => 'Más detalles',
        'less' => 'Menos detalles',
    ],
    'save' => 'Guardar configuración',
    'cookie' => 'Cookie',
    'purpose' => 'Propósito',
    'duration' => 'Duración',
    'year' => 'Año|Años',
    'day' => 'Día|Días',
    'hour' => 'Hora|Horas',
    'minute' => 'Minuto|Minutos',
    'button_footer' => 'Configuración de cookies',

    'categories' => [
        'essentials' => [
            'title' => 'Cookies esenciales',
            'description' => 'Hay algunas cookies que debemos incluir para que ciertas páginas web funcionen. Por esta razón, no requieren tu consentimiento.',
        ],
        'analytics' => [
            'title' => 'Cookies analíticas',
            'description' => 'Usamos estas cookies para realizar investigaciones internas sobre cómo podemos mejorar el servicio que ofrecemos a todos nuestros usuarios. Evalúan cómo interactúas con nuestro sitio web.',
        ],
        'optional' => [
            'title' => 'Cookies opcionales',
            'description' => 'Estas cookies habilitan funciones que podrían mejorar tu experiencia de usuario, pero su ausencia no afectará tu capacidad para navegar por nuestro sitio web.',
        ],
    ],

    'analitics' => [
        'title' => 'Google Tag Manager',
        'description' => 'Permite la gestión de etiquetas de Google Tag Manager para cargar scripts de analítica, marketing y conversión tras tu consentimiento.',
    ],

    'defaults' => [
        'consent' => 'Se utiliza para almacenar las preferencias de consentimiento de cookies del usuario.',
        'session' => 'Se utiliza para identificar la sesión de navegación del usuario.',
        'csrf' => 'Se utiliza para proteger tanto al usuario como a nuestro sitio web contra ataques de falsificación de solicitudes entre sitios (CSRF).',
        '_ga' => 'Cookie principal utilizada por Google Analytics, permite a un servicio distinguir a un visitante de otro.',
        '_ga_ID' => 'Utilizada por Google Analytics para mantener el estado de la sesión.',
        '_gid' => 'Utilizada por Google Analytics para identificar al usuario.',
        '_gat' => 'Utilizada por Google Analytics para limitar la tasa de solicitudes.',
    ],
];
