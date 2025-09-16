#!/usr/bin/env pwsh
# PowerShell script to set EAS environment variables from .env file
# This reads from your local .env file and sets EAS build environment variables

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Setting EAS Environment Variables from .env" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "ERROR: .env file not found!" -ForegroundColor Red
    Write-Host "Please create a .env file from .env.example and add your API keys." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Copy .env.example to .env and replace the placeholder values with your actual API keys." -ForegroundColor Yellow
    exit 1
}

Write-Host "Reading environment variables from .env file..." -ForegroundColor Green
Write-Host ""

# Define environments
$environments = @("production", "preview", "development")

# Read .env file
$envContent = Get-Content ".env"

foreach ($line in $envContent) {
    # Skip empty lines and comments
    if ($line -match '^\s*$' -or $line -match '^#') {
        continue
    }

    # Parse key=value pairs
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $Matches[1].Trim()
        $value = $Matches[2].Trim()

        # Remove quotes if present
        $value = $value -replace '^["'']|["'']$', ''

        if ($key -and $value) {
            Write-Host "Setting $key in EAS..." -ForegroundColor Yellow

            foreach ($env in $environments) {
                try {
                    # Try to create the variable
                    eas env:create --scope project --name $key --value "$value" --environment $env --non-interactive 2>$null
                    if ($LASTEXITCODE -ne 0) {
                        # If it already exists, update it
                        eas env:update --scope project --name $key --value "$value" --environment $env --non-interactive
                    }
                } catch {
                    Write-Host "Warning: Could not set $key for $env environment" -ForegroundColor Yellow
                }
            }
        }
    }
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Environment variables have been set in EAS!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "You can verify with: eas env:list --environment production" -ForegroundColor Cyan
Write-Host ""