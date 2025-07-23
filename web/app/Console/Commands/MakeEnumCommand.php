<?php

namespace App\Console\Commands;

class MakeEnumCommand extends MakeFileStructureCommand
{
    protected $signature = 'make:enum {path}';

    protected $description = 'Create a new Enum class';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();

        $this->setNameSpace('App/Enums');
        $this->setSuffix('Enum');
        $this->setStubPath('stubs/enums.stub');
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
