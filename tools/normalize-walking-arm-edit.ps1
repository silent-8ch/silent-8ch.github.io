param(
    [string]$Source = "birthday/sprites/walking-v3/arm-edit-source.png",
    [string]$Master = "birthday/sprites/walking-v3/krystal-walk-4frame.png",
    [string]$Live = "birthday/k-walking3.png"
)

Add-Type -AssemblyName System.Drawing
$input = [Drawing.Bitmap]::FromFile((Resolve-Path $Source).Path)
$output = New-Object Drawing.Bitmap 1252, 1252, ([Drawing.Imaging.PixelFormat]::Format32bppArgb)
try {
    $g = [Drawing.Graphics]::FromImage($output)
    try {
        $g.InterpolationMode = [Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
        $g.PixelOffsetMode = [Drawing.Drawing2D.PixelOffsetMode]::Half
        $g.DrawImage($input, 0, 0, 1252, 1252)
    } finally { $g.Dispose() }

    # Remove only near-white pixels connected to the canvas border. Eye whites
    # and other enclosed highlights therefore remain opaque.
    $count = 1252 * 1252
    $visited = New-Object 'bool[]' $count
    $queue = New-Object 'System.Collections.Generic.Queue[int]'
    for ($x = 0; $x -lt 1252; $x++) { $queue.Enqueue($x); $queue.Enqueue((1251 * 1252) + $x) }
    for ($y = 1; $y -lt 1251; $y++) { $queue.Enqueue($y * 1252); $queue.Enqueue(($y * 1252) + 1251) }
    while ($queue.Count -gt 0) {
        $index = $queue.Dequeue()
        if ($visited[$index]) { continue }
        $visited[$index] = $true
        $x = $index % 1252; $y = [Math]::Floor($index / 1252)
        $p = $output.GetPixel($x, $y)
        if ($p.R -lt 248 -or $p.G -lt 248 -or $p.B -lt 248) { continue }
        $output.SetPixel($x, $y, [Drawing.Color]::Transparent)
        if ($x -gt 0) { $queue.Enqueue($index - 1) }
        if ($x -lt 1251) { $queue.Enqueue($index + 1) }
        if ($y -gt 0) { $queue.Enqueue($index - 1252) }
        if ($y -lt 1251) { $queue.Enqueue($index + 1252) }
    }
    $output.Save($Master, [Drawing.Imaging.ImageFormat]::Png)
} finally { $output.Dispose(); $input.Dispose() }

Copy-Item -LiteralPath $Master -Destination $Live -Force
Write-Output "Normalized full-sheet arm edit to 1252x1252 RGBA."
