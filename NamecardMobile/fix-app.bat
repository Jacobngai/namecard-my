@echo off
echo ========================================
echo    NAMECARD.MY - Fixing App Issues
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Cleaning node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    echo    - node_modules removed
) else (
    echo    - node_modules already clean
)

echo.
echo Step 2: Removing package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo    - package-lock.json removed
) else (
    echo    - package-lock.json already clean
)

echo.
echo Step 3: Clearing Expo cache...
npx expo start --clear --offline > nul 2>&1
taskkill /F /IM node.exe > nul 2>&1
echo    - Cache cleared

echo.
echo Step 4: Reinstalling dependencies...
npm install --legacy-peer-deps

echo.
echo Step 5: Installing Expo CLI tools...
npm install -g expo-cli@latest eas-cli@latest

echo.
echo ========================================
echo    Fix Complete!
echo ========================================
echo.
echo To start the app, run: npm start
echo Or use: npx expo start
echo.
pause