import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { keybindList } from "../../data/keybinds.js";
const { Box, Label } = Widget;

export const Keybinds = () =>
  Box({
    vertical: false,
    className: "spacing-h-15",
    homogeneous: true,
    children: keybindList.map((group, i) =>
      Box({
        vertical: true,
        className: "spacing-v-15",
        children: group.map((category, i) =>
          Box({
            vertical: true,
            className: "spacing-v-15",
            children: [
              Box({
                vertical: false,
                className: "spacing-h-10",
                children: [
                  Label({
                    xalign: 0,
                    className: "icon-material txt txt-larger",
                    label: category.icon,
                  }),
                  Label({
                    xalign: 0,
                    className: "cheatsheet-category-title txt",
                    label: category.name,
                  }),
                ],
              }),
              Box({
                vertical: false,
                className: "spacing-h-10",
                children: [
                  Box({
                    vertical: true,
                    homogeneous: true,
                    children: category.binds.map((keybinds, i) =>
                      Box({
                        vertical: false,
                        children: keybinds.keys.map((key, i) =>
                          Label({
                            className: `${
                              ["OR", "+"].includes(key)
                                ? "cheatsheet-key-notkey"
                                : "cheatsheet-key"
                            } txt-small`,
                            label: key,
                          })
                        ),
                      })
                    ),
                  }),
                  Box({
                    vertical: true,
                    homogeneous: true,
                    children: category.binds.map((keybinds, i) =>
                      Label({
                        xalign: 0,
                        label: keybinds.action,
                        className: "txt chearsheet-action txt-small",
                      })
                    ),
                  }),
                ],
              }),
            ],
          })
        ),
      })
    ),
  });
