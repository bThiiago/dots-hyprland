#!/usr/bin/bash

if [ "$1" == "--noswitch" ]; then
    imgpath=$(swww query | awk -F 'image: ' '{print $2}')
else
    cd "$HOME/Pictures" || cd "$HOME/Imagens" || exit 0
    imgpath=$(yad --width 1000 --height 800 --file --title='Choose wallpaper' --add-preview)
    screensizey=$(xrandr --current | grep '*' | uniq | awk '{print $1}' | cut -d 'x' -f2 | head -1)
    cursorposx=$(hyprctl cursorpos -j | gojq '.x')
    cursorposy=$(hyprctl cursorpos -j | gojq '.y')
    cursorposy_inverted=$((screensizey - cursorposy))

    if [ "$imgpath" == '' ]; then
        echo 'Aborted'
        exit 0
    fi

    echo Sending "$imgpath" to swww. Cursor pos: ["$cursorposx, $cursorposy_inverted"]
    swww img "$imgpath" --transition-step 100 --transition-fps 60 \
        --transition-type grow --transition-angle 30 --transition-duration 1 \
        --transition-pos "$cursorposx, $cursorposy_inverted"
fi

"$HOME"/.config/ags/scripts/color_generation/colorgen.sh "${imgpath}" --apply
