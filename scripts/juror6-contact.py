import sys, glob
from PIL import Image
pattern, out, W, H = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
files = sorted(glob.glob(pattern))
tw = 300; th = round(H * tw / W); cols = 6
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 4), rows * (th + 4)), (60, 60, 60))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((tw, th))
    sheet.paste(im, ((i % cols) * (tw + 4), (i // cols) * (th + 4)))
sheet.save(out)
print(out, len(files))
