<?php

namespace App\Http\Resources\BlogArticle;

use App\Traits\Resources\DtoResourceTrait;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogArticleResource extends JsonResource
{
    use DtoResourceTrait;

    private static $data;

    public function __construct($resource)
    {
        parent::__construct($resource);
        self::$data = $resource;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => (int)$this->id,
            'category_id' => (string)$this->category_id,
            'title' => (string)$this->title,
            'extract' => (string)$this->extract,
            'content' => (string)$this->content,
            'image' => (string)$this->image,
            'slug' => (string)$this->slug,
            'featured' => (bool)$this->featured,
            'date' => (string)$this->date,
        ];
    }
}
