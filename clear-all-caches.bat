@echo off
echo ========================================
echo  Clearing ALL Caches for AGHoliday
echo ========================================
echo.

echo [1/5] Clearing application cache...
php artisan cache:clear

echo [2/5] Clearing config cache...
php artisan config:clear

echo [3/5] Clearing route cache...
php artisan route:clear

echo [4/5] Clearing view cache...
php artisan view:clear

echo [5/5] Clearing compiled classes...
php artisan clear-compiled

echo.
echo ========================================
echo  ALL CACHES CLEARED SUCCESSFULLY!
echo ========================================
echo.
echo Next steps:
echo 1. Rebuild frontend: npm run build
echo 2. Refresh browser with Ctrl+Shift+R
echo.
pause
