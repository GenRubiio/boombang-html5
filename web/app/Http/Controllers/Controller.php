<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *    title="BoomMania API",
 *    version="1.0.0",
 *    description="BoomMania API - Swagger
 *    To be able to authorize api write in Authorize: Bearer {token}",
 * )
 * @OA\Server(
 *    description="Master server",
 *    url="https://boommania.com/api/"
 * ),
 * @OA\Server(
 *    description="Local server - Francesc",
 *    url="http://127.0.0.1:8000/api/"
 * ),
 */
class Controller extends BaseController
{
    use AuthorizesRequests;
    use DispatchesJobs;
    use ValidatesRequests;
}
