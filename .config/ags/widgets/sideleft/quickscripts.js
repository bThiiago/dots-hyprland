import { SidebarModule } from "./module.js";
import { Widget } from "../../imports.js";
const { Box } = Widget;

export const QuickScripts = () =>
  SidebarModule({
    name: "Quick scripts",
    child: Box({}),
  });
