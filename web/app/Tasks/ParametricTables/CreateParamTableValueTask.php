<?php

namespace App\Tasks\ParametricTables;

use App\Exceptions\GenericException;
use Illuminate\Support\Facades\Artisan;

class CreateParamTableValueTask
{
    private $tableName;
    private $entityName;
    private $createModel;
    private $createBackpackCrud;
    private $createHexagonalStructure;

    public function __construct(
        $tableName,
        $createModel = true,
        $createBackpackCrud = true,
        $createHexagonalStructure = true
    ) {
        $this->tableName = $tableName;
        $this->entityName = $this->setEntityName();
        $this->createModel = $createModel;
        $this->createBackpackCrud = $createBackpackCrud;
        $this->createHexagonalStructure = $createHexagonalStructure;
    }

    public function run()
    {
        $this->validateOptions();
        $this->createModel();
        $this->createHexagonalStructure();
        $this->createBackpackCrud();
    }

    private function createModel()
    {
        if ($this->createModel) {
            Artisan::call('make:parametric-model ' . $this->entityName . ' ' . $this->tableName);
        }
    }

    private function createBackpackCrud()
    {
        if ($this->createBackpackCrud) {
            Artisan::call('backpack:crud-parametric ' . $this->entityName . 'Table');
        }
    }

    private function createHexagonalStructure()
    {
        if ($this->createHexagonalStructure) {
            Artisan::call('make:parametric-repository ' . $this->entityName);
            Artisan::call('make:parametric-service ' . $this->entityName);
        }
    }

    private function setEntityName()
    {
        return str_replace(" ", "", ucwords(str_replace("_", " ", $this->tableName)));
    }

    private function validateOptions()
    {
        if ($this->createBackpackCrud && !$this->createModel) {
            throw new GenericException("No es posible crear Backpack CRUD sin el Modelo");
        }
        if ($this->createHexagonalStructure && !$this->createModel) {
            throw new GenericException("No es posible crear estructura hexagonal sin el Modelo");
        }
    }
}
