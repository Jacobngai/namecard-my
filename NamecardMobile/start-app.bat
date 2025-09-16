@echo off
echo ========================================
echo    NAMECARD.MY - Starting App
echo ========================================
echo.

cd /d "%~dp0"

echo Clearing Metro cache...
npx expo start --clear

pause