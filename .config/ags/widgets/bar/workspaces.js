const { Gdk, Gtk } = imports.gi;
const Lang = imports.lang;
const Cairo = imports.cairo;
const Pango = imports.gi.Pango;
const PangoCairo = imports.gi.PangoCairo;
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
const { Box, DrawingArea, EventBox } = Widget;
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";

const NUM_OF_WORKSPACES = 10;
const dummyWs = Box({ className: "bar-ws" });
const dummyActiveWs = Box({ className: "bar-ws bar-ws-active" });
const dummyOccupiedWs = Box({ className: "bar-ws bar-ws-occupied" });

const WorkspaceContents = (count = 10) => {
  return DrawingArea({
    css: `transition: 90ms cubic-bezier(0.1, 1, 0, 1);`,
    properties: [
      ["initialized", false],
      ["workspaceMask", 0],
      [
        "updateMask",
        (self) => {
          if (self._initialized) return;
          const workspaces = Hyprland.workspaces;
          let workspaceMask = 0;
          for (let i = 0; i < workspaces.length; i++) {
            const ws = workspaces[i];
            if (ws.id < 0) continue;
            if (ws.id > count) return;
            if (workspaces[i].windows > 0) {
              workspaceMask |= 1 << ws.id;
            }
          }
          self._workspaceMask = workspaceMask;
          self._initialized = true;
        },
      ],
      [
        "toggleMask",
        (self, occupied, name) => {
          if (occupied) self._workspaceMask |= 1 << parseInt(name);
          else self._workspaceMask &= ~(1 << parseInt(name));
        },
      ],
    ],
    setup: (area) =>
      area
        .hook(Hyprland.active.workspace, (area) =>
          area.setCss(`font-size: ${Hyprland.active.workspace.id}px;`)
        )
        .hook(Hyprland, (self) => self._updateMask(self), "notify::workspaces")
        .hook(
          Hyprland,
          (self, name) => self._toggleMask(self, true, name),
          "workspace-added"
        )
        .hook(
          Hyprland,
          (self, name) => self._toggleMask(self, false, name),
          "workspace-removed"
        )
        .on(
          "draw",
          Lang.bind(area, (area, cr) => {
            const allocation = area.get_allocation();
            const { width, height } = allocation;

            const workspaceStyleContext = dummyWs.get_style_context();
            const workspaceDiameter = workspaceStyleContext.get_property(
              "min-width",
              Gtk.StateFlags.NORMAL
            );
            const workspaceRadius = workspaceDiameter / 2;
            const workspaceFontSize =
              (workspaceStyleContext.get_property(
                "font-size",
                Gtk.StateFlags.NORMAL
              ) /
                4) *
              3;
            const workspaceFontFamily = workspaceStyleContext.get_property(
              "font-family",
              Gtk.StateFlags.NORMAL
            );
            const wsbg = workspaceStyleContext.get_property(
              "background-color",
              Gtk.StateFlags.NORMAL
            );
            const wsfg = workspaceStyleContext.get_property(
              "color",
              Gtk.StateFlags.NORMAL
            );

            const occupiedWorkspaceStyleContext =
              dummyOccupiedWs.get_style_context();
            const occupiedbg = occupiedWorkspaceStyleContext.get_property(
              "background-color",
              Gtk.StateFlags.NORMAL
            );
            const occupiedfg = occupiedWorkspaceStyleContext.get_property(
              "color",
              Gtk.StateFlags.NORMAL
            );

            const activeWorkspaceStyleContext =
              dummyActiveWs.get_style_context();
            const activebg = activeWorkspaceStyleContext.get_property(
              "background-color",
              Gtk.StateFlags.NORMAL
            );
            const activefg = activeWorkspaceStyleContext.get_property(
              "color",
              Gtk.StateFlags.NORMAL
            );
            area.set_size_request(workspaceDiameter * count, -1);
            const widgetStyleContext = area.get_style_context();
            const activeWs = widgetStyleContext.get_property(
              "font-size",
              Gtk.StateFlags.NORMAL
            );

            const activeWsCenterX =
              -(workspaceDiameter / 2) + workspaceDiameter * activeWs;
            const activeWsCenterY = height / 2;

            const layout = PangoCairo.create_layout(cr);
            const fontDesc = Pango.font_description_from_string(
              `${workspaceFontFamily[0]} ${workspaceFontSize}`
            );
            layout.set_font_description(fontDesc);
            cr.setAntialias(Cairo.Antialias.BEST);
            layout.set_text("0".repeat(count.toString().length), -1);
            const [layoutWidth, layoutHeight] = layout.get_pixel_size();
            const indicatorRadius =
              (Math.max(layoutWidth, layoutHeight) / 2) * 1.2;
            const indicatorGap = workspaceRadius - indicatorRadius;

            for (let i = 1; i <= count; i++) {
              if (area._workspaceMask & (1 << i)) {
                cr.setSourceRGBA(
                  occupiedbg.red,
                  occupiedbg.green,
                  occupiedbg.blue,
                  occupiedbg.alpha
                );
                const wsCenterX = -workspaceRadius + workspaceDiameter * i;
                const wsCenterY = height / 2;
                if (!(area._workspaceMask & (1 << (i - 1)))) {
                  cr.arc(
                    wsCenterX,
                    wsCenterY,
                    workspaceRadius,
                    0.5 * Math.PI,
                    1.5 * Math.PI
                  );
                  cr.fill();
                } else {
                  cr.rectangle(
                    wsCenterX - workspaceRadius,
                    wsCenterY - workspaceRadius,
                    workspaceRadius,
                    workspaceRadius * 2
                  );
                  cr.fill();
                }
                if (!(area._workspaceMask & (1 << (i + 1)))) {
                  cr.arc(
                    wsCenterX,
                    wsCenterY,
                    workspaceRadius,
                    -0.5 * Math.PI,
                    0.5 * Math.PI
                  );
                  cr.fill();
                } else {
                  cr.rectangle(
                    wsCenterX,
                    wsCenterY - workspaceRadius,
                    workspaceRadius,
                    workspaceRadius * 2
                  );
                  cr.fill();
                }

                cr.setSourceRGBA(
                  occupiedfg.red,
                  occupiedfg.green,
                  occupiedfg.blue,
                  occupiedfg.alpha
                );
              } else
                cr.setSourceRGBA(wsfg.red, wsfg.green, wsfg.blue, wsfg.alpha);
              layout.set_text(`${i}`, -1);
              const [layoutWidth, layoutHeight] = layout.get_pixel_size();
              const x =
                -workspaceRadius + workspaceDiameter * i - layoutWidth / 2;
              const y = (height - layoutHeight) / 2;
              cr.moveTo(x, y);
              PangoCairo.show_layout(cr, layout);
              cr.stroke();
            }

            cr.setSourceRGBA(
              activebg.red,
              activebg.green,
              activebg.blue,
              activebg.alpha
            );
            cr.arc(
              activeWsCenterX,
              activeWsCenterY,
              indicatorRadius,
              0,
              2 * Math.PI
            );
            cr.fill();
            cr.setSourceRGBA(
              activefg.red,
              activefg.green,
              activefg.blue,
              activefg.alpha
            );
            cr.arc(
              activeWsCenterX,
              activeWsCenterY,
              indicatorRadius * 0.2,
              0,
              2 * Math.PI
            );
            cr.fill();
          })
        ),
  });
};

export default () =>
  EventBox({
    onScrollUp: () => Hyprland.sendMessage(`dispatch workspace -1`),
    onScrollDown: () => Hyprland.sendMessage(`dispatch workspace +1`),
    onMiddleClickRelease: () => App.toggleWindow("overview"),
    onSecondaryClickRelease: () => App.toggleWindow("osk"),
    properties: [["clicked", false]],
    child: Box({
      homogeneous: true,
      className: "bar-group-margin",
      children: [
        Box({
          className: "bar-group bar-group-standalone bar-group-pad",
          css: "min-width: 2px;",
          children: [WorkspaceContents(10)],
        }),
      ],
    }),
    setup: (self) => {
      self.add_events(Gdk.EventMask.POINTER_MOTION_MASK);
      self.on("motion-notify-event", (self, event) => {
        if (!self._clicked) return;
        console.log("switching move");
        const [_, cursorX, cursorY] = event.get_coords();
        const widgetWidth = self.get_allocation().width;
        const wsId = Math.ceil((cursorX * NUM_OF_WORKSPACES) / widgetWidth);
        Hyprland.sendMessage(`dispatch workspace ${wsId}`);
      });
      self.on("button-press-event", (self, event) => {
        if (!(event.get_button()[1] === 1)) return;
        console.log("switching");
        self._clicked = true;
        const [_, cursorX, cursorY] = event.get_coords();
        const widgetWidth = self.get_allocation().width;
        const wsId = Math.ceil((cursorX * NUM_OF_WORKSPACES) / widgetWidth);
        Hyprland.sendMessage(`dispatch workspace ${wsId}`);
      });
      self.on("button-release-event", (self) => (self._clicked = false));
    },
  });
