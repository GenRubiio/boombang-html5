<?php

namespace App\Pipelines\ContactForm;

use App\Jobs\SendMailJob;
use App\Mail\ContactMail;
use App\Enums\MailTypesEnum;

class ContactFormSendMailToLeadPipeline
{
    public function handle($request, \Closure $next)
    {
        $receiver = [
            'email' => $request->data->email,
            'lang' => null
        ];
        $subject = trans('form.contact_form_email.lead_subject');
        $title = trans('form.contact_form_email.lead_title');
        $data = $request->data;

        $mail = new ContactMail($subject, $title, $data);
        SendMailJob::dispatch(
            receivers: [$receiver],
            mail: $mail,
            mailType: MailTypesEnum::UNIQUE
        );

        return $next($request);
    }
}
