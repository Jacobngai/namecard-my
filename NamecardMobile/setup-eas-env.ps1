# EAS Environment Variables Setup Script
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Setting up EAS Environment Variables" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Define environments
$environments = @("production", "preview", "development")

# Define variables
$envVars = @{
    "GOOGLE_VISION_API_KEY" = "YOUR_GOOGLE_VISION_API_KEY_HERE"
    "SUPABASE_URL" = "https://wvahortlayplumgrcmvi.supabase.co"
    "SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YWhvcnRsYXlwbHVtZ3JjbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MzAxNjIsImV4cCI6MjA3MzMwNjE2Mn0.8PSz3NErD03kFmjm9uxNI4Z4bn52sjecsf6qANEawEg"
    "OPENAI_API_KEY" = "YOUR_OPENAI_API_KEY_HERE"
}

# Environment-specific values
$envSpecific = @{
    "APP_ENV" = @{
        "production" = "production"
        "preview" = "preview"
        "development" = "development"
    }
    "DEBUG_MODE" = @{
        "production" = "false"
        "preview" = "true"
        "development" = "true"
    }
}

Write-Host "Setting up environment variables for all profiles..." -ForegroundColor Yellow
Write-Host ""

# Set up regular variables (same for all environments)
foreach ($key in $envVars.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Green
    foreach ($env in $environments) {
        $value = $envVars[$key]
        $cmd = "eas env:create --scope project --name $key --value `"$value`" --environment $env --non-interactive"
        Write-Host "  - $env" -ForegroundColor Gray
        Invoke-Expression $cmd 2>$null
    }
}

# Set up environment-specific variables
foreach ($key in $envSpecific.Keys) {
    Write-Host "Setting $key..." -ForegroundColor Green
    foreach ($env in $environments) {
        $value = $envSpecific[$key][$env]
        $cmd = "eas env:create --scope project --name $key --value `"$value`" --environment $env --non-interactive"
        Write-Host "  - $env = $value" -ForegroundColor Gray
        Invoke-Expression $cmd 2>$null
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   ✅ Environment Variables Set!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Write-Host "All variables configured for:" -ForegroundColor White
Write-Host "  ✅ Production" -ForegroundColor Green
Write-Host "  ✅ Preview" -ForegroundColor Green
Write-Host "  ✅ Development" -ForegroundColor Green
Write-Host ""
Write-Host "To verify your variables, run:" -ForegroundColor Yellow
Write-Host "  eas env:list --environment production" -ForegroundColor Cyan
Write-Host "  eas env:list --environment preview" -ForegroundColor Cyan
Write-Host "  eas env:list --environment development" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")