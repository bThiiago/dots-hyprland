const { Gtk } = imports.gi;
import { Widget } from "../../imports.js";

import { ModuleLeftSpace } from "./leftspace.js";
import { ModuleMusic } from "./music.js";
import { ModuleRightSpace } from "./rightspace.js";
import { ModuleSystem } from "./system.js";
import ModuleWorkspaces from "./workspaces.js";

const left = Widget.Box({
  className: "bar-sidemodule",
  children: [ModuleMusic()],
});

const center = Widget.Box({
  children: [ModuleWorkspaces()],
});

const right = Widget.Box({
  className: "bar-sidemodule",
  children: [ModuleSystem()],
});

export default () =>
  Widget.Window({
    name: "bar",
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    visible: true,
    child: Widget.CenterBox({
      className: "bar-bg",
      startWidget: ModuleLeftSpace(),
      centerWidget: Widget.Box({
        className: "spacing-h-4",
        children: [left, center, right],
      }),
      endWidget: ModuleRightSpace(),
      setup: (self) => {
        const styleContext = self.get_style_context();
        const minHeight = styleContext.get_property(
          "min-height",
          Gtk.StateFlags.NORMAL
        );
      },
    }),
  });
