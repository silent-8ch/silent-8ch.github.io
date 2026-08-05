using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;

public static class BuildFourFrameWalkingSheet
{
    const int Cell = 313, TargetHeight = 286, GroundY = 301;
    static readonly int[] SourcePose = { 0, 1, 0, 2 };

    sealed class Pose : IDisposable
    {
        public Bitmap Image; public Rectangle Bounds;
        public Pose(Bitmap image, Rectangle bounds) { Image = image; Bounds = bounds; }
        public void Dispose() { Image.Dispose(); }
    }

    static bool IsKey(byte r, byte g, byte b)
    {
        return r >= 100 && b >= 90 && g <= 145 && g * 1.5 < Math.Min(r, b);
    }

    static Pose[] Load(string path)
    {
        using (var source = new Bitmap(path))
        {
            var poses = new Pose[3];
            for (int n = 0; n < 3; n++)
            {
                int l = (int)Math.Floor(n * source.Width / 3.0), rgt = (int)Math.Floor((n + 1) * source.Width / 3.0);
                var image = new Bitmap(rgt - l, source.Height, PixelFormat.Format32bppArgb);
                using (var g = Graphics.FromImage(image)) g.DrawImage(source, new Rectangle(0, 0, image.Width, image.Height), new Rectangle(l, 0, image.Width, image.Height), GraphicsUnit.Pixel);
                var data = image.LockBits(new Rectangle(0, 0, image.Width, image.Height), ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
                var bytes = new byte[Math.Abs(data.Stride) * image.Height]; Marshal.Copy(data.Scan0, bytes, 0, bytes.Length);
                int minX=image.Width,minY=image.Height,maxX=-1,maxY=-1;
                for(int y=0;y<image.Height;y++) for(int x=0;x<image.Width;x++) {
                    int p=y*data.Stride+x*4; byte b=bytes[p], green=bytes[p+1], red=bytes[p+2];
                    if(IsKey(red,green,b)) bytes[p]=bytes[p+1]=bytes[p+2]=bytes[p+3]=0;
                    else { bytes[p+3]=255; minX=Math.Min(minX,x); minY=Math.Min(minY,y); maxX=Math.Max(maxX,x); maxY=Math.Max(maxY,y); }
                }
                Marshal.Copy(bytes,0,data.Scan0,bytes.Length); image.UnlockBits(data);
                if(maxX<0) throw new InvalidDataException("Empty pose in "+path);
                poses[n]=new Pose(image,Rectangle.FromLTRB(minX,minY,maxX+1,maxY+1));
            }
            return poses;
        }
    }

    static void Row(Graphics g, Pose[] poses, int row, bool mirror)
    {
        for(int frame=0;frame<4;frame++) {
            var pose=poses[SourcePose[frame]]; double scale=TargetHeight/(double)pose.Bounds.Height;
            int w=(int)Math.Round(pose.Bounds.Width*scale), x=frame*Cell+(Cell-w)/2, y=row*Cell+GroundY-TargetHeight;
            var dest=new Rectangle(x,y,w,TargetHeight);
            if(!mirror) g.DrawImage(pose.Image,dest,pose.Bounds,GraphicsUnit.Pixel);
            else { var state=g.Save(); g.TranslateTransform(frame*Cell*2+Cell,0); g.ScaleTransform(-1,1); g.DrawImage(pose.Image,dest,pose.Bounds,GraphicsUnit.Pixel); g.Restore(state); }
        }
    }

    public static string Build(string frontPath,string leftPath,string backPath,string outputPath)
    {
        var front=Load(frontPath); var left=Load(leftPath); var back=Load(backPath);
        try {
            using(var output=new Bitmap(Cell*4,Cell*4,PixelFormat.Format32bppArgb))
            using(var g=Graphics.FromImage(output)) {
                g.Clear(Color.Transparent); g.CompositingMode=CompositingMode.SourceCopy;
                g.InterpolationMode=InterpolationMode.NearestNeighbor; g.PixelOffsetMode=PixelOffsetMode.Half;
                Row(g,front,0,false); Row(g,left,1,false); Row(g,left,2,true); Row(g,back,3,false);
                Directory.CreateDirectory(Path.GetDirectoryName(outputPath)); output.Save(outputPath,ImageFormat.Png);
            }
            return Path.GetFileName(outputPath)+" 1252x1252; order neutral/contact-A/neutral/contact-B";
        } finally { foreach(var p in front)p.Dispose(); foreach(var p in left)p.Dispose(); foreach(var p in back)p.Dispose(); }
    }
}
