<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MakeFileStructureCommand extends Command
{
    private $namespace;

    private $suffix;

    private $stubPath;

    private $extension;

    private $folderPermissions;

    private $path;

    private $fileName;

    private $fullPath;

    private $fullName;

    private $pathDirectories;

    private $multiFiles = null;

    private $replaceWordsFunction = 'replaceWords_';

    protected $signature = 'command';

    protected $description = 'Create a new File structure';

    public function handle()
    {
        if ($this->multiFiles) {
            foreach ($this->multiFiles as $key => $config) {
                $this->setMultiFileAttributes($config);
                $this->start($key);
            }
        } else {
            $this->start();
        }
    }

    private function start($key = 0)
    {
        $this->setAttributes();
        $this->setPathDirectories();

        if ($this->validateTaskName()) {
            $this->makeDirectories();
            $this->makeFile($key);
        }
    }

    /*
    |--------------------------------------------------------------------------
    | FUNCTIONS
    |--------------------------------------------------------------------------
    */

    private function makeFile($key)
    {
        $function = "{$this->replaceWordsFunction}{$key}";
        $file = $this->$function(file_get_contents(base_path($this->stubPath)));
        $this->saveFile($file);
    }

    private function saveFile(string $file)
    {
        file_put_contents(base_path($this->fullPath), $file);
        $this->info("{$this->fullName} created successfully!");
    }

    private function makeDirectories()
    {
        if (!is_dir(base_path($this->pathDirectories))) {
            mkdir(base_path($this->pathDirectories), $this->folderPermissions, true);
        }
    }

    private function validateTaskName()
    {
        if (file_exists(base_path($this->fullPath))) {
            $this->error("{$this->fullName} already exists");

            return false;
        }

        return true;
    }

    private function makeNameSpacePath($path)
    {
        if (str_contains($path, '/')) {
            $namespaceFormat = $this->namespace . '/';
            $folders = explode('/', $path);
            for ($i = 0; $i < count($folders) - 1; $i++) {
                $namespaceFormat .= $folders[$i] . '/';
            }

            return rtrim($namespaceFormat, '/');
        } else {
            return $this->namespace;
        }
    }

    /*
    |--------------------------------------------------------------------------
    | MUTATORS
    |--------------------------------------------------------------------------
    */

    private function setAttributes()
    {
        $basicPath = $this->namespace . '/' . $this->argument('path');
        $this->path = $this->makeNameSpacePath($this->argument('path'));
        $this->fullPath = $basicPath . $this->suffix . $this->extension;
        $this->fileName = explode('/', $basicPath)[count(explode('/', $basicPath)) - 1] . $this->suffix;
        $this->fullName = explode('/', $this->fullPath)[count(explode('/', $this->fullPath)) - 1];
    }

    private function setMultiFileAttributes($config)
    {
        $this->setNameSpace($config['name_space']);
        $this->setSuffix($config['suffix']);
        $this->setStubPath($config['stub_path']);
        $this->setExtension($config['extension']);
        $this->setFolderPermissions($config['folder_permissions']);
    }

    private function setPathDirectories()
    {
        $path = '';
        $directories = explode('/', $this->fullPath);
        for ($a = 0; $a <= count($directories) - 2; $a++) {
            $path .= $directories[$a] . '/';
        }
        $this->pathDirectories = rtrim($path, '/');
    }

    protected function setNameSpace($value)
    {
        $this->namespace = $value;
    }

    protected function setSuffix($value)
    {
        $this->suffix = $value;
    }

    protected function setStubPath($value)
    {
        $this->stubPath = $value;
    }

    protected function setExtension($value)
    {
        $this->extension = $value;
    }

    protected function setFolderPermissions($value)
    {
        $this->folderPermissions = $value;
    }

    protected function setMultiFiles($value)
    {
        $this->multiFiles = $value;
    }

    /*
    |--------------------------------------------------------------------------
    | ACCESORS
    |--------------------------------------------------------------------------
    */

    public function getNamespace()
    {
        return str_replace('/', '\\', $this->path);
    }

    public function getClassName()
    {
        return $this->fileName;
    }
}
