<?php

namespace App\Jobs;

use App\Enums\MailTypesEnum;
use Illuminate\Bus\Queueable;
use App\Exceptions\GenericException;
use Illuminate\Support\Facades\Mail;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class SendMailJob implements ShouldQueue
{
    use Dispatchable;
    use InteractsWithQueue;
    use Queueable;
    use SerializesModels;

    protected $receivers;
    protected $originalLanguage;
    protected $mail;
    protected $formName;
    protected $mailType;

    public function __construct($mail, MailTypesEnum $mailType, array $receivers = [])
    {
        $this->originalLanguage = LaravelLocalization::getCurrentLocale();
        $this->mail = $mail;
        $this->formName = $this->mail->formName;
        $this->receivers = $this->getReceivers($receivers);
        $this->mailType = $mailType;
    }

    public function handle(): void
    {
        foreach ($this->receivers as $lang => $receivers) {
            if (!empty($lang)) {
                LaravelLocalization::setLocale($lang);
            }

            switch ($this->mailType) {
                case MailTypesEnum::UNIQUE:
                    foreach ($receivers as $receiver) {
                        Mail::to($receiver['email'])->send($this->mail);
                    }
                    break;
                case MailTypesEnum::MASSIVE:
                    $emails = collect($receivers)->pluck('email')->toArray();
                    Mail::bcc($emails)->send($this->mail);
                    break;
                default:
                    LaravelLocalization::setLocale($this->originalLanguage);
                    throw new GenericException('Mail type not supported');
            }

            LaravelLocalization::setLocale($this->originalLanguage);
        }
    }

    private function getReceivers(array $receivers): array
    {
        if (empty($receivers)) {
            $receivers = getEmailsToSendForm($this->formName);
        }

        foreach ($receivers as $key => $receiver) {
            if (empty($receiver['email'])) {
                unset($receivers[$key]);
            }
        }

        return collect($receivers)
            ->groupBy('lang')
            ->toArray();
    }
}
