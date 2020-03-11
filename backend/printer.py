#!/usr/bin/env python3

import os
import hid
import json
import shutil
import tempfile
from pyaxidraw import axidraw

ad = axidraw.AxiDraw()

def main():
    """
        find the oldest file in to_print and plot it
    """
    gamepad = find_gamepad()

    h = hid.device()
    h.open(gamepad['vendor_id'], gamepad['product_id'])

    while True:
        key = get_keydown(h)
        print_next()

    h.close()

def get_keydown(handle):
    while True:
        try:
            d = handle.read(64)
            if d[3] != 0:
                return d[3]
        except:
            print("error when reading from gamepad, continuing")

def find_gamepad():
    for d in hid.enumerate():
        if '2Axes' in d['product_string']:
            return d

def print_next():
    up_next = get_next()
    if up_next is not None:
        plot(up_next)
        shutil.move(up_next, 'printed')


def get_next():
    """ find the next file path """
    files = [f"to_print/{x}" for x in os.listdir('to_print')]
    oldest = min(files, key=os.path.getctime)
    return oldest


def plot(path):
    with open(path, 'r') as infile:
        data = json.loads(infile.read())

    f = tempfile.NamedTemporaryFile(delete=False)
    f.write(data['svg'].encode())
    f.close()

    ad.plot_setup(f.name)
    ad.options.speed_pendown = 80
    ad.options.reordering = 3

    ad.plot_run()
    os.unlink(f.name)

    # turn off motors
    ## Doesn't work!
    # ad.plot_setup()
    # ad.options.mode = "manual"
    # ad.options.manual_cmd = "disable_xy"






if __name__ == '__main__':
    main()
