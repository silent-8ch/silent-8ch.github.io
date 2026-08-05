param(
    [string]$Sheet = "birthday/sprites/walking-v3/krystal-walk-4frame.png",
    [string]$Live = "birthday/k-walking3.png"
)

Add-Type -AssemblyName System.Drawing

$path = (Resolve-Path $Sheet).Path
$original = [Drawing.Bitmap]::FromFile($path)
$work = New-Object Drawing.Bitmap 1252, 1252, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)

try {
    $g = [Drawing.Graphics]::FromImage($work)
    try {
        $g.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
        $g.DrawImageUnscaled($original, 0, 0)

        # Left-facing contact B (row 2, column 4): remove the old foreground
        # screen-left arm. It will be redrawn as the smaller/darker FAR arm.
        $clear = New-Object Drawing.SolidBrush ([Drawing.Color]::Transparent)
        try { $g.FillRectangle($clear, 1027, 458, 36, 51) }
        finally { $clear.Dispose() }

        # Redraw the forward arm as the FAR arm: darker, narrower, and partly
        # occluded at the torso. Then extend the NEAR arm backward to the right
        # as the brighter foreground limb. Blocky geometry preserves pixel art.
        $sleeveDark = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 20, 73, 46))
        $sleeveLight = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 32, 94, 57))
        $outline = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 31, 29, 23))
        $skin = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 238, 157, 102))
        $farSkin = New-Object Drawing.SolidBrush ([Drawing.Color]::FromArgb(255, 199, 119, 78))
        try {
            # Far arm reaches forward (screen-left) but reads behind the body.
            $g.FillPolygon($outline, [Drawing.Point[]]@(
                [Drawing.Point]::new(1082, 431), [Drawing.Point]::new(1071, 438),
                [Drawing.Point]::new(1037, 472), [Drawing.Point]::new(1048, 488),
                [Drawing.Point]::new(1086, 452)))
            $g.FillPolygon($sleeveDark, [Drawing.Point[]]@(
                [Drawing.Point]::new(1080, 435), [Drawing.Point]::new(1073, 441),
                [Drawing.Point]::new(1042, 473), [Drawing.Point]::new(1049, 482),
                [Drawing.Point]::new(1084, 449)))
            $g.FillRectangle($outline, 1033, 471, 16, 16)
            $g.FillRectangle($farSkin, 1036, 474, 10, 10)

            # Re-cover the shoulder joint so the far arm visibly passes behind.
            $joint = [Drawing.Rectangle]::new(1077, 426, 18, 34)
            $g.DrawImage($original, $joint, $joint, [Drawing.GraphicsUnit]::Pixel)

            # Near arm swings backward (screen-right) in the foreground.
            $g.FillPolygon($outline, [Drawing.Point[]]@(
                [Drawing.Point]::new(1110, 420), [Drawing.Point]::new(1128, 425),
                [Drawing.Point]::new(1169, 467), [Drawing.Point]::new(1155, 485),
                [Drawing.Point]::new(1120, 451)))
            $g.FillPolygon($sleeveDark, [Drawing.Point[]]@(
                [Drawing.Point]::new(1113, 423), [Drawing.Point]::new(1126, 429),
                [Drawing.Point]::new(1164, 467), [Drawing.Point]::new(1154, 478),
                [Drawing.Point]::new(1123, 448)))
            $g.FillPolygon($sleeveLight, [Drawing.Point[]]@(
                [Drawing.Point]::new(1117, 426), [Drawing.Point]::new(1125, 432),
                [Drawing.Point]::new(1157, 464), [Drawing.Point]::new(1152, 469),
                [Drawing.Point]::new(1124, 443)))
            $g.FillRectangle($outline, 1159, 463, 16, 17)
            $g.FillRectangle($skin, 1162, 466, 10, 11)
        }
        finally {
            $sleeveDark.Dispose(); $sleeveLight.Dispose(); $outline.Dispose(); $skin.Dispose(); $farSkin.Dispose()
        }
    }
    finally { $g.Dispose() }

    # Compose into a separate bitmap, then mirror each left-facing cell in
    # place. A separate destination avoids reading from a bitmap being drawn.
    $final = New-Object Drawing.Bitmap 1252, 1252, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
        $gf = [Drawing.Graphics]::FromImage($final)
        try {
            $gf.CompositingMode = [Drawing.Drawing2D.CompositingMode]::SourceCopy
            $gf.DrawImageUnscaled($work, 0, 0)
            for ($frame = 0; $frame -lt 4; $frame++) {
                $cell = $work.Clone([Drawing.Rectangle]::new($frame * 313, 313, 313, 313), [Drawing.Imaging.PixelFormat]::Format32bppArgb)
                try {
                    $cell.RotateFlip([Drawing.RotateFlipType]::RotateNoneFlipX)
                    $gf.DrawImageUnscaled($cell, $frame * 313, 626)
                }
                finally { $cell.Dispose() }
            }
        }
        finally { $gf.Dispose() }

        $temp = "$path.profile-arms.png"
        $final.Save($temp, [Drawing.Imaging.ImageFormat]::Png)
    }
    finally { $final.Dispose() }
}
finally { $work.Dispose(); $original.Dispose() }

Move-Item -LiteralPath $temp -Destination $path -Force
Copy-Item -LiteralPath $path -Destination $Live -Force
Write-Output "Corrected profile contact-B arm silhouette and mirrored each cell."
