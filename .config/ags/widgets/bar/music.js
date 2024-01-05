import { Utils, Widget } from "../../imports.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import { AnimatedCircProg } from "../../lib/animatedcircularprogress.js";
import { showMusicControls } from "../../variables.js";
const { Box, EventBox, Label, Overlay, Scrollable } = Widget;
const { execAsync } = Utils;

function trimTrackTitle(title) {
  var pattern = /【[^】]*】/;
  var cleanedTitle = title.replace(pattern, "");
  return cleanedTitle.trim();
}

const TrackProgress = () => {
  const _updateProgress = (circprog) => {
    const mpris = Mpris.getPlayer("");
    if (!mpris) return;
    circprog.css = `font-size: ${Math.max(
      (mpris.position / mpris.length) * 100,
      0
    )}px;`;
  };
  return AnimatedCircProg({
    className: "bar-music-circprog",
    vpack: "center",
    hpack: "center",
    connections: [
      [Mpris, _updateProgress],
      [3000, _updateProgress],
    ],
  });
};

export const ModuleMusic = () =>
  EventBox({
    onScrollUp: () => Hyprland.sendMessage(`dispatch workspace -1`),
    onScrollDown: () => Hyprland.sendMessage(`dispatch workspace +1`),
    onPrimaryClickRelease: () =>
      showMusicControls.setValue(!showMusicControls.value),
    onSecondaryClickRelease: () =>
      execAsync([
        "bash",
        "-c",
        'playerctl next || playerctl position `bc <<< "100 * $(playerctl metadata mpris:length) / 1000000 / 100"` &',
      ]),
    onMiddleClickRelease: () => Mpris.getPlayer("")?.playPause(),
    child: Box({
      className: "bar-group-margin bar-sides",
      children: [
        Box({
          className:
            "bar-group bar-group-standalone bar-group-pad-music spacing-h-10",
          children: [
            Box({
              homogeneous: true,
              children: [
                Overlay({
                  child: Box({
                    vpack: "center",
                    className: "bar-music-playstate",
                    homogeneous: true,
                    children: [
                      Label({
                        vpack: "center",
                        className: "bar-music-playstate-txt",
                        justification: "center",
                        connections: [
                          [
                            Mpris,
                            (label) => {
                              const mpris = Mpris.getPlayer("");
                              label.label = `${
                                mpris !== null &&
                                mpris.playBackStatus == "Playing"
                                  ? "pause"
                                  : "play_arrow"
                              }`;
                            },
                          ],
                        ],
                      }),
                    ],
                    connections: [
                      [
                        Mpris,
                        (label) => {
                          const mpris = Mpris.getPlayer("");
                          if (!mpris) return;
                          label.toggleClassName(
                            "bar-music-playstate-playing",
                            mpris !== null && mpris.playBackStatus == "Playing"
                          );
                          label.toggleClassName(
                            "bar-music-playstate",
                            mpris !== null || mpris.playBackStatus == "Paused"
                          );
                        },
                      ],
                    ],
                  }),
                  overlays: [TrackProgress()],
                }),
              ],
            }),
            Scrollable({
              hexpand: true,
              child: Label({
                className: "txt-smallie txt-onSurfaceVariant txt-semibold",
                connections: [
                  [
                    Mpris,
                    (label) => {
                      const mpris = Mpris.getPlayer("");
                      if (mpris)
                        label.label = `${trimTrackTitle(
                          mpris.trackTitle
                        )} • ${mpris.trackArtists.join(", ")}`;
                      else label.label = "No media";
                    },
                  ],
                ],
              }),
            }),
          ],
        }),
      ],
    }),
  });
