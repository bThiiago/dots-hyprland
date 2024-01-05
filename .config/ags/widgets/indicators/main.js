import { Widget } from "../../imports.js";
import Indicator from "../../services/indicator.js";
import IndicatorValues from "./indicatorvalues.js";
import MusicControls from "./musiccontrols.js";
import ColorScheme from "./colorscheme.js";
import NotificationPopups from "./notificationpopups.js";
const { EventBox, Box, Window } = Widget;

export default (monitor) =>
  Window({
    name: `indicator${monitor}`,
    monitor,
    className: "indicator",
    layer: "overlay",
    visible: true,
    anchor: ["top"],
    child: EventBox({
      onHover: () => {
        //make the widget hide when hovering
        Indicator.popup(-1);
      },
      child: Box({
        vertical: true,
        css: "min-height: 2px;",
        children: [
          IndicatorValues(),
          MusicControls(),
          NotificationPopups(),
          ColorScheme(),
        ],
      }),
    }),
  });
