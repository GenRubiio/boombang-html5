<?php

namespace App\Services\External;

use App\Models\Seo;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Http;

class GeminiAiService
{
    protected $apiKey;
    protected $apiUrl;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.key');
        $this->apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    /**
     * @param Model $model
     * @return Model
     */
    public function translate(Model $model): Model
    {
        $locales = config('backpack.crud.locales');
        $originalLocale = App::getLocale();
        $locales = array_diff_key($locales, [$originalLocale => $locales[$originalLocale]]);

        // Get the original attributes to be translated from the current language
        $attributesToTranslate = [];
        foreach ($model->ai as $field) {
            $attributesToTranslate[$field] = $this->getNestedAttribute($model, $field, $originalLocale);
        }

        $languageNames = implode(', ', array_values($locales));
        $languageCodes = implode(', ', array_keys($locales));

        $prompt = "Translate the values of the following JSON object into these languages: {$languageNames} ({$languageCodes}).\n";
        $prompt .= "Return a single JSON object where each key is the language code (e.g., 'en', 'es'). The value for each language code should be another JSON object containing the translated key-value pairs.\n";
        $prompt .= "Do not add any explanations, comments, or introductory text. Only provide the raw JSON object in your response.\n\n";
        $prompt .= "JSON to translate:\n";
        $prompt .= json_encode($attributesToTranslate, JSON_UNESCAPED_UNICODE);

        $request = Http::withHeaders([
            'Content-Type' => 'application/json',
        ]);

        if (App::environment('local')) {
            $request->withoutVerifying();
        }

        $response = $request->post($this->apiUrl . '?key=' . $this->apiKey, [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        [
                            'text' => $prompt,
                        ],
                    ],
                ]
            ],
        ]);

        $responseBody = json_decode($response->body(), true);
        
        if (isset($responseBody['candidates'][0]['content']['parts'][0]['text'])) {
            // Clean the response to get only the JSON part, removing markdown backticks if present
            $responseText = $responseBody['candidates'][0]['content']['parts'][0]['text'];
            $jsonText = preg_replace('/^```json\s*|\s*```$/', '', $responseText);
            $translations = json_decode($jsonText, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                foreach ($locales as $locale => $name) {
                    if (isset($translations[$locale])) {
                        // Use setTranslations for cleaner update
                        foreach ($translations[$locale] as $key => $value) {
                            if (in_array($key, $model->ai)) {
                                $this->setNestedAttribute($model, $key, $locale, $value);
                            }
                        }
                    }
                }
                $model->save();
            }
        }

        // Restore original locale
        App::setLocale($originalLocale);

        return $model;
    }

    public function seoGenerateAndTranslate(Model $model): Model
    {
        $locales = config('backpack.crud.locales');
        $originalLocale = App::getLocale();

        $relevantAttributes = [];
        foreach ($model->ai as $field) {
            $relevantAttributes[$field] = $this->getNestedAttribute($model, $field, $originalLocale);
        }

        $languageNames = implode(', ', array_values($locales));
        $languageCodes = implode(', ', array_keys($locales));

        $prompt = "Generate SEO metadata for the following content in these languages: {$languageNames} ({$languageCodes}).\n";
        $prompt .= "The desired SEO fields are: seo_title, meta_title, meta_description, meta_keywords, og_title, og_description, tw_title, tw_description.\n";
        $prompt .= "Return a single JSON object where each key is the language code (e.g., 'en', 'es'). The value for each language code should be another JSON object containing the generated SEO fields.\n";
        $prompt .= "Do not add any explanations, comments, or introductory text. Only provide the raw JSON object in your response.\n\n";
        $prompt .= "Content to analyze:\n";
        $prompt .= json_encode($relevantAttributes, JSON_UNESCAPED_UNICODE);

        $request = Http::withHeaders([
            'Content-Type' => 'application/json',
        ]);

        if (App::environment('local')) {
            $request->withoutVerifying();
        }

        $response = $request->post($this->apiUrl . '?key=' . $this->apiKey, [
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [
                        [
                            'text' => $prompt,
                        ],
                    ],
                ]
            ],
        ]);

        $responseBody = json_decode($response->body(), true);

        if (isset($responseBody['candidates'][0]['content']['parts'][0]['text'])) {
            $responseText = $responseBody['candidates'][0]['content']['parts'][0]['text'];
            $jsonText = preg_replace('/^```json\s*|\s*```$/', '', $responseText);
            $seoTranslations = json_decode($jsonText, true);

            if (json_last_error() === JSON_ERROR_NONE) {
                $seoData = [];
                foreach ($locales as $locale => $name) {
                    if (isset($seoTranslations[$locale])) {
                        foreach ($seoTranslations[$locale] as $key => $value) {
                            $seoData[$key][$locale] = $value;
                        }
                    }
                }

                if (!empty($seoData)) {
                    Seo::withoutEvents(function () use ($model, $seoData) {
                        $model->seo()->updateOrCreate(
                            [
                                'seoable_id' => $model->id,
                                'seoable_type' => get_class($model),
                            ],
                            $seoData
                        );
                    });
                }
            }
        }

        App::setLocale($originalLocale);

        return $model;
    }

    /**
     * Get nested attribute value using dot notation
     * Supports both simple fields and nested JSON fields like 'extras.meta_title'
     */
    private function getNestedAttribute(Model $model, string $field, string $locale): ?string
    {
        if (!str_contains($field, '.')) {
            // Simple field, use regular translation method
            return $model->getTranslation($field, $locale);
        }

        // Handle nested field like 'extras.meta_title'
        [$parentField, $nestedKey] = explode('.', $field, 2);
        
        // Get parent data for this locale
        $parentData = $model->getTranslation($parentField, $locale);
        
        // If it's a string (JSON), decode it
        if (is_string($parentData)) {
            $parentData = json_decode($parentData, true);
        }
        
        // If it's not an array, return null
        if (!is_array($parentData)) {
            return null;
        }
        
        return $parentData[$nestedKey] ?? null;
    }

    /**
     * Set nested attribute value using dot notation
     * Supports both simple fields and nested JSON fields like 'extras.meta_title'
     */
    private function setNestedAttribute(Model $model, string $field, string $locale, ?string $value): void
    {
        if (!str_contains($field, '.')) {
            // Simple field, use regular translation method
            $model->setTranslation($field, $locale, $value);
            return;
        }

        // Handle nested field like 'extras.meta_title'
        [$parentField, $nestedKey] = explode('.', $field, 2);
        
        // Get current parent data for this locale
        $parentData = $model->getTranslation($parentField, $locale);
        
        // If it's a string (JSON), decode it
        if (is_string($parentData)) {
            $parentData = json_decode($parentData, true);
        }
        
        // If it's null or not an array, initialize as empty array
        if (!is_array($parentData)) {
            $parentData = [];
        }
        
        // Set the nested value
        $parentData[$nestedKey] = $value;
        
        // Save back as array (Laravel will handle JSON encoding)
        $model->setTranslation($parentField, $locale, $parentData);
    }
}
