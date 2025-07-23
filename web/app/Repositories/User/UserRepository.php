<?php

namespace App\Repositories\User;

use App\Models\User;
use App\Repositories\Repository;

class UserRepository extends Repository implements UserRepositoryInterface
{
    public function __construct()
    {
        $this->model = new User();
        parent::__construct($this->model);
    }

    public function firstOrCreate(string $email, array $data): User
    {
        return $this->model->firstOrCreate(['email' => $email], $data);
    }

    public function getByEmail($email)
    {
        return $this->model->where('email', $email)->first();
    }

    public function updateOrCreate(array $attributes, array $values = []): User
    {
        return $this->model->updateOrCreate($attributes, $values);
    }
}
