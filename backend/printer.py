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
        Run in a loop, waiting for gamepad presses
        When they are detected, print the oldest file.
    """
    gamepad = find_gamepad()

    h = hid.device()
    h.open(gamepad['vendor_id'], gamepad['product_id'])

    while True:
        key = get_keydown(h)
        print_next()

    h.close()

def get_keydown(handle):
    """ Read all the USB HID events from a device.
        Return when a key down event happens.
        Ignore any key up events.
    """
    while True:
        try:
            d = handle.read(64)
            if d[3] != 0:
                return d[3]
        except:
            print("error when reading from gamepad, continuing")

def find_gamepad():
    """ Find the first device with 2Axes in the name.
        Return the device data structure.
    """
    for d in hid.enumerate():
        if '2Axes' in d['product_string']:
            return d

def print_next():
    """ Find the next plot to print
        Then plot it, and move it to printed/
    """
    up_next = get_next()
    if up_next is not None:
        plot(up_next)
        shutil.move(up_next, 'printed')


def get_next():
    """ Return the oldest unprinted file.
        Sort by created time.
    """
    files = [f"to_print/{x}" for x in os.listdir('to_print')]
    oldest = min(files, key=os.path.getctime)
    return oldest


def plot(path):
    """ Extract the SVG payload from the plot file.
        Store it in a named temporary file
        Tell the plotter to plot the SVG
    """
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

if __name__ == '__main__':
    main()
