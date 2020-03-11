# STEAM night nametag plotter

This repo contains the code used to build an elementary school STEAM night activity.

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

It works using a `fonts/` directory, which can be populated by any font files opentype is aware of.

I downloaded the [Google Fonts Archive](https://github.com/google/fonts) and used that.
