# Generates the app-icon set for a zcohen-nerd Docusaurus site.
#
#   powershell -ExecutionPolicy Bypass -File scripts/generate-icons.ps1
#
# Emits (relative to the repo root):
#   static/img/icon-512.png      512x512  (web manifest)
#   static/img/icon-192.png      192x192  (web manifest)
#   static/apple-touch-icon.png  180x180  (opaque, iOS home screen)
#
# Pure GDI+ (System.Drawing) — same technique as generate-og-*.ps1, no deps.
# A solid navy tile with a white "ZN" monogram and a cyan underline, matching
# the OG-card visual language. This is metadata only — there is no PWA / service
# worker.

Add-Type -AssemblyName System.Drawing

$navy  = [System.Drawing.Color]::FromArgb(255, 10, 20, 40)    # #0A1428
$white = [System.Drawing.Color]::FromArgb(255, 244, 247, 250) # #F4F7FA
$cyan  = [System.Drawing.Color]::FromArgb(255, 16, 184, 216)  # #10B8D8

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'
  $g.InterpolationMode = 'HighQualityBicubic'

  $g.Clear($navy)

  # "ZN" monogram, centred, sized to the tile.
  $fontSize = [int]($size * 0.42)
  $font = New-Object System.Drawing.Font('Segoe UI Semibold', $fontSize, `
      [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'
  $fmt.LineAlignment = 'Center'
  $rect = New-Object System.Drawing.RectangleF(0, [single](-$size * 0.04), $size, $size)
  $wb = New-Object System.Drawing.SolidBrush($white)
  $g.DrawString('ZN', $font, $wb, $rect, $fmt)

  # Cyan underline accent.
  $barW = [int]($size * 0.34)
  $barH = [math]::Max(2, [int]($size * 0.045))
  $barX = [int](($size - $barW) / 2)
  $barY = [int]($size * 0.70)
  $cb = New-Object System.Drawing.SolidBrush($cyan)
  $g.FillRectangle($cb, $barX, $barY, $barW, $barH)

  $dir = Split-Path -Parent $path
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose(); $bmp.Dispose(); $font.Dispose(); $wb.Dispose(); $cb.Dispose()
  Write-Host "  wrote $path ($size x $size)"
}

$root = Split-Path -Parent $PSScriptRoot
New-Icon 512 (Join-Path $root 'static/img/icon-512.png')
New-Icon 192 (Join-Path $root 'static/img/icon-192.png')
New-Icon 180 (Join-Path $root 'static/apple-touch-icon.png')
Write-Host "done."
