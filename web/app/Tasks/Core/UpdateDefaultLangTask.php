<?php

namespace App\Tasks\Core;

class UpdateDefaultLangTask
{
    private $abbr;

    public function __construct($abbr)
    {
        $this->abbr = $abbr;
    }

    public function run()
    {
        $folder = base_path('config');
        $filePhpPath = $folder . '/app.php';
        $fileTmpPath = $folder . '/app.tmp';
        $lineFind = "'locale' =>";
        $replaceLine = "'locale' => '" . $this->abbr . "',\n";

        $this->updatePhpFile($filePhpPath, $fileTmpPath, $lineFind, $replaceLine);
    }

    private function updatePhpFile($filePhpPath, $fileTmpPath, $lineFind, $replaceLine)
    {
        $reading = fopen($filePhpPath, 'r');
        $writing = fopen($fileTmpPath, 'w');

        $replaced = false;

        while (!feof($reading)) {
            $line = fgets($reading);
            if (stristr($line, $lineFind)) {
                $line = $replaceLine;
                $replaced = true;
            }
            fputs($writing, $line);
        }
        fclose($reading);
        fclose($writing);
        if ($replaced) {
            rename($fileTmpPath, $filePhpPath);
        } else {
            unlink($fileTmpPath);
        }
    }
}
