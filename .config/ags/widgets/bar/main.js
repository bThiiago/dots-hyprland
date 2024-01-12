const { Gtk } = imports.gi;
import Widget from "resource:///com/github/Aylur/ags/widget.js";
const { Box, CenterBox, Window } = Widget;
import { ModuleLeftSpace } from "./leftspace.js";
import { ModuleMusic } from "./music.js";
import { ModuleRightSpace } from "./rightspace.js";
import { ModuleSystem } from "./system.js";
import ModuleWorkspaces from "./workspaces.js";

const left = Box({
  className: "bar-sidemodule",
  children: [ModuleMusic()],
});

const center = Box({
  children: [ModuleWorkspaces()],
});

const right = Box({
  className: "bar-sidemodule",
  children: [ModuleSystem()],
});

export default () =>
  Window({
    name: "bar",
    anchor: ["top", "left", "right"],
    exclusivity: "exclusive",
    visible: true,
    child: CenterBox({
      className: "bar-bg",
      startWidget: ModuleLeftSpace(),
      centerWidget: Box({
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
