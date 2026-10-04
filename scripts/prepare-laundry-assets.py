from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parents[1]
assets = root / 'public/assets/laundry'
source = Image.open(root / 'references/selected-style.png')
source.crop((20,20,212,212)).save(assets / 'paper.png')
source.crop((165,1320,221,1344)).save(assets / 'button-paper.png')
full = Image.open(root / 'references/full-selected-design.png')
def extract(name, box):
    sx, sy = full.width/393, full.height/852
    full.crop(tuple(round(v*(sx if i%2==0 else sy)) for i,v in enumerate(box))).save(assets/name)
extract('home-hero.png', (50,312,323,543))
extract('handwritten-title.png', (100,150,292,190))
extract('home-clothesline.png', (138,193,253,244))
print('Prepared measured source artwork and textures.')
