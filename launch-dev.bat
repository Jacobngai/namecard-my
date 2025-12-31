@echo off
REM Launch Development Environment for NameCard.MY
REM This script opens Claude Code and starts the Expo dev server

echo ========================================
echo NameCard.MY Development Environment
echo ========================================
echo.

REM Get the current directory (where this .bat file is located)
set "PROJECT_DIR=%~dp0"
set "MOBILE_DIR=%PROJECT_DIR%NamecardMobile"

echo Project Directory: %PROJECT_DIR%
echo Mobile App Directory: %MOBILE_DIR%
echo.

REM Launch Claude Code in a new window
echo [1/2] Launching Claude Code...
start "Claude Code" cmd /k "cd /d "%PROJECT_DIR%" && claude code"

REM Wait a moment for the first window to open
timeout /t 2 /nobreak >nul

REM Launch Expo dev server in a new window
echo [2/2] Launching Expo Dev Server...
start "Expo Dev Server" cmd /k "cd /d "%MOBILE_DIR%" && npm run start:clear"

echo.
echo ========================================
echo Development environment launched!
echo ========================================
echo.
echo Two windows opened:
echo   1. Claude Code (in project root)
echo   2. Expo Dev Server (in NamecardMobile)
echo.
echo Press any key to close this launcher window...
pause >nul
