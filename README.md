<div align="center">
    <h1>「 Hyprland dotfiles 」</h1>
    <h3> end_4 illogical_impulse branch with personal tweaks </h3>
</div>

## Manual installation (Tested on arch with hyprland-git)

### Packages

```bash
yay -S --needed --noconfirm adw-gtk3-git base base-devel bc blueberry bluez boost boost-libs brightnessctl cava clang cliphist cmake dart docker docker-compose dotnet-runtime dotnet-sdk dotnet-targeting-pack dunst efibootmgr eog firefox fish foot fuzzel fzf gdb geticons git gjs gnome-control-center gnome-keyring gnome-system-monitor gnome-text-editor gnome-themes-extra gnome-tweaks gojq gradience-git grim grub gst-plugin-pipewire gtk-engine-murrine htop hyprland-git hyprpicker-git intel-ucode inter-font iwd jq keystore-explorer-bin lexend-fonts-git libqalculate light linux linux-firmware meson microsoft-edge-dev-bin mupdf nano nautilus neofetch netstandard-targeting-pack network-manager-applet networkmanager nginx ninja nlohmann-json nodejs-lts-hydrogen noto-fonts-cjk noto-fonts-emoji npm ntfs-3g openssh opentabletdriver os-prober osu-lazer pavucontrol perl-locale-gettext pipewire-alsa pipewire-audio pipewire-pulse plasma-browser-integration playerctl plymouth polkit-gnome python-build python-desktop-entry-lib python-material-color-utilities python-pillow python-poetry python-pywal qbittorrent qt5-wayland qt6-wayland ripgrep rustup sassc scdoc sddm sddm-sugar-candy-git slurp smartmontools socat sox spotify-launcher starship swappy swayidle swaylock swaylock-effects swww telegram-desktop trash-cli ttf-jetbrains-mono-nerd ttf-liberation ttf-material-design-icons-desktop-git ttf-material-symbols-variable-git ttf-space-mono-nerd typescript upower vencord-desktop-git vim visual-studio-code-bin vlc wayland-idle-inhibitor-git wayshot webcord wf-recorder wget wireless_tools wireplumber wlogout xdg-desktop-portal-hyprland xdg-utils yad yarn yay ydotool
```

### AGS

```bash
cd ~/Downloads   # Let's not trash your home folder
git clone --recursive https://github.com/Aylur/ags.git
cd ags
npm install
meson setup build
meson install -C build   # When asked to use sudo, make sure you say yes
```

- Optional
  - If you want media thumbnail from your browser to be shown, get the "Plasma browser integration" extension
    - For [Chromium](https://chrome.google.com/webstore/detail/plasma-integration/cimiefiiaegbelhefglklhhakcgmhkai)
    - For [Firefox](https://addons.mozilla.org/en-US/firefox/addon/plasma-integration/)
  - Copy .local/bin to use fuzzel emoji
  - sudo pacman -Syyuu
  - yay -Syu --devel

Check [end_4 illogical_impulse](https://github.com/end-4/dots-hyprland/tree/illogical-impulse) branch for more details or to use the original version
