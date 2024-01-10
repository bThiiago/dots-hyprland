import { Utils, Widget } from "../../imports.js";
const { Box, Label, Button, Overlay, Revealer, Stack, EventBox } = Widget;
const { execAsync, timeout } = Utils;
const { GLib } = imports.gi;
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import { MaterialIcon } from "../../lib/materialicon.js";
import { AnimatedCircProg } from "../../lib/animatedcircularprogress.js";

const BATTERY_LOW = 20;

const BatBatteryProgress = () => {
  const _updateProgress = (circprog) => {
    circprog.css = `font-size: ${Battery.percent}px;`;

    circprog.toggleClassName(
      "bar-batt-circprog-low",
      Battery.percent <= BATTERY_LOW
    );
    circprog.toggleClassName("bar-batt-circprog-full", Battery.charged);
  };
  return AnimatedCircProg({
    className: "bar-batt-circprog",
    vpack: "center",
    hpack: "center",
    connections: [[Battery, _updateProgress]],
  });
};

const BarClock = () =>
  Box({
    vpack: "center",
    className: "spacing-h-5 txt-onSurfaceVariant bar-clock-box",
    children: [
      Label({
        className: "bar-clock",
        label: GLib.DateTime.new_now_local().format("%H:%M"),
        setup: (self) =>
          self.poll(5000, (label) => {
            label.label = GLib.DateTime.new_now_local().format("%H:%M");
          }),
      }),
      Label({
        className: "txt-norm",
        label: "•",
      }),
      Label({
        className: "txt-smallie txt-semibold",
        label: GLib.DateTime.new_now_local().format("%A, %d/%m"),
        setup: (self) =>
          self.poll(5000, (label) => {
            label.label = GLib.DateTime.new_now_local().format("%A, %d/%m");
          }),
      }),
    ],
  });

const UtilButton = ({ name, icon, onClicked }) =>
  Button({
    vpack: "center",
    tooltipText: name,
    onClicked: onClicked,
    className: "bar-util-btn icon-material txt-norm",
    label: `${icon}`,
  });

const Utilities = () =>
  Box({
    hpack: "center",
    className: "spacing-h-5 txt-onSurfaceVariant",
    children: [
      UtilButton({
        name: "Screen snip",
        icon: "screenshot_region",
        onClicked: () => {
          execAsync([
            "bash",
            "-c",
            `grim -g "$(slurp -d -c e2e2e2BB -b 31313122 -s 00000000)" - | wl-copy &`,
          ]).catch(print);
        },
      }),
      UtilButton({
        name: "Color picker",
        icon: "colorize",
        onClicked: () => {
          execAsync(["hyprpicker", "-a"]).catch(print);
        },
      }),
    ],
  });

const BarBattery = () =>
  Box({
    className: "spacing-h-4 txt-onSurfaceVariant",
    children: [
      Revealer({
        transitionDuration: 150,
        revealChild: false,
        transition: "slide_right",
        child: MaterialIcon("bolt", "norm"),
        setup: (self) =>
          self.hook(Battery, (revealer) => {
            self.revealChild = Battery.charging;
          }),
      }),
      Label({
        className: "txt-smallie txt-onSurfaceVariant",
        setup: (self) =>
          self.hook(Battery, (label) => {
            label.label = `${Battery.percent}%`;
          }),
      }),
      Overlay({
        child: Box({
          vpack: "center",
          className: "bar-batt",
          homogeneous: true,
          children: [MaterialIcon("settings_heart", "small")],
          setup: (self) =>
            self.hook(Battery, (box) => {
              box.toggleClassName(
                "bar-batt-low",
                Battery.percent <= BATTERY_LOW
              );
              box.toggleClassName("bar-batt-full", Battery.charged);
            }),
        }),
        overlays: [BatBatteryProgress()],
      }),
    ],
  });

const BarResource = (name, icon, command) => {
  const resourceLabel = Label({
    className: "txt-smallie txt-onSurfaceVariant",
  });
  const resourceCircProg = AnimatedCircProg({
    className: "bar-batt-circprog",
    vpack: "center",
    hpack: "center",
    connections: [
      [
        5000,
        (progress) =>
          execAsync(["bash", "-c", command])
            .then((output) => {
              progress.css = `font-size: ${Number(output)}px;`;
              resourceLabel.label = `${Math.round(Number(output))}%`;
              widget.tooltipText = `${name}: ${Math.round(Number(output))}%`;
            })
            .catch(print),
      ],
    ],
  });
  const widget = Box({
    className: "spacing-h-4 txt-onSurfaceVariant",
    children: [
      resourceLabel,
      Overlay({
        child: Box({
          vpack: "center",
          className: "bar-batt",
          homogeneous: true,
          children: [MaterialIcon(icon, "small")],
        }),
        overlays: [resourceCircProg],
      }),
    ],
  });
  return widget;
};

const BarGroup = ({ child }) =>
  Box({
    className: "bar-group-margin bar-sides",
    children: [
      Box({
        className: "bar-group bar-group-standalone bar-group-pad-system",
        children: [child],
      }),
    ],
  });

export const ModuleSystem = () =>
  EventBox({
    onScrollUp: () => Hyprland.sendMessage(`dispatch workspace -1`),
    onScrollDown: () => Hyprland.sendMessage(`dispatch workspace +1`),
    onPrimaryClick: () => App.toggleWindow("sideright"),
    child: Box({
      className: "spacing-h-5",
      children: [
        BarGroup({ child: BarClock() }),
        Stack({
          transition: "slide_up_down",
          transitionDuration: 150,
          items: [
            [
              "laptop",
              Box({
                className: "spacing-h-5",
                children: [
                  BarGroup({ child: Utilities() }),
                  BarGroup({ child: BarBattery() }),
                ],
              }),
            ],
            [
              "desktop",
              Box({
                className: "spacing-h-5",
                children: [
                  BarGroup({ child: Utilities() }),
                  BarGroup({
                    child: BarResource(
                      "RAM usage",
                      "memory",
                      `free | awk '/^Mem/ {printf("%.2f\\n", ($3/$2) * 100)}'`
                    ),
                  }),
                  BarGroup({
                    child: BarResource(
                      "Disk space",
                      "hard_drive_2",
                      `echo $(df --output=pcent / | tr -dc '0-9')`
                    ),
                  }),
                ],
              }),
            ],
          ],
          setup: (stack) =>
            timeout(10, () => {
              if (!Battery.available) stack.shown = "desktop";
              else stack.shown = "laptop";
            }),
        }),
      ],
    }),
  });
