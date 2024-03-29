import * as Utils from "resource:///com/github/Aylur/ags/utils.js";
import Service from "resource:///com/github/Aylur/ags/service.js";
const { fetch } = Utils;

// Tags:
//     waifu.im (type):
//         maid waifu marin-kitagawa mori-calliope raiden-shogun oppai selfies uniform
//     waifu.im (nsfw tags):
//         ecchi hentai ero ass paizuri oral milf

function paramStringFromObj(params) {
  return Object.entries(params)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length == 0) return "";
        let thisKey = `${encodeURIComponent(key)}=${encodeURIComponent(
          value[0]
        )}`;
        for (let i = 1; i < value.length; i++) {
          thisKey += `&${encodeURIComponent(key)}=${encodeURIComponent(
            value[i]
          )}`;
        }
        return thisKey;
      }
      return `${key}=${value}`;
    })
    .join("&");
}

class WaifuService extends Service {
  _endpoints = {
    im: "https://api.waifu.im/search",
    nekos: "https://nekos.life/api/neko",
    pics: "https://api.waifu.pics/sfw/",
  };
  _headers = {
    im: { "Accept-Version": "v5" },
    nekos: {},
    pics: {},
  };
  _baseUrl = "https://api.waifu.im/search";
  _mode = "im";
  _responses = [];
  _queries = [];
  _nsfw = false;
  _minHeight = 600;
  _status = 0;

  static {
    Service.register(this, {
      initialized: [],
      clear: [],
      newResponse: ["int"],
      updateResponse: ["int"],
    });
  }

  constructor() {
    super();
    this.emit("initialized");
  }

  clear() {
    this._responses = [];
    this._queries = [];
    this.emit("clear");
  }

  get mode() {
    return this._mode;
  }
  set mode(value) {
    this._mode = value;
    this._baseUrl = this._endpoints[this._mode];
  }
  get nsfw() {
    return this._nsfw;
  }
  set nsfw(value) {
    this._nsfw = value;
  }
  get queries() {
    return this._queries;
  }
  get responses() {
    return this._responses;
  }

  async fetch(msg) {
    try {
      const userArgs = msg.split(" ");
      let taglist = [];
      this._nsfw = false;
      for (let i = 0; i < userArgs.length; i++) {
        const thisArg = userArgs[i];
        if (thisArg == "--im") this._mode = "im";
        else if (thisArg == "--nekos") this._mode = "nekos";
        else if (thisArg.includes("pics")) this._mode = "pics";
        else if (
          thisArg.includes("segs") ||
          thisArg.includes("sex") ||
          thisArg.includes("lewd")
        )
          this._nsfw = true;
        else {
          taglist.push(thisArg);
          if (
            [
              "ecchi",
              "hentai",
              "ero",
              "ass",
              "paizuri",
              "oral",
              "milf",
            ].includes(thisArg)
          )
            this._nsfw = true;
        }
      }
      const newMessageId = this._queries.length;
      this._queries.push(taglist);
      this.emit("newResponse", newMessageId);
      const params = {
        included_tags: taglist,
        height: `>=${this._minHeight}`,
        nsfw: this._nsfw,
      };
      const paramString = paramStringFromObj(params);
      const options = {
        method: "GET",
        headers: this._headers[this._mode],
      };
      var status = 0;
      fetch(`${this._endpoints[this._mode]}?${paramString}`, options)
        .then((result) => {
          status = result.status;
          return result.text();
        })
        .then((dataString) => {
          const parsedData = JSON.parse(dataString);
          if (!parsedData.images)
            this._responses.push({
              status: status,
              signature: -1,
              url: "",
              extension: "",
              source: "",
              dominant_color: "#383A40",
              is_nsfw: false,
              width: 0,
              height: 0,
              tags: [],
            });
          else {
            const imageData = parsedData.images[0];
            this._responses.push({
              status: status,
              signature: imageData?.signature || -1,
              url: imageData?.url || undefined,
              extension: imageData.extension,
              source: imageData?.source,
              dominant_color: imageData?.dominant_color || "#9392A6",
              is_nsfw: imageData?.is_nsfw || false,
              width: imageData?.width || 0,
              height: imageData?.height || 0,
              tags: imageData?.tags.map((obj) => obj["name"]) || [],
            });
          }
          this.emit("updateResponse", newMessageId);
        })
        .catch(console.error);
    } catch (e) {
      console.error(e);
    }
  }
}

export default new WaifuService();
