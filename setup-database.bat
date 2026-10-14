@echo off
chcp 65001 > nul
echo ========================================================
echo       ParkFlow - Inicializador de Base de Datos MySQL
echo                     XAMPP Server
echo ========================================================
echo.

set MYSQL_BIN=C:\xampp\mysql\bin\mysql.exe
set SQL_FILE=%~dp0database\parkflow.sql

if not exist "%MYSQL_BIN%" (
    echo [ERROR] No se encontro mysql.exe en C:\xampp\mysql\bin\mysql.exe
    echo Verifique que XAMPP este instalado en C:\xampp.
    pause
    exit /b 1
)

if not exist "%SQL_FILE%" (
    echo [ERROR] No se encontro el archivo SQL en %SQL_FILE%
    pause
    exit /b 1
)

echo Conectando a MySQL en localhost:3306 e importando parkflow.sql...
"%MYSQL_BIN%" -u root < "%SQL_FILE%"

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo [EXITO] Base de datos 'parkflow_db' creada e importada correctamente!
    echo Tablas creadas: users, parking_spaces, rates, movements.
    echo ========================================================
) else (
    echo.
    echo [ERROR] Ocurrio un error al ejecutar el script en MySQL.
    echo Asegurese de que el servicio MySQL este iniciado en el XAMPP Control Panel.
)

echo.
pause
