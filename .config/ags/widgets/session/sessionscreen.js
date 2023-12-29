const { Gdk, Gtk } = imports.gi;
import {
  App,
  Utils,
  Widget,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../../imports.js";
const { execAsync } = Utils;

const SessionButton = (name, icon, command, props = {}) => {
  const buttonDescription = Widget.Revealer({
    vpack: "end",
    transitionDuration: 200,
    transition: "slide_down",
    revealChild: false,
    child: Widget.Label({
      className: "txt-smaller session-button-desc",
      label: name,
    }),
  });
  return Widget.Button({
    onClicked: command,
    className: "session-button",
    child: Widget.Overlay({
      child: Widget.Label({
        vexpand: true,
        className: "icon-material",
        label: icon,
      }),
      overlays: [buttonDescription],
    }),
    onHover: (button) => {
      const display = Gdk.Display.get_default();
      const cursor = Gdk.Cursor.new_from_name(display, "pointer");
      button.get_window().set_cursor(cursor);
      buttonDescription.revealChild = true;
      button.grab_focus();
    },
    onHoverLost: (button) => {
      const display = Gdk.Display.get_default();
      const cursor = Gdk.Cursor.new_from_name(display, "default");
      button.get_window().set_cursor(cursor);
      buttonDescription.revealChild = false;
      button.toggleClassName("session-button-focused", false);
    },
    connections: [
      [
        "focus-in-event",
        (self) => {
          buttonDescription.revealChild = true;
          self.toggleClassName("session-button-focused", true);
        },
      ],
      [
        "focus-out-event",
        (self) => {
          buttonDescription.revealChild = false;
          self.toggleClassName("session-button-focused", false);
        },
      ],
    ],
    ...props,
  });
};

export default () => {
  const lockButton = SessionButton("Lock", "lock", () => {
    App.closeWindow("session");
    execAsync("swaylock");
  });
  const logoutButton = SessionButton("Logout", "logout", () => {
    App.closeWindow("session");
    execAsync(["bash", "-c", "hyprctl dispatch exit"]);
  });
  const sleepButton = SessionButton("Sleep", "sleep", () => {
    App.closeWindow("session");
    execAsync("systemctl suspend");
  });
  const hibernateButton = SessionButton("Hibernate", "downloading", () => {
    App.closeWindow("session");
    execAsync("systemctl hibernate");
  });
  const shutdownButton = SessionButton("Shutdown", "power_settings_new", () => {
    App.closeWindow("session");
    execAsync("systemctl poweroff");
  });
  const rebootButton = SessionButton("Reboot", "restart_alt", () => {
    App.closeWindow("session");
    execAsync("systemctl reboot");
  });
  const cancelButton = SessionButton(
    "Cancel",
    "close",
    () => App.closeWindow("session"),
    { className: "session-button-cancel" }
  );
  return Widget.Box({
    className: "session-bg",
    css: `
        min-width: ${SCREEN_WIDTH * 1.5}px; 
        min-height: ${SCREEN_HEIGHT * 1.5}px;
        `,
    vertical: true,
    children: [
      Widget.EventBox({
        onPrimaryClick: () => App.closeWindow("session"),
        onSecondaryClick: () => App.closeWindow("session"),
        onMiddleClick: () => App.closeWindow("session"),
      }),
      Widget.Box({
        hpack: "center",
        vexpand: true,
        vertical: true,
        children: [
          Widget.Box({
            vpack: "center",
            vertical: true,
            className: "spacing-v-15",
            children: [
              Widget.Box({
                vertical: true,
                css: "margin-bottom: 0.682rem;",
                children: [
                  Widget.Label({
                    className: "txt-title txt",
                    label: "Session",
                  }),
                  Widget.Label({
                    justify: Gtk.Justification.CENTER,
                    className: "txt-small txt",
                    label:
                      "Use arrow keys to navigate.\nEnter to select, Esc to cancel.",
                  }),
                ],
              }),
              Widget.Box({
                hpack: "center",
                className: "spacing-h-15",
                children: [lockButton, logoutButton, sleepButton],
              }),
              Widget.Box({
                hpack: "center",
                className: "spacing-h-15",
                children: [hibernateButton, shutdownButton, rebootButton],
              }),
              Widget.Box({
                hpack: "center",
                className: "spacing-h-15",
                children: [cancelButton],
              }),
            ],
          }),
        ],
      }),
    ],
    connections: [
      [
        App,
        (_b, name, visible) => {
          if (visible) lockButton.grab_focus();
        },
      ],
    ],
  });
};
