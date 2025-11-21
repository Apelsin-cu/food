@echo off
color 0A
echo.
echo =====================================
echo   FlavorFinder - Сборка APK
echo =====================================
echo.

set FLUTTER_PATH=E:\desktop2\flutter\bin\flutter.bat

echo [1/4] Проверка Flutter...
"%FLUTTER_PATH%" --version
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ FLUTTER НЕ РАБОТАЕТ!
    pause
    exit /b 1
)

echo.
echo [2/4] Очистка проекта...
"%FLUTTER_PATH%" clean

echo.
echo [3/4] Установка зависимостей...
"%FLUTTER_PATH%" pub get

echo.
echo [4/4] Сборка APK (это займет несколько минут)...
"%FLUTTER_PATH%" build apk --release

if %ERRORLEVEL% EQU 0 (
    echo.
    color 0B
    echo ✅ APK СОЗДАН УСПЕШНО!
    echo.
    echo 📍 Файл: build\app\outputs\flutter-apk\app-release.apk
    echo 📱 Скопируйте этот файл на телефон и установите
    echo.
    echo Открываем папку с APK...
    if exist "build\app\outputs\flutter-apk\" (
        explorer "build\app\outputs\flutter-apk\"
    )
) else (
    color 0C
    echo ❌ ОШИБКА ПРИ СБОРКЕ APK
)

echo.
pause
