@echo off
color 0A
echo.
echo ========================================
echo   FlavorFinder - Создание APK файла
echo ========================================
echo.

:: Добавляем Flutter в PATH для этой сессии
set PATH=E:\desktop2\flutter\bin;%PATH%
set FLUTTER_PATH=E:\desktop2\flutter\bin\flutter.bat

echo [1/4] Проверка Flutter...
flutter --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Используем прямой путь к Flutter...
    "%FLUTTER_PATH%" --version >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo ❌ FLUTTER НЕ РАБОТАЕТ!
        pause
        exit /b 1
    )
    set USE_DIRECT_PATH=1
)

echo ✅ Flutter работает!
echo.

echo [2/4] Очистка проекта...
if defined USE_DIRECT_PATH (
    "%FLUTTER_PATH%" clean
) else (
    flutter clean
)

echo [3/4] Получение зависимостей...
if defined USE_DIRECT_PATH (
    "%FLUTTER_PATH%" pub get
) else (
    flutter pub get
)

echo ✅ Зависимости получены!
echo.

echo [4/4] Создание APK файла...
echo ⚠️  ВНИМАНИЕ: Сборка может занять 5-15 минут!
echo 🔄 Gradle создает оптимизированную версию приложения...
echo 💡 НЕ ПРЕРЫВАЙТЕ ПРОЦЕСС!
echo.

if defined USE_DIRECT_PATH (
    "%FLUTTER_PATH%" build apk --release
) else (
    flutter build apk --release
)

if %ERRORLEVEL% EQU 0 (
    color 0A
    echo.
    echo 🎉 APK ФАЙЛ СОЗДАН УСПЕШНО!
    echo.
    echo � Местоположение APK:
    echo    build\app\outputs\flutter-apk\app-release.apk
    echo.
    echo 📱 Как установить на телефон:
    echo    1. Скопируйте файл app-release.apk на телефон
    echo    2. Откройте файл на телефоне
    echo    3. Разрешите установку из неизвестных источников
    echo    4. Нажмите "Установить"
    echo.
    echo 💡 Также можно отправить APK через WhatsApp, Telegram или email
    echo.
    
    :: Открываем папку с APK
    start "" "build\app\outputs\flutter-apk\"
    
) else (
    color 0C
    echo.
    echo ❌ ОШИБКА СОЗДАНИЯ APK!
    echo Проверьте логи выше для деталей.
)

echo.
pause
