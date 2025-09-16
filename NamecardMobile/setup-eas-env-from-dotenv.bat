@echo off
REM Script to set EAS environment variables from .env file
REM This reads from your local .env file and sets EAS build environment variables

echo.
echo ================================================
echo Setting EAS Environment Variables from .env
echo ================================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create a .env file from .env.example and add your API keys.
    echo.
    echo Copy .env.example to .env and replace the placeholder values with your actual API keys.
    exit /b 1
)

echo Reading environment variables from .env file...
echo.

REM Read .env file and set environment variables for EAS
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    REM Skip comments and empty lines
    echo %%a | findstr /r "^#" >nul
    if errorlevel 1 (
        if not "%%a"=="" (
            if not "%%b"=="" (
                echo Setting %%a in EAS...

                REM Set for all environments
                call eas env:create --scope project --name %%a --value "%%b" --environment production --non-interactive 2>nul || call eas env:update --scope project --name %%a --value "%%b" --environment production --non-interactive
                call eas env:create --scope project --name %%a --value "%%b" --environment preview --non-interactive 2>nul || call eas env:update --scope project --name %%a --value "%%b" --environment preview --non-interactive
                call eas env:create --scope project --name %%a --value "%%b" --environment development --non-interactive 2>nul || call eas env:update --scope project --name %%a --value "%%b" --environment development --non-interactive
            )
        )
    )
)

echo.
echo ================================================
echo Environment variables have been set in EAS!
echo ================================================
echo.
echo You can verify with: eas env:list --environment production
echo.
pause