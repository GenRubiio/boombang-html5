<?php

namespace App\Helpers;

use Illuminate\Database\Schema\Blueprint;

class BlueprintHelper extends Blueprint
{
    public function defaultIdString()
    {
        $this->string('id')->primary();
    }

    public function defaultSimpleOrder()
    {
        $this->integer('order')->unsigned()->nullable();
    }

    public function defaultOrder($idWithString = false)
    {
        if ($idWithString) {
            $this->string('parent_id')->nullable();
        } else {
            $this->integer('parent_id')->unsigned()->nullable();
        }
        $this->integer('lft')->unsigned()->nullable();
        $this->integer('rgt')->unsigned()->nullable();
        $this->integer('depth')->unsigned()->nullable();
    }

    public function defaultActive($active = 0)
    {
        $this->boolean('active')->default($active);
    }

    public function defaultFeatured($featured = 0)
    {
        $this->boolean('featured')->default($featured);
        $this->integer('featured_order')->nullable();
    }

    public function defaultTimeStamps()
    {
        $this->integer('created_user')->nullable();
        $this->timestamp('created_at')->nullable();
        $this->integer('updated_user')->nullable();
        $this->timestamp('updated_at')->nullable();
        $this->integer('deleted_user')->nullable();
    }

    public function defaultSlug()
    {
        $this->text('slug')->nullable();
    }
}
