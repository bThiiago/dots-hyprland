import { App, Utils, Widget } from "../../imports.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Mpris from "resource:///com/github/Aylur/ags/service/mpris.js";
import SystemTray from "resource:///com/github/Aylur/ags/service/systemtray.js";
import Indicator from "../../services/indicator.js";
import { StatusIcons } from "../../lib/statusicons.js";
import { RoundedCorner } from "../../lib/roundedcorner.js";
import { Tray } from "./tray.js";
const { Box, EventBox, Revealer } = Widget;
const { execAsync } = Utils;

export const ModuleRightSpace = () => {
  const barTray = Tray();
  const barStatusIcons = StatusIcons({
    className: "bar-statusicons",
    setup: (self) =>
      self.hook(App, (self, currentName, visible) => {
        if (currentName === "sideright") {
          self.toggleClassName("bar-statusicons-active", visible);
        }
      }),
  });

  return EventBox({
    onScrollUp: () => {
      if (!Audio.speaker) return;
      Audio.speaker.volume += 0.05;
      Indicator.popup(1);
    },
    onScrollDown: () => {
      if (!Audio.speaker) return;
      Audio.speaker.volume -= 0.05;
      Indicator.popup(1);
    },
    onPrimaryClick: () => App.toggleWindow("sideright"),
    onSecondaryClickRelease: () =>
      execAsync([
        "bash",
        "-c",
        'playerctl next || playerctl position `bc <<< "100 * $(playerctl metadata mpris:length) / 1000000 / 100"` &',
      ]),
    onMiddleClickRelease: () => Mpris.getPlayer("")?.playPause(),
    child: Box({
      homogeneous: false,
      children: [
        Box({
          hexpand: true,
          className: "spacing-h-5 txt",
          children: [
            Box({
              hexpand: true,
              className: "spacing-h-5 txt",
              children: [
                Box({ hexpand: true }),
                barTray,
                Revealer({
                  transition: "slide_left",
                  revealChild: false,
                  properties: [
                    ["count", 0],
                    [
                      "update",
                      (self, diff) => {
                        self._count += diff;
                        self.revealChild = self._count > 0;
                      },
                    ],
                  ],
                  child: Box({
                    vpack: "center",
                    className: "separator-circle",
                  }),
                  setup: (self) =>
                    self
                      .hook(
                        SystemTray,
                        (self) => self._update(self, 1),
                        "added"
                      )
                      .hook(
                        SystemTray,
                        (self) => self._update(self, -1),
                        "removed"
                      ),
                }),
                barStatusIcons,
              ],
            }),
          ],
        }),
        RoundedCorner("topright", { className: "corner-black" }),
      ],
    }),
  });
};
