param(
    [string]$Source = "birthday/sprites/walking/krystal-walk-source.png",
    [string]$Output = "birthday/sprites/walking/krystal-walk-processed.png"
)

Add-Type -AssemblyName System.Drawing
Add-Type -Path (Join-Path $PSScriptRoot "ProcessWalkingSheet.cs") -ReferencedAssemblies System.Drawing
[ProcessWalkingSheet]::Process($Source, $Output)
