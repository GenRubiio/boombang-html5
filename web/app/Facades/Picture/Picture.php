<?php

namespace App\Facades\Picture;

use Illuminate\Support\Facades\Facade;

class Picture extends Facade
{
    private $maxWidthDesktop;
    private $maxWidthTablet;
    private $maxWidthMobile;
    private $maxWidthThumbnail;

    public function __construct()
    {
        $this->maxWidthDesktop = config('images.desktop_max_width');
        $this->maxWidthTablet = config('images.tablet_max_width');
        $this->maxWidthMobile = config('images.mobile_max_width');
        $this->maxWidthThumbnail = config('images.thumbnail_max_width');
    }

    public function responsive($alt, $title, $class, $desktop, $tablet = null, $mobile = null, $thumbnail = null)
    {
        $html = "<picture>";
        if (!is_null($thumbnail) && !empty($thumbnail)) {
            $html .= "<source media='(max-width:{$this->maxWidthThumbnail}px)' srcset='" . asset($thumbnail) . "'>";
        }
        if (!is_null($mobile) && !empty($mobile)) {
            $html .= "<source media='(max-width:{$this->maxWidthMobile}px)' srcset='" . asset($mobile) . "'>";
        }
        if (!is_null($tablet) && !empty($tablet)) {
            $html .= "<source media='(max-width:{$this->maxWidthTablet}px)' srcset='" . asset($tablet) . "'>";
        }
        if (!is_null($desktop) && !empty($desktop)) {
            $html .= "<source media='(max-width:{$this->maxWidthDesktop}px)' srcset='" . asset($desktop) . "'>";
        }
        $html .= "<img src='" . asset($desktop) . "' alt='" . $alt . "' title='" . $title . "' class='img-fluid " . $class . "' loading='lazy'>";
        $html .= "</picture>";
        return $html;
    }
}
