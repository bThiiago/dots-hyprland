import { SidebarModule } from "./module.js";
import Widget from "resource:///com/github/Aylur/ags/widget.js";
const { Box } = Widget;

export const QuickScripts = () =>
  SidebarModule({
    name: "Quick scripts",
    child: Box({}),
  });
