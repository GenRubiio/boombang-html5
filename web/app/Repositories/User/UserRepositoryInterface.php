<?php

namespace App\Repositories\User;

use App\Models\User;

interface UserRepositoryInterface
{
    public function firstOrCreate(string $email, array $data): User;

    public function getByEmail($email);

    public function updateOrCreate(array $attributes, array $values = []): User;
}
