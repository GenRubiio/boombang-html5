<?php

namespace App\Console\Commands;

use App\Models\Language;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SquareDatabaseTranslations extends Command
{
    protected $signature = 'update:translations {model} {--force}';

    protected $description = 'Update translations for the given table and attribute';

    public function handle()
    {
        $forceTranslate = (bool)$this->option('force') ?? false;
        $modelName = $this->argument('model');
        $model = self::getModel($modelName);
        $table = self::getTable($model);
        $attributesTranslatables = self::getAttributesTranslatables($model);

        $activeLanguages = Language::getActiveLanguagesArray() ?? [];
        $defaultLocale = Language::getDefaultLanguage()->abbr;

        DB::table($table)->get()->each(function ($record) use ($attributesTranslatables, $table, $defaultLocale, $activeLanguages, $forceTranslate) {
            $updatedAttributes = [];
            foreach ($attributesTranslatables as $attribute) {
                if (isset($record->$attribute)) {
                    $translations = json_decode($record->$attribute, true);
                    if (isset($translations[$defaultLocale])) {
                        foreach ($activeLanguages as $lang) {
                            if (!isset($translations[$lang['abbr']]) || $forceTranslate) {
                                $translations[$lang['abbr']] = $translations[$defaultLocale];
                            }
                        }
                    }
                    $updatedAttributes[$attribute] = json_encode($translations);
                }
            }
            DB::table($table)->where('id', $record->id)->update($updatedAttributes);
        });
        $this->info('Translations updated successfully.');
    }

    protected function getModel($modelName)
    {
        $modelClass = "App\\Models\\{$modelName}";
        $model = new $modelClass();

        if (!class_exists($modelClass)) {
            $this->error("Model class {$modelClass} does not exist.");
            return false;
        }

        return $model;
    }

    protected function getTable($model)
    {
        $table = $model->getTable();
        $this->info("Table name for " . get_class($model) . ": {$table}");
        return $table;
    }

    protected function getAttributesTranslatables($model)
    {
        $attributesTranslatables = [];
        if (method_exists($model, 'getTranslatable')) {
            $attributesTranslatables = $model->getTranslatable();
        }
        return $attributesTranslatables;
    }
}
