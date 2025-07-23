<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Mcamara\LaravelLocalization\Facades\LaravelLocalization;

class Repository implements RepositoryInterface
{
    /**
     * @var Model
     */
    protected Model $model;

    /**
     * @var int Limit for retrieve data
     */
    protected $limit;

    /**
     * @var int defaultTtl for cache
     */
    protected $defaultTtl;

    /**
     * @var string modelCamel
     */
    protected $modelCamel;

    /**
     * Repository constructor.
     * @param Model $model
     */
    public function __construct(Model $model)
    {
        $this->defaultTtl = env('CACHE_DEFAULT_TTL', 7200);
        $this->limit = 10;
        $this->model = $model;
        $this->modelCamel = Str::camel(class_basename($model));
    }

    /**
     * @return Model
     */
    public function getModel(): Model
    {
        return $this->model;
    }

    /**
     * @param Model $model
     */
    public function setModel(Model $model)
    {
        $this->model = $model;
    }

    /**
     * @return Collection
     */
    public function all(array $relations = []): Collection
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () use ($relations) {
            return $this->model->ordered()->with($relations)->get();
        });
    }

    /**
     * @return Collection
     */
    public function allActives(array $relations = []): Collection
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () use ($relations) {
            return $this->model->active()->with($relations)->ordered()->get();
        });
    }

    public function allUnorderedActives(array $relations = []): Collection
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () use ($relations) {
            return $this->model->active()->with($relations)->get();
        });
    }

    public function allRandomActives(array $relations = []): Collection
    {
        return $this->model->active()->inRandomOrder()->with($relations)->get();
    }

    /**
     * @param array $data
     * @return mixed
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * @param array $data
     * @param int $id
     * @return mixed
     */
    public function update(int $id, array $data): bool
    {
        return $this->model->where('id', $id)
            ->update($data);
    }

    /**
     * @param int $id
     * @return int
     */
    public function delete(int $id): bool
    {
        return $this->model->destroy($id);
    }

    /**
     * @param int $id
     * @return Model|null
     */
    public function find(int $id, array $relations = []): ?Model
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . $id . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () use ($id, $relations) {
            return $this->model->find($id)->with($relations);
        });
    }

    /**
     * @param int $id
     * @return Model|null
     */
    public function findBySlug(string $slug, array $relations = []): ?Model
    {
        return cache()->remember($this->modelCamel . '.' . __FUNCTION__ . '.' . $slug . '.' . LaravelLocalization::getCurrentLocale(), $this->defaultTtl, function () use ($slug, $relations) {
            return $this->model->where('slug', $slug)->with($relations)->first();
        });
    }

    /**
     * @param int $pagination
     * @return array
     */
    public function paginate(int $pagination): array
    {
        return $this->model->paginate($pagination)->items();
    }
}
