const { GLib } = imports.gi;
import { Widget } from "../../imports.js";
const { Box, Label } = Widget;

const TimeAndDate = () =>
  Box({
    vertical: true,
    className: "spacing-v--5",
    children: [
      Label({
        className: "bg-time-clock",
        xalign: 0,
        label: GLib.DateTime.new_now_local().format("%H:%M"),
        setup: (self) =>
          self.poll(5000, (label) => {
            label.label = GLib.DateTime.new_now_local().format("%H:%M");
          }),
      }),
      Label({
        className: "bg-time-date",
        xalign: 0,
        label: GLib.DateTime.new_now_local().format("%A, %d/%m/%Y"),
        setup: (self) =>
          self.poll(5000, (label) => {
            label.label = GLib.DateTime.new_now_local().format("%A, %d/%m/%Y");
          }),
      }),
    ],
  });

export default () =>
  Box({
    hpack: "start",
    vpack: "end",
    vertical: true,
    className: "bg-time-box spacing-v-20",
    children: [TimeAndDate()],
  });
