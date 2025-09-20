# This script packages the Media Inverter browser extension into a zip file for distribution.
# It should be run from the root directory of the repository (no arguments needed).

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Define the repository root directory. Assumes script is run from the repository root.
$repoDir = Resolve-Path "."

# Define product name and files to include in the package
$ProductName = "MediaInverter"
$PackageItems = `
@(
    "icons",
    "background.js",
    "content.js",
    "manifest.json",
    "CHANGELOG.md",
    "LICENSE",
    "PRIVACY.md",
    "README.md"
)

# Helper function to get the contents of a zip file
function Get-ZipFileContents
{
    [CmdletBinding()]
    [OutputType([System.IO.Compression.ZipArchiveEntry])]
    param
    (
        [Parameter(Mandatory = $true, Position = 0)]
        [ValidateNotNullOrEmpty()]
        [ValidateScript({ Test-Path $_ -PathType Leaf })]
        [string]$Path
    )

    try
    {
        if (-not ([System.Reflection.Assembly]::Load("System.IO.Compression.FileSystem")))
        {
            throw "Could not load the System.IO.Compression.FileSystem assembly. Is .NET Framework 4.5 or later installed?"
        }
        
        $fullPath = Resolve-Path -Path $Path -ErrorAction Stop
        $zip = [System.IO.Compression.ZipFile]::OpenRead($fullPath)
        Write-Output $zip.Entries
    }
    catch
    {
        Write-Error "Failed to open zip file: $_"
    }
    finally
    {
        if ($zip)
        {
            $zip.Dispose()
        }
    }
}

# Create distribution directory
$distDir = Join-Path -Path $repoDir -ChildPath "dist"
New-Item -ItemType Directory -Path $distDir -Force | Out-Null

# Create zip filename with version from manifest
$manifestPath = Join-Path -Path $repoDir -ChildPath "manifest.json"
$manifest = Get-Content -Path $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version
$zipName = "$ProductName-v$version.zip"
$zipPath = Join-Path -Path $distDir -ChildPath $zipName

# Remove existing zip if it exists
if (Test-Path -Path $zipPath)
{
    Remove-Item -Path $zipPath -Force
}

# Create a temporary directory for packaging
$tempDir = Join-Path -Path $env:TEMP -ChildPath "$ProductName-$(Get-Date -Format 'yyyyMMddHHmmss')"
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null
    
# Copy files to temporary directory, maintaining directory structure
Write-Host "Copying files to temporary directory: $tempDir"
foreach ($item in $PackageItems)
{
    if (Test-Path -Path $item)
    {
        Copy-Item -Path $item -Destination $tempDir -Recurse -Force
        Write-Host "- Copied: $item"
    }
    else
    {
        Write-Warning "File or directory not found: $item"
    }
}

# Create zip file from temporary directory
Write-Host "`nCreating zip file: $zipPath"
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Clean up temporary directory
Write-Host "`nRemoving temporary directory: $tempDir"
Remove-Item -Path $tempDir -Recurse -Force

# List files in the zip for verification
Write-Host "`nCreated package: $zipPath"
Write-Host "`nPackage contents:"
Get-ZipFileContents -Path $zipPath | Format-Table -Property LastWriteTime,Length,FullName -AutoSize
