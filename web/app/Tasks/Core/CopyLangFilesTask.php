<?php

namespace App\Tasks\Core;

class CopyLangFilesTask
{
    private $defaultLang;
    private $newLang;

    public function __construct($defaultLang, $newLang)
    {
        $this->defaultLang = $defaultLang;
        $this->newLang = $newLang;
    }

    public function run()
    {
        foreach (scandir(resource_path('lang/' . $this->defaultLang->abbr)) as $file) {
            if (str_contains($file, '.php')) {
                $content = file_get_contents(resource_path('lang/' . $this->defaultLang->abbr) . '/' . $file);
                $pathLang = resource_path('lang/' . $this->newLang->abbr) . '/' . $file;
                if (!file_exists($pathLang)) {
                    file_put_contents($pathLang, $content);
                }
            }
        }
    }
}
