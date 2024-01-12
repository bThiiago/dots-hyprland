import Widget from "resource:///com/github/Aylur/ags/widget.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { timeout } = Utils;
const { Box, Button, EventBox, Label, Overlay, Stack } = Widget;
import { MaterialIcon } from "../../lib/materialicon.js";
import { getCalendarLayout } from "../../lib/calendarlayout.js";
import { setupCursorHover } from "../../lib/cursorhover.js";
import { TodoWidget } from "./todolist.js";

let calendarJson = getCalendarLayout(undefined, true);
let monthshift = 0;

function getDateInXMonthsTime(x) {
  var currentDate = new Date();
  var targetMonth = currentDate.getMonth() + x;
  var targetYear = currentDate.getFullYear();

  targetYear += Math.floor(targetMonth / 12);
  targetMonth = ((targetMonth % 12) + 12) % 12;

  var targetDate = new Date(targetYear, targetMonth, 1);

  return targetDate;
}

const weekDays = [
  { day: "Mo", today: 0 },
  { day: "Tu", today: 0 },
  { day: "We", today: 0 },
  { day: "Th", today: 0 },
  { day: "Fr", today: 0 },
  { day: "Sa", today: 0 },
  { day: "Su", today: 0 },
];

const CalendarDay = (day, today) =>
  Button({
    className: `sidebar-calendar-btn ${
      today == 1
        ? "sidebar-calendar-btn-today"
        : today == -1
        ? "sidebar-calendar-btn-othermonth"
        : ""
    }`,
    child: Overlay({
      child: Box({}),
      overlays: [
        Label({
          hpack: "center",
          className: "txt-smallie txt-semibold sidebar-calendar-btn-txt",
          label: String(day),
        }),
      ],
    }),
  });

const CalendarWidget = () => {
  const calendarMonthYear = Button({
    className: "txt txt-large sidebar-calendar-monthyear-btn",
    onClicked: () => shiftCalendarXMonths(0),
    setup: (button) => {
      button.label = `${new Date().toLocaleString("default", {
        month: "long",
      })} ${new Date().getFullYear()}`;
      setupCursorHover(button);
    },
  });
  const addCalendarChildren = (box, calendarJson) => {
    const children = box.get_children();
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.destroy();
    }
    box.children = calendarJson.map((row, i) =>
      Box({
        className: "spacing-h-5",
        children: row.map((day, i) => CalendarDay(day.day, day.today)),
      })
    );
  };
  function shiftCalendarXMonths(x) {
    if (x == 0) monthshift = 0;
    else monthshift += x;
    var newDate;
    if (monthshift == 0) newDate = new Date();
    else newDate = getDateInXMonthsTime(monthshift);

    calendarJson = getCalendarLayout(newDate, monthshift == 0);
    calendarMonthYear.label = `${
      monthshift == 0 ? "" : "• "
    }${newDate.toLocaleString("default", {
      month: "long",
    })} ${newDate.getFullYear()}`;
    addCalendarChildren(calendarDays, calendarJson);
  }
  const calendarHeader = Box({
    className: "spacing-h-5 sidebar-calendar-header",
    setup: (box) => {
      box.pack_start(calendarMonthYear, false, false, 0);
      box.pack_end(
        Box({
          className: "spacing-h-5",
          children: [
            Button({
              className: "sidebar-calendar-monthshift-btn",
              onClicked: () => shiftCalendarXMonths(-1),
              child: MaterialIcon("chevron_left", "norm"),
              setup: setupCursorHover,
            }),
            Button({
              className: "sidebar-calendar-monthshift-btn",
              onClicked: () => shiftCalendarXMonths(1),
              child: MaterialIcon("chevron_right", "norm"),
              setup: setupCursorHover,
            }),
          ],
        }),
        false,
        false,
        0
      );
    },
  });
  const calendarDays = Box({
    hexpand: true,
    vertical: true,
    className: "spacing-v-5",
    setup: (box) => {
      addCalendarChildren(box, calendarJson);
    },
  });
  return EventBox({
    onScrollUp: () => shiftCalendarXMonths(-1),
    onScrollDown: () => shiftCalendarXMonths(1),
    child: Box({
      hpack: "center",
      children: [
        Box({
          hexpand: true,
          vertical: true,
          className: "spacing-v-5",
          children: [
            calendarHeader,
            Box({
              homogeneous: true,
              className: "spacing-h-5",
              children: weekDays.map((day, i) =>
                CalendarDay(day.day, day.today)
              ),
            }),
            calendarDays,
          ],
        }),
      ],
    }),
  });
};

const defaultShown = "calendar";
const contentStack = Stack({
  hexpand: true,
  items: [
    ["calendar", CalendarWidget()],
    ["todo", TodoWidget()],
  ],
  transition: "slide_up_down",
  transitionDuration: 180,
  setup: (stack) =>
    timeout(1, () => {
      stack.shown = defaultShown;
    }),
});

const StackButton = (stackItemName, icon, name) =>
  Button({
    className:
      "button-minsize sidebar-navrail-btn sidebar-button-alone txt-small spacing-h-5",
    onClicked: (button) => {
      contentStack.shown = stackItemName;
      const kids = button.get_parent().get_children();
      for (let i = 0; i < kids.length; i++) {
        if (kids[i] != button)
          kids[i].toggleClassName("sidebar-navrail-btn-active", false);
        else button.toggleClassName("sidebar-navrail-btn-active", true);
      }
    },
    child: Box({
      className: "spacing-v-5",
      vertical: true,
      children: [
        Label({
          className: `txt icon-material txt-hugeass`,
          label: icon,
        }),
        Label({
          label: name,
          className: "txt txt-smallie",
        }),
      ],
    }),
    setup: (button) =>
      timeout(1, () => {
        setupCursorHover(button);
        button.toggleClassName(
          "sidebar-navrail-btn-active",
          defaultShown === stackItemName
        );
      }),
  });

export const ModuleCalendar = () =>
  Box({
    className: "sidebar-group spacing-h-5",
    setup: (box) => {
      box.pack_start(
        Box({
          vpack: "center",
          homogeneous: true,
          vertical: true,
          className: "sidebar-navrail spacing-v-10",
          children: [
            StackButton("calendar", "calendar_month", "Calendar"),
            StackButton("todo", "lists", "To Do"),
          ],
        }),
        false,
        false,
        0
      );
      box.pack_end(contentStack, false, false, 0);
    },
  });
