import Widget from "resource:///com/github/Aylur/ags/widget.js";
const { Revealer, Scrollable } = Widget;

export const MarginRevealer = ({
  transition = "slide_down",
  child,
  revealChild,
  showClass = "element-show",
  hideClass = "element-hide",
  extraProperties = [],
  ...rest
}) => {
  const widget = Scrollable({
    ...rest,
    properties: [
      ["revealChild", true],
      ["transition", transition],
      [
        "show",
        () => {
          if (widget._revealChild) return;
          widget.hscroll = "never";
          widget.vscroll = "never";
          child.toggleClassName(hideClass, false);
          child.toggleClassName(showClass, true);
          widget._revealChild = true;
          child.css = "margin: 0px;";
        },
      ],
      [
        "hide",
        () => {
          if (!widget._revealChild) return;
          child.toggleClassName(hideClass, true);
          child.toggleClassName(showClass, false);
          widget._revealChild = false;
          if (widget._transition == "slide_left")
            child.css = `margin-right: -${child.get_allocated_width()}px;`;
          else if (widget._transition == "slide_right")
            child.css = `margin-left: -${child.get_allocated_width()}px;`;
          else if (widget._transition == "slide_up")
            child.css = `margin-bottom: -${child.get_allocated_height()}px;`;
          else if (widget._transition == "slide_down")
            child.css = `margin-top: -${child.get_allocated_height()}px;`;
        },
      ],
      [
        "toggle",
        () => {
          console.log("toggle");
          if (widget._revealChild) widget._hide();
          else widget._show();
        },
      ],
      ...extraProperties,
    ],
    child: child,
    hscroll: `${revealChild ? "never" : "always"}`,
    vscroll: `${revealChild ? "never" : "always"}`,
  });
  child.toggleClassName(`${revealChild ? showClass : hideClass}`, true);
  return widget;
};

export const DoubleRevealer = ({
  transition1 = "slide_right",
  transition2 = "slide_left",
  duration1 = 150,
  duration2 = 150,
  child,
  revealChild,
}) => {
  return Revealer({
    transition: transition1,
    transitionDuration: duration1,
    revealChild: revealChild,
    child: Revealer({
      transition: transition2,
      transitionDuration: duration2,
      revealChild: revealChild,
      child: child,
    }),
  });
};
