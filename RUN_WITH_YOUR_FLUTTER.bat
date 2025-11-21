@echo off
color 0A
echo.
echo ================================
echo   FlavorFinder - Запуск проекта
echo ================================
echo.

:: Добавляем Flutter в PATH для этой сессии
set PATH=E:\desktop2\flutter\bin;%PATH%
set FLUTTER_PATH=E:\desktop2\flutter\bin\flutter.bat

echo [1/5] Установка PATH для Flutter...
echo ✅ Flutter временно добавлен в PATH
echo.

echo [2/5] Проверка Flutter...
flutter --version
if %ERRORLEVEL% NEQ 0 (
    echo Пробуем прямой путь...
    "%FLUTTER_PATH%" --version
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

echo [3/5] Проверка устройств...
if defined USE_DIRECT_PATH (
    "%FLUTTER_PATH%" devices
) else (
    flutter devices
)
echo.

echo [4/5] Очистка и установка зависимостей...
if defined USE_DIRECT_PATH (
    "%FLUTTER_PATH%" clean
    "%FLUTTER_PATH%" pub get
) else (
    flutter clean
    flutter pub get
)

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ Ошибка установки зависимостей
    pause
    exit /b 1
)

echo ✅ Зависимости установлены!
echo.

echo [5/5] Запуск приложения...
echo 📱 Убедитесь что телефон подключен или эмулятор запущен
echo.
echo ⚠️  ВНИМАНИЕ: Первый запуск может занять 5-10 минут!
echo 🔄 Gradle загружает зависимости и собирает проект...
echo 💡 НЕ ПРЕРЫВАЙТЕ ПРОЦЕСС, дождитесь завершения!
echo.

if defined USE_DIRECT_PATH (
    "%FLUTTER_PATH%" run
) else (
    flutter run
)

echo.
echo Приложение остановлено.
pause
