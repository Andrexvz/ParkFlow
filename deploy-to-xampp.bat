@echo off
chcp 65001 > nul
echo ========================================================
echo       ParkFlow - Despliegue de Aplicación PHP a XAMPP
echo                 C:\xampp\htdocs\parkflow
echo ========================================================
echo.

set TARGET_DIR=C:\xampp\htdocs\parkflow
set SOURCE_DIR=%~dp0php-app

if not exist "C:\xampp\htdocs" (
    echo [ERROR] No se encontro la carpeta C:\xampp\htdocs.
    echo Asegurese de tener instalado XAMPP.
    pause
    exit /b 1
)

echo Sincronizando archivos de ParkFlow hacia %TARGET_DIR%...
xcopy /E /I /Y "%SOURCE_DIR%\*" "%TARGET_DIR%\" > nul

echo.
echo ========================================================
echo [EXITO] ¡Aplicacion PHP desplegada correctamente en XAMPP!
echo URL de Acceso: http://localhost/parkflow
echo ========================================================
echo.
pause
