@echo off
color 0B
echo.
echo ==========================================
echo   FlavorFinder - Отправка APK на телефон
echo ==========================================
echo.

set APK_PATH=build\app\outputs\flutter-apk\app-release.apk

:: Проверяем существование APK файла
if not exist "%APK_PATH%" (
    color 0C
    echo ❌ APK файл не найден!
    echo.
    echo Сначала создайте APK:
    echo   1. Запустите BUILD_APK.bat
    echo   2. Дождитесь завершения сборки
    echo   3. Повторите попытку
    echo.
    pause
    exit /b 1
)

echo ✅ APK файл найден!
echo 📁 Путь: %APK_PATH%
echo.

:: Получаем размер файла
for %%A in ("%APK_PATH%") do set APK_SIZE=%%~zA
set /a APK_SIZE_MB=%APK_SIZE%/1024/1024
echo 📊 Размер APK: %APK_SIZE_MB% МБ
echo.

echo 📱 СПОСОБЫ ОТПРАВКИ НА ТЕЛЕФОН:
echo.
echo [1] 🔌 USB - Скопировать через кабель
echo [2] 📧 Email - Отправить по почте
echo [3] 💬 WhatsApp/Telegram - Через мессенджер  
echo [4] ☁️  Облако - Google Drive, Яндекс.Диск
echo [5] 📂 Открыть папку с APK
echo [0] ❌ Выход
echo.

set /p choice="Выберите способ (1-5): "

if "%choice%"=="1" goto usb
if "%choice%"=="2" goto email
if "%choice%"=="3" goto messenger
if "%choice%"=="4" goto cloud
if "%choice%"=="5" goto open_folder
if "%choice%"=="0" goto exit
goto invalid

:usb
echo.
echo 🔌 USB ПОДКЛЮЧЕНИЕ:
echo 1. Подключите телефон к компьютеру через USB
echo 2. Разрешите доступ к файлам на телефоне
echo 3. Скопируйте APK в папку Downloads на телефоне
echo.
echo Открываю папку с APK...
start "" "build\app\outputs\flutter-apk\"
echo.
echo 💡 Перетащите app-release.apk в папку Downloads телефона
goto end

:email
echo.
echo 📧 ОТПРАВКА ПО EMAIL:
echo 1. Откройте вашу почту (Gmail, Яндекс, Mail.ru)
echo 2. Создайте новое письмо самому себе
echo 3. Прикрепите файл app-release.apk
echo 4. Отправьте письмо
echo 5. На телефоне откройте письмо и скачайте APK
echo.
start "" "build\app\outputs\flutter-apk\"
goto end

:messenger
echo.
echo 💬 МЕССЕНДЖЕРЫ:
echo.
echo WhatsApp:
echo 1. Откройте WhatsApp Web или приложение
echo 2. Отправьте APK файл самому себе или в любой чат
echo 3. На телефоне скачайте файл из чата
echo.
echo Telegram:
echo 1. Откройте Telegram
echo 2. Найдите "Избранное" (Saved Messages)
echo 3. Отправьте APK файл в избранное
echo 4. На телефоне скачайте из избранного
echo.
start "" "build\app\outputs\flutter-apk\"
goto end

:cloud
echo.
echo ☁️  ОБЛАЧНОЕ ХРАНИЛИЩЕ:
echo.
echo Google Drive:
echo 1. drive.google.com → Загрузить файл
echo 2. На телефоне: Google Drive → Скачать APK
echo.
echo Яндекс.Диск:
echo 1. disk.yandex.ru → Загрузить
echo 2. На телефоне: Яндекс.Диск → Скачать APK
echo.
start "" "build\app\outputs\flutter-apk\"
goto end

:open_folder
echo.
echo 📂 Открываю папку с APK файлом...
start "" "build\app\outputs\flutter-apk\"
goto end

:invalid
echo.
color 0C
echo ❌ Неверный выбор! Попробуйте снова.
goto end

:end
echo.
echo 📱 УСТАНОВКА НА ТЕЛЕФОНЕ:
echo 1. Найдите app-release.apk в Downloads
echo 2. Нажмите на файл
echo 3. Разрешите установку из неизвестных источников  
echo 4. Нажмите "Установить"
echo 5. Наслаждайтесь приложением! 🎉
echo.

:exit
pause
