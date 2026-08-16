
import glob, os
from PIL import Image
files = sorted(glob.glob("/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle/cnwm-v2/docs/v7/qa/juror-pass6/curtain-card-d1440/f*.jpg"))
sel = files[::max(1, len(files)//36)]
ims = [Image.open(f) for f in sel]
w, h = ims[0].size
tw = 120; th = round(h * tw / w)
cols = 12; rows = (len(ims) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (tw + 3), rows * (th + 16)), (30, 30, 30))
from PIL import ImageDraw
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(sel, ims)):
    x = (i % cols) * (tw + 3); y = (i // cols) * (th + 16)
    sheet.paste(im.resize((tw, th)), (x, y + 14))
    d.text((x + 2, y + 1), os.path.basename(f).split('-')[1].replace('.jpg', 'ms'), fill=(255, 200, 150))
sheet.save("/Users/thebayniac/Documents/(A) Documents/(A) WBM Enterprises/(B) Notable/(B) Clients/Charles Nalle/cnwm-v2/docs/v7/qa/juror-pass6/curtain-card-d1440-strip.png")
print(len(files), len(sel))
