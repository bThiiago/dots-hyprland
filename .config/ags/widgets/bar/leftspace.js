import { App, Widget } from "../../imports.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import { RoundedCorner } from "../../lib/roundedcorner.js";
import Indicator from "../../services/indicator.js";
const { EventBox, Box, Overlay, Label, Scrollable } = Widget;

function truncateTitle(str) {
  let lastDash = -1;
  let found = -1;
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] === "—") {
      found = 0;
      lastDash = i;
    } else if (str[i] === "–" && found < 1) {
      found = 1;
      lastDash = i;
    } else if (str[i] === "-" && found < 2) {
      found = 2;
      lastDash = i;
    } else if (str[i] === "|" && found < 3) {
      found = 3;
      lastDash = i;
    } else if (str[i] === "·" && found < 4) {
      found = 4;
      lastDash = i;
    }
  }
  if (lastDash === -1) return str;
  return str.substring(0, lastDash);
}

export const ModuleLeftSpace = () =>
  EventBox({
    onScrollUp: () => {
      if (!Audio.speaker) return;
      Audio.microphone.volume += 0.01;
      Indicator.popup(1);
    },
    onScrollDown: () => {
      if (!Audio.speaker) return;
      Audio.microphone.volume -= 0.01;
      Indicator.popup(1);
    },
    onPrimaryClick: () => {
      App.toggleWindow("sideleft");
    },
    child: Box({
      homogeneous: false,
      children: [
        RoundedCorner("topleft", { className: "corner-black" }),
        Overlay({
          overlays: [
            Box({ hexpand: true }),
            Box({
              className: "bar-sidemodule",
              hexpand: true,
              children: [
                Box({
                  vertical: true,
                  className: "bar-space-button",
                  children: [
                    Scrollable({
                      hexpand: true,
                      vexpand: true,
                      hscroll: "automatic",
                      vscroll: "never",
                      child: Box({
                        vertical: true,
                        children: [
                          Label({
                            xalign: 0,
                            className: "txt-smaller bar-topdesc txt",
                            setup: (self) =>
                              self.hook(Hyprland.active.client, (label) => {
                                label.label =
                                  Hyprland.active.client._class.length === 0
                                    ? "Desktop"
                                    : Hyprland.active.client._class;
                              }),
                          }),
                          Label({
                            xalign: 0,
                            className: "txt txt-smallie",
                            setup: (self) =>
                              self.hook(Hyprland.active.client, (label) => {
                                label.label =
                                  Hyprland.active.client._title.length === 0
                                    ? `Workspace ${Hyprland.active.workspace.id}`
                                    : truncateTitle(
                                        Hyprland.active.client._title
                                      );
                              }),
                          }),
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
