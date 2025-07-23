<?php

namespace App\Tasks\Core;

class AddNewLanguageTask
{
    private $abbr;
    private $laravelLocalizationFile;
    private $crudFile;

    public function __construct($abbr)
    {
        $this->abbr = $abbr;
        $this->laravelLocalizationFile = base_path('config/laravellocalization.php');
        $this->crudFile = base_path('config/backpack/crud.php');
    }

    public function run()
    {
        $this->updateFile($this->laravelLocalizationFile);
        $this->updateFile($this->crudFile);
    }

    private function updateFile($file)
    {
        $content = file_get_contents($file);
        $updatedContent = str_replace("//'{$this->abbr}'", "'{$this->abbr}'", $content);
        $updatedContent = str_replace("// '{$this->abbr}'", "'{$this->abbr}'", $updatedContent);
        $updatedContent = str_replace('// "' . $this->abbr . '"', "'{$this->abbr}'", $updatedContent);
        $updatedContent = str_replace('//"' . $this->abbr . '"', "'{$this->abbr}'", $updatedContent);
        file_put_contents($file, $updatedContent);
    }
}
