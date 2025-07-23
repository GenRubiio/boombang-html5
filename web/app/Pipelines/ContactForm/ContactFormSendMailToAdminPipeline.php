<?php

namespace App\Pipelines\ContactForm;

use App\Jobs\SendMailJob;
use App\Mail\ContactMail;
use App\Enums\MailTypesEnum;

class ContactFormSendMailToAdminPipeline
{
    public function handle($request, \Closure $next)
    {
        $subject = trans('form.contact_form_email.admin_subject');
        $title = trans('form.contact_form_email.admin_title');
        $data = $request->data;

        $mail = new ContactMail($subject, $title, $data);
        SendMailJob::dispatch(
            mail: $mail,
            mailType: MailTypesEnum::UNIQUE
        );

        return $next($request);
    }
}
