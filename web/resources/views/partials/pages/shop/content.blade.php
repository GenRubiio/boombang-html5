<div class="container-1200">
    <div class="page-shop__content">
        <div class="page-shop__content__left">
            <h1 class="page-shop__content__left-title loading-text">
                {!! $title !!}
            </h1>
            <div class="page-shop__content__left__items">
                @for ($i = 0; $i < 6; $i++)
                    <div class="page-shop__content__left__items__item">
                        <div class="page-shop__content__left__items__item-title">
                            PROTEGE TU INFORMACIÓN PERSONAL
                        </div>
                        <div class="page-shop__content__left__items__item__content">
                            <div class="page-shop__content__left__items__item__content-text">
                                <p>
                                    ¡Nunca sabes quién puede estar al otro lado de la pantalla, así que nunca compartas
                                    tu información personal! Facilitar tus datos personales (nombre, dirección, números
                                    de teléfono, fotos o escuela a la que asistes) podría llevarte a ser timado, acosado
                                    o expuesto a un peligro serio.</p>
                            </div>
                            <div class="page-shop__content__left__items__item__content-image">
                                <img src="https://static.boombang.tv/resources/img/conoce/dj.png?1" alt="shop Image 1">
                            </div>
                        </div>
                    </div>
                    <hr>
                @endfor
            </div>
        </div>
        <div class="page-shop__content__right">

        </div>
    </div>
</div>
