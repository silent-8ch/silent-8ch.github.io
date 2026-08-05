using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class ProcessWalkingSheet
{
    const int Grid = 4;
    const int Cell = 313;
    const int TargetBottom = 299;

    static bool IsChroma(byte r, byte g, byte b)
    {
        return r >= 80 && b >= 70 && g <= 125 && g * 1.55 < Math.Min(r, b);
    }

    public static string Process(string sourcePath, string outputPath)
    {
        using (var input = new Bitmap(sourcePath))
        using (var keyed = new Bitmap(input.Width, input.Height, PixelFormat.Format32bppArgb))
        {
            using (var g = Graphics.FromImage(keyed))
            {
                g.CompositingMode = CompositingMode.SourceCopy;
                g.DrawImageUnscaled(input, 0, 0);
            }

            var full = new Rectangle(0, 0, keyed.Width, keyed.Height);
            var data = keyed.LockBits(full, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
            int stride = data.Stride;
            var pixels = new byte[Math.Abs(stride) * keyed.Height];
            Marshal.Copy(data.Scan0, pixels, 0, pixels.Length);
            for (int y = 0; y < keyed.Height; y++)
            {
                int row = y * stride;
                for (int x = 0; x < keyed.Width; x++)
                {
                    int i = row + x * 4;
                    byte b = pixels[i], g = pixels[i + 1], r = pixels[i + 2];
                    if (IsChroma(r, g, b)) pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i+3] = 0;
                    else pixels[i+3] = 255;
                }
            }
            Marshal.Copy(pixels, 0, data.Scan0, pixels.Length);
            keyed.UnlockBits(data);

            using (var output = new Bitmap(Cell * Grid, Cell * Grid, PixelFormat.Format32bppArgb))
            using (var graphics = Graphics.FromImage(output))
            {
                graphics.Clear(Color.Transparent);
                graphics.CompositingMode = CompositingMode.SourceCopy;
                graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
                graphics.PixelOffsetMode = PixelOffsetMode.Half;

                string[] summaries = new string[Grid * Grid];
                for (int rowIndex = 0; rowIndex < Grid; rowIndex++)
                {
                    int sourceTop = (int)Math.Floor(rowIndex * keyed.Height / (double)Grid);
                    int sourceBottom = (int)Math.Floor((rowIndex + 1) * keyed.Height / (double)Grid);
                    int sourceHeight = sourceBottom - sourceTop;
                    for (int column = 0; column < Grid; column++)
                    {
                        int sourceLeft = (int)Math.Floor(column * keyed.Width / (double)Grid);
                        int sourceRight = (int)Math.Floor((column + 1) * keyed.Width / (double)Grid);
                        int sourceWidth = sourceRight - sourceLeft;
                        int maxY = -1;
                        for (int y = sourceTop; y < sourceBottom; y++)
                        {
                            int pixelRow = y * stride;
                            for (int x = sourceLeft; x < sourceRight; x++)
                                if (pixels[pixelRow + x * 4 + 3] != 0) maxY = y;
                        }
                        if (maxY < 0) throw new InvalidDataException("A walking frame is empty.");

                        double scaleY = Cell / (double)sourceHeight;
                        int localBottom = (int)Math.Round((maxY - sourceTop + 1) * scaleY) - 1;
                        int shiftY = TargetBottom - localBottom;
                        var sourceRect = new Rectangle(sourceLeft, sourceTop, sourceWidth, sourceHeight);
                        var destination = new Rectangle(column * Cell, rowIndex * Cell + shiftY, Cell, Cell);
                        graphics.DrawImage(keyed, destination, sourceRect, GraphicsUnit.Pixel);
                        summaries[rowIndex * Grid + column] = "r" + rowIndex + "c" + column + ":dy=" + shiftY;
                    }
                }
                output.Save(outputPath, ImageFormat.Png);
                return Path.GetFileName(outputPath) + " 1252x1252, 313x313 cells; " + string.Join(", ", summaries);
            }
        }
    }
}
