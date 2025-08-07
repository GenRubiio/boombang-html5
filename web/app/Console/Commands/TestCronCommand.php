<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class TestCronCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:test-cron-command';

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
        \Log::info('TestCronCommand executed.');
    }
}
