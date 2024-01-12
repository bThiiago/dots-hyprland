import Service from "resource:///com/github/Aylur/ags/service.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { timeout } = Utils;

class IndicatorService extends Service {
  static {
    Service.register(this, { popup: ["double"] });
  }

  _delay = 1500;
  _count = 0;

  popup(value) {
    this.emit("popup", value);
    this._count++;
    timeout(this._delay, () => {
      this._count--;

      if (this._count === 0) this.emit("popup", -1);
    });
  }

  connectWidget(widget, callback) {
    connect(this, widget, callback, "popup");
  }
}

const service = new IndicatorService();

globalThis["indicator"] = service;

export default service;
