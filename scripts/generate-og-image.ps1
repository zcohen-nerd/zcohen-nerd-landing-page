# Generates static/img/og-zcohen-nerd.png (1200x630 social share card).
# Zero dependencies — uses Windows GDI+ (System.Drawing). Re-run after any
# copy/token change:  powershell -File scripts/generate-og-image.ps1
# Colors mirror the brand tokens: navy #0a1428→#1b3358, cyan #10b8d8,
# amber #f8c840, subcopy #aebed1.

Add-Type -AssemblyName System.Drawing

$w = 1200
$h = 630
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Navy gradient background (matches the hub hero)
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $rect,
  [System.Drawing.ColorTranslator]::FromHtml('#0a1428'),
  [System.Drawing.ColorTranslator]::FromHtml('#1b3358'),
  35.0)
$g.FillRectangle($bg, $rect)

# Soft cyan glow, top-right (echoes the hero glow)
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowPath.AddEllipse(760, -320, 760, 760)
$glow = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$glow.CenterColor = [System.Drawing.Color]::FromArgb(70, 16, 184, 216)
$glow.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 16, 184, 216))
$g.FillPath($glow, $glowPath)
$glowPath.Dispose()

$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$cyan = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#10b8d8'))
$sub = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#aebed1'))
$faint = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#7f95b3'))
$amber = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#f8c840'))

$margin = 90.0
$fmt = [System.Drawing.StringFormat]::GenericTypographic

# Cyan accent bar
$g.FillRectangle($cyan, [single]$margin, 118, 76, 10)

# Wordmark: "zcohen" white + "-nerd" cyan
$wordFont = New-Object System.Drawing.Font('Segoe UI', 96, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$wordY = 180.0
$g.DrawString('zcohen', $wordFont, $white, [single]$margin, [single]$wordY, $fmt)
$zw = $g.MeasureString('zcohen', $wordFont, [System.Drawing.PointF]::new($margin, $wordY), $fmt).Width
$g.DrawString('-nerd', $wordFont, $cyan, [single]($margin + $zw), [single]$wordY, $fmt)

# Tagline, two lines
$tagFont = New-Object System.Drawing.Font('Segoe UI', 40, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Practical engineering, systems thinking, and modern', $tagFont, $sub, [single]$margin, 340, $fmt)
$g.DrawString(('literacy ' + [char]0x2014 + ' documented in public.'), $tagFont, $sub, [single]$margin, 396, $fmt)

# Bottom line: amber signal dot + workshop attribution
$g.FillEllipse($amber, [single]$margin, 520, 14, 14)
$attrFont = New-Object System.Drawing.Font('Segoe UI', 27, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('The public engineering and education workshop of Zac Cohen.', $attrFont, $faint, [single]($margin + 28), 511, $fmt)

$out = Join-Path $PSScriptRoot '..\static\img\og-zcohen-nerd.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "wrote $out"
