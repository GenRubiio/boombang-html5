<?php

namespace App\Facades\Btn;

use Illuminate\Support\Facades\Facade;

class Btn extends Facade
{
    public function a($url, $text = null, $class = null, $id = null, $extras = null)
    {
        return view('facades.btn.a', [
            'url' => url($url),
            'text' => $text ?? $url,
            'class' => $class ?? '',
            'id' => $id ?? '',
            'extras' => $extras ?? '',
        ]);
    }

    public function button($text = 'Button', $type = 'button', $class = null, $id = null, $extras = null)
    {
        return view('facades.btn.button', [
            'type' => $type,
            'text' => $text,
            'class' => $class ?? '',
            'id' => $id ?? '',
            'extras' => $extras,
        ]);
    }
}
