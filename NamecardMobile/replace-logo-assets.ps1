# WhatsCard Logo Asset Replacement Script
# This script resizes the WhatsCard logo to all required sizes

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "WhatsCard Logo Asset Generator" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Define paths
$sourceLogo = "whatscard logo green background.png"
$assetsDir = "assets"

# Check if source logo exists
if (-not (Test-Path $sourceLogo)) {
    Write-Host "ERROR: Source logo not found: $sourceLogo" -ForegroundColor Red
    Write-Host "Please ensure the logo file is in the NamecardMobile directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Found source logo: $sourceLogo" -ForegroundColor Green
Write-Host ""

# Load System.Drawing assembly
Add-Type -AssemblyName System.Drawing

# Function to resize image
function Resize-Image {
    param(
        [string]$InputPath,
        [string]$OutputPath,
        [int]$Width,
        [int]$Height
    )

    try {
        # Load the source image
        $srcImage = [System.Drawing.Image]::FromFile($InputPath)

        # Create a new bitmap with the desired size
        $destImage = New-Object System.Drawing.Bitmap($Width, $Height)

        # Draw the source image onto the destination image with high quality
        $graphics = [System.Drawing.Graphics]::FromImage($destImage)
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)

        # Save the result
        $destImage.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

        # Clean up
        $graphics.Dispose()
        $destImage.Dispose()
        $srcImage.Dispose()

        return $true
    }
    catch {
        Write-Host "ERROR resizing to ${Width}x${Height}: $_" -ForegroundColor Red
        return $false
    }
}

# Create output directories if they don't exist
$directories = @(
    "$assetsDir\icon",
    "$assetsDir\splash"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

Write-Host "Starting logo asset generation..." -ForegroundColor Cyan
Write-Host ""

# Define assets to create
$assets = @(
    @{Name="App Icon (icon.png)"; Path="$assetsDir\icon\icon.png"; Width=1024; Height=1024},
    @{Name="Adaptive Icon"; Path="$assetsDir\adaptive-icon.png"; Width=1024; Height=1024},
    @{Name="Root Icon"; Path="$assetsDir\icon.png"; Width=1024; Height=1024},
    @{Name="Favicon"; Path="$assetsDir\favicon.png"; Width=48; Height=48},
    @{Name="Splash Icon"; Path="$assetsDir\splash-icon.png"; Width=512; Height=512}
)

# Generate each asset
$successCount = 0
$totalCount = $assets.Count

foreach ($asset in $assets) {
    Write-Host "Generating: $($asset.Name) ($($asset.Width)x$($asset.Height))..." -NoNewline

    $fullSourcePath = Resolve-Path $sourceLogo
    $success = Resize-Image -InputPath $fullSourcePath -OutputPath $asset.Path -Width $asset.Width -Height $asset.Height

    if ($success) {
        Write-Host " [OK]" -ForegroundColor Green
        $successCount++
    }
    else {
        Write-Host " [FAILED]" -ForegroundColor Red
    }
}

Write-Host ""

# Create splash screen with centered logo
Write-Host "Creating splash screen (1284x2778)..." -NoNewline

try {
    # Splash screen dimensions
    $splashWidth = 1284
    $splashHeight = 2778
    $backgroundColor = [System.Drawing.Color]::FromArgb(74, 122, 92) # #4A7A5C

    # Create splash background
    $splash = New-Object System.Drawing.Bitmap($splashWidth, $splashHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($splash)

    # Fill with background color
    $brush = New-Object System.Drawing.SolidBrush($backgroundColor)
    $graphics.FillRectangle($brush, 0, 0, $splashWidth, $splashHeight)

    # Load and center the logo (512x512 on splash)
    $logoSize = 512
    $logoPath = Resolve-Path $sourceLogo
    $logo = [System.Drawing.Image]::FromFile($logoPath)

    $logoX = ($splashWidth - $logoSize) / 2
    $logoY = ($splashHeight - $logoSize) / 2

    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($logo, $logoX, $logoY, $logoSize, $logoSize)

    # Save splash screen
    $splashPath = "$assetsDir\splash\splash.png"
    $splash.Save($splashPath, [System.Drawing.Imaging.ImageFormat]::Png)

    # Clean up
    $brush.Dispose()
    $graphics.Dispose()
    $logo.Dispose()
    $splash.Dispose()

    Write-Host " [OK]" -ForegroundColor Green
    $successCount++
    $totalCount++
}
catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Host "ERROR: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Asset Generation Complete!" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Success: $successCount / $totalCount assets generated" -ForegroundColor Green
Write-Host ""

if ($successCount -eq $totalCount) {
    Write-Host "All logo assets have been successfully created!" -ForegroundColor Green
    Write-Host "You can now proceed with building the app." -ForegroundColor Green
}
else {
    Write-Host "Some assets failed to generate." -ForegroundColor Yellow
    Write-Host "Please check the errors above and try again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Generated assets:" -ForegroundColor Cyan
Get-ChildItem -Path $assetsDir -Recurse -Include *.png |
    Where-Object { $_.Name -match "(icon|splash|favicon|adaptive)" } |
    ForEach-Object {
        $size = [System.Drawing.Image]::FromFile($_.FullName)
        Write-Host "  $($_.FullName) - $($size.Width)x$($size.Height)" -ForegroundColor White
        $size.Dispose()
    }

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
