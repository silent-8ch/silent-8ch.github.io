param([string]$InputDirectory = "birthday/sprites/clapping")

Add-Type -AssemblyName System.Drawing
Add-Type -Path (Join-Path $PSScriptRoot "NormalizeClapSprites.cs") -ReferencedAssemblies System.Drawing

Get-ChildItem -LiteralPath $InputDirectory -Filter "*-clap-source.png" | ForEach-Object {
    $outputName = $_.Name -replace "-source\.png$", "-processed.png"
    $outputPath = Join-Path $_.DirectoryName $outputName
    [NormalizeClapSprites]::Process($_.FullName, $outputPath)
}
