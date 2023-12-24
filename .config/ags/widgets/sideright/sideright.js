const { GLib, Gdk, Gtk } = imports.gi;
import { Utils, Widget } from "../../imports.js";
const { execAsync, exec } = Utils;
const { Box, EventBox } = Widget;
import {
  ToggleIconBluetooth,
  ToggleIconWifi,
  HyprToggleIcon,
  ModuleNightLight,
  ModuleInvertColors,
  ModuleIdleInhibitor,
  ModuleDND,
  ModuleReloadIcon,
  ModuleSettingsIcon,
  ModulePowerIcon,
} from "./quicktoggles.js";
import ModuleNotificationList from "./notificationlist.js";
import { ModuleCalendar } from "./calendar.js";

const timeRow = Box({
  className: "spacing-h-5 sidebar-group-invisible-morehorizpad",
  children: [
    Widget.Label({
      className: "txt-title txt",
      connections: [
        [
          5000,
          (label) => {
            label.label = GLib.DateTime.new_now_local().format("%H:%M");
          },
        ],
      ],
    }),
    Widget.Label({
      hpack: "center",
      className: "txt-small txt",
      connections: [
        [
          5000,
          (label) => {
            execAsync([
              "bash",
              "-c",
              `uptime -p | sed -e 's/up //;s/ hours,/h/;s/ minutes/m/'`,
            ])
              .then((upTimeString) => {
                label.label = `• up ${upTimeString}`;
              })
              .catch(print);
          },
        ],
      ],
    }),
    Widget.Box({ hexpand: true }),
    // ModuleEditIcon({ hpack: 'end' }), // TODO: Make this work
    ModuleReloadIcon({ hpack: "end" }),
    ModuleSettingsIcon({ hpack: "end" }),
    ModulePowerIcon({ hpack: "end" }),
  ],
});

const togglesBox = Widget.Box({
  hpack: "center",
  className: "sidebar-group spacing-h-10",
  children: [
    ToggleIconWifi(),
    ToggleIconBluetooth(),
    HyprToggleIcon("mouse", "Raw input", "input:force_no_accel", {}),
    HyprToggleIcon(
      "front_hand",
      "No touchpad while typing",
      "input:touchpad:disable_while_typing",
      {}
    ),
    ModuleNightLight(),
    ModuleInvertColors(),
    ModuleIdleInhibitor(),
    ModuleDND(),
  ],
});

export default () =>
  Box({
    vexpand: true,
    hexpand: true,
    children: [
      EventBox({
        onPrimaryClick: () => App.closeWindow("sideright"),
        onSecondaryClick: () => App.closeWindow("sideright"),
        onMiddleClick: () => App.closeWindow("sideright"),
      }),
      Box({
        vertical: true,
        vexpand: true,
        className: "sidebar-right spacing-v-15",
        children: [
          Box({
            vertical: true,
            className: "spacing-v-5",
            children: [
              timeRow,
              // togglesFlowBox,
              togglesBox,
            ],
          }),
          ModuleNotificationList({ vexpand: true }),
          ModuleCalendar(),
        ],
      }),
    ],
  });
