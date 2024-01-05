import { Widget } from "../../imports.js";
import { SearchAndWindows } from "./overview.js";
const { Box, Window } = Widget;

export default () =>
  Window({
    name: "overview",
    exclusivity: "ignore",
    focusable: true,
    popup: true,
    visible: false,
    anchor: ["top"],
    layer: "overlay",
    child: Box({
      vertical: true,
      children: [SearchAndWindows()],
    }),
  });
