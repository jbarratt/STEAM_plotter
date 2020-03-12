# STEAM night nametag plotter

This repo contains the code used to build an elementary school STEAM night activity.

![](STEAM_architecture.png?raw=true)

1. Kids entered text (such as their names) into a web-based app
2. They chose to use the font they got automatically, or could click a button to select a new random choice
3. Once happy, they hit "print it"
4. They'd move to the Pen Plotter (the [Axidraw V3](https://axidraw.com)) and select a pen
5. They'd then hit a button on a USB gamepad to actually start their plot


The system worked really well!

[Live Demo of the app](http://snap.serialized.net/namecard/index.html)

The code is very "scrappy" -- it worked well enough for a live demo but, for example, the gamepad identifier is hard coded.

## Frontend

The frontend is basically "vanillajs", using several open source javascript libraries:

* opentype
* maker.js
* bezier.js

It works using a `fonts/` directory, which is not included, but can be populated by any font files opentype is aware of.

I downloaded the [Google Fonts Archive](https://github.com/google/fonts) and used that.

There's a simple script called `make_map.py` in `public/fonts` which will 

* find all the .ttf files in a tree, skipping any duplicates
* copy them into fonts/
* output an `all.json` file which has a list of all the fonts

This can then be loaded by the frontend and used to randomly select fonts to use.

When "Print It" gets pressed, the image is POSTed to a local server.

## Backend Server

The backend server is a very simple python Flask app.

It takes the data written to it, and writes it to a local directory. The end.

## Printer Daemon

The printer daemon:

* Waits for the click of a gamepad button
* Finds the oldest file (by creation time) in the directory the backend saves files to
* Sends that to the plotter
* Moves it to a `plotted/` folder
* Goes back to waiting for another gamepad click.

It was suprisingly tricky to get python to read the joystick on macos.
I ended up having to use a low level HID (Human Interface Device) driver called [hidapi](https://pypi.org/project/hid/).

```
$ brew install hidapi
$ pip install hid
```

Since it found all the HID devices, I had to find the one that had `2axes` in the `product_string`.
This script will almost certainly need tweaking if you'd like to use it.

One fun thing, because of the lazy way of blocking on input device, if you try and Control-C the program, it won't die.
You need to hit Control-C and _then_ tap a button. Control flow will return to the program and it'll exit.

For controlling the axidraw itself, I'm using the [official axidraw python library.](https://axidraw.com/doc/py_api/#introduction)
