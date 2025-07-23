<?php

namespace App\Exceptions;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     *
     * @return void
     */
    public function register()
    {
        $this->reportable(function (Throwable $exception) {
            $request = request();
            $data = [
                'url' => $request->url(),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'exception_type' => get_class($exception),
                'ip' => $request->ip(),
                'datetime' => Carbon::now()->format('Y-m-d H:i')
            ];
            $validationErrorLogArray = [
                'exception_message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine()
            ];

            //Handle 404 errors for user view
            if ($exception instanceof NotFoundHttpException) {
                Log::channel('exception')->error('NotFoundHttpException: ', [$validationErrorLogArray]);
                Log::channel('exception')->error('NotFoundHttpException: ', ['uri_not_found' => $data['url']]);
            } elseif ($exception instanceof ValidationException) {
                Log::channel('exception')->info('ValidationException: ', [$validationErrorLogArray]);
            } elseif ($exception instanceof ModelNotFoundException) {
                $validationErrorLogArray['model'] = $exception->getModel();
                $validationErrorLogArray['ids'] = $exception->getIds();
                Log::channel('exception')->error(get_class($exception) . ' : ', [$validationErrorLogArray]);
            } else {
                if (parent::shouldReport($exception)) {
                    Log::channel('exception')->error(get_class($exception) . ' : ', [$validationErrorLogArray]);
                }
            }
        });
    }
}
