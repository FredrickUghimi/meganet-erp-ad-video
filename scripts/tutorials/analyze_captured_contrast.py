"""Contrast + effective-size audit of CAPTURED app pixels (360 CSS px viewport, DSF 3), measured on the pixels.
Same idea as scripts/pharmacy_contrast.py: contrast of the text colour against EVERY pixel behind the box in the
text-less capture of the same state, worst pixel = minimum. The text colour is the REAL rendered ink colour (median of
the pixels whose luminance differs from the text-less capture by >= 90% of the box maximum, i.e. full-coverage glyph
pixels, so opacity is included and anti-aliased edge pixels are not mistaken for text colour).
'worst' = ink vs the worst background pixel in the box; 'typ' = ink vs the median background pixel. Text hidden behind a toast/drawer scrim is dropped
by the collector (elementFromPoint); text mid fade (opacity < 0.98) is transient and counted separately.
Effective size = CSS px x (840/360): the capture is displayed 840px wide (the safe-area width)."""
import json, glob, re, os
import numpy as np
from PIL import Image
DSF=3; SCALE=840/360; MIN_C=4.5; MIN_PX=32
def lin(c): c=c/255.0; return np.where(c<=0.04045, c/12.92, ((c+0.055)/1.055)**2.4)
def lum(rgb): l=lin(rgb.astype(float)); return 0.2126*l[...,0]+0.7152*l[...,1]+0.0722*l[...,2]
rows={}; transient=0; noink=0; total=0; PB=[]
for jf in sorted(glob.glob('shots/s*.json')):
    st=os.path.basename(jf)[:-5]; d=json.load(open(jf))
    N=np.array(Image.open(f'shots/{st}.png').convert('RGB')); B=np.array(Image.open(f'shots/{st}.notext.png').convert('RGB')); H,W,_=N.shape
    for b in d['boxes']:
        total+=1
        if b['opacity']<0.5: transient+=1; continue
        x0=max(int(b['x0']*DSF),0); y0=max(int(b['y0']*DSF),0); x1=min(int(np.ceil(b['x1']*DSF)),W); y1=min(int(np.ceil(b['y1']*DSF)),H)
        if x1-x0<2 or y1-y0<2: continue
        n=N[y0:y1,x0:x1].reshape(-1,3); bg=B[y0:y1,x0:x1].reshape(-1,3)
        ln,lb=lum(n),lum(bg); diff=np.abs(ln-lb); mx=diff.max()
        if mx<0.02: noink+=1; continue
        core=diff>=0.9*mx
        ink=np.median(n[core],0); li=float(lum(ink[None,:])[0])
        hi=np.maximum(li,lb); lo=np.minimum(li,lb); cr=(hi+0.05)/(lo+0.05); crt=cr[np.argsort(lb)[len(lb)//2]]
        PB.append(dict(state=st,text=b['text'][:80],x0=b['x0'],y0=b['y0'],x1=b['x1'],y1=b['y1'],worst=float(cr.min()),eff=round(b['size']*SCALE,1)))
        key=(b['text'][:60],b['color'],round(b['size'],2),b['weight'])
        rec=dict(text=b['text'][:60],color=b['color'],css=round(b['size'],2),eff=round(b['size']*SCALE,1),worst=float(cr.min()),p5=float(np.percentile(cr,5)),med=float(crt),ncore=int(core.sum()),state=st,
                 ink='#%02x%02x%02x'%tuple(int(v) for v in ink),bgc='#%02x%02x%02x'%tuple(int(v) for v in np.median(bg,0)))
        if key not in rows or rec['worst']<rows[key]['worst']: rows[key]=rec
R=list(rows.values()); fails=[r for r in R if r['worst']<MIN_C]; small=[r for r in R if r['eff']<MIN_PX]
print(f"text boxes seen {total}; transient (mid-fade) skipped {transient}; no visible ink {noink}; distinct text items measured {len(R)}")
print(f"items with worst ink pixel < {MIN_C}:1 = {len(fails)};  items with effective size < {MIN_PX}px = {len(small)}")
print("\n== BELOW 4.5:1 ==")
for r in sorted(fails,key=lambda r:r['worst']): print(f"worst {r['worst']:5.2f} typ {r['med']:5.2f} css {r['css']:>5} eff {r['eff']:>5} ink {r['ink']} on {r['bgc']} [{r['state']}] {r['text']!r}")
print("\n== EFFECTIVE SIZE < 32px ==")
for r in sorted(small,key=lambda r:r['eff']): print(f"eff {r['eff']:>5} css {r['css']:>5} worst {r['worst']:.2f} [{r['state']}] {r['text']!r}")
print("\n== 20 LOWEST-CONTRAST PASSING ITEMS ==")
for r in sorted([r for r in R if r['worst']>=MIN_C],key=lambda r:r['worst'])[:20]: print(f"worst {r['worst']:5.2f} typ {r['med']:5.2f} css {r['css']:>5} eff {r['eff']:>5} ink {r['ink']} on {r['bgc']} [{r['state']}] {r['text']!r}")
json.dump(R,open('contrast_items.json','w'),indent=1)

json.dump(PB,open('per_box.json','w'))
