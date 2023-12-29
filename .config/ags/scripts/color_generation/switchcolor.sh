#!/usr/bin/bash

color=$(hyprpicker --no-fancy)

"$HOME"/.config/ags/scripts/color_generation/colorgen.sh "${color}" --apply
sassc "$HOME"/.config/ags/scss/main.scss "$HOME"/.config/ags/style.css
ags run-js "App.resetCss(); App.applyCss('${HOME}/.config/ags/style.css');"
