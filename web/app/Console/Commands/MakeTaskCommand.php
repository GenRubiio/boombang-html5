<?php

namespace App\Console\Commands;

class MakeTaskCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:task {path}';

    protected $description = 'Create a new Task class';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
        $this->setNameSpace('App/Tasks');
        $this->setSuffix('Task');
        $this->setStubPath('stubs/task.stub');
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
