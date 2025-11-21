@echo off
echo =====================================
echo   FlavorFinder - Исправление PATH
echo =====================================
echo.

echo ВНИМАНИЕ: Этот скрипт должен быть запущен от имени АДМИНИСТРАТОРА!
echo.
echo Нажмите любую клавишу для продолжения или закройте окно для отмены...
pause >nul

echo.
echo Запускаем PowerShell скрипт...
powershell.exe -ExecutionPolicy Bypass -File "FLUTTER_PATH_FIX.ps1"

echo.
echo Готово! Перезапустите командную строку и выполните: flutter --version
pause
