param(
    [string]$Front = "birthday/sprites/walking-v2/front-source.png",
    [string]$Left = "birthday/sprites/walking-v2/left-source.png",
    [string]$Back = "birthday/sprites/walking-v2/back-source.png",
    [string]$Output = "birthday/sprites/walking-v2/krystal-walk-8frame.png"
)

Add-Type -AssemblyName System.Drawing
Add-Type -Path (Join-Path $PSScriptRoot "BuildEightFrameWalkingSheet.cs") -ReferencedAssemblies System.Drawing
[BuildEightFrameWalkingSheet]::Build($Front, $Left, $Back, $Output)
