<?php

namespace App\Enums;

use App\Traits\EnumTrait;

enum SocialNetworksEnum: string
{
    use EnumTrait;

    case facebook = 'Facebook';
    case instagram = 'Instagram';
    case twitter = 'Twitter';
    case tik_tok = 'TikTok';
    case youtube = 'Youtube';
    case linkedin = 'Linkedin';
    case whatsapp = 'Whatsapp';
    case telegram = 'Telegram';

    public static function getIcon($key)
    {
        return match ($key) {
            self::facebook->name => injectSvg(public_path('images/icons/rrss/facebook.svg')),
            self::instagram->name => injectSvg(public_path('images/icons/rrss/instagram.svg')),
            self::twitter->name => injectSvg(public_path('images/icons/rrss/twitter.svg')),
            self::tik_tok->name => injectSvg(public_path('images/icons/rrss/tik-tok.svg')),
            self::youtube->name => injectSvg(public_path('images/icons/rrss/youtube.svg')),
            self::linkedin->name => injectSvg(public_path('images/icons/rrss/linkedin.svg')),
            self::whatsapp->name => injectSvg(public_path('images/icons/rrss/whatsapp.svg')),
            self::telegram->name => injectSvg(public_path('images/icons/rrss/telegram.svg')),
        };
    }
}
