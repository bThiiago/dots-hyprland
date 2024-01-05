import { Widget, Utils, Service } from "../../imports.js";
import Bluetooth from "resource:///com/github/Aylur/ags/service/bluetooth.js";
import Network from "resource:///com/github/Aylur/ags/service/network.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
const { execAsync, exec } = Utils;
import { BluetoothIndicator, NetworkIndicator } from "../../lib/statusicons.js";
import { setupCursorHover } from "../../lib/cursorhover.js";
import { MaterialIcon } from "../../lib/materialicon.js";

export const ToggleIconWifi = (props = {}) =>
  Widget.Button({
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Network | Right-click to configure",
    onClicked: Network.toggleWifi,
    onSecondaryClickRelease: () => {
      execAsync([
        "bash",
        "-c",
        'XDG_CURRENT_DESKTOP="gnome" gnome-control-center network',
        "&",
      ]);
      App.closeWindow("sideright");
    },
    child: NetworkIndicator(),
    connections: [
      [
        Network,
        (button) => {
          button.toggleClassName(
            "sidebar-button-active",
            [Network.wifi?.internet, Network.wired?.internet].includes(
              "connected"
            )
          );
        },
      ],
      [
        Network,
        (button) => {
          button.tooltipText =
            `Network | Right-click to configure` || "Unknown";
        },
      ],
    ],
    setup: setupCursorHover,
    ...props,
  });

export const ToggleIconBluetooth = (props = {}) =>
  Widget.Button({
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Bluetooth | Right-click to configure",
    onClicked: () => {
      // Provided service doesn't work hmmm
      const status = Bluetooth?.enabled;
      if (status) {
        exec("rfkill block bluetooth");
      } else {
        exec("rfkill unblock bluetooth");
      }
    },
    onSecondaryClickRelease: () => {
      execAsync([
        "bash",
        "-c",
        'XDG_CURRENT_DESKTOP="gnome" gnome-control-center bluetooth',
        "&",
      ]);
      App.closeWindow("sideright");
    },
    child: BluetoothIndicator(),
    connections: [
      [
        Bluetooth,
        (button) => {
          button.toggleClassName("sidebar-button-active", Bluetooth?.enabled);
        },
      ],
    ],
    setup: setupCursorHover,
    ...props,
  });

export const HyprToggleIcon = (icon, name, hyprlandConfigValue, props = {}) =>
  Widget.Button({
    className: "txt-small sidebar-iconbutton",
    tooltipText: `${name}`,
    onClicked: (button) => {
      // Set the value to 1 - value
      Utils.execAsync(`hyprctl -j getoption ${hyprlandConfigValue}`)
        .then((result) => {
          const currentOption = JSON.parse(result).int;
          execAsync([
            "bash",
            "-c",
            `hyprctl keyword ${hyprlandConfigValue} ${1 - currentOption} &`,
          ]).catch(print);
          button.toggleClassName("sidebar-button-active", currentOption == 0);
        })
        .catch(print);
    },
    child: MaterialIcon(icon, "norm", { hpack: "center" }),
    setup: (button) => {
      button.toggleClassName(
        "sidebar-button-active",
        JSON.parse(Utils.exec(`hyprctl -j getoption ${hyprlandConfigValue}`))
          .int == 1
      );
      setupCursorHover(button);
    },
    ...props,
  });

export const ModuleNightLight = (props = {}) =>
  Widget.Button({
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Night Light",
    onClicked: (button) => {
      const shaderPath = JSON.parse(
        exec("hyprctl -j getoption decoration:screen_shader")
      ).str;
      if (shaderPath != "[[EMPTY]]" && shaderPath != "") {
        execAsync([
          "bash",
          "-c",
          `hyprctl keyword decoration:screen_shader '' && hyprctl reload`,
        ]).catch(print);
        button.toggleClassName("sidebar-button-active", false);
      } else {
        execAsync([
          "bash",
          "-c",
          `hyprctl keyword decoration:screen_shader ~/.config/hypr/shaders/night.frag`,
        ]).catch(print);
        button.toggleClassName("sidebar-button-active", true);
      }
    },
    child: MaterialIcon("nightlight", "norm"),
    setup: setupCursorHover,
    ...props,
  });

export const ModuleInvertColors = (props = {}) =>
  Widget.Button({
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Vibrance",
    onClicked: (button) => {
      const shaderPath = JSON.parse(
        exec("hyprctl -j getoption decoration:screen_shader")
      ).str;
      if (shaderPath != "[[EMPTY]]" && shaderPath != "") {
        execAsync([
          "bash",
          "-c",
          `hyprctl keyword decoration:screen_shader '' && hyprctl reload`,
        ]).catch(print);
        button.toggleClassName("sidebar-button-active", false);
      } else {
        execAsync([
          "bash",
          "-c",
          `hyprctl keyword decoration:screen_shader ~/.config/hypr/shaders/vibrance.frag`,
        ]).catch(print);
        button.toggleClassName("sidebar-button-active", true);
      }
    },
    child: MaterialIcon("invert_colors", "norm"),
    setup: setupCursorHover,
    ...props,
  });

export const ModuleIdleInhibitor = (props = {}) =>
  Widget.Button({
    properties: [
      ["enabled", false],
      ["inhibitor", undefined],
    ],
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Keep system awake",
    onClicked: (self) => {
      self._enabled = !self._enabled;
      self.toggleClassName("sidebar-button-active", self._enabled);
      if (self._enabled) {
        self._inhibitor = Utils.subprocess(
          ["wayland-idle-inhibitor.py"],
          (output) => print(output),
          (err) => logError(err),
          self
        );
      } else {
        if (self._inhibitor) {
          self._inhibitor.force_exit();
          self._inhibitor = undefined;
        }
      }
    },
    child: MaterialIcon("coffee", "norm"),
    setup: setupCursorHover,
    ...props,
  });

export const ModuleDND = (props = {}) =>
  Widget.Button({
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Do not disturb",
    onClicked: (button) => {
      const dnd = Notifications.dnd;
      if (dnd) {
        Notifications.dnd = false;
      }
      Notifications.dnd = !dnd;
      button.toggleClassName("sidebar-button-active", !dnd);
    },
    child: MaterialIcon("notifications_off", "norm"),
    setup: setupCursorHover,
    ...props,
  });

export const ModuleReloadIcon = (props = {}) =>
  Widget.Button({
    ...props,
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Reload Hyprland",
    onClicked: () => {
      execAsync(["bash", "-c", "hyprctl reload &"]);
      App.toggleWindow("sideright");
    },
    child: MaterialIcon("refresh", "norm"),
    setup: (button) => {
      setupCursorHover(button);
    },
  });

export const ModuleSettingsIcon = (props = {}) =>
  Widget.Button({
    ...props,
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Open Settings",
    onClicked: () => {
      execAsync([
        "bash",
        "-c",
        'XDG_CURRENT_DESKTOP="gnome" gnome-control-center',
        "&",
      ]);
      App.toggleWindow("sideright");
    },
    child: MaterialIcon("settings", "norm"),
    setup: (button) => {
      setupCursorHover(button);
    },
  });

export const ModulePowerIcon = (props = {}) =>
  Widget.Button({
    ...props,
    className: "txt-small sidebar-iconbutton",
    tooltipText: "Session",
    onClicked: () => {
      App.toggleWindow("session");
      App.closeWindow("sideright");
    },
    child: MaterialIcon("power_settings_new", "norm"),
    setup: (button) => {
      setupCursorHover(button);
    },
    connections: [
      [
        App,
        (self, currentName, visible) => {
          if (currentName === "sideright" && visible) {
            self.grab_focus();
          }
        },
      ],
    ],
  });
