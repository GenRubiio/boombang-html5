<?php

namespace App\Helpers;

use App\Services\MenuItemService;

class MenuHelper
{
    public static function getMenuTop()
    {
        return (new MenuItemService())->getMenuTop();
    }

    public static function getMenuFooter()
    {
        return (new MenuItemService())->getMenuFooter();
    }

    public static function getMenuFooterLegal()
    {
        return (new MenuItemService())->getMenuLegal();
    }
}
