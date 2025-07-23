<?php

namespace App\Console\Commands;

class MakePipeOperationCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:pipe-operation {path}';

    protected $description = 'Create a new Pipe Operation class';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();

        $this->setNameSpace('App/PipeOperations');
        $this->setSuffix('PipeOperation');
        $this->setStubPath('stubs/pipe-operation.stub');
        $this->setExtension('.php');
        $this->setFolderPermissions(0755);
    }

    public function replaceWords_0(string $file): string
    {
        $search = [
            'NameSpacePathStub',
            'ClassNameStub',
        ];
        $replace = [
            $this->getNamespace(),
            $this->getClassName(),
        ];

        return str_replace($search, $replace, $file);
    }
}
