<?php

namespace App\Console\Commands;

use Laravel\Passport\Passport;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ClearPassportTokensCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'passport:clear-tokens';

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
        $deletedAccess = DB::table('oauth_access_tokens')->delete();
        $deletedRefresh = DB::table('oauth_refresh_tokens')->delete();

        $this->info("Tokens eliminados: {$deletedAccess} access, {$deletedRefresh} refresh");
    }
}
