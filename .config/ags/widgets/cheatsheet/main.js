const { Gtk } = imports.gi;
import { Widget } from "../../imports.js";
import { Keybinds } from "./keybinds.js";
import { setupCursorHover } from "../../lib/cursorhover.js";
const { Box, Label, Button, CenterBox, EventBox, Window } = Widget;

const cheatsheetHeader = () =>
  CenterBox({
    vertical: false,
    startWidget: Box({}),
    centerWidget: Box({
      vertical: true,
      className: "spacing-h-15",
      children: [
        Box({
          hpack: "center",
          className: "spacing-h-5",
          children: [
            Label({
              hpack: "center",
              css: "margin-right: 0.682rem;",
              className: "txt-title txt",
              label: "Cheat sheet",
            }),
            Label({
              vpack: "center",
              className: "cheatsheet-key txt-small",
              label: "",
            }),
            Label({
              vpack: "center",
              className: "cheatsheet-key-notkey txt-small",
              label: "+",
            }),
            Label({
              vpack: "center",
              className: "cheatsheet-key txt-small",
              label: "/",
            }),
          ],
        }),
      ],
    }),
    endWidget: Button({
      vpack: "start",
      hpack: "end",
      className: "cheatsheet-closebtn icon-material txt txt-hugeass",
      onClicked: () => {
        App.toggleWindow("cheatsheet");
      },
      child: Label({
        className: "icon-material txt txt-hugeass",
        label: "close",
      }),
      setup: setupCursorHover,
    }),
  });

const clickOutsideToClose = EventBox({
  onPrimaryClick: () => App.closeWindow("cheatsheet"),
  onSecondaryClick: () => App.closeWindow("cheatsheet"),
  onMiddleClick: () => App.closeWindow("cheatsheet"),
});

export default () =>
  Window({
    name: "cheatsheet",
    exclusivity: "ignore",
    focusable: true,
    popup: true,
    visible: false,
    child: Box({
      vertical: true,
      children: [
        clickOutsideToClose,
        Box({
          vertical: true,
          className: "cheatsheet-bg spacing-v-15",
          children: [cheatsheetHeader(), Keybinds()],
        }),
      ],
    }),
  });
