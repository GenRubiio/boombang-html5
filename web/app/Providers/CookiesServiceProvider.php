<?php

namespace App\Providers;

use App\Services\CookieService;
use App\Enums\CookieCategoriesEnum;
use Illuminate\Support\Facades\Schema;
use Whitecube\LaravelCookieConsent\Cookie;
use Whitecube\LaravelCookieConsent\Consent;
use Whitecube\LaravelCookieConsent\CookiesGroup;
use Whitecube\LaravelCookieConsent\Facades\Cookies;
use Whitecube\LaravelCookieConsent\CookiesServiceProvider as ServiceProvider;

class CookiesServiceProvider extends ServiceProvider
{
    /**
     * Define the cookies users should be aware of.
     */
    protected function registerCookies(): void
    {
        if (!Schema::hasTable('cookies')) {
            return;
        }
        $cookiesServices = new CookieService();
        $cookiesAllList = $cookiesServices->allActives();
        $cookiesEssentialsList = $cookiesAllList->where('category', CookieCategoriesEnum::ESSENTIALS->key())->all();
        $cookiesOptionalList = $cookiesAllList->where('category', CookieCategoriesEnum::OPTIONAL->key())->all();
        $cookiesAnalyticsList = $cookiesAllList->where('category', CookieCategoriesEnum::ANALYTICS->key())->all();

        $essentialsCookies = Cookies::essentials()
            ->session()
            ->csrf();
        foreach ($cookiesEssentialsList as $cookieModel) {
            $essentialsCookies->cookie(function (Cookie $cookie) use ($cookieModel) {
                return $cookie
                    ->name($cookieModel->name)
                    ->description($cookieModel->description)
                    ->duration($cookieModel->duration);
            });
        }

        if (count($cookiesAnalyticsList)) {
            Cookies::analytics()
                ->group(function (CookiesGroup $group) use ($cookiesAnalyticsList) {
                    $group->name(__('cookies.analitics.title'));

                    foreach ($cookiesAnalyticsList as $cookieModel) {
                        $group->cookie(function (Cookie $cookie) use ($cookieModel) {
                            return $cookie
                                ->name($cookieModel->name)
                                ->description($cookieModel->description)
                                ->duration($cookieModel->duration);
                        });
                    }

                    $group->accepted(function (Consent $consent) {
                        $consent->script(config('settings.gtm_script'));
                    });
                });
        }

        if (count($cookiesOptionalList)) {
            Cookies::optional()
                ->group(function (CookiesGroup $group) use ($cookiesOptionalList) {
                    $group->name(__('cookies.categories.optional.title'));

                    foreach ($cookiesOptionalList as $cookieModel) {
                        $group->cookie(function (Cookie $cookie) use ($cookieModel) {
                            return $cookie
                                ->name($cookieModel->name)
                                ->description($cookieModel->description)
                                ->duration($cookieModel->duration);
                        });
                    }
                });
        }
    }
}
