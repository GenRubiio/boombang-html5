<?php

namespace App\Observers;

use Illuminate\Support\Str;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class FullTextSearchObserver
{
    protected $searchableWithLanguages;

    public function creating($model)
    {
        $this->searchableWithLanguages = $model::SEARCHABLE_WITH_LANGUAGES;
        if ($this->searchableWithLanguages) {
            $this->prepareSearchTermsForLanguage($model);
        } else {
            $this->prepareSearchTerms($model);
        }
    }

    public function updating($model)
    {
        $this->searchableWithLanguages = $model::SEARCHABLE_WITH_LANGUAGES;
        if ($this->searchableWithLanguages) {
            $this->prepareSearchTermsForLanguage($model);
        } else {
            $this->prepareSearchTerms($model);
        }
    }

    public function prepareSearchTerms($model): void
    {
        $model->search_terms = $this->prepareSearchTermsFields($model);
    }

    public function prepareSearchTermsForLanguage($model): void
    {
        foreach (LaravelLocalization::getSupportedLocales() as $locale => $language) {
            LaravelLocalization::setLocale($locale);
            $model->setTranslation('search_terms', $locale, $this->prepareSearchTermsFields($model, $locale));
        }
    }

    public function prepareSearchTermsFields($model, $locale = null)
    {
        $terms = "";
        $searchableFields = $model::SEARCHABLE_FIELDS ?? [];
        foreach ($searchableFields as $field) {
            if ($this->searchableWithLanguages && $locale) {
                $terms .= $this->prepareTexts($model->getTranslation($field, $locale));
            } else {
                $terms .= $this->prepareTexts($model->{$field});
            }
        }
        $terms = $this->filterUniqueTerms($terms);
        return trim($terms);
    }

    public function prepareTexts($text)
    {
        if ($text != '') {
            $text = html_entity_decode(strip_tags($text));
            $text = $this->sanitizeReservedSymbols($text);
            $text = $this->sanitizeReservedWords($text);
            return $text . ' ';
        }
        return '';
    }

    public function sanitizeReservedSymbols($text)
    {
        $reservedSymbols = config('search-words-skipped.reserved-symbols');
        $text = str_replace($reservedSymbols, '', $text);
        return $text;
    }

    public function sanitizeReservedWords($text)
    {
        if ($this->searchableWithLanguages) {
            $wordsForSkip = config('search-words-skipped.' . LaravelLocalization::getCurrentLocale()) ?? [];
        } else {
            $wordsForSkip = config('search-words-skipped.all') ?? [];
        }
        $words = explode(' ', $text);
        foreach ($words as $key => $word) {
            if (in_array($word, $wordsForSkip)) {
                unset($words[$key]);
            } else {
                $words[$key] = Str::slug($word);
            }
        }
        $searchTerms = implode(' ', $words) . ' ';
        return $searchTerms;
    }

    public function filterUniqueTerms($text)
    {
        $words = explode(' ', $text);
        $wordsUnique = array_unique($words);
        return implode(' ', $wordsUnique);
    }
}
