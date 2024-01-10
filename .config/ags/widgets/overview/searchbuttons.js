const { Gtk } = imports.gi;
import { App, Utils, Widget } from "../../imports.js";
const { execAsync, timeout } = Utils;
const { Box, Label, Icon, Button, Revealer } = Widget;
import { searchItem } from "./searchitem.js";
import { execAndClose, launchCustomCommand } from "./miscfunctions.js";

export const DirectoryButton = ({ parentPath, name, type, icon }) => {
  const actionText = Revealer({
    revealChild: false,
    transition: "crossfade",
    transitionDuration: 200,
    child: Label({
      className: "overview-search-results-txt txt txt-small txt-action",
      label: "Open",
    }),
  });
  const actionTextRevealer = Revealer({
    revealChild: false,
    transition: "slide_left",
    transitionDuration: 300,
    child: actionText,
  });
  return Button({
    className: "overview-search-result-btn",
    onClicked: () => {
      App.closeWindow("overview");
      execAsync(["bash", "-c", `xdg-open '${parentPath}/${name}'`, `&`]).catch(
        print
      );
    },
    child: Box({
      children: [
        Box({
          vertical: false,
          children: [
            Box({
              className: "overview-search-results-icon",
              homogeneous: true,
              child: Icon({
                icon: icon,
                setup: (self) =>
                  timeout(1, () => {
                    const styleContext = self.get_parent().get_style_context();
                    const width = styleContext.get_property(
                      "min-width",
                      Gtk.StateFlags.NORMAL
                    );
                    const height = styleContext.get_property(
                      "min-height",
                      Gtk.StateFlags.NORMAL
                    );
                    self.size = Math.max(width, height, 1);
                  }),
              }),
            }),
            Label({
              className: "overview-search-results-txt txt txt-norm",
              label: name,
            }),
            Box({ hexpand: true }),
            actionTextRevealer,
          ],
        }),
      ],
    }),
    connections: [
      [
        "focus-in-event",
        (button) => {
          actionText.revealChild = true;
          actionTextRevealer.revealChild = true;
        },
      ],
      [
        "focus-out-event",
        (button) => {
          actionText.revealChild = false;
          actionTextRevealer.revealChild = false;
        },
      ],
    ],
  });
};

export const CalculationResultButton = ({ result, text }) =>
  searchItem({
    materialIconName: "calculate",
    name: `Math result`,
    actionName: "Copy",
    content: `${result}`,
    onActivate: () => {
      App.closeWindow("overview");
      execAsync(["wl-copy", `${result}`]).catch(print);
    },
  });

export const DesktopEntryButton = (app) => {
  const actionText = Revealer({
    revealChild: false,
    transition: "crossfade",
    transitionDuration: 200,
    child: Label({
      className: "overview-search-results-txt txt txt-small txt-action",
      label: "Launch",
    }),
  });
  const actionTextRevealer = Revealer({
    revealChild: false,
    transition: "slide_left",
    transitionDuration: 300,
    child: actionText,
  });
  return Button({
    className: "overview-search-result-btn",
    onClicked: () => {
      App.closeWindow("overview");
      app.launch();
    },
    child: Box({
      children: [
        Box({
          vertical: false,
          children: [
            Box({
              className: "overview-search-results-icon",
              homogeneous: true,
              child: Icon({
                icon: app.iconName,
                setup: (self) =>
                  timeout(1, () => {
                    const styleContext = self.get_parent().get_style_context();
                    const width = styleContext.get_property(
                      "min-width",
                      Gtk.StateFlags.NORMAL
                    );
                    const height = styleContext.get_property(
                      "min-height",
                      Gtk.StateFlags.NORMAL
                    );
                    self.size = Math.max(width, height, 1);
                  }),
              }),
            }),
            Label({
              className: "overview-search-results-txt txt txt-norm",
              label: app.name,
            }),
            Box({ hexpand: true }),
            actionTextRevealer,
          ],
        }),
      ],
    }),
    connections: [
      [
        "focus-in-event",
        (button) => {
          actionText.revealChild = true;
          actionTextRevealer.revealChild = true;
        },
      ],
      [
        "focus-out-event",
        (button) => {
          actionText.revealChild = false;
          actionTextRevealer.revealChild = false;
        },
      ],
    ],
  });
};

export const ExecuteCommandButton = ({ command, terminal = false }) =>
  searchItem({
    materialIconName: `${terminal ? "terminal" : "settings_b_roll"}`,
    name: `Run command`,
    actionName: `Execute ${terminal ? "in terminal" : ""}`,
    content: `${command}`,
    onActivate: () => execAndClose(command, terminal),
  });

export const CustomCommandButton = ({ text = "" }) =>
  searchItem({
    materialIconName: "settings_suggest",
    name: "Action",
    actionName: "Run",
    content: `${text}`,
    onActivate: () => {
      App.closeWindow("overview");
      launchCustomCommand(text);
    },
  });

export const SearchButton = ({ text = "" }) =>
  searchItem({
    materialIconName: "travel_explore",
    name: "Search Google",
    actionName: "Go",
    content: `${text}`,
    onActivate: () => {
      App.closeWindow("overview");
      execAsync([
        "bash",
        "-c",
        `xdg-open 'https://www.google.com/search?q=${text} -site:quora.com' &`,
      ]).catch(print);
    },
  });
