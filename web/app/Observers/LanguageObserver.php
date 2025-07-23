<?php

namespace App\Observers;

use App\Models\Language;
use App\Services\LanguageService;
use App\Tasks\Core\CopyLangFilesTask;
use App\Tasks\Core\AddNewLanguageTask;
use App\Tasks\Core\UpdateDefaultLangTask;

class LanguageObserver
{
    /**
     * Handle the Language "created" event.
     */
    public function created(Language $language): void
    {
        if ($language->default) {
            (new UpdateDefaultLangTask($language->abbr))->run();
        }
        (new AddNewLanguageTask($language->abbr))->run();
    }

    /**
     * Handle the Language "creating" event.
     */
    public function creating(Language $language): void
    {
        $oldDefaultLang = Language::where('default', true)->first();
        if ($oldDefaultLang) {
            (new CopyLangFilesTask($oldDefaultLang, $language))->run();
        }
        if ($language->default) {
            (new LanguageService())->updateAll([
                'default' => false,
            ]);
        }
    }

    /**
     * Handle the Language "updated" event.
     */
    public function updated(Language $language): void
    {
        if ($language->default) {
            (new UpdateDefaultLangTask($language->abbr))->run();
        }
        (new AddNewLanguageTask($language->abbr))->run();
    }

    /**
     * Handle the Language "updating" event.
     */
    public function updating(Language $language): void
    {
        if ($language->default) {
            (new LanguageService())->updateAll([
                'default' => false,
            ]);
        }
    }

    /**
     * Handle the Language "deleted" event.
     */
    public function deleted(Language $language): void
    {
        //
    }

    /**
     * Handle the Language "restored" event.
     */
    public function restored(Language $language): void
    {
        //
    }

    /**
     * Handle the Language "force deleted" event.
     */
    public function forceDeleted(Language $language): void
    {
        //
    }
}
