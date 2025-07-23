<?php

namespace App\Http\Controllers\Webapi;

use App\Pipelines\ContactForm\ContactFormSendMailToLeadPipeline;
use Exception;
use Illuminate\Pipeline\Pipeline;
use App\Http\Controllers\Controller;
use App\Pipelines\VerifyRecaptchaPipeline;
use App\Pipelines\CreateLeadPipeline;
use App\Pipelines\CreateRgpdPipeline;
use App\Http\Requests\FormContactRequest;
use App\Pipelines\ContactForm\ContactFormPrepareDataPipeline;
use App\Pipelines\ContactForm\ContactFormSendMailToAdminPipeline;

class FormContactWebapiController extends Controller
{
    public function handle(FormContactRequest $request)
    {
        try {
            app(Pipeline::class)
                ->send($request)
                ->through([
                    VerifyRecaptchaPipeline::class,
                    ContactFormPrepareDataPipeline::class,
                    CreateRgpdPipeline::class,
                    CreateLeadPipeline::class,
                    ContactFormSendMailToLeadPipeline::class,
                    ContactFormSendMailToAdminPipeline::class
                ])
                ->thenReturn();
            return response()->json([
                'success' => true,
                'message' => trans('form.form-sent-ok')
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => trans('form.form-sent-ko') . ': ' . $e->getMessage()
            ]);
        }
    }
}
