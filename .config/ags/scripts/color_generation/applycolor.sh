#!/usr/bin/env bash

sleep 0
cd "$HOME/.config/ags" || exit

colornames=''
colorstrings=''
colorlist=()
colorvalues=()

if [[ "$1" = "--bad-apple" ]]; then
    cp scripts/color_generation/specials/_material_badapple.scss scss/_material.scss
    colornames=$(cat scripts/color_generation/specials/_material_badapple.scss | cut -d: -f1)
    colorstrings=$(cat scripts/color_generation/specials/_material_badapple.scss | cut -d: -f2 | cut -d ' ' -f2 | cut -d ";" -f1)
    IFS=$'\n'
    colorlist=($colornames)
    colorvalues=($colorstrings)
else
    colornames=$(cat scss/_material.scss | cut -d: -f1)
    colorstrings=$(cat scss/_material.scss | cut -d: -f2 | cut -d ' ' -f2 | cut -d ";" -f1)
    IFS=$'\n'
    colorlist=($colornames)
    colorvalues=($colorstrings)
fi

transparentize() {
    local hex="$1"
    local alpha="$2"
    local red green blue

    red=$((16#${hex:1:2}))
    green=$((16#${hex:3:2}))
    blue=$((16#${hex:5:2}))

    printf 'rgba(%d, %d, %d, %.2f)\n' "$red" "$green" "$blue" "$alpha"
}

get_light_dark() {
    lightdark=""
    if [ ! -f ~/.cache/ags/user/colormode.txt ]; then
        echo "" >~/.cache/ags/user/colormode.txt
    else
        lightdark=$(cat ~/.cache/ags/user/colormode.txt)
    fi
    echo "$lightdark"
}

apply_fuzzel() {
    if [ ! -f "scripts/templates/fuzzel/fuzzel.ini" ]; then
        echo "Template file not found for Fuzzel. Skipping that."
        return
    fi
    cp "scripts/templates/fuzzel/fuzzel.ini" "$HOME/.config/fuzzel/fuzzel.ini"
    for i in "${!colorlist[@]}"; do
        sed -i "s/{{ ${colorlist[$i]} }}/${colorvalues[$i]#\#}/g" "$HOME/.config/fuzzel/fuzzel.ini"
    done
}

apply_foot() {
    if [ ! -f "scripts/templates/foot/foot.ini" ]; then
        echo "Template file not found for Foot. Skipping that."
        return
    fi
    cp "scripts/templates/foot/foot.ini" "$HOME/.config/foot/foot_new.ini"
    for i in "${!colorlist[@]}"; do
        sed -i "s/${colorlist[$i]} #/${colorvalues[$i]#\#}/g" "$HOME/.config/foot/foot_new.ini"
    done

    cp "$HOME/.config/foot/foot_new.ini" "$HOME/.config/foot/foot.ini"
}

apply_hyprland() {
    if [ ! -f "scripts/templates/hypr/colors.conf" ]; then
        echo "Template file not found for Hyprland colors. Skipping that."
        return
    fi
    cp "scripts/templates/hypr/colors.conf" "$HOME/.config/hypr/colors_new.conf"
    for i in "${!colorlist[@]}"; do
        sed -i "s/{{ ${colorlist[$i]} }}/${colorvalues[$i]#\#}/g" "$HOME/.config/hypr/colors_new.conf"
    done

    mv "$HOME/.config/hypr/colors_new.conf" "$HOME/.config/hypr/colors.conf"
}

apply_gtk() {
    lightdark=$(get_light_dark)

    cp "scripts/templates/gradience/preset_template.json" "scripts/templates/gradience/preset.json"

    for i in "${!colorlist[@]}"; do
        sed -i "s/{{ ${colorlist[$i]} }}/${colorvalues[$i]}/g" "scripts/templates/gradience/preset.json"
    done

    mkdir -p "$HOME/.config/presets"
    gradience-cli apply -p scripts/templates/gradience/preset.json --gtk both

    if [ "$lightdark" = "-l" ]; then
        gsettings set org.gnome.desktop.interface gtk-theme 'adw-gtk3'
        gsettings set org.gnome.desktop.interface color-scheme 'default'
    else
        gsettings set org.gnome.desktop.interface gtk-theme adw-gtk3-dark
        gsettings set org.gnome.desktop.interface color-scheme 'prefer-dark'
    fi
}

apply_swaylock() {
    if [ ! -f "scripts/templates/swaylock/config" ]; then
        echo "Template file not found for Swaylock. Skipping that."
        return
    fi
    cp "scripts/templates/swaylock/config" "$HOME/.config/swaylock/config_new"
    for i in "${!colorlist[@]}"; do
        sed -i "s/{{ ${colorlist[$i]} }}/${colorvalues[$i]#\#}/g" "$HOME/.config/swaylock/config_new"
    done

    mv "$HOME/.config/swaylock/config_new" "$HOME/.config/swaylock/config"
}

apply_ags() {
    sassc "$HOME"/.config/ags/scss/main.scss "$HOME"/.config/ags/style.css
    ags run-js 'openColorScheme.value = true; Utils.timeout(2000, () => openColorScheme.value = false);'
    ags run-js "App.resetCss(); App.applyCss('${HOME}/.config/ags/style.css');"
}

apply_ags &
apply_hyprland &
apply_gtk &
apply_swaylock &
apply_fuzzel &
apply_foot
