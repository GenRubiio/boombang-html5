<?php

namespace App\Console\Commands\ParametricTableValues;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeParametricServiceCommand extends Command
{
    protected $signature = 'make:parametric-service {serviceName} {--m|model=} {--r|repository=false}';

    protected $description = 'Create a new Service class';

    /**
     * Model base Namespace
     */
    private $modelNamespaceBase = 'App\Models\ParametricTableValues\\';

    /**
     * Repository base Namespace
     */
    private $repositoryNamespaceBase = 'App\Repositories\ParametricTableValue\\';

    /**
     * Folder where the Service will be stored
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
     * Name that will have the service
     */
    private $serviceName;

    /**
     * Name that will have the repository
     */
    private $repositoryName;

    /**
     * Method called when the command is executed
     */
    public function handle()
    {
        $serviceNameParam = $this->argument('serviceName');
        $serviceNameParam = $serviceNameParam . 'Table';
        $modelParam = $this->option('model');
        $repositoryParam = $this->option('repository');

        $this->singularVariableName = Str::lower($serviceNameParam);
        $this->singularModelName = Str::studly($modelParam ?? $serviceNameParam);
        $this->serviceName = Str::studly($serviceNameParam . 'Service');
        $this->repositoryName = Str::studly($this->singularModelName . 'Repository');

        $this->checkIfRepositoryExists($repositoryParam, $this->repositoryName);

        $this->checkIfModelExists($this->singularModelName);

        $this->makeService();
    }

    /**
     * Method that make the Service file
     */
    private function makeService(): void
    {
        $stubFile = 'stubs/ParametricTableValues/parametric-service.repository.stub';
        $service = $this->replaceWords(file_get_contents(base_path($stubFile)));
        $this->saveService($service);
    }

    /**
     * Method that stores the Service file
     */
    private function saveService(string $file): void
    {
        $this->checkIfServiceFolderExists();
        if (!is_file(base_path($this->folder . $this->serviceName . '.php'))) {
            file_put_contents($this->folder . $this->serviceName . '.php', $file);
            $this->info($this->serviceName . ' created successfully!');
        } else {
            $this->info('Service already exists');
        }
    }

    /**
     * Method that checks if the Model exists in the project, if it does not exists, throws an error
     */
    private function checkIfModelExists(string $model): bool
    {
        if (!class_exists($this->modelNamespaceBase . $model)) {
            $this->info('The model ' . $model . ' was not found in this project.');
            return false;
        }
        return true;
    }

    /**
     * Method that checks if the Model exists in the project, if it does not exists, throws an error
     */
    private function checkIfRepositoryExists(bool $repositoryParam, string $repository): bool
    {
        if (!$repositoryParam) {
            return false;
        }

        if (!class_exists($this->repositoryNamespaceBase . $this->singularModelName . '\\' . $repository)) {
            $this->error('The repository ' . $repository . ' was not found in this project.');
            die();
        }
        return true;
    }

    /**
     * Method that checks if the Service folder exists, and creates it if it does not
     */
    private function checkIfServiceFolderExists(): void
    {
        $this->folder = app_path('Services' . '/' . 'ParametricTableValues' . '/');
        if (!file_exists($this->folder)) {
            mkdir($this->folder, $this->folderPermissions, true);
            $this->info('Services folder created successfully!');
        }
    }

    /**
     * Method that change the keywords in the stub files, for the ones given
     */
    private function replaceWords(string $file): string
    {
        $search = [
            '{{ namespace }}',
            '{{ namespace_model }}',
            '{{ namespace_repository }}',
            '{{ namespace_repository_interface }}',
            '{{ class }}',
            '{{ var_repository }}',
            '{{ class_model }}',
            '{{ var_model }}',
            '{{ class_interface }}',
            '{{ class_repository }}',
        ];
        $replace = [
            'App\Services\ParametricTableValues',
            'App\Models\ParametricTableValues\\' . $this->singularModelName,
            'App\Repositories\ParametricTableValue\\' . $this->singularModelName . '\\' . $this->singularModelName . 'Repository',
            'App\Repositories\ParametricTableValue\\' . $this->singularModelName . '\\' . $this->singularModelName . 'RepositoryInterface',
            $this->serviceName,
            Str::camel($this->singularModelName . 'Repository'),
            $this->singularModelName,
            Str::camel($this->singularModelName),
            $this->singularModelName . 'RepositoryInterface',
            $this->singularModelName . 'Repository',
        ];
        return str_replace($search, $replace, $file);
    }
}
