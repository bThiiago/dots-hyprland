import Widget from "resource:///com/github/Aylur/ags/widget.js";
import { RoundedCorner } from "../../lib/roundedcorner.js";
const { Window } = Widget;

export const CornerTopleft = () =>
  Window({
    name: "cornertl",
    layer: "top",
    anchor: ["top", "left"],
    exclusivity: "normal",
    visible: true,
    child: RoundedCorner("topleft", { className: "corner" }),
  });
export const CornerTopright = () =>
  Window({
    name: "cornertr",
    layer: "top",
    anchor: ["top", "right"],
    exclusivity: "normal",
    visible: true,
    child: RoundedCorner("topright", { className: "corner" }),
  });
export const CornerBottomleft = () =>
  Window({
    name: "cornerbl",
    layer: "top",
    anchor: ["bottom", "left"],
    exclusivity: "ignore",
    visible: true,
    child: RoundedCorner("bottomleft", { className: "corner-black" }),
  });
export const CornerBottomright = () =>
  Window({
    name: "cornerbr",
    layer: "top",
    anchor: ["bottom", "right"],
    exclusivity: "ignore",
    visible: true,
    child: RoundedCorner("bottomright", { className: "corner-black" }),
  });
