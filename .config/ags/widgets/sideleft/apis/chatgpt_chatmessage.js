const { Gio, GLib, Gtk } = imports.gi;
import { App, Utils, Widget } from "../../../imports.js";
const { Box, Button, Label, Scrollable } = Widget;
const { execAsync } = Utils;
import { MaterialIcon } from "../../../lib/materialicon.js";
import md2pango from "../../../lib/md2pango.js";
import GtkSource from "gi://GtkSource?version=3.0";

const CUSTOM_SOURCEVIEW_SCHEME_PATH = `${App.configDir}/data/sourceviewtheme.xml`;
const CUSTOM_SCHEME_ID = "custom";
const USERNAME = GLib.get_user_name();
const CHATGPT_CURSOR = "  (o) ";

function loadCustomColorScheme(filePath) {
  const file = Gio.File.new_for_path(filePath);
  const [success, contents] = file.load_contents(null);

  if (!success) {
    logError("Failed to load the XML file.");
    return;
  }

  const schemeManager = GtkSource.StyleSchemeManager.get_default();
  schemeManager.append_search_path(file.get_parent().get_path());
}
loadCustomColorScheme(CUSTOM_SOURCEVIEW_SCHEME_PATH);

function substituteLang(str) {
  const subs = [{ from: "javascript", to: "js" }];

  for (const { from, to } of subs) {
    if (from === str) return to;
  }

  return str;
}

const HighlightedCode = (content, lang) => {
  const buffer = new GtkSource.Buffer();
  const sourceView = new GtkSource.View({
    buffer: buffer,
    wrap_mode: Gtk.WrapMode.WORD,
  });
  const langManager = GtkSource.LanguageManager.get_default();
  let displayLang = langManager.get_language(substituteLang(lang));
  if (displayLang) {
    buffer.set_language(displayLang);
  }
  const schemeManager = GtkSource.StyleSchemeManager.get_default();
  buffer.set_style_scheme(schemeManager.get_scheme(CUSTOM_SCHEME_ID));
  buffer.set_text(content, -1);
  return sourceView;
};

const TextBlock = (content = "") =>
  Label({
    hpack: "fill",
    className: "txt sidebar-chat-txtblock sidebar-chat-txt",
    useMarkup: true,
    xalign: 0,
    wrap: true,
    selectable: true,
    label: content,
  });

const CodeBlock = (content = "", lang = "txt") => {
  const topBar = Box({
    className: "sidebar-chat-codeblock-topbar",
    children: [
      Label({
        label: lang,
        className: "sidebar-chat-codeblock-topbar-txt",
      }),
      Box({
        hexpand: true,
      }),
      Button({
        className: "sidebar-chat-codeblock-topbar-btn",
        child: Box({
          className: "spacing-h-5",
          children: [
            MaterialIcon("content_copy", "small"),
            Label({
              label: "Copy",
            }),
          ],
        }),
        onClicked: (self) => {
          const buffer = sourceView.get_buffer();
          const copyContent = buffer.get_text(
            buffer.get_start_iter(),
            buffer.get_end_iter(),
            false
          );
          execAsync([`wl-copy`, `${copyContent}`]).catch(print);
        },
      }),
    ],
  });
  const sourceView = HighlightedCode(content, lang);

  const codeBlock = Box({
    properties: [
      [
        "updateText",
        (text) => {
          sourceView.get_buffer().set_text(text, -1);
        },
      ],
    ],
    className: "sidebar-chat-codeblock",
    vertical: true,
    children: [
      topBar,
      Box({
        className: "sidebar-chat-codeblock-code",
        homogeneous: true,
        children: [
          Scrollable({
            vscroll: "never",
            hscroll: "automatic",
            child: sourceView,
          }),
        ],
      }),
    ],
  });
  return codeBlock;
};

const Divider = () =>
  Box({
    className: "sidebar-chat-divider",
  });

const MessageContent = (content) => {
  const contentBox = Box({
    vertical: true,
    properties: [
      [
        "fullUpdate",
        (self, content, useCursor = false) => {
          const children = contentBox.get_children();
          for (let i = 0; i < children.length; i++) {
            const child = children[i];
            child.destroy();
          }
          contentBox.add(TextBlock());
          let lines = content.split("\n");
          let lastProcessed = 0;
          let inCode = false;
          for (const [index, line] of lines.entries()) {
            const codeBlockRegex = /^\s*```([a-zA-Z0-9]+)?\n?/;
            if (codeBlockRegex.test(line)) {
              const kids = self.get_children();
              const lastLabel = kids[kids.length - 1];
              const blockContent = lines.slice(lastProcessed, index).join("\n");
              if (!inCode) {
                lastLabel.label = md2pango(blockContent);
                contentBox.add(CodeBlock("", codeBlockRegex.exec(line)[1]));
              } else {
                lastLabel._updateText(blockContent);
                contentBox.add(TextBlock());
              }

              lastProcessed = index + 1;
              inCode = !inCode;
            }
            const dividerRegex = /^\s*---/;
            if (!inCode && dividerRegex.test(line)) {
              const kids = self.get_children();
              const lastLabel = kids[kids.length - 1];
              const blockContent = lines.slice(lastProcessed, index).join("\n");
              lastLabel.label = md2pango(blockContent);
              contentBox.add(Divider());
              contentBox.add(TextBlock());
              lastProcessed = index + 1;
            }
          }
          if (lastProcessed < lines.length) {
            const kids = self.get_children();
            const lastLabel = kids[kids.length - 1];
            let blockContent = lines
              .slice(lastProcessed, lines.length)
              .join("\n");
            if (!inCode)
              lastLabel.label = `${md2pango(blockContent)}${
                useCursor ? CHATGPT_CURSOR : ""
              }`;
            else lastLabel._updateText(blockContent);
          }
          contentBox.show_all();
        },
      ],
    ],
  });
  contentBox._fullUpdate(contentBox, content, false);
  return contentBox;
};

export const ChatMessage = (message, scrolledWindow) => {
  const messageContentBox = MessageContent(message.content);
  const thisMessage = Box({
    className: "sidebar-chat-message",
    children: [
      Box({
        className: `sidebar-chat-indicator ${
          message.role == "user"
            ? "sidebar-chat-indicator-user"
            : "sidebar-chat-indicator-bot"
        }`,
      }),
      Box({
        vertical: true,
        hpack: "fill",
        hexpand: true,
        children: [
          Label({
            hpack: "fill",
            xalign: 0,
            className: "txt txt-bold sidebar-chat-name",
            wrap: true,
            label: message.role == "user" ? USERNAME : "ChatGPT",
          }),
          messageContentBox,
        ],
        connections: [
          [
            message,
            (self, isThinking) => {
              messageContentBox.toggleClassName("thinking", message.thinking);
            },
            "notify::thinking",
          ],
          [
            message,
            (self) => {
              messageContentBox._fullUpdate(
                messageContentBox,
                message.content,
                message.role != "user"
              );
            },
            "notify::content",
          ],
          [
            message,
            (label, isDone) => {
              messageContentBox._fullUpdate(
                messageContentBox,
                message.content,
                false
              );
            },
            "notify::done",
          ],
        ],
      }),
    ],
  });
  return thisMessage;
};

export const SystemMessage = (content, commandName, scrolledWindow) => {
  const messageContentBox = MessageContent(content);
  const thisMessage = Box({
    className: "sidebar-chat-message",
    children: [
      Box({
        className: `sidebar-chat-indicator sidebar-chat-indicator-System`,
      }),
      Box({
        vertical: true,
        hpack: "fill",
        hexpand: true,
        children: [
          Label({
            xalign: 0,
            className: "txt txt-bold sidebar-chat-name",
            wrap: true,
            label: `System  •  ${commandName}`,
          }),
          messageContentBox,
        ],
      }),
    ],
  });
  return thisMessage;
};
