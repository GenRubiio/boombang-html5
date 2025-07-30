<?php

namespace App\Helpers;

use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class MailHelper
{
    public static function sendEmail(
        $data,
        $subject,
        $to = [],
        $formType = 'default-content',
        $fromAddress = null,
        $fromName = null,
        $bcc = []
    ) {
        $originalLanguage = LaravelLocalization::getCurrentLocale();

        if (is_string($to)) {
            $arrayTo[$to] = config('app.locale');
            $to = $arrayTo;
        }

        if (is_null($to) || !count($to) || empty($to)) {
            $emailsToSendForm = getEmailsToSendForm($formType);
            $to = array_unique($emailsToSendForm);
        } else {
            $to = array_unique($to);
        }

        $blade = 'emails.' . $formType;
        $fromAddress = $fromAddress ?? env('MAIL_FROM_ADDRESS') ?? "boommaniagame@gmail.com";
        $fromName = $fromName ?? env('MAIL_FROM_NAME');
        $fromAddress = $fromAddress ?? env('MAIL_FROM_ADDRESS') ?? "boommaniagame@gmail.com";
        $subject = $subject ?? env('MAIL_FROM_ADDRESS');
        $bcc = $bcc ?? env('MAIL_FROM_ADDRESS');

        try {
            foreach ($to as $toMail => $toLang) {
                LaravelLocalization::setLocale($toLang);
                Mail::send(
                    $blade,
                    ['data' => $data],
                    function ($message) use ($fromAddress, $fromName, $subject, $bcc, $toMail) {
                        $message->from($fromAddress, $fromName);
                        $message->to($toMail);
                        $message->bcc($bcc);
                        $message->subject($subject);
                    }
                );
            }
            LaravelLocalization::setLocale($originalLanguage);
            Log::channel('mail')->info("Mail sent" . PHP_EOL .
                "To: " . implode(', ', $to) . PHP_EOL .
                "Form Type: " . $formType . PHP_EOL .
                "At: " . Carbon::now()->format('d-m-Y H:i:s') . PHP_EOL);
            return true;
        } catch (Exception $e) {
            Log::channel('mail')->error("ERROR in mail send" . PHP_EOL .
                "To: " . implode(', ', $to) . PHP_EOL .
                "Form Type: " . $formType . PHP_EOL .
                "At: " . Carbon::now()->format('d-m-Y H:i:s') . PHP_EOL);
            LaravelLocalization::setLocale($originalLanguage);
            throw $e;
        }
    }

    public static function sendEmailError($subject, $data)
    {
        $blade = 'emails.error';
        $to = env('APP_MAIL_TEST');
        $fromAddress = env('APP_MAIL_TEST');
        $fromName = "TITAN PLV";
        $subject = "TITAN PLV :: " . $subject ?? "Error Exception";

        try {
            Mail::send(
                $blade,
                ['data' => $data],
                function ($message) use ($fromAddress, $fromName, $subject, $to) {
                    $message->from($fromAddress, $fromName);
                    $message->to($to);
                    $message->subject($subject);
                }
            );
            Log::channel('mail')->info("Mail sent" . PHP_EOL .
                "To: " . $to . PHP_EOL .
                "Form Type: Error" . PHP_EOL .
                "At: " . Carbon::now()->format('d-m-Y H:i:s') . PHP_EOL);
            return true;
        } catch (Exception $e) {
            Log::channel('mail')->error("ERROR in mail send" . PHP_EOL .
                "To: " . $to . PHP_EOL .
                "Form Type: Error" . PHP_EOL .
                "At: " . Carbon::now()->format('d-m-Y H:i:s') . PHP_EOL);
            throw $e;
        }
    }
}
