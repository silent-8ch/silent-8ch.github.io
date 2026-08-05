param(
    [string]$Sheet = "birthday/sprites/walking-v3/krystal-walk-4frame.png",
    [string]$Edit = "birthday/sprites/walking-v3/arm-edit-source.png",
    [string]$Live = "birthday/k-walking3.png"
)

Add-Type -AssemblyName System.Drawing

$targetPath = (Resolve-Path $Sheet).Path
$editPath = (Resolve-Path $Edit).Path
$target = [Drawing.Bitmap]::FromFile($targetPath)
$rawEdit = [Drawing.Bitmap]::FromFile($editPath)
$normalized = New-Object Drawing.Bitmap 1252, 1252, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)

try {
    $g = [Drawing.Graphics]::FromImage($normalized)
    try {
        $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
        $g.DrawImage($rawEdit, 0, 0, 1252, 1252)
    } finally { $g.Dispose() }

    # The image edit returned an opaque black field. Remove only pixels that are
    # effectively pure black; the sprite outlines are dark brown and remain intact.
    for ($y = 0; $y -lt $normalized.Height; $y++) {
        for ($x = 0; $x -lt $normalized.Width; $x++) {
            $p = $normalized.GetPixel($x, $y)
            if ($p.R -le 2 -and $p.G -le 2 -and $p.B -le 2) {
                $normalized.SetPixel($x, $y, [Drawing.Color]::Transparent)
            }
        }
    }

    $out = New-Object Drawing.Bitmap 1252, 1252, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $go = [Drawing.Graphics]::FromImage($out)
        try {
            $go.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
            $go.DrawImageUnscaled($target, 0, 0)

            # Front contact-B: replace only its two sleeve/hand regions.
            foreach ($r in @(
                [Drawing.Rectangle]::new(1034, 112, 48, 86),
                [Drawing.Rectangle]::new(1114, 112, 50, 86)
            )) {
                $go.DrawImage($normalized, $r, $r, [Drawing.GraphicsUnit]::Pixel)
            }
        } finally { $go.Dispose() }

        $temp = "$targetPath.arm-corrected.png"
        $out.Save($temp, [Drawing.Imaging.ImageFormat]::Png)
    } finally { $out.Dispose() }
} finally {
    $normalized.Dispose(); $rawEdit.Dispose(); $target.Dispose()
}

Move-Item -LiteralPath $temp -Destination $targetPath -Force
Copy-Item -LiteralPath $targetPath -Destination $Live -Force
Write-Output "Corrected front and profile counter-swing; rebuilt mirrored right profile."
