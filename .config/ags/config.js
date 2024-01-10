"use strict";
import { App, Utils } from "./imports.js";
const { exec } = Utils;
import Bar from "./widgets/bar/main.js";
import Cheatsheet from "./widgets/cheatsheet/main.js";
import DesktopBackground from "./widgets/desktopbackground/main.js";
import {
  CornerTopleft,
  CornerTopright,
  CornerBottomleft,
  CornerBottomright,
} from "./widgets/screencorners/main.js";
import Indicator from "./widgets/indicators/main.js";
import Osk from "./widgets/onscreenkeyboard/main.js";
import Overview from "./widgets/overview/main.js";
import Session from "./widgets/session/main.js";
import SideLeft from "./widgets/sideleft/main.js";
import SideRight from "./widgets/sideright/main.js";

const CLOSE_ANIM_TIME = 210;

exec(`bash -c 'echo "" > ${App.configDir}/scss/_musicwal.scss'`);
exec(`bash -c 'echo "" > ${App.configDir}/scss/_musicmaterial.scss'`);
function applyStyle() {
  exec(`sassc ${App.configDir}/scss/main.scss ${App.configDir}/style.css`);
  App.resetCss();
  App.applyCss(`${App.configDir}/style.css`);
  console.log("[LOG] Styles loaded");
}
applyStyle();

export default {
  css: `${App.configDir}/style.css`,
  stackTraceOnError: true,
  closeWindowDelay: {
    sideright: CLOSE_ANIM_TIME,
    sideleft: CLOSE_ANIM_TIME,
    osk: CLOSE_ANIM_TIME,
  },
  windows: [
    CornerTopleft(),
    CornerTopright(),
    CornerBottomleft(),
    CornerBottomright(),
    DesktopBackground(),
    Overview(),
    Indicator(),
    Cheatsheet(),
    SideLeft(),
    SideRight(),
    Osk(),
    Session(),
    Bar(),
  ],
};
