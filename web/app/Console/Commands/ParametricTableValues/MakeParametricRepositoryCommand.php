<?php

namespace App\Console\Commands\ParametricTableValues;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeParametricRepositoryCommand extends Command
{
    protected $description = 'Create a new Repository class and its RepositoryInterface';

    protected $signature = 'make:parametric-repository {modelName}';

    /**
     * Model base Namespace
     */
    private $modelNamespaceBase = 'App\Models\ParametricTableValues\\';

    /**
     * Folder where the Repository will be stored
     */
    private $folder;

    /**
     * Folder UNIX permission
     */
    private $folderPermissions = 0755;

    /**
     * Name of the variable
     */
    private $singularVariableName;

    /**
     * Name of the model
     */
    private $singularModelName;

    /**
     * Name that will have the repository
     */
    private $singularRepositoryName;

    /**
     * Name that will have the repository interface
     */
    private $singularRepositoryInterfaceName;

    /**
     * Method called when the command is executed
     */
    public function handle()
    {
        $this->singularVariableName = Str::camel($this->argument('modelName'));
        $this->singularModelName = Str::studly($this->argument('modelName')) . 'Table';
        $this->singularRepositoryName = Str::studly($this->argument('modelName') . 'TableRepository');
        $this->singularRepositoryInterfaceName = Str::studly($this->argument('modelName') . 'TableRepositoryInterface');

        $this->checkIfModelExists($this->singularModelName);

        $this->checkIfRepositoryFolderExists();

        $this->makeRepositoryInterface();
        $this->makeRepository();
    }

    /**
     * Method that make the Repository file
     */
    private function makeRepository()
    {
        $repository = $this->replaceWords(file_get_contents(base_path('stubs/ParametricTableValues/parametric-repository.stub')));
        $this->saveRepository($repository);
    }

    /**
     * Method that stores the Repository file
     */
    private function saveRepository(string $file)
    {
        if (!is_file(base_path($this->folder . '/' . $this->singularRepositoryName . '.php'))) {
            file_put_contents($this->folder . '/' . $this->singularRepositoryName . '.php', $file);
            $this->info($this->singularRepositoryName . ' created successfully!');
        } else {
            $this->info('Repository already exists');
        }
    }

    /**
     * Method that make the RepositoryInterface file
     */
    private function makeRepositoryInterface()
    {
        $interfaceRepository = $this->replaceWords(file_get_contents(base_path('stubs/ParametricTableValues/parametric-repository.interface.stub')));
        $this->saveRepositoryInterface($interfaceRepository);
    }

    /**
     * Method that stores the RepositoryInterface file
     */
    private function saveRepositoryInterface(string $file)
    {
        if (!is_file(base_path($this->folder . '/' . $this->singularRepositoryInterfaceName . '.php'))) {
            file_put_contents($this->folder . '/' . $this->singularRepositoryInterfaceName . '.php', $file);
            $this->info($this->singularRepositoryInterfaceName . ' created successfully!');
        } else {
            $this->info('RepositoryInterface already exists');
        }
    }

    /**
     * Method that checks if the Model exists in the project, if it does not exists, throws an error
     */
    private function checkIfModelExists(string $model)
    {
        if (!class_exists($this->modelNamespaceBase . $model)) {
            $this->error('The model ' . $model . ' was not found in this project.');
            die(1);
        }
    }

    /**
     * Method that checks if the Repository folder exists, and creates it if it does not
     */
    private function checkIfRepositoryFolderExists()
    {
        $this->folder = app_path('Repositories/ParametricTableValue/' . $this->singularModelName);
        if (!file_exists($this->folder)) {
            mkdir($this->folder, $this->folderPermissions, true);
            $this->info($this->singularModelName . ' folder created successfully into Repositories folder!');
        }
    }

    /**
     * Method that change the keywords in the stub files, for the ones given
     */
    private function replaceWords(string $file): string
    {
        $search = [
            '{{ namespace }}',
            '{{ class }}',
            '{{ class_model }}',
            '{{ namespace_model }}'
        ];
        $replace = [
            'App\Repositories\ParametricTableValue\\' . $this->singularModelName,
            $this->singularModelName . 'Repository',
            $this->singularModelName,
            'App\Models\ParametricTableValues\\' . $this->singularModelName
        ];
        return str_replace($search, $replace, $file);
    }
}
