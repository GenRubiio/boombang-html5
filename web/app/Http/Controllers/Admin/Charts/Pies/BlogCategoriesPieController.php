<?php

namespace App\Http\Controllers\Admin\Charts\Pies;

use App\Models\BlogCategory;
use Backpack\CRUD\app\Http\Controllers\ChartController;
use ConsoleTVs\Charts\Classes\Chartjs\Chart;

class BlogCategoriesPieController extends ChartController
{
    public function setup()
    {
        $this->chart = new Chart();

        $blogCategories = BlogCategory::active()->get();
        $blogCategoriesNames = [];
        $percentages = [];
        $colors = [];

        foreach ($blogCategories as $blogCategory) {
            $percentages[] = $blogCategory->blogArticles()->count();
            $blogCategoriesNames[] = $blogCategory->name;
            $colors[] = getRgbRandomColor();
        }

        $this->chart->dataset('Red', 'pie', $percentages)
            ->backgroundColor($colors);

        // OPTIONAL
        $this->chart->displayAxes(false);
        $this->chart->displayLegend(true);

        // MANDATORY. Set the labels for the dataset points
        $this->chart->labels($blogCategoriesNames);
    }
}
