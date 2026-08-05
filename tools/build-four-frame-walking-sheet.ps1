param(
    [string]$Front = "birthday/sprites/walking-v3/front-source.png",
    [string]$Left = "birthday/sprites/walking-v3/left-source.png",
    [string]$Back = "birthday/sprites/walking-v3/back-source.png",
    [string]$Output = "birthday/sprites/walking-v3/krystal-walk-4frame.png"
)
Add-Type -AssemblyName System.Drawing
Add-Type -Path (Join-Path $PSScriptRoot "BuildFourFrameWalkingSheet.cs") -ReferencedAssemblies System.Drawing
[BuildFourFrameWalkingSheet]::Build($Front,$Left,$Back,$Output)
