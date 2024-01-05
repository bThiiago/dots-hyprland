import { Widget } from "../../imports.js";
const { Box, Label, Button, Revealer } = Widget;

export const searchItem = ({
  materialIconName,
  name,
  actionName,
  content,
  onActivate,
}) => {
  const actionText = Revealer({
    revealChild: false,
    transition: "crossfade",
    transitionDuration: 200,
    child: Label({
      className: "overview-search-results-txt txt txt-small txt-action",
      label: `${actionName}`,
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
    onClicked: onActivate,
    child: Box({
      children: [
        Box({
          vertical: false,
          children: [
            Label({
              className: `icon-material overview-search-results-icon`,
              label: `${materialIconName}`,
            }),
            Box({
              vertical: true,
              children: [
                Label({
                  hpack: "start",
                  className:
                    "overview-search-results-txt txt txt-smallie txt-subtext",
                  label: `${name}`,
                  truncate: "end",
                }),
                Label({
                  hpack: "start",
                  className: "overview-search-results-txt txt txt-norm",
                  label: `${content}`,
                  truncate: "end",
                }),
              ],
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
