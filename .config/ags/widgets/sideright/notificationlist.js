import { Widget } from "../../imports.js";
import Notifications from "resource:///com/github/Aylur/ags/service/notifications.js";
const { Box, Button, Label, Revealer, Scrollable, Stack } = Widget;
import { MaterialIcon } from "../../lib/materialicon.js";
import { setupCursorHover } from "../../lib/cursorhover.js";
import { ConfigToggle } from "../../lib/configwidgets.js";
import Notification from "../../lib/notification.js";

export default (props) => {
  const dndToggle = ConfigToggle({
    hpack: "center",
    icon: "notifications_paused",
    name: "Do not disturb",
    desc: "Don't pop up notifications",
    initValue: Notifications.dnd,
    onChange: (self, newValue) => {
      Notifications.dnd = newValue;
      silenceButton.toggleClassName(
        "notif-listaction-btn-enabled",
        Notifications.dnd
      );
    },
  });
  const notifEmptyContent = Box({
    homogeneous: true,
    children: [
      Box({
        vertical: true,
        vpack: "center",
        className: "txt spacing-v-10",
        children: [
          Box({
            vertical: true,
            className: "spacing-v-5",
            children: [
              MaterialIcon("notifications_active", "badonkers"),
              Label({ label: "No notifications", className: "txt-small" }),
            ],
          }),
          dndToggle,
        ],
      }),
    ],
  });
  const notificationList = Box({
    vertical: true,
    vpack: "start",
    className: "spacing-v-5-revealer",
    connections: [
      [
        Notifications,
        (box, id) => {
          if (box.get_children().length == 0) {
            Notifications.notifications.forEach((n) => {
              box.pack_end(
                Notification({
                  notifObject: n,
                  isPopup: false,
                }),
                false,
                false,
                0
              );
            });
            box.show_all();
            return;
          }
          const notif = Notifications.getNotification(id);
          const NewNotif = Notification({
            notifObject: notif,
            isPopup: false,
          });
          if (NewNotif) {
            box.pack_end(NewNotif, false, false, 0);
            box.show_all();
          }
        },
        "notified",
      ],

      [
        Notifications,
        (box, id) => {
          if (!id) return;
          for (const ch of box.children) {
            if (ch._id === id) {
              ch._destroyWithAnims();
            }
          }
        },
        "closed",
      ],
    ],
  });
  const ListActionButton = (icon, name, action) =>
    Button({
      className: "notif-listaction-btn",
      onClicked: action,
      child: Box({
        className: "spacing-h-5",
        children: [
          MaterialIcon(icon, "norm"),
          Label({
            className: "txt-small",
            label: name,
          }),
        ],
      }),
      setup: setupCursorHover,
    });
  const silenceButton = ListActionButton(
    "notifications_paused",
    "Silence",
    (self) => {
      Notifications.dnd = !Notifications.dnd;
      dndToggle._toggle(Notifications.dnd);
      self.toggleClassName("notif-listaction-btn-enabled", Notifications.dnd);
    }
  );
  const clearButton = ListActionButton("clear_all", "Clear", () => {
    notificationList.get_children().forEach((child) => {
      child.destroy();
    });
    Notifications.Clear();
  });
  const listTitle = Revealer({
    revealChild: false,
    connections: [
      [
        Notifications,
        (revealer) => {
          revealer.revealChild = Notifications.notifications.length > 0;
        },
      ],
    ],
    child: Box({
      vpack: "start",
      className: "sidebar-group-invisible txt spacing-h-5",
      children: [
        Label({
          hexpand: true,
          xalign: 0,
          className: "txt-title-small",
          label: "Notifications",
        }),
        silenceButton,
        clearButton,
      ],
    }),
  });
  const notifList = Scrollable({
    hexpand: true,
    hscroll: "never",
    vscroll: "automatic",
    child: Box({
      vexpand: true,
      children: [notificationList],
    }),
    setup: (self) => {
      const vScrollbar = self.get_vscrollbar();
      vScrollbar.get_style_context().add_class("sidebar-scrollbar");
    },
  });
  const listContents = Stack({
    transition: "crossfade",
    transitionDuration: 150,
    items: [
      ["empty", notifEmptyContent],
      ["list", notifList],
    ],
    setup: (self) =>
      self.hook(
        Notifications,
        (self) =>
          (self.shown =
            Notifications.notifications.length > 0 ? "list" : "empty")
      ),
  });
  return Box({
    ...props,
    className: "sidebar-group-invisible spacing-v-5",
    vertical: true,
    children: [listTitle, listContents],
  });
};
