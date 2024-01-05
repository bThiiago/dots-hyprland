import { Utils, Widget } from "../../imports.js";
const { Box, Label, Button, Overlay, Revealer } = Widget;
const { execAsync } = Utils;
const { GLib } = imports.gi;
import Battery from "resource:///com/github/Aylur/ags/service/battery.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
import { MaterialIcon } from "../../lib/materialicon.js";
import { AnimatedCircProg } from "../../lib/animatedcircularprogress.js";

const BatBatteryProgress = () => {
  const _updateProgress = (circprog) => {
    circprog.css = `font-size: 100px;`;
  };
  return AnimatedCircProg({
    className: "bar-batt-circprog",
    vpack: "center",
    hpack: "center",
    connections: [[Battery, _updateProgress]],
  });
};

const BarClock = () =>
  Widget.Box({
    vpack: "center",
    className: "spacing-h-5 txt-onSurfaceVariant bar-clock-box",
    children: [
      Widget.Label({
        className: "bar-clock",
        tooltipText: "Clock",
        label: GLib.DateTime.new_now_local().format("%H:%M"),
        setup: (self) =>
          self.poll(5000, (label) => {
            label.label = GLib.DateTime.new_now_local().format("%H:%M");
          }),
      }),
      Widget.Label({
        className: "txt-norm",
        label: "•",
      }),
      Widget.Label({
        className: "txt-smallie txt-onSurfaceVariant txt-semibold",
        tooltipText: "Date",
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
    className: "bar-util-btn icon-material txt-norm txt-onSurfaceVariant",
    label: `${icon}`,
  });

const Utilities = () =>
  Box({
    hpack: "center",
    className: "spacing-h-5",
    children: [
      UtilButton({
        name: "Screen snip",
        icon: "screenshot_region",
        onClicked: () => {
          Utils.execAsync([
            "bash",
            "-c",
            `grim -g "$(slurp -d -c e2e2e2BB -b 31313122 -s 00000000)" | wl-copy &`,
          ]).catch(print);
        },
      }),
      UtilButton({
        name: "Color picker",
        icon: "colorize",
        onClicked: () => {
          Utils.execAsync(["hyprpicker", "-a"]).catch(print);
        },
      }),
      UtilButton({
        name: "Toggle on-screen keyboard",
        icon: "keyboard",
        onClicked: () => {
          App.toggleWindow("osk");
        },
      }),
    ],
  });

const BarBattery = () =>
  Box({
    className: "spacing-h-4 txt-onSurfaceVariant txt-semibold",
    tooltipText: "Battery",
    children: [
      Revealer({
        transitionDuration: 150,
        revealChild: false,
        transition: "slide_right",
        child: MaterialIcon("bolt", "norm"),
        setup: (self) =>
          self.hook(Battery, () => {
            self.revealChild = Battery.charging;
          }),
      }),
      Label({
        className: "txt-smallie txt-onSurfaceVariant txt-semibold",
        setup: (self) =>
          self.hook(Battery, (label) => {
            label.label = `100%`;
          }),
      }),
      Overlay({
        child: Widget.Box({
          vpack: "center",
          className: "bar-batt",
          homogeneous: true,
          children: [MaterialIcon("settings_heart", "small")],
        }),
        overlays: [BatBatteryProgress()],
      }),
    ],
  });

const BarGroup = ({ child }) =>
  Widget.Box({
    className: "bar-group-margin bar-sides",
    children: [
      Widget.Box({
        className: "bar-group bar-group-standalone bar-group-pad-system",
        children: [child],
      }),
    ],
  });

export const ModuleSystem = () =>
  Widget.EventBox({
    onScrollUp: () => Hyprland.sendMessage(`dispatch workspace -1`),
    onScrollDown: () => Hyprland.sendMessage(`dispatch workspace +1`),
    onPrimaryClick: () => App.toggleWindow("sideright"),
    child: Widget.Box({
      className: "spacing-h-5",
      children: [
        BarGroup({ child: BarClock() }),
        BarGroup({ child: Utilities() }),
        BarGroup({ child: BarBattery() }),
      ],
    }),
  });
