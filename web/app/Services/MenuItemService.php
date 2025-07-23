<?php

namespace App\Services;

use App\Http\Controllers\Controller;
use App\Repositories\MenuItem\MenuItemRepository;

class MenuItemService extends Controller
{
    private $menuItemRepository;

    /**
     * MenuItemService constructor.
     */
    public function __construct()
    {
        $this->menuItemRepository = new MenuItemRepository();
    }

    public function getMenuTop()
    {
        return $this->menuItemRepository->getMenuTop();
    }

    public function getMenuFooter()
    {
        return $this->menuItemRepository->getMenuFooter();
    }

    public function getMenuLegal()
    {
        return $this->menuItemRepository->getMenuLegal();
    }
}
