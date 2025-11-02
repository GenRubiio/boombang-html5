<?php

use Illuminate\Foundation\Console\ClosureCommand;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    /** @var ClosureCommand $this */
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Cola:
 * En producción es mejor un supervisor (supervisor, systemd, etc.).
 * Si quieres mantener el comportamiento anterior, puedes dejar este schedule:
 */
Schedule::command('queue:work --stop-when-empty')
    ->everyMinute()
    ->withoutOverlapping();

/**
 * Procesar minijuegos y eventos (crear semanas, distribuir premios)
 * Se ejecuta cada minuto para asegurar que se procesen los cambios de semana
 */
Schedule::command('boombang:process-games-events')
    ->everyMinute()
    ->withoutOverlapping();
