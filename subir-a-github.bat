@echo off
chcp 65001 > nul
echo ========================================================
echo          ParkFlow - Sincronizar con GitHub
echo ========================================================
echo.

git status
echo.
echo Agregando archivos al area de preparacion...
git add .

echo Creando commit...
git commit -m "update: actualizacion del proyecto ParkFlow"

echo Enviando cambios a GitHub (git push origin main)...
git push origin main

echo.
echo ========================================================
if %ERRORLEVEL% equ 0 (
    echo [EXITO] Cambios enviados correctamente a GitHub!
) else (
    echo [INFO] Si se abrio una ventana en tu navegador, confirma el inicio de sesion en GitHub.
)
echo ========================================================
echo.
pause
