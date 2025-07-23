<?php

namespace App\Observers;

use Illuminate\Support\Str;

class PageObserver
{
    public function created($page)
    {
        if ($page->exists_blade) {
            $scaffolding = getDirectoryBladePath($page);
            if (!is_file(storage_path($scaffolding->pathBlade))) {
                if (!is_dir(storage_path($scaffolding->basePath))) {
                    mkdir(storage_path($scaffolding->basePath), 0755, true);
                }
                if (!is_dir(storage_path($scaffolding->templatePagePath))) {
                    mkdir(storage_path($scaffolding->templatePagePath), 0755, true);
                }
                $page_filename_destination = storage_path($scaffolding->pathBlade);

                $page_file = $this->replacePageWords(file_get_contents(storage_path('../resources/views/templates/page.template.stub')), $page);
                file_put_contents($page_filename_destination, $page_file);

                if ($page->template == "entity") {
                    $object_page_filename_destination = storage_path($scaffolding->templatePagePath . '/' . $scaffolding->nameBlade . '-object.blade.php');
                    $object_page_file = $this->replacePageWords(file_get_contents(storage_path('../resources/views/templates/object.template.stub')), $page);
                    file_put_contents($object_page_filename_destination, $object_page_file);
                }
                $this->createScssFile($scaffolding->nameBlade);
            }
        }
    }

    private function replacePageWords(string $file, $page): string
    {
        $search = [
            'PageName',
            'PageSlug',
        ];
        $replace = [
            $page->name,
            Str::slug($page->name),
        ];
        return str_replace($search, $replace, $file);
    }

    private function createScssFile($fileName)
    {
        file_put_contents('../resources/sass/pages/_' . $fileName . '.scss', '');
        $filePath = public_path('../resources/sass/pages/index.scss');
        $newLine = '@import "' . $fileName . '";';
        $newLine .= '';
        $file = fopen($filePath, 'a');
        fwrite($file, $newLine);
        fclose($file);
    }
}
