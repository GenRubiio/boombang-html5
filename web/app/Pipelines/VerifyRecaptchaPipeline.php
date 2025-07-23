<?php

namespace App\Pipelines;

use Exception;
use Illuminate\Support\Facades\App;

class VerifyRecaptchaPipeline
{
    public function handle($request, \Closure $next)
    {
        if (!App::environment(['production', 'staging']) && !config('recaptcha.active')) {
            return $next($request);
        }
        $recaptchaResponse = recaptchaValidation($request->recaptchaResponse ?? '');
        if ($recaptchaResponse) {
            return $next($request);
        } else {
            throw new Exception(trans('form.recaptcha_validation_failed'));
        }
    }
}
