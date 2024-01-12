import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { execAsync } = Utils;
const { Box, EventBox, Label } = Widget;
import {
  ToggleIconBluetooth,
  ToggleIconWifi,
  HyprToggleIcon,
  ModuleNightLight,
  ModuleInvertColors,
  ModuleIdleInhibitor,
  ModuleMuteMic,
  ModuleReloadIcon,
  ModuleSettingsIcon,
  ModulePowerIcon,
} from "./quicktoggles.js";
import ModuleNotificationList from "./notificationlist.js";
import { ModuleCalendar } from "./calendar.js";

const timeRow = Box({
  className: "spacing-h-5 sidebar-group-invisible-morehorizpad",
  children: [
    Label({
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
                label.label = `System up for ${upTimeString}`;
              })
              .catch(print);
          },
        ],
      ],
    }),
    Box({ hexpand: true }),
    ModuleReloadIcon({ hpack: "end" }),
    ModuleSettingsIcon({ hpack: "end" }),
    ModulePowerIcon({ hpack: "end" }),
  ],
});

const togglesBox = Box({
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
    ModuleMuteMic(),
  ],
});

export default () =>
  Box({
    vexpand: true,
    hexpand: true,
    css: "min-width: 2px;",
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
            children: [timeRow, togglesBox],
          }),
          ModuleNotificationList({ vexpand: true }),
          ModuleCalendar(),
        ],
      }),
    ],
  });
