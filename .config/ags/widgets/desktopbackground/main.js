import { Widget } from "../../imports.js";
import TimeAndLaunchesWidget from "./timeandlaunches.js";
import SystemWidget from "./system.js";
const { Box, Overlay, Window } = Widget;

export default () =>
  Window({
    name: "desktopbackground",
    anchor: ["top", "bottom", "left", "right"],
    layer: "background",
    exclusivity: "normal",
    visible: true,
    child: Overlay({
      child: Box({
        hexpand: true,
        vexpand: true,
      }),
      overlays: [TimeAndLaunchesWidget(), SystemWidget()],
      setup: (self) =>
        self.set_overlay_pass_through(self.get_children()[1], true),
    }),
  });
