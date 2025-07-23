<?php

namespace App\Console\Commands;

class MakePipelineCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:pipeline {path}';

    protected $description = 'Create a new Pipeline class';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();

        $this->setNameSpace('App/Pipelines');
        $this->setSuffix('Pipeline');
        $this->setStubPath('stubs/pipeline.stub');
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
