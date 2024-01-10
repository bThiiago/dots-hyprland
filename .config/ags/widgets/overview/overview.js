const { Gdk, Gtk } = imports.gi;
import {
  App,
  Utils,
  Widget,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
} from "../../imports.js";
import Applications from "resource:///com/github/Aylur/ags/service/applications.js";
import Hyprland from "resource:///com/github/Aylur/ags/service/hyprland.js";
const { execAsync, exec, timeout } = Utils;
const {
  Box,
  EventBox,
  Button,
  Label,
  Entry,
  Menu,
  MenuItem,
  Icon,
  Revealer,
  Scrollable,
} = Widget;
import { setupCursorHoverGrab } from "../../lib/cursorhover.js";
import { DoubleRevealer } from "../../lib/advancedwidgets.js";
import {
  execAndClose,
  expandTilde,
  hasUnterminatedBackslash,
  startsWithNumber,
  launchCustomCommand,
  ls,
} from "./miscfunctions.js";
import {
  CalculationResultButton,
  CustomCommandButton,
  DirectoryButton,
  DesktopEntryButton,
  ExecuteCommandButton,
  SearchButton,
} from "./searchbuttons.js";
import { dumpToWorkspace, swapWorkspace } from "./actions.js";

const { sin, cos, tan, cot, asin, acos, atan, acot } = Math;
const pi = Math.PI;
const sind = (x) => sin((x * pi) / 180);
const cosd = (x) => cos((x * pi) / 180);
const tand = (x) => tan((x * pi) / 180);
const cotd = (x) => cot((x * pi) / 180);
const asind = (x) => (asin(x) * 180) / pi;
const acosd = (x) => (acos(x) * 180) / pi;
const atand = (x) => (atan(x) * 180) / pi;
const acotd = (x) => (acot(x) * 180) / pi;

const MAX_RESULTS = 10;
const OVERVIEW_SCALE = 0.18;
const OVERVIEW_WS_NUM_SCALE = 0.09;
const OVERVIEW_WS_NUM_MARGIN_SCALE = 0.07;
const TARGET = [Gtk.TargetEntry.new("text/plain", Gtk.TargetFlags.SAME_APP, 0)];
const searchPromptTexts = [
  'Try "~/.config"',
  'Try "Files"',
  'Try "6*cos(pi)"',
  'Try "sudo pacman -Syu"',
  'Try "How to basic"',
  "Drag n' drop to move windows",
  "Type to search",
];

function truncateTitle(str) {
  let lastDash = -1;
  let found = -1;
  for (let i = str.length - 1; i >= 0; i--) {
    if (str[i] === "—") {
      found = 0;
      lastDash = i;
    } else if (str[i] === "–" && found < 1) {
      found = 1;
      lastDash = i;
    } else if (str[i] === "-" && found < 2) {
      found = 2;
      lastDash = i;
    } else if (str[i] === "|" && found < 3) {
      found = 3;
      lastDash = i;
    } else if (str[i] === "·" && found < 4) {
      found = 4;
      lastDash = i;
    }
  }
  if (lastDash === -1) return str;
  return str.substring(0, lastDash);
}

function iconExists(iconName) {
  let iconTheme = Gtk.IconTheme.get_default();
  return iconTheme.has_icon(iconName);
}

function substitute(str) {
  const subs = [
    { from: "code-url-handler", to: "visual-studio-code" },
    { from: "Code", to: "visual-studio-code" },
    { from: "GitHub Desktop", to: "github-desktop" },
    { from: "wpsoffice", to: "wps-office2019-kprometheus" },
    { from: "gnome-tweaks", to: "org.gnome.tweaks" },
    { from: "Minecraft* 1.20.1", to: "minecraft" },
    { from: "VencordDesktop", to: "webcord" },
    { from: "", to: "image-missing" },
  ];

  for (const { from, to } of subs) {
    if (from === str) return to;
  }

  if (!iconExists(str)) str = str.toLowerCase().replace(/\s+/g, "-");
  return str;
}

const ContextWorkspaceArray = ({ label, actionFunc, thisWorkspace }) =>
  MenuItem({
    label: `${label}`,
    setup: (menuItem) => {
      let submenu = new Gtk.Menu();
      submenu.className = "menu";
      for (let i = 1; i <= 10; i++) {
        let button = new Gtk.MenuItem({
          label: `Workspace ${i}`,
        });
        button.connect("activate", () => {
          actionFunc(thisWorkspace, i);
        });
        submenu.append(button);
      }
      menuItem.set_reserve_indicator(true);
      menuItem.set_submenu(submenu);
    },
  });

const client = ({
  address,
  size: [w, h],
  workspace: { id, name },
  class: c,
  title,
  xwayland,
}) => {
  const revealInfoCondition = Math.min(w, h) * OVERVIEW_SCALE > 70;
  if (w <= 0 || h <= 0) return null;
  title = truncateTitle(title);
  return Button({
    className: "overview-tasks-window",
    hpack: "center",
    vpack: "center",
    onClicked: () => {
      Hyprland.sendMessage(`dispatch focuswindow address:${address}`);
      App.closeWindow("overview");
    },
    onMiddleClickRelease: () =>
      Hyprland.sendMessage(`dispatch closewindow address:${address}`),
    onSecondaryClick: (button) => {
      button.toggleClassName("overview-tasks-window-selected", true);
      const menu = Menu({
        className: "menu",
        children: [
          MenuItem({
            child: Label({
              xalign: 0,
              label: "Close (Middle-click)",
            }),
            onActivate: () =>
              Hyprland.sendMessage(`dispatch closewindow address:${address}`),
          }),
          ContextWorkspaceArray({
            label: "Dump windows to workspace",
            actionFunc: dumpToWorkspace,
            thisWorkspace: Number(id),
          }),
          ContextWorkspaceArray({
            label: "Swap windows with workspace",
            actionFunc: swapWorkspace,
            thisWorkspace: Number(id),
          }),
        ],
      });
      menu.connect("deactivate", () => {
        button.toggleClassName("overview-tasks-window-selected", false);
      });
      menu.connect("selection-done", () => {
        button.toggleClassName("overview-tasks-window-selected", false);
      });
      menu.popup_at_pointer(null);
    },
    child: Box({
      css: `
                min-width: ${Math.max(w * OVERVIEW_SCALE - 4, 1)}px;
                min-height: ${Math.max(h * OVERVIEW_SCALE - 4, 1)}px;
            `,
      homogeneous: true,
      child: Box({
        vertical: true,
        vpack: "center",
        className: "spacing-v-5",
        children: [
          Icon({
            icon: substitute(c),
            size: (Math.min(w, h) * OVERVIEW_SCALE) / 2.5,
          }),
          DoubleRevealer({
            transition1: "slide_right",
            transition2: "slide_down",
            revealChild: revealInfoCondition,
            child: Scrollable({
              hexpand: true,
              vscroll: "never",
              hscroll: "automatic",
              child: Label({
                truncate: "end",
                className: `${xwayland ? "txt txt-italic" : "txt"}`,
                css: `
                                    font-size: ${
                                      (Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) *
                                        OVERVIEW_SCALE) /
                                      14.6
                                    }px;
                                    margin: 0px ${
                                      (Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) *
                                        OVERVIEW_SCALE) /
                                      10
                                    }px;
                                `,
                label: title.length <= 1 ? `${c}: ${title}` : title,
              }),
            }),
          }),
        ],
      }),
    }),
    tooltipText: `${c}: ${title}`,
    setup: (button) => {
      setupCursorHoverGrab(button);

      button.drag_source_set(
        Gdk.ModifierType.BUTTON1_MASK,
        TARGET,
        Gdk.DragAction.MOVE
      );
      button.drag_source_set_icon_name(substitute(c));

      button.connect("drag-begin", (button) => {
        button.toggleClassName("overview-tasks-window-dragging", true);
      });
      button.connect("drag-data-get", (_w, _c, data) => {
        data.set_text(address, address.length);
        button.toggleClassName("overview-tasks-window-dragging", false);
      });
    },
  });
};

const workspace = (index) => {
  const fixed = Gtk.Fixed.new();
  const WorkspaceNumber = (index) =>
    Label({
      className: "overview-tasks-workspace-number",
      label: `${index}`,
      css: `
            margin: ${
              Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) *
              OVERVIEW_SCALE *
              OVERVIEW_WS_NUM_MARGIN_SCALE
            }px;
            font-size: ${
              SCREEN_HEIGHT * OVERVIEW_SCALE * OVERVIEW_WS_NUM_SCALE
            }px;
        `,
    });
  const widget = Box({
    className: "overview-tasks-workspace",
    vpack: "center",
    css: `
        min-width: ${SCREEN_WIDTH * OVERVIEW_SCALE}px;
        min-height: ${SCREEN_HEIGHT * OVERVIEW_SCALE}px;
        `,
    children: [
      EventBox({
        hexpand: true,
        vexpand: true,
        onPrimaryClick: () => {
          Hyprland.sendMessage(`dispatch workspace ${index}`);
          App.closeWindow("overview");
        },
        setup: (eventbox) => {
          eventbox.drag_dest_set(
            Gtk.DestDefaults.ALL,
            TARGET,
            Gdk.DragAction.COPY
          );
          eventbox.connect("drag-data-received", (_w, _c, _x, _y, data) => {
            Hyprland.sendMessage(
              `dispatch movetoworkspacesilent ${index},address:${data.get_text()}`
            );
          });
        },
        child: fixed,
      }),
    ],
  });
  widget.update = (clients) => {
    clients = clients.filter(({ workspace: { id } }) => id === index);

    clients = clients.map((client) => {
      const [x, y] = client.at;
      if (x > SCREEN_WIDTH) client.at = [x - SCREEN_WIDTH, y];
      return client;
    });

    const children = fixed.get_children();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.destroy();
    }
    fixed.put(WorkspaceNumber(index), 0, 0);

    for (let i = 0; i < clients.length; i++) {
      const c = clients[i];
      if (c.mapped) {
        fixed.put(
          client(c),
          c.at[0] * OVERVIEW_SCALE,
          c.at[1] * OVERVIEW_SCALE
        );
      }
    }

    fixed.show_all();
  };
  return widget;
};

const arr = (s, n) => {
  const array = [];
  for (let i = 0; i < n; i++) array.push(s + i);

  return array;
};

const OverviewRow = ({ startWorkspace, workspaces, windowName = "overview" }) =>
  Box({
    children: arr(startWorkspace, workspaces).map(workspace),
    properties: [
      [
        "update",
        (box) => {
          if (!App.getWindow(windowName).visible) return;
          execAsync("hyprctl -j clients")
            .then((clients) => {
              const json = JSON.parse(clients);
              const children = box.get_children();
              for (let i = 0; i < children.length; i++) {
                const ch = children[i];
                ch.update(json);
              }
            })
            .catch(print);
        },
      ],
    ],
    setup: (box) => {
      box
        .hook(
          Hyprland,
          (box, name, data) => {
            if (["changefloatingmode", "movewindow"].includes(name))
              box._update(box);
          },
          "event"
        )
        .hook(Hyprland, (box) => box._update(box), "client-added")
        .hook(Hyprland, (box) => box._update(box), "client-removed")
        .hook(App, (box, name, visible) => {
          if (name == "overview" && visible) box._update(box);
        });
    },
  });

export const SearchAndWindows = () => {
  var _appSearchResults = [];

  const ClickToClose = ({ ...props }) =>
    EventBox({
      ...props,
      onPrimaryClick: () => App.closeWindow("overview"),
      onSecondaryClick: () => App.closeWindow("overview"),
      onMiddleClick: () => App.closeWindow("overview"),
    });
  const resultsBox = Box({
    className: "overview-search-results",
    vertical: true,
    vexpand: true,
  });
  const resultsRevealer = Revealer({
    transitionDuration: 200,
    revealChild: false,
    transition: "slide_down",
    hpack: "center",
    child: resultsBox,
  });
  const overviewRevealer = Revealer({
    revealChild: true,
    transition: "slide_down",
    transitionDuration: 200,
    child: Box({
      vertical: true,
      className: "overview-tasks",
      children: [
        OverviewRow({ startWorkspace: 1, workspaces: 5 }),
        OverviewRow({ startWorkspace: 6, workspaces: 5 }),
      ],
    }),
  });
  const entryPromptRevealer = Revealer({
    transition: "crossfade",
    transitionDuration: 150,
    revealChild: true,
    hpack: "center",
    child: Label({
      className: "overview-search-prompt txt-small txt",
      label:
        searchPromptTexts[Math.floor(Math.random() * searchPromptTexts.length)],
    }),
  });

  const entryIconRevealer = Revealer({
    transition: "crossfade",
    transitionDuration: 150,
    revealChild: false,
    hpack: "end",
    child: Label({
      className: "txt txt-large icon-material overview-search-icon",
      label: "search",
    }),
  });

  const entryIcon = Box({
    className: "overview-search-prompt-box",
    setup: (box) => box.pack_start(entryIconRevealer, true, true, 0),
  });

  const entry = Entry({
    className: "overview-search-box txt-small txt",
    hpack: "center",
    onAccept: (self) => {
      const text = self.text;
      if (text.length == 0) return;
      const isAction = text.startsWith(">");
      const isDir = ["/", "~"].includes(entry.text[0]);

      if (startsWithNumber(text)) {
        try {
          const fullResult = eval(text);
          execAsync(["wl-copy", `${fullResult}`]).catch(print);
          App.closeWindow("overview");
          return;
        } catch (e) {
          console.log(e);
        }
      }
      if (isDir) {
        App.closeWindow("overview");
        execAsync(["bash", "-c", `xdg-open "${expandTilde(text)}"`, `&`]).catch(
          print
        );
        return;
      }
      if (_appSearchResults.length > 0) {
        App.closeWindow("overview");
        _appSearchResults[0].launch();
        return;
      } else if (text[0] == ">") {
        App.closeWindow("overview");
        launchCustomCommand(text);
        return;
      }
      if (
        !isAction &&
        exec(`bash -c "command -v ${text.split(" ")[0]}"`) != ""
      ) {
        if (text.startsWith("sudo")) execAndClose(text, true);
        else execAndClose(text, false);
      } else {
        App.closeWindow("overview");
        execAsync([
          "bash",
          "-c",
          `xdg-open 'https://www.google.com/search?q=${text} -site:quora.com' &`,
        ]).catch(print);
      }
    },
    onChange: (entry) => {
      const isAction = entry.text[0] == ">";
      const isDir = ["/", "~"].includes(entry.text[0]);
      const children = resultsBox.get_children();
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        child.destroy();
      }
      if (entry.text == "") {
        resultsRevealer.set_reveal_child(false);
        overviewRevealer.set_reveal_child(true);
        entryPromptRevealer.set_reveal_child(true);
        entryIconRevealer.set_reveal_child(false);
        entry.toggleClassName("overview-search-box-extended", false);
        return;
      }
      const text = entry.text;
      resultsRevealer.set_reveal_child(true);
      overviewRevealer.set_reveal_child(false);
      entryPromptRevealer.set_reveal_child(false);
      entryIconRevealer.set_reveal_child(true);
      entry.toggleClassName("overview-search-box-extended", true);
      _appSearchResults = Applications.query(text);

      if (startsWithNumber(text)) {
        try {
          const fullResult = eval(text);
          resultsBox.add(
            CalculationResultButton({ result: fullResult, text: text })
          );
        } catch (e) {
          console.log(e);
        }
      }
      if (isDir) {
        var contents = [];
        contents = ls({ path: text, silent: true });
        contents.forEach((item) => {
          resultsBox.add(DirectoryButton(item));
        });
      }
      if (isAction) {
        resultsBox.add(CustomCommandButton({ text: entry.text }));
      }
      let appsToAdd = MAX_RESULTS;
      _appSearchResults.forEach((app) => {
        if (appsToAdd == 0) return;
        resultsBox.add(DesktopEntryButton(app));
        appsToAdd--;
      });

      if (
        !isAction &&
        !hasUnterminatedBackslash(text) &&
        exec(`bash -c "command -v ${text.split(" ")[0]}"`) != ""
      ) {
        resultsBox.add(
          ExecuteCommandButton({
            command: entry.text,
            terminal: entry.text.startsWith("sudo"),
          })
        );
      }

      resultsBox.add(SearchButton({ text: entry.text }));
      resultsBox.show_all();
    },
  });

  return Box({
    vertical: true,
    children: [
      ClickToClose({
        child: Box({
          className: "bar-height",
        }),
      }),
      Box({
        hpack: "center",
        children: [
          entry,
          Box({
            className: "overview-search-icon-box",
            setup: (box) => box.pack_start(entryPromptRevealer, true, true, 0),
          }),
          entryIcon,
        ],
      }),
      overviewRevealer,
      resultsRevealer,
    ],
    setup: (self) =>
      self
        .hook(App, (_b, name, visible) => {
          if (name == "overview" && !visible) {
            entryPromptRevealer.child.label =
              searchPromptTexts[
                Math.floor(Math.random() * searchPromptTexts.length)
              ];
            resultsBox.children = [];
            entry.set_text("");
          }
        })
        .on("key-press-event", (widget, event) => {
          if (
            event.get_keyval()[1] >= 32 &&
            event.get_keyval()[1] <= 126 &&
            widget != entry
          ) {
            timeout(1, () => entry.grab_focus());
            entry.set_text(
              entry.text + String.fromCharCode(event.get_keyval()[1])
            );
            entry.set_position(-1);
          }
        }),
  });
};
