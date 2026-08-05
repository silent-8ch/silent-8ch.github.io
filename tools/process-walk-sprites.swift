#!/usr/bin/env swift

import CoreGraphics
import Foundation
import ImageIO

private let columns = 4
private let rows = 4
private let outputCell = 256
private let sidePadding = 16
private let topPadding = 12
private let baseline = 236

struct Bitmap {
    let width: Int
    let height: Int
    var pixels: [UInt8]
}

struct Bounds {
    var minX: Int
    var minY: Int
    var maxX: Int
    var maxY: Int

    var width: Int { maxX - minX + 1 }
    var height: Int { maxY - minY + 1 }
}

func loadPNG(_ path: String) throws -> Bitmap {
    let url = URL(fileURLWithPath: path) as CFURL
    guard let source = CGImageSourceCreateWithURL(url, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        throw NSError(domain: "WalkSprite", code: 1,
                      userInfo: [NSLocalizedDescriptionKey: "Cannot read \(path)"])
    }

    let width = image.width
    let height = image.height
    var pixels = [UInt8](repeating: 0, count: width * height * 4)
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let context = CGContext(data: &pixels, width: width, height: height,
                                  bitsPerComponent: 8, bytesPerRow: width * 4,
                                  space: colorSpace,
                                  bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue) else {
        throw NSError(domain: "WalkSprite", code: 2,
                      userInfo: [NSLocalizedDescriptionKey: "Cannot decode \(path)"])
    }
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    return Bitmap(width: width, height: height, pixels: pixels)
}

func isChromaKey(_ r: UInt8, _ g: UInt8, _ b: UInt8) -> Bool {
    let ri = Int(r), gi = Int(g), bi = Int(b)
    return gi > 150 && gi - ri > 65 && gi - bi > 55
}

func removeChromaKey(_ bitmap: inout Bitmap) {
    for offset in stride(from: 0, to: bitmap.pixels.count, by: 4) {
        let r = bitmap.pixels[offset]
        let g = bitmap.pixels[offset + 1]
        let b = bitmap.pixels[offset + 2]
        if isChromaKey(r, g, b) {
            bitmap.pixels[offset] = 0
            bitmap.pixels[offset + 1] = 0
            bitmap.pixels[offset + 2] = 0
            bitmap.pixels[offset + 3] = 0
        }
    }
}

func retainLargestComponent(_ bitmap: inout Bitmap, column: Int, row: Int) {
    let originX = column * bitmap.width / columns
    let originY = row * bitmap.height / rows
    let endX = (column + 1) * bitmap.width / columns
    let endY = (row + 1) * bitmap.height / rows
    let width = endX - originX
    let height = endY - originY
    var visited = [Bool](repeating: false, count: width * height)
    var largest = [Int]()

    for localY in 0..<height {
        for localX in 0..<width {
            let localIndex = localY * width + localX
            let pixelOffset = ((originY + localY) * bitmap.width + originX + localX) * 4
            if visited[localIndex] || bitmap.pixels[pixelOffset + 3] <= 8 { continue }

            var component = [Int]()
            var queue = [localIndex]
            visited[localIndex] = true
            var cursor = 0
            while cursor < queue.count {
                let current = queue[cursor]
                cursor += 1
                component.append(current)
                let x = current % width
                let y = current / width
                for dy in -1...1 {
                    for dx in -1...1 where dx != 0 || dy != 0 {
                        let nx = x + dx, ny = y + dy
                        guard nx >= 0, nx < width, ny >= 0, ny < height else { continue }
                        let next = ny * width + nx
                        let nextOffset = ((originY + ny) * bitmap.width + originX + nx) * 4
                        if !visited[next] && bitmap.pixels[nextOffset + 3] > 8 {
                            visited[next] = true
                            queue.append(next)
                        }
                    }
                }
            }
            if component.count > largest.count { largest = component }
        }
    }

    let keep = Set(largest)
    for localY in 0..<height {
        for localX in 0..<width where !keep.contains(localY * width + localX) {
            let offset = ((originY + localY) * bitmap.width + originX + localX) * 4
            bitmap.pixels[offset] = 0
            bitmap.pixels[offset + 1] = 0
            bitmap.pixels[offset + 2] = 0
            bitmap.pixels[offset + 3] = 0
        }
    }
}

func frameBounds(_ bitmap: Bitmap, column: Int, row: Int) -> Bounds? {
    let originX = column * bitmap.width / columns
    let originY = row * bitmap.height / rows
    let endX = (column + 1) * bitmap.width / columns
    let endY = (row + 1) * bitmap.height / rows
    let frameWidth = endX - originX
    let frameHeight = endY - originY
    var bounds = Bounds(minX: frameWidth, minY: frameHeight, maxX: -1, maxY: -1)

    for y in 0..<frameHeight {
        for x in 0..<frameWidth {
            let offset = ((originY + y) * bitmap.width + originX + x) * 4
            if bitmap.pixels[offset + 3] > 8 {
                bounds.minX = min(bounds.minX, x)
                bounds.minY = min(bounds.minY, y)
                bounds.maxX = max(bounds.maxX, x)
                bounds.maxY = max(bounds.maxY, y)
            }
        }
    }
    return bounds.maxX >= 0 ? bounds : nil
}

func savePNG(_ bitmap: Bitmap, to output: String) throws {
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let provider = CGDataProvider(data: Data(bitmap.pixels) as CFData)!
    let image = CGImage(width: bitmap.width, height: bitmap.height,
                        bitsPerComponent: 8, bitsPerPixel: 32,
                        bytesPerRow: bitmap.width * 4, space: colorSpace,
                        bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.premultipliedLast.rawValue),
                        provider: provider, decode: nil, shouldInterpolate: false,
                        intent: .defaultIntent)!
    let outputURL = URL(fileURLWithPath: output) as CFURL
    guard let destination = CGImageDestinationCreateWithURL(outputURL, "public.png" as CFString, 1, nil) else {
        throw NSError(domain: "WalkSprite", code: 5,
                      userInfo: [NSLocalizedDescriptionKey: "Cannot create \(output)"])
    }
    CGImageDestinationAddImage(destination, image, nil)
    guard CGImageDestinationFinalize(destination) else {
        throw NSError(domain: "WalkSprite", code: 6,
                      userInfo: [NSLocalizedDescriptionKey: "Cannot save \(output)"])
    }
}

func process(_ input: String, _ output: String) throws {
    var source = try loadPNG(input)
    removeChromaKey(&source)
    for row in 0..<rows {
        for column in 0..<columns {
            retainLargestComponent(&source, column: column, row: row)
        }
    }

    var bounds = [Bounds]()
    for row in 0..<rows {
        for column in 0..<columns {
            guard let frame = frameBounds(source, column: column, row: row) else {
                throw NSError(domain: "WalkSprite", code: 4,
                              userInfo: [NSLocalizedDescriptionKey: "Empty frame at row \(row), column \(column)"])
            }
            bounds.append(frame)
        }
    }

    let widest = bounds.map(\.width).max()!
    let tallest = bounds.map(\.height).max()!
    let scale = min(Double(outputCell - sidePadding * 2) / Double(widest),
                    Double(baseline - topPadding) / Double(tallest))
    let outputWidth = outputCell * columns
    let outputHeight = outputCell * rows
    var result = Bitmap(width: outputWidth, height: outputHeight,
                        pixels: [UInt8](repeating: 0, count: outputWidth * outputHeight * 4))

    for row in 0..<rows {
        for column in 0..<columns {
            let frame = bounds[row * columns + column]
            let targetWidth = max(1, Int((Double(frame.width) * scale).rounded()))
            let targetHeight = max(1, Int((Double(frame.height) * scale).rounded()))
            let targetX = column * outputCell + (outputCell - targetWidth) / 2
            let targetY = row * outputCell + baseline - targetHeight
            let sourceOriginX = column * source.width / columns
            let sourceOriginY = row * source.height / rows

            for y in 0..<targetHeight {
                let sourceY = min(frame.height - 1, Int(Double(y) / scale))
                for x in 0..<targetWidth {
                    let sourceX = min(frame.width - 1, Int(Double(x) / scale))
                    let sx = sourceOriginX + frame.minX + sourceX
                    let sy = sourceOriginY + frame.minY + sourceY
                    let sourceOffset = (sy * source.width + sx) * 4
                    let targetOffset = ((targetY + y) * outputWidth + targetX + x) * 4
                    result.pixels[targetOffset..<(targetOffset + 4)] = source.pixels[sourceOffset..<(sourceOffset + 4)]
                }
            }
        }
    }

    try savePNG(result, to: output)
    print("processed \(input) -> \(output) (scale \(String(format: "%.3f", scale)))")
}

func splitActions(_ input: String, outputDirectory: String, names: [String]) throws {
    guard names.count == rows else {
        throw NSError(domain: "WalkSprite", code: 11,
                      userInfo: [NSLocalizedDescriptionKey: "Exactly four action names are required"])
    }
    try FileManager.default.createDirectory(atPath: outputDirectory,
                                            withIntermediateDirectories: true)
    let atlasPath = URL(fileURLWithPath: outputDirectory)
        .appendingPathComponent(".processed-atlas.png").path
    try process(input, atlasPath)
    let atlas = try loadPNG(atlasPath)
    for row in 0..<rows {
        var sheet = Bitmap(width: atlas.width, height: outputCell,
                           pixels: [UInt8](repeating: 0, count: atlas.width * outputCell * 4))
        let sourceStart = row * outputCell * atlas.width * 4
        let sourceEnd = sourceStart + sheet.pixels.count
        sheet.pixels.replaceSubrange(0..<sheet.pixels.count,
                                     with: atlas.pixels[sourceStart..<sourceEnd])
        let output = URL(fileURLWithPath: outputDirectory)
            .appendingPathComponent("\(names[row]).png").path
        try savePNG(sheet, to: output)
        print("split \(names[row]) -> \(output)")
    }
    try? FileManager.default.removeItem(atPath: atlasPath)
}

func validate(_ path: String) throws {
    let bitmap = try loadPNG(path)
    guard bitmap.width == outputCell * columns, bitmap.height == outputCell * rows else {
        throw NSError(domain: "WalkSprite", code: 7,
                      userInfo: [NSLocalizedDescriptionKey: "\(path) must be 1024x1024"])
    }
    for row in 0..<rows {
        for column in 0..<columns {
            guard let frame = frameBounds(bitmap, column: column, row: row) else {
                throw NSError(domain: "WalkSprite", code: 8,
                              userInfo: [NSLocalizedDescriptionKey: "Empty frame in \(path) at \(row),\(column)"])
            }
            guard frame.maxY == baseline - 1 else {
                throw NSError(domain: "WalkSprite", code: 9,
                              userInfo: [NSLocalizedDescriptionKey: "Bad baseline in \(path) at \(row),\(column)"])
            }
            guard frame.minX > 0, frame.maxX < outputCell - 1, frame.minY > 0 else {
                throw NSError(domain: "WalkSprite", code: 10,
                              userInfo: [NSLocalizedDescriptionKey: "Frame touches partition edge in \(path) at \(row),\(column)"])
            }
        }
    }
    print("validated \(path): 16 contained frames, baseline \(baseline)")
}

func validateAction(_ path: String) throws {
    let bitmap = try loadPNG(path)
    guard bitmap.width == outputCell * columns, bitmap.height == outputCell else {
        throw NSError(domain: "WalkSprite", code: 12,
                      userInfo: [NSLocalizedDescriptionKey: "\(path) must be 1024x256"])
    }
    for column in 0..<columns {
        let startX = column * outputCell
        var minX = outputCell, minY = outputCell, maxX = -1, maxY = -1
        for y in 0..<outputCell {
            for x in 0..<outputCell {
                let offset = (y * bitmap.width + startX + x) * 4
                if bitmap.pixels[offset + 3] > 8 {
                    minX = min(minX, x); minY = min(minY, y)
                    maxX = max(maxX, x); maxY = max(maxY, y)
                }
            }
        }
        guard maxX >= 0, maxY == baseline - 1,
              minX > 0, maxX < outputCell - 1, minY > 0 else {
            throw NSError(domain: "WalkSprite", code: 13,
                          userInfo: [NSLocalizedDescriptionKey: "Invalid action frame in \(path), column \(column)"])
        }
    }
    print("validated \(path): 4 contained frames, baseline \(baseline)")
}

do {
    if CommandLine.arguments.count >= 3 && CommandLine.arguments[1] == "--validate" {
        for path in CommandLine.arguments.dropFirst(2) { try validate(path) }
    } else if CommandLine.arguments.count >= 3 && CommandLine.arguments[1] == "--validate-actions" {
        for path in CommandLine.arguments.dropFirst(2) { try validateAction(path) }
    } else if CommandLine.arguments.count == 8 && CommandLine.arguments[1] == "--split-actions" {
        try splitActions(CommandLine.arguments[2], outputDirectory: CommandLine.arguments[3],
                         names: Array(CommandLine.arguments[4...7]))
    } else if CommandLine.arguments.count == 3 {
        try process(CommandLine.arguments[1], CommandLine.arguments[2])
    } else {
        fputs("usage: process-walk-sprites.swift INPUT.png OUTPUT.png\n" +
              "       process-walk-sprites.swift --validate SHEET.png [...]\n", stderr)
        exit(64)
    }
} catch {
    fputs("error: \(error.localizedDescription)\n", stderr)
    exit(1)
}
