<?php

namespace App\Providers;

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

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

        $this->bladeDirectives();
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

    protected function bladeDirectives()
    {
        // Picture directive
        Blade::directive('picture', function ($expression) {
            return "<?php echo Picture::responsive($expression); ?>";
        });

        // Button directive
        Blade::directive('btn', function ($expression) {
            return "<?php echo Btn::render($expression); ?>";
        });

        // Background Image Responsive directive
        Blade::directive('bgImageResponsive', function ($expression) {
            return "<?php echo BgImageResponsive::render($expression); ?>";
        });
    }
}
