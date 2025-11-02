@echo off
echo ====================================
echo WhatsCard Logo Asset Generator
echo ====================================
echo.

REM Change to script directory
cd /d "%~dp0"

REM Check if PowerShell script exists
if not exist "replace-logo-assets.ps1" (
    echo ERROR: replace-logo-assets.ps1 not found!
    pause
    exit /b 1
)

REM Run PowerShell script
echo Running PowerShell script to generate logo assets...
echo.

powershell.exe -ExecutionPolicy Bypass -File "replace-logo-assets.ps1"

REM Check if successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Logo assets generated successfully!
) else (
    echo.
    echo ERROR: Logo asset generation failed!
)

echo.
pause
