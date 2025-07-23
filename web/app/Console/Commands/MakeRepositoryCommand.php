<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeRepositoryCommand extends Command
{
    protected $signature = 'make:repository {modelName}';

    protected $description = 'Create a new Repository class and its RepositoryInterface';

    /**
     * Model base Namespace
     */
    private $modelNamespaceBase = 'App\Models\\';

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
        $this->singularModelName = Str::studly($this->argument('modelName'));
        $this->singularRepositoryName = Str::studly($this->argument('modelName') . 'Repository');
        $this->singularRepositoryInterfaceName = Str::studly($this->argument('modelName') . 'RepositoryInterface');

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
        $repository = $this->replaceWords(file_get_contents('stubs/repository.stub'));
        $this->saveRepository($repository);
    }

    /**
     * Method that stores the Repository file
     */
    private function saveRepository(string $file)
    {
        if (!is_file($this->folder . '/' . $this->singularRepositoryName . '.php')) {
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
        $interfaceRepository = $this->replaceWords(file_get_contents('stubs/repository.interface.stub'));
        $this->saveRepositoryInterface($interfaceRepository);
    }

    /**
     * Method that stores the RepositoryInterface file
     */
    private function saveRepositoryInterface(string $file)
    {
        if (!is_file($this->folder . '/' . $this->singularRepositoryInterfaceName . '.php')) {
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
            exit(1);
        }
    }

    /**
     * Method that checks if the Repository folder exists, and creates it if it does not
     */
    private function checkIfRepositoryFolderExists()
    {
        $this->folder = app_path('Repositories/' . $this->singularModelName);
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
            'SingularModelName',
            'SingularVariableName',
        ];
        $replace = [
            $this->singularModelName,
            $this->singularVariableName,
        ];

        return str_replace($search, $replace, $file);
    }
}
