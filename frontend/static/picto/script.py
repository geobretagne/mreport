#!/usr/bin/env python3
import glob, os, json

style = []

tpl = ".icon-%s { background-image: url(/static/picto/%s); }"



for filepath in glob.iglob('**/*.svg', recursive=True):
    filename = os.path.basename(filepath)
    (file, ext) = os.path.splitext(filename)    
    style.append({"id": file, "url": filepath})
    

with open("picto.json", "w") as outfile:
    json.dump(style, outfile)
