param(
    [string]$InputDirectory = "birthday/sprites/clapping"
)

Add-Type -AssemblyName System.Drawing

$cellWidth = 64
$cellHeight = 96
$frameCount = 4
$targetBottom = 93
$maxWidth = 60
$maxHeight = 90

function Is-ChromaPixel([System.Drawing.Color]$color) {
    return $color.R -ge 205 -and $color.B -ge 175 -and $color.G -le 125
}

function Get-FrameBounds([System.Drawing.Bitmap]$bitmap, [int]$left, [int]$width) {
    $minX = $width
    $minY = $bitmap.Height
    $maxX = -1
    $maxY = -1

    for ($y = 0; $y -lt $bitmap.Height; $y++) {
        for ($x = 0; $x -lt $width; $x++) {
            $color = $bitmap.GetPixel($left + $x, $y)
            if (-not (Is-ChromaPixel $color)) {
                $minX = [Math]::Min($minX, $x)
                $minY = [Math]::Min($minY, $y)
                $maxX = [Math]::Max($maxX, $x)
                $maxY = [Math]::Max($maxY, $y)
            }
        }
    }

    if ($maxX -lt 0) { throw "No sprite pixels found in frame." }
    return [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
}

Get-ChildItem -LiteralPath $InputDirectory -Filter "*-clap-source.png" | ForEach-Object {
    $outputName = $_.Name -replace "-source\.png$", ".png"
    $outputPath = Join-Path $_.DirectoryName $outputName
    if (Test-Path -LiteralPath $outputPath) {
        Write-Output "$outputName already normalized; skipping"
        return
    }
    $source = [System.Drawing.Bitmap]::FromFile($_.FullName)
    try {
        $frameLefts = @()
        $frameWidths = @()
        for ($frame = 0; $frame -lt $frameCount; $frame++) {
            $left = [int][Math]::Floor($frame * $source.Width / $frameCount)
            $right = [int][Math]::Floor(($frame + 1) * $source.Width / $frameCount)
            $frameLefts += $left
            $frameWidths += ($right - $left)
        }
        $bounds = @()
        for ($frame = 0; $frame -lt $frameCount; $frame++) {
            $bounds += Get-FrameBounds $source $frameLefts[$frame] $frameWidths[$frame]
        }

        $widest = ($bounds | Measure-Object Width -Maximum).Maximum
        $tallest = ($bounds | Measure-Object Height -Maximum).Maximum
        $scale = [Math]::Min($maxWidth / $widest, $maxHeight / $tallest)

        $sheet = New-Object System.Drawing.Bitmap ($cellWidth * $frameCount), $cellHeight, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        try {
            $graphics = [System.Drawing.Graphics]::FromImage($sheet)
            try {
                $graphics.Clear([System.Drawing.Color]::Transparent)
                $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
                $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
                $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half

                for ($frame = 0; $frame -lt $frameCount; $frame++) {
                    $box = $bounds[$frame]
                    $frameBitmap = New-Object System.Drawing.Bitmap $box.Width, $box.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
                    try {
                        for ($y = 0; $y -lt $box.Height; $y++) {
                            for ($x = 0; $x -lt $box.Width; $x++) {
                                $color = $source.GetPixel($frameLefts[$frame] + $box.X + $x, $box.Y + $y)
                                if (Is-ChromaPixel $color) {
                                    $frameBitmap.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
                                } else {
                                    $frameBitmap.SetPixel($x, $y, $color)
                                }
                            }
                        }

                        $drawWidth = [Math]::Max(1, [int][Math]::Round($box.Width * $scale))
                        $drawHeight = [Math]::Max(1, [int][Math]::Round($box.Height * $scale))
                        $drawX = ($frame * $cellWidth) + [int][Math]::Round(($cellWidth - $drawWidth) / 2)
                        $drawY = $targetBottom - $drawHeight + 1
                        $destination = New-Object System.Drawing.Rectangle $drawX, $drawY, $drawWidth, $drawHeight
                        $graphics.DrawImage($frameBitmap, $destination, 0, 0, $box.Width, $box.Height, [System.Drawing.GraphicsUnit]::Pixel)
                    } finally {
                        $frameBitmap.Dispose()
                    }
                }
            } finally {
                $graphics.Dispose()
            }

            $sheet.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

            $summary = for ($frame = 0; $frame -lt $frameCount; $frame++) {
                $box = $bounds[$frame]
                "f$frame=$($box.Width)x$($box.Height)"
            }
            Write-Output "$outputName scale=$([Math]::Round($scale, 4)) $($summary -join ' ')"
        } finally {
            $sheet.Dispose()
        }
    } finally {
        $source.Dispose()
    }
}
