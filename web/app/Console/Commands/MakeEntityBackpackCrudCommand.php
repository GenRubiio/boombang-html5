<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeEntityBackpackCrudCommand extends Command
{
    protected $signature = 'backpack:crud-make-entity {name}';

    protected $description = 'Create a CRUD interface: Controller, Model, Request';

    public function handle()
    {
        $name = (string)$this->argument('name');
        $nameTitle = ucfirst(Str::camel($name));
        $nameKebab = Str::kebab($nameTitle);
        $namePlural = ucfirst(str_replace('-', ' ', Str::plural($nameKebab)));

        // Create the CRUD Model and show output
        $this->call('backpack:crud-model', ['name' => $nameTitle]);

        // Create the CRUD Controller and show output
        $this->call('backpack:crud-controller', ['name' => $nameTitle]);

        // Create the CRUD Request and show output
        $this->call('backpack:crud-request', ['name' => $nameTitle]);

        // Create the CRUD route
        $this->call('backpack:add-custom-route', [
            'code' => "Route::crud('$nameKebab', '{$nameTitle}CrudController');",
        ]);

        // Create the sidebar item
        $this->call('backpack:add-menu-content', [
            'code' => "<li class='nav-item'><a class='nav-link' href='{{ backpack_url('$nameKebab') }}'><i class='nav-icon la la-question'></i> $namePlural</a></li>",
        ]);

        // if the application uses cached routes, we should rebuild the cache so the previous added route will
        // be acessible without manually clearing the route cache.
        if (app()->routesAreCached()) {
            $this->call('route:cache');
        }
    }
}
