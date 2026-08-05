using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class BuildEightFrameWalkingSheet
{
    const int SourceCols = 4;
    const int SourceRows = 2;
    const int Frames = 8;
    const int Cell = 313;
    const int TargetHeight = 286;
    const int GroundY = 301;

    // Contact, recoil, passing, high point, then the opposite foot.
    static readonly int[] GaitLift = { 0, 1, 3, 2, 0, 1, 3, 2 };

    sealed class Frame : IDisposable
    {
        public Bitmap Image;
        public Rectangle Bounds;
        public Frame(Bitmap image, Rectangle bounds) { Image = image; Bounds = bounds; }
        public void Dispose() { Image.Dispose(); }
    }

    static bool IsChroma(byte r, byte g, byte b)
    {
        return r >= 80 && b >= 70 && g <= 135 && g * 1.48 < Math.Min(r, b);
    }

    static Frame[] ReadFrames(string path)
    {
        using (var source = new Bitmap(path))
        {
            var result = new Frame[Frames];
            for (int index = 0; index < Frames; index++)
            {
                int col = index % SourceCols;
                int row = index / SourceCols;
                int left = (int)Math.Floor(col * source.Width / (double)SourceCols);
                int right = (int)Math.Floor((col + 1) * source.Width / (double)SourceCols);
                int top = (int)Math.Floor(row * source.Height / (double)SourceRows);
                int bottom = (int)Math.Floor((row + 1) * source.Height / (double)SourceRows);
                var frame = new Bitmap(right - left, bottom - top, PixelFormat.Format32bppArgb);
                using (var g = Graphics.FromImage(frame))
                {
                    g.CompositingMode = CompositingMode.SourceCopy;
                    g.DrawImage(source, new Rectangle(0, 0, frame.Width, frame.Height),
                        new Rectangle(left, top, frame.Width, frame.Height), GraphicsUnit.Pixel);
                }

                var rect = new Rectangle(0, 0, frame.Width, frame.Height);
                var data = frame.LockBits(rect, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                int stride = data.Stride;
                var pixels = new byte[Math.Abs(stride) * frame.Height];
                Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
                int minX = frame.Width, minY = frame.Height, maxX = -1, maxY = -1;
                for (int y = 0; y < frame.Height; y++)
                {
                    int scan = y * stride;
                    for (int x = 0; x < frame.Width; x++)
                    {
                        int p = scan + x * 4;
                        byte b = pixels[p], green = pixels[p + 1], r = pixels[p + 2];
                        if (IsChroma(r, green, b))
                            pixels[p] = pixels[p + 1] = pixels[p + 2] = pixels[p + 3] = 0;
                        else
                        {
                            pixels[p + 3] = 255;
                            minX = Math.Min(minX, x); minY = Math.Min(minY, y);
                            maxX = Math.Max(maxX, x); maxY = Math.Max(maxY, y);
                        }
                    }
                }
                Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
                frame.UnlockBits(data);
                if (maxX < minX || maxY < minY) throw new InvalidDataException("Empty frame " + index + " in " + path);
                result[index] = new Frame(frame, Rectangle.FromLTRB(minX, minY, maxX + 1, maxY + 1));
            }
            return result;
        }
    }

    static void DrawRow(Graphics graphics, Frame[] frames, int row, bool mirror, List<string> report)
    {
        for (int i = 0; i < Frames; i++)
        {
            Rectangle source = frames[i].Bounds;
            double scale = TargetHeight / (double)source.Height;
            int width = Math.Max(1, (int)Math.Round(source.Width * scale));
            int height = TargetHeight;
            int x = i * Cell + (Cell - width) / 2;
            int y = row * Cell + GroundY - height - GaitLift[i];
            var destination = new Rectangle(x, y, width, height);
            if (!mirror)
                graphics.DrawImage(frames[i].Image, destination, source, GraphicsUnit.Pixel);
            else
            {
                var state = graphics.Save();
                graphics.TranslateTransform(i * Cell * 2 + Cell, 0);
                graphics.ScaleTransform(-1, 1);
                graphics.DrawImage(frames[i].Image, destination, source, GraphicsUnit.Pixel);
                graphics.Restore(state);
            }
            report.Add("r" + row + "f" + i + " src=" + source.Width + "x" + source.Height + " out=" + width + "x" + height + " y=" + (y - row * Cell));
        }
    }

    public static string Build(string frontPath, string leftPath, string backPath, string outputPath)
    {
        Frame[] front = ReadFrames(frontPath), left = ReadFrames(leftPath), back = ReadFrames(backPath);
        try
        {
            using (var output = new Bitmap(Cell * Frames, Cell * 4, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(output))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
                graphics.PixelOffsetMode = PixelOffsetMode.Half;
                var report = new List<string>();
                DrawRow(graphics, front, 0, false, report);
                DrawRow(graphics, left, 1, false, report);
                DrawRow(graphics, left, 2, true, report);
                DrawRow(graphics, back, 3, false, report);
                Directory.CreateDirectory(Path.GetDirectoryName(outputPath));
                output.Save(outputPath, ImageFormat.Png);
                return Path.GetFileName(outputPath) + " 2504x1252, 8x4 cells\n" + string.Join("\n", report);
            }
        }
        finally
        {
            foreach (var frame in front) frame.Dispose();
            foreach (var frame in left) frame.Dispose();
            foreach (var frame in back) frame.Dispose();
        }
    }
}
