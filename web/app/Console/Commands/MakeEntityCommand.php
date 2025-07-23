<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Str;

class MakeEntityCommand extends Command
{
    protected $signature = 'make:entity {entityName}';

    protected $description = 'Ability to create all the complete files of an entity';

    /**
     * Model base Namespace
     */
    private $modelNamespaceBase = 'App\Models\\';

    /**
     * Name of the model
     */
    private $singularModelName;

    /**
     * Name of the table
     */
    private $pluralVariableName;

    private $response = '';

    private $makeRepository = false;

    private $makeBackpackCrud = false;

    public function handle()
    {
        $this->singularModelName = Str::studly($this->argument('entityName'));
        $this->pluralVariableName = Str::of($this->argument('entityName'))->plural()->snake();
        $this->questionnaire();
    }

    private function questionnaire()
    {
        $this->info('Use Y / N to answer. Default value N');

        if ($this->confirm('Do you want to create the Migration?', false)) {
            $this->makeMigration();
        }

        if ($this->confirm('Do you want to create the Backpack CRUD?', false)) {
            $this->makeBackpackCrud();
            $this->makeBackpackCrud = true;
        }

        if (!$this->makeBackpackCrud && $this->confirm('Do you want to create the Model?', false)) {
            $this->makeModel();
        } else {
            $this->checkIfModelExists($this->singularModelName);
        }

        if ($this->confirm('Do you want to create the Enum?', false)) {
            $this->makeEnum();
        }

        if ($this->confirm('Do you want to create the Resource?', false)) {
            $this->makeResource();
        }

        if ($this->confirm('Do you want to create the Resource Collection?', false)) {
            $this->makeResource(true);
        }

        if (!$this->makeBackpackCrud && $this->confirm('Do you want to create the Admin Controller?', false)) {
            $this->makeController('Admin');
        }

        if ($this->confirm('Do you want to create the Api Controller?', false)) {
            $this->makeApiController();
        }

        if ($this->confirm('Do you want to create the Front Controller?', false)) {
            $this->makeController('Front');
        }

        if ($this->confirm('Do you want to create the Webapi Controller?', false)) {
            $this->makeController('Webapi');
        }

        if (!$this->makeBackpackCrud && $this->confirm('Do you want to create the Request?', false)) {
            $this->makeRequest();
        }

        if ($this->confirm('Do you want to create the Repository?', false)) {
            $this->makeRepository = true;
            $this->makeRepository();
        }

        if ($this->confirm('Do you want to create the Service?', false)) {
            $this->makeService();
        }

        if ($this->confirm('Do you want to create the Pipeline?', false)) {
            $this->makePipeline();
        }

        if ($this->confirm('Do you want to create the Test?', false)) {
            $this->makeTest();
        }

        if ($this->confirm('Do you want to create the Unit Test?', false)) {
            $this->makeTest(true);
        }

        if ($this->confirm('Do you want to create the Helper?', false)) {
            $this->makeHelper();
        }

        $this->info($this->response);
    }

    private function makeModel()
    {
        Artisan::call('make:model ' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' Model created successfully!' . PHP_EOL;
    }

    private function makeEnum()
    {
        Artisan::call('make:enum ' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' Enum created successfully!' . PHP_EOL;
    }

    private function makeMigration()
    {
        Artisan::call('make:migration create_' . $this->pluralVariableName . '_table');
        $this->response .= $this->singularModelName . ' Migration created successfully!' . PHP_EOL;
    }

    private function makeBackpackCrud()
    {
        Artisan::call('backpack:crud-make-entity ' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' Backpack CRUD created successfully!' . PHP_EOL;
    }

    private function makeResource($collection = false)
    {
        Artisan::call('make:resource ' . $this->singularModelName . '/' . $this->singularModelName .
            ($collection ? 'Collection' : 'Resource') . ($collection ? ' --collection' : ''));
        $this->response .= $this->singularModelName . ' Resource' .
            ($collection ? ' Collection' : '') . ' created successfully!' . PHP_EOL;
    }

    private function makeController($prefix = false)
    {
        Artisan::call('make:controller ' . ($prefix ? $prefix . '/' : '') .
            $this->singularModelName . $prefix . 'Controller');
        $this->response .= $this->singularModelName . ($prefix ? ' ' . $prefix : '') .
            ' Controller created successfully!' . PHP_EOL;
    }

    private function makeApiController()
    {
        // Crear el ApiController con la ruta original
        Artisan::call('make:api-controller Api/' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' ApiController created successfully!' . PHP_EOL;

        // Prepare path
        $segments = explode('/', $this->singularModelName);
        $modelName = array_pop($segments);
        $path = implode('/', $segments);

        Artisan::call('make:api-controller-interface Api/' . $path . '/Interfaces/' . $modelName);
        $this->response .= $this->singularModelName . ' ApiControllerInterface created successfully!' . PHP_EOL;
    }

    private function makeRepository()
    {
        Artisan::call('make:repository ' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' Repository and RepositoryInterface created successfully!' . PHP_EOL;
    }

    private function makeService()
    {
        Artisan::call('make:service ' . $this->singularModelName . ' --model=' .
            $this->singularModelName . ' --repository=' . $this->makeRepository);
        $this->response .= $this->singularModelName . ' Service created successfully!' . PHP_EOL;
    }

    private function makePipeline()
    {
        Artisan::call('make:pipeline ' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' Pipeline created successfully!' . PHP_EOL;
    }

    private function makeRequest()
    {
        Artisan::call('make:request ' . $this->singularModelName . 'Request');
        $this->response .= $this->singularModelName . ' Request created successfully!' . PHP_EOL;
    }

    private function makeTest($unit = false)
    {
        Artisan::call('make:test ' . $this->singularModelName . 'Test' . ($unit ? ' --unit' : ''));
        $this->response .= $this->singularModelName . ($unit ? ' Unit' : '') . ' Test created successfully!' . PHP_EOL;
    }

    private function makeHelper()
    {
        Artisan::call('make:helper ' . $this->singularModelName);
        $this->response .= $this->singularModelName . ' Helper created successfully!' . PHP_EOL;
    }

    private function checkIfModelExists(string $model)
    {
        if (!class_exists($this->modelNamespaceBase . $model)) {
            $this->error('The model ' . $model . ' was not found in this project.');
            exit(1);
        }
    }
}
