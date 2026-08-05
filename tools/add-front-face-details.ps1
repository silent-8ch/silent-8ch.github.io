param(
    [string[]]$Sheets = @(
        "birthday/sprites/walking-v3/krystal-walk-4frame.png",
        "birthday/k-walking3.png"
    )
)

Add-Type -AssemblyName System.Drawing

$cell = 313
$noseShadow = [Drawing.Color]::FromArgb(255, 184, 104, 73)
$mouth = [Drawing.Color]::FromArgb(255, 91, 43, 39)

foreach ($sheet in $Sheets) {
    $resolved = (Resolve-Path $sheet).Path
    $bitmap = [Drawing.Bitmap]::FromFile($resolved)
    try {
        if ($bitmap.Width -ne 1252 -or $bitmap.Height -ne 1252) {
            throw "Expected a 1252x1252 four-frame walking sheet: $sheet"
        }

        $graphics = [Drawing.Graphics]::FromImage($bitmap)
        try {
            for ($frame = 0; $frame -lt 4; $frame++) {
                $centerX = $frame * $cell + 156

                # One restrained pixel-art nose shadow, then a short neutral mouth.
                # Coordinates are identical within every front-row partition.
                $graphics.FillRectangle([Drawing.SolidBrush]::new($noseShadow), $centerX + 1, 85, 3, 3)
                $graphics.FillRectangle([Drawing.SolidBrush]::new($mouth), $centerX - 3, 97, 7, 3)
            }
        }
        finally {
            $graphics.Dispose()
        }

        $temporary = "$resolved.face-details.png"
        $bitmap.Save($temporary, [Drawing.Imaging.ImageFormat]::Png)
    }
    finally {
        $bitmap.Dispose()
    }

    Move-Item -LiteralPath $temporary -Destination $resolved -Force
    Write-Output "Added front-facing nose and mouth: $sheet"
}
