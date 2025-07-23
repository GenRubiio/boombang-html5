<?php

namespace App\Console\Commands;

class FileStructureCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:file-struct-command {path}';

    protected $description = 'Create file structure';

    public function __construct()
    {
        parent::__construct();
        $this->setNameSpace('App/Console/Commands');
        $this->setSuffix('');
        $this->setStubPath('stubs/file-struct-command.stub');
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
