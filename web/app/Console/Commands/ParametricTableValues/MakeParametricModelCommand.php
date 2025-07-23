<?php

namespace App\Console\Commands\ParametricTableValues;

use App\Console\Commands\MakeFileStructureCommand;

class MakeParametricModelCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:parametric-model {path} {table}';

    protected $description = 'Create a new Parametric Model class';

    public function __construct()
    {
        parent::__construct();

        $this->setNameSpace('App/Models/ParametricTableValues');
        $this->setSuffix('Table');
        $this->setStubPath('stubs/ParametricTableValues/parametric-model.stub');
        $this->setExtension('.php');
        $this->setFolderPermissions(0755);
    }

    /**
     * Method that change the keywords in the stub files, for the ones given
     *
     * For $this->setMultiFiles() use
     * replaceWords_0
     * replaceWords_1
     * replaceWords_2
     */
    public function replaceWords_0(string $file): string
    {
        $search = [
            '{{ namespace }}',
            '{{ class }}',
            '{{ table }}'
        ];
        $replace = [
            $this->getNamespace(),
            $this->getClassName(),
            $this->argument('table')
        ];
        return str_replace($search, $replace, $file);
    }
}
