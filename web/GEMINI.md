
# Proyecto Laravel

El proyecto está desarrollado en **Laravel** y utiliza componentes **Blade** para el frontend. Para los estilos se utiliza **SASS** y para la lógica en cliente se emplea **JavaScript puro**.

---

## Arquitectura

La arquitectura del proyecto es **hexagonal**, aunque solo se aplican los conceptos de **services** y **repositories**. No se implementa el concepto de **dominio**.

- Los **services** se ubican en la carpeta `app/Services` y siguen la convención de nombres, por ejemplo: `UserService`.
- Los **repositories** se ubican en `app/Repositories`, también siguiendo una estructura de nombres como `UserRepository`.

Dentro de `app/Repositories` se crea una **carpeta por cada repositorio**, por ejemplo `UserRepository`, y dentro de ella se colocan:

- `UserRepository.php`
- `UserRepositoryInterface.php`

En caso de tener que crear toda una estructura para una tabla, normalmente utilizamos comandos artisan:

```bash
php artisan backpack:crud User
```

```bash
php artisan make:resource UserResource
```

```bash
php artisan make:service UserService
```

```bash
php artisan make:repository UserRepository
```

Esto permite generar automáticamente los archivos necesarios y mantener una estructura coherente.

---

## Migrations
Es importante lanzar la creación de las migraciones con el comando:

```bash
php artisan make:migration create_{tableName}_table
``` 

- No se utilizan campos de tipo `json` en las migraciones, utilizamos `longText` para almacenar datos JSON.

---

## Estructura de Vistas Blade

- Dentro de `resources/views` encontramos las carpetas `pages` y `partials`.
- Cada página (page) suele tener su propia carpeta, aunque hay excepciones.
- Por ejemplo, la vista de inicio `home.blade.php` se encuentra en:
  ```
  resources/views/pages/home/home.blade.php
  ```

### Convención HTML

Cada página contiene una estructura similar:

```html
<div class="container-fluid" id="page-{pageName}">
    <div class="page-{pageName}">
        ...
    </div>
</div>
```

### Partials

Una página puede incluir componentes reutilizables que denominamos **partials**.

- Estos se encuentran en: `resources/views/partials/{pageName}`.

---

## Estilos (SASS)

- Los estilos de las páginas se ubican en: `resources/sass/pages/{pageName}.scss`.
- Los estilos de los partials están en: `resources/sass/partials/{pageName}.scss`.
- Estos estilos se importan dentro de los archivos:
  - `resources/sass/pages/index.scss`
  - `resources/sass/partials/index.scss`

### Convención SCSS

Cada archivo `.scss` de una página comienza así:

```scss
#page-{pageName} {
    .page-{pageName} {
        // estilos aquí
    }
}
```

---

## JavaScript

- Para el JavaScript de cada página se crea un archivo dentro de `resources/js/pages` llamado `{pageName}Controller.js`.
- Luego, este archivo se importa dentro del archivo central: `resources/js/ViewHandler.js`.

---

## Backpack (Panel de Administración)

El proyecto utiliza **Backpack for Laravel** como sistema de administración.

- Cada CRUD debe seguir una estructura. Quiero que el nuevo archivo generado se base completamente en otro archivo existente, utilizando su misma estructura y estilo de escritura, ya que hay diferentes formas de hacer las cosas y quiero mantener coherencia con ese enfoque.:  
  `app/Http/Controllers/Admin/CookieCrudController.php`

### Filtros y Campos en CRUD

Cuando un CRUD necesita filtros o tiene datos divididos en pestañas (tabs):

- Se crea una carpeta dentro de `app/Http/Controllers/Admin/` con la nomenclatura `{ModelName}Crud`.
- Dentro de ella, se crean carpetas `Filters` y `Fields` donde se colocan los archivos de lógica.

Ejemplo:

- Para un filtro de estado activo (`active`) en usuarios, se crea:  
  `app/Http/Controllers/Admin/UserCrud/Filters/UserCrudActiveFilter.php`

Estos archivos son **Traits** y deben ser importados en el controlador correspondiente, por ejemplo:

```php
use UserCrudActiveFilter;
```

---

## API

> ⚠️ El proyecto será considerado una **API** si en el archivo `routes/api.php` existe la siguiente línea:

```php
Route::middleware('auth:sanctum')
```

Si no aparece, se trata de una API sin autenticación mediante Sanctum.

### Controladores de API

- Se crean dentro de `app/Http/Controllers/Api`.
- La convención de nombres es: `{ControllerName}ApiController.php`.
- Las rutas de API se definen en `routes/api.php`.

---

## Controladores de Frontend

Cada página tiene su propia clase controladora en:  
`app/Http/Controllers/Front`

Ejemplo:

- `BlogArticleFrontController.php`

### Flujo

1. El usuario accede a una ruta.
2. Esta pasa por el archivo `PageFrontController.php`.
3. Dependiendo de la ruta, este llama a los controladores `FrontController` correspondientes.
4. Se obtiene la información que se enviará a la vista Blade.

---

## Reglas Generales

Cada vez que se crea una nueva entidad, también se deben crear:

- Su correspondiente **Resource**
- Su **Service**
- Su **Repository**
- Su controlador de **Admin**
- Su controlador de **Front**
