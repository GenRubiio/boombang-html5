<?php

namespace App\Pipelines\ContactForm;

use App\Enums\FormsEnum;

class ContactFormPrepareDataPipeline
{
    public function handle($request, \Closure $next)
    {
        $request = (object)[
            'request' => $request,
            'data' => (object)[
                'form' => FormsEnum::CONTACT->name(),
                'url_origin' => $request->url_origin,
                'name' => $request->name,
                'email' => $request->email,
                'message' => $request->explain,
                'exist_accept_terms' => isset($request->accept_terms),
                'accept_terms' => $request->accept_terms == "on",
            ]
        ];
        return $next($request);
    }
}
