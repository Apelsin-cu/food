# FlavorFinder - Исправление PATH для Flutter
# Запускать от имени Администратора

Write-Host "=====================================`n" -ForegroundColor Green
Write-Host "   FlavorFinder - Настройка Flutter   `n" -ForegroundColor Green  
Write-Host "=====================================" -ForegroundColor Green

$flutterPath = "E:\desktop2\flutter\bin"

# Проверяем существование Flutter
if (!(Test-Path $flutterPath)) {
    Write-Host "❌ Flutter не найден по пути: $flutterPath" -ForegroundColor Red
    Read-Host "Нажмите Enter для выхода"
    exit
}

Write-Host "✅ Flutter найден!" -ForegroundColor Green

# Получаем текущий системный PATH
$currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Проверяем, есть ли уже Flutter в PATH  
if ($currentPath -like "*$flutterPath*") {
    Write-Host "⚠️  Flutter уже в системном PATH" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Добавляем Flutter в системный PATH..." -ForegroundColor Cyan
    
    try {
        # Добавляем Flutter в системный PATH
        $newPath = "$flutterPath;$currentPath"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
        
        Write-Host "✅ Flutter успешно добавлен в системный PATH!" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Убедитесь что PowerShell запущен от имени администратора" -ForegroundColor Yellow
        Read-Host "Нажмите Enter для выхода"
        exit
    }
}

# Также добавляем в PATH текущего пользователя
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$flutterPath*") {
    Write-Host "🔧 Добавляем Flutter в PATH пользователя..." -ForegroundColor Cyan
    $newUserPath = "$flutterPath;$userPath"
    [Environment]::SetEnvironmentVariable("Path", $newUserPath, "User")
    Write-Host "✅ Flutter добавлен в PATH пользователя!" -ForegroundColor Green
}

Write-Host "`n🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "📋 Следующие шаги:" -ForegroundColor Yellow
Write-Host "   1. Перезапустите PowerShell/CMD" -ForegroundColor White
Write-Host "   2. Выполните: flutter --version" -ForegroundColor White  
Write-Host "   3. Запустите: flutter run" -ForegroundColor White

Read-Host "`nНажмите Enter для завершения"
