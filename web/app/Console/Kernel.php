<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('flush:cache')->weekly()->withoutOverlapping();
        //$schedule->command('sitemap:generate')->daily()->withoutOverlapping();
        $schedule->command('telescope:prune')->daily();
        //$schedule->command('backup:run')->weekly()->withoutOverlapping();
        $schedule->command('backup:run --only-db')->daily()->withoutOverlapping();

        $schedule->command('prune:old-files-generated')->daily()->withoutOverlapping();
        // Comprueba que exista el demonio de la cola, async database en el env y tabla jobs
        $schedule->command('queue:work --stop-when-empty')->everyMinute()->withoutOverlapping();
        //$schedule->command('app:test-cron-command')->everyMinute()->withoutOverlapping();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
