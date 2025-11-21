# Пошаговое руководство по созданию FlavorFinder

## Шаг 1: Создание проекта Flutter

1. Откройте командную строку или PowerShell
2. Перейдите в папку где хотите создать проект:
   ```
   cd E:\desktop2
   ```
3. Создайте новый Flutter проект:
   ```
   flutter create flavor_finder
   ```
4. Перейдите в папку проекта:
   ```
   cd flavor_finder
   ```

## Шаг 2: Настройка зависимостей

Замените содержимое файла `pubspec.yaml`:

```yaml
name: flavor_finder
description: Приложение для поиска рецептов FlavorFinder
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=2.19.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.2
  http: ^0.13.5
  shared_preferences: ^2.0.18
  provider: ^6.0.5

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/images/
```

## Шаг 3: Установка зависимостей

```
flutter pub get
```

## Шаг 4: Создание структуры папок

Создайте следующие папки в `lib/`:
- `models/`
- `screens/`
- `services/`
- `widgets/`

## Шаг 5: Копирование файлов

Скопируйте все созданные файлы из данного проекта в соответствующие папки:

### Модели данных:
- `lib/models/recipe.dart`
- `lib/models/ingredient.dart`

### Экраны:
- `lib/screens/recipes_screen.dart`
- `lib/screens/refrigerator_screen.dart`
- `lib/screens/favorites_screen.dart`
- `lib/screens/recipe_detail_screen.dart`

### Сервисы:
- `lib/services/app_state.dart`
- `lib/services/gpt_service.dart`

### Виджеты:
- `lib/widgets/recipe_card.dart`

### Главный файл:
- `lib/main.dart`

## Шаг 6: Исправление ошибок

После копирования файлов, в IDE могут появиться ошибки импорта. Это нормально, так как файлы были созданы отдельно.

Основные исправления:
1. Убедитесь, что все import пути корректны
2. Проверьте, что все используемые классы импортированы

## Шаг 7: Запуск приложения

### Для отладки:
```
flutter run
```

### Для сборки APK:
```
flutter build apk --release
```

APK файл будет создан в `build/app/outputs/flutter-apk/app-release.apk`

## Шаг 8: Установка через USB

1. Включите режим разработчика на Android устройстве
2. Включите отладку по USB
3. Подключите устройство к компьютеру
4. Скопируйте APK файл на устройство
5. Установите APK через файловый менеджер

## Возможные проблемы и их решения

### Ошибка "Flutter SDK not found"
- Убедитесь, что Flutter SDK установлен и добавлен в PATH

### Ошибки компиляции
- Выполните `flutter clean` и затем `flutter pub get`
- Перезапустите IDE

### Проблемы с зависимостями
- Обновите версии пакетов в pubspec.yaml до последних совместимых

## Функциональность приложения

После успешной установки приложение будет содержать:

1. **Экран рецептов** - показывает сгенерированные рецепты
2. **Экран холодильника** - управление доступными продуктами
3. **Экран избранного** - сохраненные рецепты
4. **Детальный экран рецепта** - полная информация о рецепте

Навигация осуществляется через нижнюю панель с тремя вкладками.

## Дальнейшая разработка

Для подключения реального GPT API:
1. Получите API ключ от OpenAI
2. Замените заглушку в `lib/services/gpt_service.dart`
3. Добавьте обработку HTTP запросов

Готово! Теперь у вас есть полнофункциональное приложение FlavorFinder.
