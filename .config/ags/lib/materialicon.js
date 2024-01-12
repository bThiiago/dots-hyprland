import Widget from "resource:///com/github/Aylur/ags/widget.js";
const { Label } = Widget;

export const MaterialIcon = (icon, size, props = {}) =>
  Label({
    className: `icon-material txt-${size}`,
    label: icon,
    ...props,
  });
