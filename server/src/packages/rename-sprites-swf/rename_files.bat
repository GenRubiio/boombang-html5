@echo off
setlocal enabledelayedexpansion

:inicio
cls
echo ***************************************
echo * RENOMBRADOR DE CARPETAS INTERACTIVO *
echo ***************************************
echo.
set "ruta="
set /p "ruta=Introduce la ruta completa de la carpeta padre: "
set "ruta=%ruta:"=%"

if not exist "%ruta%\" (
    echo.
    echo ERROR: Ruta invalida
    timeout /t 2 /nobreak >nul
    goto inicio
)

echo.
echo Eliminando carpetas que contengan "DefineSprite_" con un solo guion bajo...
:: Recorre todas las carpetas que empiecen por DefineSprite_
for /f "delims=" %%D in ('dir /b /ad "%ruta%\DefineSprite_*" 2^>nul') do (
    :: Busca un segundo guion bajo con findstr /r "_.*_"
    echo %%D | findstr /r "_.*_" >nul
    if errorlevel 1 (
        echo Carpeta eliminada: %%D
        rd /s /q "%ruta%\%%D"
    )
)

echo.
echo Carpetas encontradas en: %ruta%
echo.

set "contador=0"

:: Bucle de renombrado interactivo
for /f "delims=" %%D in ('dir /b /ad "%ruta%"') do (
    set "original=%%D"
    set "nuevo="
    
    :: Separa por el primer guion bajo: tokens=1,2,* delims=_
    for /f "tokens=1,2,* delims=_" %%a in ("%%D") do set "nuevo=%%c"
    
    if defined nuevo (
        echo.
        echo Carpeta original: %%D
        echo Nuevo nombre propuesto: !nuevo!
        ren "%ruta%\%%D" "!nuevo!" && set /a "contador+=1"
    )
)

echo.
echo Operacion finalizada. Carpetas modificadas: %contador%
pause
