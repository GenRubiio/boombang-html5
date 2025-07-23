<?php

namespace App\Facades\BgImageResponsive;

use Illuminate\Support\Facades\Facade;

class BgImageResponsive extends Facade
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

    public function headerSlider($class, $desktop, $tablet = null, $mobile = null, $thumbnail = null)
    {
        $css = ".{$class}{
            background-image: url(" . asset($desktop) . ");
        }";
        if (!is_null($tablet) && !empty($tablet)) {
            $css .= "@media (max-width: {$this->maxWidthTablet}px) {
                .{$class}{
                    background-image: url(" . asset($tablet) . ");
                }
            }";
        }
        if (!is_null($mobile) && !empty($mobile)) {
            $css .= "@media (max-width: {$this->maxWidthMobile}px) {
                .{$class}{
                    background-image: url(" . asset($mobile) . ");
                }
            }";
        }
        if (!is_null($thumbnail) && !empty($thumbnail)) {
            $css .= "@media (max-width: {$this->maxWidthThumbnail}px) {
                .{$class}{
                    background-image: url(" . asset($thumbnail) . ");
                }
            }";
        }

        return $css;
    }
}
