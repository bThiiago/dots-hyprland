#!/usr/bin/bash

color=$(hyprpicker --no-fancy)

"$HOME"/.config/ags/scripts/color_generation/colorgen.sh "${color}" --apply
