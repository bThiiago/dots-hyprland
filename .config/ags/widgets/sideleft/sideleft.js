const { Gdk } = imports.gi;
import App from "resource:///com/github/Aylur/ags/app.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { Box, Button, EventBox, Label, Stack } = Widget;
const { timeout } = Utils;
import { MaterialIcon } from "../../lib/materialicon.js";
import { setupCursorHover } from "../../lib/cursorhover.js";
import { NavigationIndicator } from "../../lib/navigationindicator.js";
import toolBox from "./toolbox.js";
import apiWidgets, { chatEntry } from "./apiwidgets.js";

const contents = [
  {
    name: "apis",
    content: apiWidgets,
    materialIcon: "api",
    friendlyName: "APIs",
  },
  {
    name: "tools",
    content: toolBox,
    materialIcon: "home_repair_service",
    friendlyName: "Tools",
  },
];
let currentTabId = 0;

const contentStack = Stack({
  vexpand: true,
  transition: "slide_left_right",
  items: contents.map((item) => [item.name, item.content]),
});

function switchToTab(id) {
  const allTabs = navTabs.get_children();
  const tabButton = allTabs[id];
  allTabs[currentTabId].toggleClassName("sidebar-selector-tab-active", false);
  allTabs[id].toggleClassName("sidebar-selector-tab-active", true);
  contentStack.shown = contents[id].name;
  if (tabButton) {
    const buttonWidth = tabButton.get_allocated_width();
    const highlightWidth = tabButton.get_children()[0].get_allocated_width();
    navIndicator.css = `
            font-size: ${id}px; 
            padding: 0px ${(buttonWidth - highlightWidth) / 2}px;
        `;
  }
  currentTabId = id;
}
const SidebarTabButton = (navIndex) =>
  Button({
    className: "sidebar-selector-tab",
    onClicked: (self) => {
      switchToTab(navIndex);
    },
    child: Box({
      hpack: "center",
      className: "spacing-h-5",
      children: [
        MaterialIcon(contents[navIndex].materialIcon, "larger"),
        Label({
          className: "txt txt-smallie",
          label: `${contents[navIndex].friendlyName}`,
        }),
      ],
    }),
    setup: (button) =>
      timeout(1, () => {
        setupCursorHover(button);
        button.toggleClassName(
          "sidebar-selector-tab-active",
          currentTabId == navIndex
        );
      }),
  });

const navTabs = Box({
  homogeneous: true,
  children: contents.map((item, id) =>
    SidebarTabButton(id, item.materialIcon, item.friendlyName)
  ),
});

const navIndicator = NavigationIndicator(2, false, {
  className: "sidebar-selector-highlight",
  css: "font-size: 0px; padding: 0rem 4.160rem;",
});

const navBar = Box({
  vertical: true,
  hexpand: true,
  children: [navTabs, navIndicator],
});

const pinButton = Button({
  properties: [
    ["enabled", false],
    [
      "toggle",
      (self) => {
        self._enabled = !self._enabled;
        self.toggleClassName("sidebar-pin-enabled", self._enabled);

        const sideleftWindow = App.getWindow("sideleft");
        const barWindow = App.getWindow("bar");
        const cornerTopLeftWindow = App.getWindow("cornertl");
        const sideleftContent = sideleftWindow
          .get_children()[0]
          .get_children()[0]
          .get_children()[1];

        sideleftContent.toggleClassName("sidebar-pinned", self._enabled);

        if (self._enabled) {
          sideleftWindow.layer = "bottom";
          barWindow.layer = "bottom";
          cornerTopLeftWindow.layer = "bottom";
          sideleftWindow.exclusivity = "exclusive";
        } else {
          sideleftWindow.layer = "top";
          barWindow.layer = "top";
          cornerTopLeftWindow.layer = "top";
          sideleftWindow.exclusivity = "normal";
        }
      },
    ],
  ],
  vpack: "start",
  className: "sidebar-pin",
  child: MaterialIcon("push_pin", "larger"),
  tooltipText: "Pin sidebar",
  onClicked: (self) => self._toggle(self),
  connections: [
    [
      App,
      (self, currentName, visible) => {
        if (currentName === "sideleft" && visible) {
          self.grab_focus();
        }
      },
    ],
  ],
});

export default () =>
  Box({
    vexpand: true,
    hexpand: true,
    css: "min-width: 2px;",
    children: [
      EventBox({
        onPrimaryClick: () => App.closeWindow("sideleft"),
        onSecondaryClick: () => App.closeWindow("sideleft"),
        onMiddleClick: () => App.closeWindow("sideleft"),
      }),
      Box({
        vertical: true,
        vexpand: true,
        className: "sidebar-left spacing-v-10",
        children: [
          Box({
            className: "spacing-h-10",
            children: [navBar, pinButton],
          }),
          contentStack,
        ],
        connections: [
          [
            App,
            (self, currentName, visible) => {
              if (currentName === "sideleft") {
                self.toggleClassName(
                  "sidebar-pinned",
                  pinButton._enabled && visible
                );
              }
            },
          ],
        ],
      }),
    ],
    connections: [
      [
        "key-press-event",
        (widget, event) => {
          if (event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) {
            if (event.get_keyval()[1] == Gdk.KEY_p)
              pinButton._toggle(pinButton);
            else if (event.get_keyval()[1] === Gdk.KEY_Tab)
              switchToTab((currentTabId + 1) % contents.length);
            else if (event.get_keyval()[1] === Gdk.KEY_Page_Up)
              switchToTab(Math.max(currentTabId - 1, 0));
            else if (event.get_keyval()[1] === Gdk.KEY_Page_Down)
              switchToTab(Math.min(currentTabId + 1, contents.length - 1));
          }
          if (contentStack.shown == "apis") {
            if (
              (!(event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) &&
                event.get_keyval()[1] >= 32 &&
                event.get_keyval()[1] <= 126 &&
                widget != chatEntry &&
                event.get_keyval()[1] != Gdk.KEY_space) ||
              (event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK &&
                event.get_keyval()[1] === Gdk.KEY_v)
            ) {
              chatEntry.grab_focus();
              chatEntry.set_text(
                chatEntry.text + String.fromCharCode(event.get_keyval()[1])
              );
              chatEntry.set_position(-1);
            } else if (
              !(event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) &&
              event.get_keyval()[1] === Gdk.KEY_Page_Down
            ) {
              const toSwitchTab = contentStack.get_visible_child();
              toSwitchTab._nextTab();
            } else if (
              !(event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) &&
              event.get_keyval()[1] === Gdk.KEY_Page_Up
            ) {
              const toSwitchTab = contentStack.get_visible_child();
              toSwitchTab._prevTab();
            }
          }
        },
      ],
    ],
  });
