<?php

namespace App\Pipelines;

use App\Models\Lead;

class CreateLeadPipeline
{
    public function handle($request, \Closure $next)
    {
        Lead::create([
            "request" => json_encode($request->request->all()),
            "name" => $request->data->name ?? null,
            "surname" => $request->data->surname ?? null,
            "email" => $request->data->email ?? null,
            "telephone" => $request->data->telephone ?? null,
            "city" => $request->data->city ?? null,
            "message" => $request->data->message ?? null,
            "url_origin" => $request->data->url_origin,
            "accept_terms" => $request->data->accept_terms ?? false,
            "accept_notifications" => $request->data->accept_notifications ?? false,
            "form_name" => $request->data->form,
            "rgpd_id" => $request->data->rgpd_id,
        ]);
        return $next($request);
    }
}
