<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

/**
 * Interface RepositoryInterface
 * @package App\Repositories
 */
interface RepositoryInterface
{
    public function getModel(): Model;
    public function setModel(Model $model);
    public function all(array $relations = []): Collection;
    public function allActives(array $relations = []): Collection;
    public function allUnorderedActives(array $relations = []): Collection;
    public function allRandomActives(array $relations = []): Collection;
    public function create(array $data): Model;
    public function update(int $id, array $data): bool;
    public function delete(int $id): bool;
    public function find(int $id, array $relations = []): ?Model;
    public function findBySlug(string $slug, array $relations = []): ?Model;
    public function paginate(int $pagination): array;
}
