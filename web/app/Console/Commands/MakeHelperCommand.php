<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class MakeHelperCommand extends Command
{
    protected $signature = 'make:helper {helperName}';

    protected $description = 'Create a new Helper class';

    private $folder;

    private $singularVariableName;

    private $singularHelperName;

    private $helperName;

    public function handle()
    {
        $this->folder = app_path('Helpers');
        $this->singularVariableName = Str::lower($this->argument('helperName'));
        $this->singularHelperName = Str::studly($this->argument('helperName'));
        $this->helperName = Str::studly($this->argument('helperName') . 'Helper');

        $this->makeHelper();
    }

    private function addUseToHelpersFile()
    {
        $filename = $this->folder . '/Helpers.php';
        $search = '<?php';
        $insert = PHP_EOL . 'use App\Helpers\\' . $this->helperName . ';';
        $replace = $search . "\n" . $insert;
        file_put_contents($filename, str_replace($search, $replace, file_get_contents($filename)));
    }

    private function makeHelper()
    {
        $helper = $this->replaceWords(file_get_contents('stubs/helper.stub'));
        $this->saveHelper($helper);
    }

    private function saveHelper(string $file)
    {
        if (!is_file($this->folder . '/' . $this->helperName . '.php')) {
            file_put_contents($this->folder . '/' . $this->helperName . '.php', $file);
            $this->addUseToHelpersFile();
            $this->info($this->helperName . ' created successfully!');
        } else {
            $this->info('Helper already exists');
        }
    }

    private function replaceWords(string $file): string
    {
        $search = [
            'SingularHelperName',
            'SingularVariableName',
        ];
        $replace = [
            $this->singularHelperName,
            $this->singularVariableName,
        ];

        return str_replace($search, $replace, $file);
    }
}
