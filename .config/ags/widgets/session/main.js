import Widget from "resource:///com/github/Aylur/ags/widget.js";
import SessionScreen from "./sessionscreen.js";
const { Window } = Widget;

export default () =>
  Window({
    name: "session",
    popup: true,
    visible: false,
    focusable: true,
    layer: "overlay",
    exclusivity: "ignore",
    child: SessionScreen(),
  });
