# Icon Generation Instructions

This folder contains the SVG source and generated PNG icons for the MediaInverter extension.

## How to Regenerate PNG Icons

If you modify `icon.svg`, you should regenerate the PNG files to ensure all icon sizes are up to date.

### 1. Install resvg (if not already installed)

On Windows, you can install resvg using [Scoop](https://scoop.sh/):

```powershell
scoop install main/resvg
```

### 2. Generate PNGs from SVG

Run the following commands in this directory:

```powershell
resvg icon.svg -w 16 -h 16 icon16.png
resvg icon.svg -w 32 -h 32 icon32.png
resvg icon.svg -w 48 -h 48 icon48.png
resvg icon.svg -w 128 -h 128 icon128.png
```

This will create or update the PNG files for all required icon sizes.
