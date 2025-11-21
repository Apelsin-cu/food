@echo off
echo Добавление Flutter в PATH...

:: Проверяем, есть ли уже Flutter в PATH
echo %PATH% | findstr /C:"E:\desktop2\flutter\bin" >nul
if %ERRORLEVEL% EQU 0 (
    echo Flutter уже в PATH
) else (
    echo Добавляем Flutter в PATH...
    setx PATH "%PATH%;E:\desktop2\flutter\bin" /M
    echo.
    echo ✅ Flutter добавлен в PATH!
    echo ⚠️  Перезапустите командную строку для применения изменений
)

echo.
echo Для проверки выполните в НОВОЙ командной строке:
echo flutter --version
echo.
pause
