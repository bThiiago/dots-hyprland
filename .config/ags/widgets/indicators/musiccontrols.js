const { Gio, GLib } = imports.gi;
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { exec, execAsync, readFile } = Utils;
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";

const { Box, Button, Label, Overlay, Revealer } = Widget;
import { MarginRevealer } from "../../lib/advancedwidgets.js";
import { AnimatedCircProg } from "../../lib/animatedcircularprogress.js";
import { setupCursorHover } from "../../lib/cursorhover.js";
import { showMusicControls } from "../../variables.js";

function expandTilde(path) {
  if (path.startsWith("~")) {
    return GLib.get_home_dir() + path.slice(1);
  } else {
    return path;
  }
}

const LIGHTDARK_FILE_LOCATION = `${GLib.get_user_cache_dir()}//ags/user/colormode.txt`;
const lightDark = readFile(expandTilde(LIGHTDARK_FILE_LOCATION)).trim();
const COVER_COLORSCHEME_SUFFIX = "_colorscheme.css";
const PREFERRED_PLAYER = "plasma-browser-integration";
var lastCoverPath = "";

function isRealPlayer(player) {
  return (
    !player.busName.startsWith("org.mpris.MediaPlayer2.firefox") &&
    !player.busName.startsWith("org.mpris.MediaPlayer2.playerctld")
  );
}

export const getPlayer = (name = PREFERRED_PLAYER) => {
  return Mpris.getPlayer(name) || Mpris.players[0] || null;
};

function lengthStr(length) {
  const min = Math.floor(length / 60);
  const sec = Math.floor(length % 60);
  const sec0 = sec < 10 ? "0" : "";
  return `${min}:${sec0}${sec}`;
}

function fileExists(filePath) {
  let file = Gio.File.new_for_path(filePath);
  return file.query_exists(null);
}

function detectMediaSource(link) {
  if (link.startsWith("file://")) {
    if (link.includes("firefox-mpris")) return "󰈹 Firefox";
    return "󰈣 File";
  }
  let url = link.replace(/(^\w+:|^)\/\//, "");
  let domain = url.match(/(?:[a-z]+\.)?([a-z]+\.[a-z]+)/i)[1];

  if (domain == "ytimg.com") return "󰗃 Youtube";
  if (domain == "discordapp.net") return "󰙯 Discord";
  if (domain == "spotify.com") return "󰓇 Spotify";
  if (domain == "soundcloud.com") return "󰓀 SoundCloud";
  if (domain == "sndcdn.com") return "󰓀 SoundCloud";
  if (domain == "scdn.co") return "󰓇 Spotify";
  return "󰖟" + domain;
}

const DEFAULT_MUSIC_FONT = "Gabarito, sans-serif";
function getTrackfont(player) {
  const title = player.trackTitle;
  const artists = player.trackArtists.join(" ");
  if (
    artists.includes("TANO*C") ||
    artists.includes("USAO") ||
    artists.includes("Kobaryo")
  )
    return "Chakra Petch";
  if (title.includes("東方")) return "Crimson Text, serif";
  return DEFAULT_MUSIC_FONT;
}

function trimTrackTitle(title) {
  var pattern = /【[^】]*】/;
  var cleanedTitle = title.replace(pattern, "");
  return cleanedTitle.trim();
}

const TrackProgress = ({ player, ...rest }) => {
  const _updateProgress = (circprog) => {
    const player = Mpris.getPlayer();
    if (!player) return;
    circprog.css = `font-size: ${Math.max(
      (player.position / player.length) * 100,
      0
    )}px;`;
  };
  return AnimatedCircProg({
    ...rest,
    className: "osd-music-circprog",
    vpack: "center",
    connections: [
      [Mpris, _updateProgress],
      [3000, _updateProgress],
    ],
  });
};

const TrackTitle = ({ player, ...rest }) =>
  Label({
    ...rest,
    label: "No music playing",
    xalign: 0,
    truncate: "end",
    className: "osd-music-title",
    connections: [
      [
        player,
        (self) => {
          self.label =
            player.trackTitle.length > 0
              ? trimTrackTitle(player.trackTitle)
              : "No media";
          const fontForThisTrack = getTrackfont(player);
          self.css = `font-family: ${fontForThisTrack}, ${DEFAULT_MUSIC_FONT};`;
        },
        "notify::track-title",
      ],
    ],
  });

const TrackArtists = ({ player, ...rest }) =>
  Label({
    ...rest,
    xalign: 0,
    className: "osd-music-artists",
    truncate: "end",
    connections: [
      [
        player,
        (self) => {
          self.label =
            player.trackArtists.length > 0
              ? player.trackArtists.join(", ")
              : "";
        },
        "notify::track-artists",
      ],
    ],
  });

const CoverArt = ({ player, ...rest }) =>
  Box({
    ...rest,
    className: "osd-music-cover",
    children: [
      Overlay({
        child: Box({
          className: "osd-music-cover-fallback",
          homogeneous: true,
          children: [
            Label({
              className: "icon-material txt-hugeass",
              label: "music_note",
            }),
          ],
        }),
        overlays: [
          Box({
            properties: [
              [
                "updateCover",
                (self) => {
                  const player = Mpris.getPlayer();

                  if (!player || player.trackTitle == "") {
                    self.css = `background-image: none;`;
                    App.applyCss(`${App.configDir}/style.css`);
                    return;
                  }

                  const coverPath = player.coverPath;
                  const stylePath = `${player.coverPath}${lightDark}${COVER_COLORSCHEME_SUFFIX}`;
                  if (player.coverPath == lastCoverPath) {
                    self.css = `background-image: url('${coverPath}');`;
                  }
                  lastCoverPath = player.coverPath;

                  if (fileExists(stylePath)) {
                    self.css = `background-image: url('${coverPath}');`;
                    App.applyCss(stylePath);
                    return;
                  }

                  execAsync([
                    "bash",
                    "-c",
                    `${App.configDir}/scripts/color_generation/generate_colors_material.py --path '${coverPath}' > ${App.configDir}/scss/_musicmaterial.scss ${lightDark}`,
                  ])
                    .then(() => {
                      exec(
                        `wal -i "${player.coverPath}" -n -t -s -e -q ${lightDark}`
                      );
                      exec(
                        `cp ${GLib.get_user_cache_dir()}/wal/colors.scss ${
                          App.configDir
                        }/scss/_musicwal.scss`
                      );
                      exec(
                        `sassc ${App.configDir}/scss/_music.scss ${stylePath}`
                      );
                      self.css = `background-image: url('${coverPath}');`;
                      App.applyCss(`${stylePath}`);
                    })
                    .catch(print);
                },
              ],
            ],
            className: "osd-music-cover-art",
            connections: [
              [player, (self) => self._updateCover(self), "notify::cover-path"],
            ],
          }),
        ],
      }),
    ],
  });

const TrackControls = ({ player, ...rest }) =>
  Revealer({
    revealChild: false,
    transition: "slide_right",
    transitionDuration: 200,
    child: Box({
      ...rest,
      vpack: "center",
      className: "osd-music-controls spacing-h-3",
      children: [
        Button({
          className: "osd-music-controlbtn",
          onClicked: () => {
            Mpris.getPlayer().previous();
          },
          child: Label({
            className: "icon-material osd-music-controlbtn-txt",
            label: "skip_previous",
          }),
          setup: setupCursorHover,
        }),
        Button({
          className: "osd-music-controlbtn",
          onClicked: () => {
            Mpris.getPlayer().next();
          },
          child: Label({
            className: "icon-material osd-music-controlbtn-txt",
            label: "skip_next",
          }),
          setup: setupCursorHover,
        }),
      ],
    }),
    connections: [
      [
        Mpris,
        (self) => {
          const player = Mpris.getPlayer();
          if (!player) self.revealChild = false;
          else self.revealChild = true;
        },
        "notify::play-back-status",
      ],
    ],
  });

const TrackSource = ({ player, ...rest }) =>
  Revealer({
    revealChild: false,
    transition: "slide_left",
    transitionDuration: 200,
    child: Box({
      ...rest,
      className: "osd-music-pill spacing-h-5",
      homogeneous: true,
      children: [
        Label({
          hpack: "fill",
          justification: "center",
          className: "icon-nerd",
          connections: [
            [
              player,
              (self) => {
                self.label = detectMediaSource(player.trackCoverUrl);
              },
              "notify::cover-path",
            ],
          ],
        }),
      ],
    }),
    connections: [
      [
        Mpris,
        (self) => {
          const mpris = Mpris.getPlayer("");
          if (!mpris) self.revealChild = false;
          else self.revealChild = true;
        },
      ],
    ],
  });

const TrackTime = ({ player, ...rest }) => {
  return Revealer({
    revealChild: false,
    transition: "slide_left",
    transitionDuration: 200,
    child: Box({
      ...rest,
      vpack: "center",
      className: "osd-music-pill spacing-h-5",
      children: [
        Label({
          connections: [
            [
              1000,
              (self) => {
                const player = Mpris.getPlayer();
                if (!player) return;
                self.label = lengthStr(player.position);
              },
            ],
          ],
        }),
        Label({ label: "/" }),
        Label({
          connections: [
            [
              Mpris,
              (self) => {
                const player = Mpris.getPlayer();
                if (!player) return;
                self.label = lengthStr(player.length);
              },
            ],
          ],
        }),
      ],
    }),
    connections: [
      [
        Mpris,
        (self) => {
          if (!player) self.revealChild = false;
          else self.revealChild = true;
        },
      ],
    ],
  });
};

const PlayState = ({ player }) => {
  const trackCircProg = TrackProgress({ player: player });
  return Button({
    className: "osd-music-playstate",
    child: Overlay({
      child: trackCircProg,
      overlays: [
        Button({
          className: "osd-music-playstate-btn",
          onClicked: () => {
            Mpris.getPlayer().playPause();
          },
          child: Label({
            justification: "center",
            hpack: "fill",
            vpack: "center",
            connections: [
              [
                player,
                (label) => {
                  label.label = `${
                    player.playBackStatus == "Playing" ? "pause" : "play_arrow"
                  }`;
                },
                "notify::play-back-status",
              ],
            ],
          }),
        }),
      ],
      setup: setupCursorHover,
      passThrough: true,
    }),
  });
};

const MusicControlsWidget = (player) =>
  Box({
    className: "osd-music spacing-h-20",
    children: [
      CoverArt({ player: player, vpack: "center" }),
      Box({
        vertical: true,
        className: "spacing-v-5 osd-music-info",
        children: [
          Box({
            vertical: true,
            vpack: "center",
            hexpand: true,
            children: [
              TrackTitle({ player: player }),
              TrackArtists({ player: player }),
            ],
          }),
          Box({ vexpand: true }),
          Box({
            className: "spacing-h-10",
            setup: (box) => {
              box.pack_start(
                TrackControls({ player: player }),
                false,
                false,
                0
              );
              box.pack_end(PlayState({ player: player }), false, false, 0);
              box.pack_end(TrackTime({ player: player }), false, false, 0);
              box.pack_end(
                TrackSource({ vpack: "center", player: player }),
                false,
                false,
                0
              );
            },
          }),
        ],
      }),
    ],
  });

export default () =>
  MarginRevealer({
    transition: "slide_down",
    revealChild: false,
    showClass: "osd-show",
    hideClass: "osd-hide",
    child: Box({
      connections: [
        [
          Mpris,
          (box) => {
            let foundPlayer = false;
            Mpris.players.forEach((player, i) => {
              if (isRealPlayer(player)) {
                foundPlayer = true;
                box._player = player;
                box.children = [MusicControlsWidget(player)];
              }
            });

            if (!foundPlayer) {
              box._player = null;
              const children = box.get_children();
              for (let i = 0; i < children.length; i++) {
                const child = children[i];
                child.destroy();
              }
              return;
            }
          },
          "notify::players",
        ],
      ],
    }),
    connections: [
      [
        showMusicControls,
        (revealer) => {
          if (showMusicControls.value) revealer._show();
          else revealer._hide();
        },
      ],
    ],
  });
