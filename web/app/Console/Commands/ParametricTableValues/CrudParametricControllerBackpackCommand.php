<?php

namespace App\Console\Commands\ParametricTableValues;

use Illuminate\Console\GeneratorCommand;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;

class CrudParametricControllerBackpackCommand extends GeneratorCommand
{
    protected $name = 'backpack:crud-controller-parametric';

    protected $signature = 'backpack:crud-controller-parametric {name}';

    protected $description = 'Generate a Backpack Parametric CRUD controller';

    /**
     * The type of class being generated.
     */
    protected $type = 'Controller';

    /**
     * Get the destination class path.
     */
    protected function getPath($name)
    {
        $name = str_replace($this->laravel->getNamespace(), '', $name);

        return $this->laravel['path'] . '/' . str_replace('\\', '/', $name) . 'CrudController.php';
    }

    /**
     * Get the stub file for the generator.
     */
    protected function getStub()
    {
        return base_path('stubs/ParametricTableValues/parametric-crud-controller.stub');
    }

    /**
     * Get the default namespace for the class.
     */
    protected function getDefaultNamespace($rootNamespace)
    {
        return $rootNamespace . '\Http\Controllers\Admin';
    }

    /**
     * Replace the table name for the given stub.
     */
    protected function replaceNameStrings(&$stub, $name)
    {
        $nameTitle = Str::afterLast($name, '\\');
        $nameKebab = Str::kebab($nameTitle);
        $nameSingular = str_replace('-', ' ', $nameKebab);
        $namePlural = Str::plural($nameSingular);

        $stub = str_replace('DummyClass', $nameTitle, $stub);
        $stub = str_replace('dummy-class', $nameKebab, $stub);
        $stub = str_replace('dummy singular', $nameSingular, $stub);
        $stub = str_replace('dummy plural', $namePlural, $stub);

        return $this;
    }

    protected function getAttributes($model)
    {
        $attributes = [];
        $model = new $model();

        // if fillable was defined, use that as the attributes
        if (count($model->getFillable())) {
            $attributes = $model->getFillable();
        } else {
            // otherwise, if guarded is used, just pick up the columns straight from the bd table
            $attributes = \Schema::getColumnListing($model->getTable());
        }

        return $attributes;
    }

    /**
     * Replace the table name for the given stub.
     */
    protected function replaceSetFromDb(&$stub, $name)
    {
        $class = Str::afterLast($name, '\\');
        $model = "App\\Models\\$class";

        if (!class_exists($model)) {
            return $this;
        }

        $attributes = $this->getAttributes($model);

        // create an array with the needed code for defining fields
        $fields = Arr::except($attributes, ['id', 'created_at', 'updated_at', 'deleted_at']);
        $fields = collect($fields)
            ->map(function ($field) {
                return "CRUD::field('$field');";
            })
            ->toArray();

        // create an array with the needed code for defining columns
        $columns = Arr::except($attributes, ['id']);
        $columns = collect($columns)
            ->map(function ($column) {
                return "CRUD::column('$column');";
            })
            ->toArray();

        // replace setFromDb with actual fields and columns
        $stub = str_replace('CRUD::setFromDb(); // fields', implode(PHP_EOL . '        ', $fields), $stub);
        $stub = str_replace('CRUD::setFromDb(); // columns', implode(PHP_EOL . '        ', $columns), $stub);

        return $this;
    }

    /**
     * Replace the class name for the given stub.
     */
    protected function replaceModel(&$stub, $name)
    {
        $class = str_replace($this->getNamespace($name) . '\\', '', $name);
        $stub = str_replace(['DummyClass', '{{ class }}', '{{class}}'], $class, $stub);

        return $this;
    }

    /**
     * Build the class with the given name.
     */
    protected function buildClass($name)
    {
        $stub = $this->files->get($this->getStub());

        $this->replaceNamespace($stub, $name)
            ->replaceNameStrings($stub, $name)
            ->replaceModel($stub, $name)
            ->replaceSetFromDb($stub, $name);

        return $stub;
    }

    /**
     * Get the console command options.
     */
    protected function getOptions()
    {
        return [

        ];
    }
}
