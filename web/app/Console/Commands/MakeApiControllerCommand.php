<?php

namespace App\Console\Commands;

class MakeApiControllerCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:api-controller {path}';

    protected $description = 'Create a new Api Controller class';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();

        $this->setNameSpace('App/Http/Controllers');
        $this->setSuffix('ApiController');
        $this->setStubPath('stubs/api-controller.stub');
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
