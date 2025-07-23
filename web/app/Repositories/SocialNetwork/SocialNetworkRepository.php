<?php

namespace App\Repositories\SocialNetwork;

use App\Models\SocialNetwork;
use App\Repositories\Repository;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class SocialNetworkRepository extends Repository implements SocialNetworkRepositoryInterface
{
    public function __construct()
    {
        $this->model = new SocialNetwork();
        parent::__construct($this->model);
    }

    public function getSocialNetworks()
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () {
            return $this->model->active()->ordered()->get();
        });
    }
}
