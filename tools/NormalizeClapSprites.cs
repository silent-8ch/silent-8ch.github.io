using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class NormalizeClapSprites
{
    const int FrameCount = 4;
    const int CellWidth = 543;
    const int CellHeight = 724;
    const int TargetBottom = 700;
    const int MaxSpriteWidth = 500;
    const int MaxSpriteHeight = 680;

    static bool IsChroma(byte r, byte g, byte b)
    {
        // The generated matte is vivid magenta. This deliberately keys by hue,
        // not one exact RGB value, so minor generator variation is removed too.
        return r >= 80 && b >= 70 && g <= 125 && g * 1.55 < Math.Min(r, b);
    }

    static Bitmap ToKeyedArgb(string path, out byte[] pixels, out int stride)
    {
        using (var input = new Bitmap(path))
        {
            var keyed = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb);
            using (var g = Graphics.FromImage(keyed))
            {
                g.CompositingMode = CompositingMode.SourceCopy;
                g.DrawImageUnscaled(input, 0, 0);
            }

            var rect = new Rectangle(0, 0, keyed.Width, keyed.Height);
            var data = keyed.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            stride = data.Stride;
            pixels = new byte[Math.Abs(stride) * keyed.Height];
            Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);

            for (int y = 0; y < keyed.Height; y++)
            {
                int row = y * stride;
                for (int x = 0; x < keyed.Width; x++)
                {
                    int i = row + x * 4;
                    byte b = pixels[i], g = pixels[i + 1], r = pixels[i + 2];
                    if (IsChroma(r, g, b))
                    {
                        pixels[i] = pixels[i + 1] = pixels[i + 2] = pixels[i + 3] = 0;
                    }
                    else
                    {
                        pixels[i + 3] = 255;
                    }
                }
            }

            Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
            keyed.UnlockBits(data);
            return keyed;
        }
    }

    static Rectangle FindBounds(byte[] pixels, int stride, int imageHeight, int left, int right)
    {
        int minX = right, minY = imageHeight, maxX = -1, maxY = -1;
        for (int y = 0; y < imageHeight; y++)
        {
            int row = y * stride;
            for (int x = left; x < right; x++)
            {
                if (pixels[row + x * 4 + 3] == 0) continue;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
        if (maxX < 0) throw new InvalidDataException("A frame contains no visible sprite pixels.");
        return Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1);
    }

    public static string Process(string sourcePath, string outputPath)
    {
        byte[] pixels;
        int stride;
        using (var keyed = ToKeyedArgb(sourcePath, out pixels, out stride))
        {
            var bounds = new List<Rectangle>();
            for (int frame = 0; frame < FrameCount; frame++)
            {
                int left = (int)Math.Floor(frame * keyed.Width / (double)FrameCount);
                int right = (int)Math.Floor((frame + 1) * keyed.Width / (double)FrameCount);
                bounds.Add(FindBounds(pixels, stride, keyed.Height, left, right));
            }

            int widest = 0, tallest = 0;
            foreach (var box in bounds)
            {
                widest = Math.Max(widest, box.Width);
                tallest = Math.Max(tallest, box.Height);
            }
            double scale = Math.Min(MaxSpriteWidth / (double)widest, MaxSpriteHeight / (double)tallest);

            using (var sheet = new Bitmap(CellWidth * FrameCount, CellHeight, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(sheet))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
                graphics.PixelOffsetMode = PixelOffsetMode.Half;

                for (int frame = 0; frame < FrameCount; frame++)
                {
                    var box = bounds[frame];
                    int drawWidth = Math.Max(1, (int)Math.Round(box.Width * scale));
                    int drawHeight = Math.Max(1, (int)Math.Round(box.Height * scale));
                    int drawX = frame * CellWidth + (CellWidth - drawWidth) / 2;
                    int drawY = TargetBottom - drawHeight + 1;
                    var destination = new Rectangle(drawX, drawY, drawWidth, drawHeight);
                    graphics.DrawImage(keyed, destination, box, GraphicsUnit.Pixel);
                }

                sheet.Save(outputPath, ImageFormat.Png);
            }

            return string.Format("{0}: scale={1:F4}; source bounds={2}",
                Path.GetFileName(outputPath), scale,
                string.Join(", ", bounds.ConvertAll(b => b.Width + "x" + b.Height).ToArray()));
        }
    }
}
