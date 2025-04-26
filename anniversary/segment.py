import os
import json
from PIL import Image

with open("reference.json", "r") as f:
    data = json.load(f)

page_dir = "pages"

output_dir = "words"
os.makedirs(output_dir, exist_ok=True)

scale = 2.4
crop_width = 450*scale
crop_height = 180*scale

for page_info in data:
    page_name = page_info["page"]
    words = page_info["words"]
    
    page_path = os.path.join(page_dir, f"{page_name}.png")
    if not os.path.exists(page_path):
        print(f"page image {page_path} not found")
        continue
    
    img = Image.open(page_path)
    
    for word in words:
        text = word["t"]
        x = word["x"]
        y = word["y"]
        
        left = x - 24
        top = y - crop_height // 2
        right = x + crop_width - 24
        bottom = y + crop_height // 2
        
        left = max(left, 0)
        top = max(top, 0)
        right = min(right, img.width)
        bottom = min(bottom, img.height)
        
        crop = img.crop((left, top, right, bottom))
        
        safe_text = "".join(c if c.isalnum() else "_" for c in text)
        
        output_path = os.path.join(output_dir, f"{safe_text}.png")
        crop.save(output_path)
        print(f"Saved word '{text}' to {output_path}")