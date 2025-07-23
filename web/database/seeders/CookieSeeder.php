<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Enums\CookieCategoriesEnum;
use Illuminate\Support\Facades\DB;

class CookieSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::table('cookies')->insert([
            [
                'category' => CookieCategoriesEnum::ESSENTIALS->key(),
                'name' => '1P_JAR',
                'description' => json_encode([
                    'en' => 'Google reCAPTCHA cookie that stores user preferences and usage statistics and helps protect forms against spam and abuse.'
                ]),
                'duration' => 30 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ESSENTIALS->key(),
                'name' => 'NID',
                'description' => json_encode([
                    'en' => 'Google reCAPTCHA cookie that identifies the user to personalise the experience and safeguard forms.'
                ]),
                'duration' => 180 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ESSENTIALS->key(),
                'name' => 'CONSENT',
                'description' => json_encode([
                    'en' => 'Google cookie that stores the user’s consent status for Google services and is required by reCAPTCHA.'
                ]),
                'duration' => 365 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ESSENTIALS->key(),
                'name' => 'fh-target-language',
                'description' => json_encode([
                    'en' => 'Cookie from fareharbor.com'
                ]),
                'duration' => 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ESSENTIALS->key(),
                'name' => 'fh-units-language',
                'description' => json_encode([
                    'en' => 'Cookie from fareharbor.com'
                ]),
                'duration' => 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ESSENTIALS->key(),
                'name' => 'fh-content-language',
                'description' => json_encode([
                    'en' => 'Cookie from fareharbor.com'
                ]),
                'duration' => 60,
                'active' => true,
            ],
            /****************************************************************** */
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => '_clck',
                'description' => json_encode([
                    'en' => 'Microsoft Clarity cookie that logs session start and helps measure clicks and page performance.'
                ]),
                'duration' => 30 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => '_clsk',
                'description' => json_encode([
                    'en' => 'Microsoft Clarity cookie that uniquely identifies the user\'s session.'
                ]),
                'duration' => 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => '_ga',
                'description' => json_encode([
                    'en' => 'Google Analytics cookie that assigns a unique identifier to each visitor to distinguish users and collect usage statistics.'
                ]),
                'duration' => 2 * 365 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => '_ga_{id}',
                'description' => json_encode([
                    'en' => 'Google Analytics cookie for your property (ID G-{id}); stores session state and measurement persistence.'
                ]),
                'duration' => 365 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => 'CLID',
                'description' => json_encode([
                    'en' => 'Microsoft Advertising cookie that stores the unique identifier for an ad click, used to correctly attribute conversions.'
                ]),
                'duration' => 365 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => 'IDE',
                'description' => json_encode([
                    'en' => 'Google DoubleClick cookie that assigns a unique ID for ad targeting and controls impression frequency.'
                ]),
                'duration' => 365 * 24 * 60,
                'active' => true,
            ],
            [
                'category' => CookieCategoriesEnum::ANALYTICS->key(),
                'name' => 'MUID',
                'description' => json_encode([
                    'en' => 'Microsoft Advertising/Bing cookie that creates a unique device/browser ID, used in personalized advertising.'
                ]),
                'duration' => 365 * 24 * 60,
                'active' => true,
            ],
        ]);
        $this->command->info('Cookies seeding successful.');
    }
}
