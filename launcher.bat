@echo off
setlocal EnableExtensions

:: Directorio raíz del proyecto (asume que el .bat está en la raíz)
set ROOT=%~dp0

:MAIN_MENU
cls
echo ==============================
echo   BOOMBANG-HTML5 LAUNCHER
echo ==============================
echo.
echo 1) Iniciar todos los servicios
echo 2) Reiniciar servidor (node index.js)
echo 3) Reiniciar cliente (npm run dev)
echo 4) Reiniciar API (php artisan serve)
echo 5) Salir
echo.
set /p choice=Elige una opcion [1-5]:

if "%choice%"=="1" goto START_ALL
if "%choice%"=="2" goto RESTART_SERVER
if "%choice%"=="3" goto RESTART_CLIENT
if "%choice%"=="4" goto RESTART_API
if "%choice%"=="5" goto EOF

goto MAIN_MENU


:START_ALL
call :START_SERVER
call :START_CLIENT
call :START_API
pause
goto MAIN_MENU


:RESTART_SERVER
call :KILL_SERVER
call :START_SERVER
pause
goto MAIN_MENU

:RESTART_CLIENT
call :KILL_CLIENT
call :START_CLIENT
pause
goto MAIN_MENU

:RESTART_API
call :KILL_API
call :START_API
pause
goto MAIN_MENU


::––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
:: Funciones de arrancar
:START_SERVER
echo Iniciando servidor...
start "server" cmd /k "cd /d "%ROOT%server" && node index.js"
goto :eof

:START_CLIENT
echo Iniciando cliente...
start "client" cmd /k "cd /d "%ROOT%client" && npm run dev"
goto :eof

:START_API
echo Iniciando API...
start "api" cmd /k "cd /d "%ROOT%api" && php artisan serve"
goto :eof


::––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
:: Funciones de parar/reiniciar
:KILL_SERVER
echo Deteniendo servidor...
taskkill /FI "WINDOWTITLE eq server" /T /F >nul 2>&1
goto :eof

:KILL_CLIENT
echo Deteniendo cliente...
taskkill /FI "WINDOWTITLE eq client" /T /F >nul 2>&1
goto :eof

:KILL_API
echo Deteniendo API...
taskkill /FI "WINDOWTITLE eq api" /T /F >nul 2>&1
goto :eof
