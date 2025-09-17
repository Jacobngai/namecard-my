@echo off
echo ============================================
echo    Setting up EAS Environment Variables
echo ============================================
echo.
echo This will set up all environment variables for:
echo - Production
echo - Preview
echo - Development
echo.

cd /d "%~dp0"

echo Creating project-scoped environment variables...
echo.

REM Google Vision API Key
echo Setting GOOGLE_VISION_API_KEY...
call eas env:create --scope project --name GOOGLE_VISION_API_KEY --value "YOUR_GOOGLE_VISION_API_KEY_HERE" --environment production --non-interactive
call eas env:create --scope project --name GOOGLE_VISION_API_KEY --value "YOUR_GOOGLE_VISION_API_KEY_HERE" --environment preview --non-interactive
call eas env:create --scope project --name GOOGLE_VISION_API_KEY --value "YOUR_GOOGLE_VISION_API_KEY_HERE" --environment development --non-interactive

REM Supabase URL
echo Setting SUPABASE_URL...
call eas env:create --scope project --name SUPABASE_URL --value "https://wvahortlayplumgrcmvi.supabase.co" --environment production --non-interactive
call eas env:create --scope project --name SUPABASE_URL --value "https://wvahortlayplumgrcmvi.supabase.co" --environment preview --non-interactive
call eas env:create --scope project --name SUPABASE_URL --value "https://wvahortlayplumgrcmvi.supabase.co" --environment development --non-interactive

REM Supabase Anon Key
echo Setting SUPABASE_ANON_KEY...
call eas env:create --scope project --name SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzAxNjIsImV4cCI6MjA3MzMwNjE2Mn0.8PSz3NErD03kFmjm9uxNI4Z4bn52sjecsf6qANEawEg" --environment production --non-interactive
call eas env:create --scope project --name SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzAxNjIsImV4cCI6MjA3MzMwNjE2Mn0.8PSz3NErD03kFmjm9uxNI4Z4bn52sjecsf6qANEawEg" --environment preview --non-interactive
call eas env:create --scope project --name SUPABASE_ANON_KEY --value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzAxNjIsImV4cCI6MjA3MzMwNjE2Mn0.8PSz3NErD03kFmjm9uxNI4Z4bn52sjecsf6qANEawEg" --environment development --non-interactive

REM OpenAI API Key
echo Setting OPENAI_API_KEY...
call eas env:create --scope project --name OPENAI_API_KEY --value "YOUR_OPENAI_API_KEY_HERE" --environment production --non-interactive
call eas env:create --scope project --name OPENAI_API_KEY --value "YOUR_OPENAI_API_KEY_HERE" --environment preview --non-interactive
call eas env:create --scope project --name OPENAI_API_KEY --value "YOUR_OPENAI_API_KEY_HERE" --environment development --non-interactive

REM App Environment
echo Setting APP_ENV...
call eas env:create --scope project --name APP_ENV --value "production" --environment production --non-interactive
call eas env:create --scope project --name APP_ENV --value "preview" --environment preview --non-interactive
call eas env:create --scope project --name APP_ENV --value "development" --environment development --non-interactive

REM Debug Mode
echo Setting DEBUG_MODE...
call eas env:create --scope project --name DEBUG_MODE --value "false" --environment production --non-interactive
call eas env:create --scope project --name DEBUG_MODE --value "true" --environment preview --non-interactive
call eas env:create --scope project --name DEBUG_MODE --value "true" --environment development --non-interactive

echo.
echo ============================================
echo    Environment Variables Set!
echo ============================================
echo.
echo All variables have been configured for:
echo ✅ Production
echo ✅ Preview
echo ✅ Development
echo.
echo To verify, run: eas env:list --environment production
echo.
pause