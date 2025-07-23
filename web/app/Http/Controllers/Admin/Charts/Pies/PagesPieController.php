<?php

namespace App\Http\Controllers\Admin\Charts\Pies;

use App\Models\Page;
use Backpack\CRUD\app\Http\Controllers\ChartController;
use ConsoleTVs\Charts\Classes\Highcharts\Chart;

class PagesPieController extends ChartController
{
    public function setup()
    {
        $this->chart = new Chart();

        $pages = Page::active()->get();
        $pagesNames = [];
        $percentages = [];
        $colors = [];

        foreach ($pages as $page) {
            $percentages[] = $page->count();
            $pagesNames[] = $page->title;
            $colors[] = getRgbRandomColor();
        }

        $this->chart->dataset('Red', 'pie', $percentages)
            ->color($colors);

        // OPTIONAL
        $this->chart->displayAxes(false);
        $this->chart->displayLegend(true);

        // MANDATORY. Set the labels for the dataset points
        $this->chart->labels($pagesNames);
    }
}
