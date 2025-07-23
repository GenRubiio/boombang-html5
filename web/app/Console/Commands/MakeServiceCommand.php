<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeServiceCommand extends Command
{
    protected $signature = 'make:service {serviceName?} {--m|model=} {--r|repository=false}';

    protected $description = 'Create a new Service class';

    /**
     * Model base Namespace
     */
    private $modelNamespaceBase = 'App\Models\\';

    /**
     * Repository base Namespace
     */
    private $repositoryNamespaceBase = 'App\Repositories\\';

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
        $modelParam = $this->option('model');
        $repositoryParam = $this->option('repository');

        $this->singularVariableName = Str::camel($serviceNameParam);
        $this->singularModelName = Str::studly($modelParam ?? $serviceNameParam);
        $this->serviceName = Str::studly($serviceNameParam . 'Service');
        $this->repositoryName = Str::studly($this->singularModelName . 'Repository');

        $repositoryExists = $this->checkIfRepositoryExists($repositoryParam, $this->repositoryName);

        $modelExists = $this->checkIfModelExists($this->singularModelName);

        $this->makeService($modelExists, $repositoryExists);
    }

    /**
     * Method that make the Service file
     */
    private function makeService(bool $modelExists, bool $repositoryExists): void
    {
        $stubFile = 'stubs/service.stub';
        if ($repositoryExists) {
            $stubFile = 'stubs/service.repository.stub';
        } elseif ($modelExists) {
            $stubFile = 'stubs/service.model.stub';
        }
        $service = $this->replaceWords(file_get_contents($stubFile));
        $this->saveService($service);
    }

    /**
     * Method that stores the Service file
     */
    private function saveService(string $file): void
    {
        $this->checkIfServiceFolderExists();
        if (!is_file($this->folder . '/' . $this->serviceName . '.php')) {
            file_put_contents($this->folder . '/' . $this->serviceName . '.php', $file);
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
            exit();
        }

        return true;
    }

    /**
     * Method that checks if the Service folder exists, and creates it if it does not
     */
    private function checkIfServiceFolderExists(): void
    {
        $this->folder = app_path('Services');
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
