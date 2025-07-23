<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Repositories\User\UserRepository;

class UserService extends Controller
{
    private $userRepository;

    public function __construct()
    {
        $this->userRepository = new UserRepository();
    }

    public function getById(int $userId): ?User
    {
        return $this->userRepository->find(id: $userId);
    }

    public function getByEmail($email)
    {
        return $this->userRepository->getByEmail($email);
    }

    public function update($id, $data)
    {
        return $this->userRepository->update($id, $data);
    }

    public function create($data)
    {
        return $this->userRepository->create($data);
    }

    public function firstOrCreate(string $email, array $data): User
    {
        return $this->userRepository->firstOrCreate(email: $email, data: $data);
    }

    public function find($id)
    {
        return $this->userRepository->find($id);
    }

    public function updateOrCreate(array $attributes, array $values = []): User
    {
        return $this->userRepository->updateOrCreate(attributes: $attributes, values: $values);
    }
}
