<?php

namespace App\Http\Controllers\Admin\Charts\Pies;

use Backpack\CRUD\app\Http\Controllers\ChartController;
use ConsoleTVs\Charts\Classes\Echarts\Chart;
use Spatie\Permission\Models\Role;

class RolesPieController extends ChartController
{
    public function setup()
    {
        $this->chart = new Chart();

        $roles = Role::withCount('users')->get();
        $rolesNames = [];
        $percentages = [];
        $colors = [];

        foreach ($roles as $role) {
            $percentages[] = $role->users_count;
            $rolesNames[] = $role->name;
            $colors[] = getRgbRandomColor();
        }

        $this->chart->dataset('Red', 'pie', $percentages)
            ->color($colors);

        // OPTIONAL
        $this->chart->displayAxes(false);
        $this->chart->displayLegend(true);

        // MANDATORY. Set the labels for the dataset points
        $this->chart->labels($rolesNames);
    }
}
