<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;

/**
 * @OA\Info(
 *    title="Basetis Backpack Base API",
 *    version="1.0.0",
 *    description="Basetis Backpack Base API - Swagger
 *    To be able to authorize api write in Authorize: Bearer {token}",
 * )
 * @OA\Server(
 *    description="Master server",
 *    url="https://basetisbackpackbase.com/api/"
 * ),
 * @OA\Server(
 *    description="Staging server",
 *    url="https://basetisbackpackbase.basetis.com/api/"
 * ),
 * @OA\Server(
 *    description="Local server - Francesc",
 *    url="http://basetisbackpackbase.bst/api/"
 * ),
 */
class Controller extends BaseController
{
    use AuthorizesRequests;
    use DispatchesJobs;
    use ValidatesRequests;
}
