<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class ServeLocal extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'serve';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Command description';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting local server on http://127.0.0.1:8000');
        passthru('php -S 127.0.0.1:8000 -t public');
    }
}
