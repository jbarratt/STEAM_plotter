#!/usr/bin/env python3

import os
import sys
import json
import shutil

def main():
    """
    open a directory given by sys.argv[1]
    find all the .ttf files
    if not existing, copy to working dir
    add it to a list of files
    dump that list out as all.json
    """
    fonts = []
    for root, dirs, files in os.walk(sys.argv[1], topdown = False):
        for name in files:
            if not name.endswith(".ttf"):
                continue
            fonts.append(name)
            if not os.path.exists(name):
                src = os.path.join(root, name)
                print(f"copying {src} to {name}")
                shutil.copy(src, name)
    with open("all.json", "w") as of:
        of.write(json.dumps({"files": fonts}))

if __name__ == "__main__":
    main()
