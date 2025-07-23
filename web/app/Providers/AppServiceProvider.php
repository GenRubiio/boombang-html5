<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Vite;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Vite::useScriptTagAttributes([
            'defer' => true, // Specify an attribute without a value...
        ]);

        /*
        When using PostgreSQL, we need to convert the resource to a string
        $settings = \DB::table('settings')->pluck('value', 'key');
        foreach ($settings as $key => $value) {
            $config = config('settings.' . $key);
            if (is_resource($config)) {
                $config = stream_get_contents($config);

                config(['settings.' . $key => $config]);
            }
        }
        */
        $this->overrideConfigValues();
    }

    protected function overrideConfigValues()
    {
        $config = [];
        if (config('settings.skin')) {
            $config['backpack.base.skin'] = config('settings.skin');
        }
        if (config('settings.show_powered_by')) {
            $config['backpack.base.show_powered_by'] = config('settings.show_powered_by') == '1';
        }
        config($config);
    }
}
