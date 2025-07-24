<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Process;

class PintCommand extends Command
{
    protected $signature = 'pint {path?}';

    protected $description = 'Execute Laravel Pint command';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $process = Process::fromShellCommandline('./vendor/bin/pint' . ($this->argument('path') ? ' ' . $this->argument('path') : ''));
        $process->setTty(Process::isTtySupported()); // Para salida en tiempo real si la terminal lo soporta
        $process->run();

        $message = 'Laravel Pint executed successfully';
        Log::channel('info')->info($message);
        $this->info($message);
    }
}
