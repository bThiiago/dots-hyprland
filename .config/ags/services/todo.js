const { Gio, GLib } = imports.gi;
import Service from "resource:///com/github/Aylur/ags/service.js";
import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
const { exec, writeFile, readFile } = Utils;

function fileExists(filePath) {
  let file = Gio.File.new_for_path(filePath);
  return file.query_exists(null);
}

class TodoService extends Service {
  static {
    Service.register(this, { updated: [] });
  }

  _todoPath = "";
  _todoJson = [];

  refresh(value) {
    this.emit("updated", value);
  }

  connectWidget(widget, callback) {
    this.connect(widget, callback, "updated");
  }

  get todo_json() {
    return this._todoJson;
  }

  add(content) {
    this._todoJson.push({ content, done: false });
    writeFile(JSON.stringify(this._todoJson), this._todoPath).catch(print);
    this.emit("updated");
  }

  check(index) {
    this._todoJson[index].done = true;
    writeFile(JSON.stringify(this._todoJson), this._todoPath).catch(print);
    this.emit("updated");
  }

  uncheck(index) {
    this._todoJson[index].done = false;
    writeFile(JSON.stringify(this._todoJson), this._todoPath).catch(print);
    this.emit("updated");
  }

  remove(index) {
    this._todoJson.splice(index, 1);
    writeFile(JSON.stringify(this._todoJson), this._todoPath).catch(print);
    this.emit("updated");
  }

  constructor() {
    super();
    this._todoPath = `${GLib.get_user_cache_dir()}/ags/user/todo.json`;
    if (!fileExists(this._todoPath)) {
      exec(`bash -c 'mkdir -p ${GLib.get_user_cache_dir()}/ags/user'`);
      exec(`touch ${this._todoPath}`);
      writeFile("[]", this._todoPath)
        .then(() => {
          this._todoJson = JSON.parse(readFile(this._todoPath));
        })
        .catch(print);
    } else {
      const fileContents = readFile(this._todoPath);
      this._todoJson = JSON.parse(fileContents);
    }
  }
}

const service = new TodoService();

globalThis.todo = service;

export default service;
