<?php

namespace App\Pipelines;

use Exception;
use Carbon\Carbon;
use App\Models\Rgpd;

class CreateRgpdPipeline
{
    public function handle($request, \Closure $next)
    {
        if (empty($request->data->email) && empty($request->data->telephone)) {
            throw new Exception(trans('form.email_or_phone_required'));
        }

        $data = [
            'name' => $request->data->full_name ?? $request->data->name ?? null,
            'ip_consent' => getIp(),
            'consent' => $request->data->accept_terms,
            'datetime_consent' => Carbon::now(),
            'active' => 1
        ];

        if ($request->data->email) {
            isset($request->data->telephone) ? $data['phone'] = $request->data->telephone : null;
            $rgpd = Rgpd::updateOrCreate(['email' => $request->data->email], $data);
        } else {
            isset($request->data->email) ? $data['email'] = $request->data->email : null;
            $rgpd = Rgpd::updateOrCreate(['phone' => $request->data->telephone], $data);
        }
        $request->data->rgpd_id = $rgpd->id;
        return $next($request);
    }
}
