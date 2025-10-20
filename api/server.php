<?php
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$public = __DIR__ . '/public';

// Si el archivo físico existe en /public, que lo sirva PHP; si no, pasa a Laravel.
if ($uri !== '/' && file_exists($public . $uri)) {
    return false;
}
require_once $public . '/index.php';
