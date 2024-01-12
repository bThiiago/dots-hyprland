import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { MarginRevealer } from "../../lib/advancedwidgets.js";
import Audio from "resource:///com/github/Aylur/ags/service/audio.js";
import Indicator from "../../services/indicator.js";
const { Box, Label, ProgressBar } = Widget;

const OsdValue = (name, labelConnections, progressConnections, props = {}) =>
  Box({
    ...props,
    vertical: true,
    className: "osd-bg osd-value",
    hexpand: true,
    children: [
      Box({
        vexpand: true,
        children: [
          Label({
            xalign: 0,
            yalign: 0,
            hexpand: true,
            className: "osd-label",
            label: `${name}`,
          }),
          Label({
            hexpand: false,
            className: "osd-value-txt",
            label: "100",
            connections: labelConnections,
          }),
        ],
      }),
      ProgressBar({
        className: "osd-progress",
        hexpand: true,
        vertical: false,
        connections: progressConnections,
      }),
    ],
  });

const microphoneIndicator = OsdValue(
  "Microphone",
  [
    [
      Audio,
      (label) => {
        label.label = `${Math.round(Audio.microphone?.volume * 100)}`;
      },
    ],
  ],
  [
    [
      Audio,
      (progress) => {
        const updateValue = Audio.microphone?.volume;
        if (!isNaN(updateValue)) progress.value = updateValue;
      },
    ],
  ]
);

const volumeIndicator = OsdValue(
  "Volume",
  [
    [
      Audio,
      (label) => {
        label.label = `${Math.round(Audio.speaker?.volume * 100)}`;
      },
    ],
  ],
  [
    [
      Audio,
      (progress) => {
        const updateValue = Audio.speaker?.volume;
        if (!isNaN(updateValue)) progress.value = updateValue;
      },
    ],
  ]
);

export default () =>
  MarginRevealer({
    transition: "slide_down",
    showClass: "osd-show",
    hideClass: "osd-hide",
    connections: [
      [
        Indicator,
        (revealer, value) => {
          if (value > -1) revealer._show();
          else revealer._hide();
        },
        "popup",
      ],
    ],
    child: Box({
      hpack: "center",
      vertical: false,
      children: [microphoneIndicator, volumeIndicator],
    }),
  });
