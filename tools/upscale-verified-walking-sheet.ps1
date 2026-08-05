param(
    [string]$Source = "birthday/sprites/walking-verified/krystal-walk-original.png",
    [string]$Output = "birthday/sprites/walking-verified/krystal-walk-upscaled-2x.png",
    [string]$Live = "birthday/k-walking3.png"
)

Add-Type -AssemblyName System.Drawing

$grid = 4
$cell = 626
$sourceImage = [Drawing.Bitmap]::FromFile((Resolve-Path $Source).Path)
$sheet = New-Object Drawing.Bitmap ($cell * $grid), ($cell * $grid), ([Drawing.Imaging.PixelFormat]::Format32bppArgb)

try {
    $graphics = [Drawing.Graphics]::FromImage($sheet)
    try {
        $graphics.Clear([Drawing.Color]::Transparent)
        $graphics.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $graphics.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half

        for ($row = 0; $row -lt $grid; $row++) {
            $top = [Math]::Floor($row * $sourceImage.Height / $grid)
            $bottom = [Math]::Floor(($row + 1) * $sourceImage.Height / $grid)
            for ($column = 0; $column -lt $grid; $column++) {
                $left = [Math]::Floor($column * $sourceImage.Width / $grid)
                $right = [Math]::Floor(($column + 1) * $sourceImage.Width / $grid)
                $sourceRect = [Drawing.Rectangle]::new($left, $top, $right - $left, $bottom - $top)
                $destination = [Drawing.Rectangle]::new($column * $cell, $row * $cell, $cell, $cell)
                $graphics.DrawImage($sourceImage, $destination, $sourceRect, [Drawing.GraphicsUnit]::Pixel)
            }
        }
    }
    finally { $graphics.Dispose() }

    $directory = Split-Path -Parent $Output
    New-Item -ItemType Directory -Force $directory | Out-Null
    $sheet.Save($Output, [Drawing.Imaging.ImageFormat]::Png)
}
finally { $sheet.Dispose(); $sourceImage.Dispose() }

Copy-Item -LiteralPath $Output -Destination $Live -Force
Write-Output "Upscaled verified 4x4 sheet to 2504x2504 with 626x626 cells."
