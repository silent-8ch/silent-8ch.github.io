#!/usr/bin/env swift

import AppKit
import CoreGraphics
import Foundation

struct LayerSource {
    let name: String
    let path: String
    let transparent: Bool
}

let sources = [
    LayerSource(name: "mountains", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-a32b9781-754d-4f0b-b3ba-59986869c71d.png", transparent: false),
    LayerSource(name: "hills", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-fccef049-5c3a-49f1-b588-b4a7dcb514d1.png", transparent: true),
    LayerSource(name: "skyline", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-a8e3e113-b526-4e25-8037-1268fcb8d2e2.png", transparent: true),
    LayerSource(name: "industrial", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-9a2e49aa-532d-4111-b519-90da0032d91e.png", transparent: true),
    LayerSource(name: "suburbs", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-6d1141b3-08bc-4154-82b5-8a71e6830975.png", transparent: true),
    LayerSource(name: "farms", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-4544d8ca-b784-4777-93af-5272f37a15f6.png", transparent: true),
    LayerSource(name: "trees", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-8a4718fb-72dd-436e-9448-92b6148d7943.png", transparent: true),
    LayerSource(name: "forest", path: "/Users/phlusko/.codex/generated_images/019fd983-7214-78f3-a069-fe38a1d606b4/exec-e73d8c3d-81e5-46af-884c-3d7cec6676d2.png", transparent: true),
]

let outputURL = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
    .appendingPathComponent("parallax/assets", isDirectory: true)
try FileManager.default.createDirectory(at: outputURL, withIntermediateDirectories: true)

let outputWidth = 2048
let outputHeight = 512
let colorSpace = CGColorSpaceCreateDeviceRGB()

func removeMagenta(from data: inout [UInt8]) {
    for pixel in stride(from: 0, to: data.count, by: 4) {
        let red = Double(data[pixel])
        let green = Double(data[pixel + 1])
        let blue = Double(data[pixel + 2])
        let magenta = min(red, blue) - green
        let strength = min(max((magenta - 28) / 105, 0), 1)
        let alpha = 1 - strength

        data[pixel] = UInt8(min(255, red * alpha))
        data[pixel + 1] = UInt8(min(255, green * alpha))
        data[pixel + 2] = UInt8(min(255, blue * alpha))
        data[pixel + 3] = UInt8(255 * alpha)
    }
}

for source in sources {
    guard let image = NSImage(contentsOfFile: source.path),
          let sourceCG = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        fatalError("Unable to read \(source.path)")
    }

    let panelHeight = sourceCG.height / 3
    for variant in 0..<3 {
        let cropRect = CGRect(
            x: 0,
            y: variant * panelHeight,
            width: sourceCG.width,
            height: panelHeight
        )
        guard let cropped = sourceCG.cropping(to: cropRect) else {
            fatalError("Unable to crop \(source.name) variant \(variant + 1)")
        }

        var pixels = [UInt8](repeating: 0, count: outputWidth * outputHeight * 4)
        guard let context = CGContext(
            data: &pixels,
            width: outputWidth,
            height: outputHeight,
            bitsPerComponent: 8,
            bytesPerRow: outputWidth * 4,
            space: colorSpace,
            bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        ) else {
            fatalError("Unable to create image context")
        }

        context.interpolationQuality = .high
        context.draw(cropped, in: CGRect(x: 0, y: 0, width: outputWidth, height: outputHeight))
        if source.transparent {
            removeMagenta(from: &pixels)
        }

        guard let rendered = context.makeImage() else {
            fatalError("Unable to render \(source.name) variant \(variant + 1)")
        }
        let bitmap = NSBitmapImageRep(cgImage: rendered)
        guard let png = bitmap.representation(using: .png, properties: [:]) else {
            fatalError("Unable to encode \(source.name) variant \(variant + 1)")
        }

        let destination = outputURL.appendingPathComponent("\(source.name)_\(variant + 1).png")
        try png.write(to: destination)
        print(destination.path)
    }
}
