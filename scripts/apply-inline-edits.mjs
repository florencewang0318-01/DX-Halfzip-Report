import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const editsPath = path.join(rootDir, "edits.json");
const templatePath = path.join(rootDir, "src", "template.html");

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function toNodeContent(value, isRich) {
  return isRich ? String(value) : escapeText(value);
}

function parseAttributes(rawTag) {
  const attrs = {};
  const attrRegex = /([^\s=/>]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = attrRegex.exec(rawTag))) {
    const [, name, doubleQuoted = "", singleQuoted = "", bareValue = ""] = match;
    if (name.startsWith("<") || name.startsWith("/")) {
      continue;
    }
    attrs[name] = doubleQuoted || singleQuoted || bareValue;
  }
  return attrs;
}

function getClassPreview(classValue = "") {
  const classes = classValue
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);
  return classes.length ? `.${classes.join(".")}` : "";
}

function buildPathSegment(tagName, attrs, siblingIndex) {
  const idPart = attrs.id ? `#${attrs.id}` : "";
  const classPart = getClassPreview(attrs.class);
  return `${tagName}${idPart}${classPart}[${siblingIndex}]`;
}

function replaceAttribute(openTag, name, value) {
  const escaped = escapeAttr(value);
  const attrPattern = new RegExp(`${name}=(?:"[^"]*"|'[^']*')`);
  if (attrPattern.test(openTag)) {
    return openTag.replace(attrPattern, `${name}="${escaped}"`);
  }
  return openTag.replace(/>$/, ` ${name}="${escaped}">`);
}

function* iterateTags(html) {
  let cursor = 0;

  while (cursor < html.length) {
    const start = html.indexOf("<", cursor);
    if (start === -1) {
      break;
    }

    if (html.startsWith("<!--", start)) {
      const commentEnd = html.indexOf("-->", start + 4);
      cursor = commentEnd === -1 ? html.length : commentEnd + 3;
      continue;
    }

    let index = start + 1;
    let quote = null;

    while (index < html.length) {
      const char = html[index];
      if (quote) {
        if (char === quote) {
          quote = null;
        }
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === ">") {
        break;
      }
      index += 1;
    }

    if (index >= html.length) {
      break;
    }

    yield {
      fullTag: html.slice(start, index + 1),
      start,
      end: index + 1
    };

    cursor = index + 1;
  }
}

function collectEditableNodes(html) {
  const root = {
    path: "",
    childCounters: new Map(),
    hasChildTags: true
  };
  const stack = [root];
  const nodes = [];
 
  for (const tag of iterateTags(html)) {
    const { fullTag } = tag;
    const isClosing = fullTag.startsWith("</");
    const tagMatch = isClosing
      ? /^<\/([a-zA-Z][\w:-]*)/.exec(fullTag)
      : /^<([a-zA-Z][\w:-]*)([\s\S]*?)\/?>$/.exec(fullTag);
    if (!tagMatch) {
      continue;
    }
    const tagName = tagMatch[1].toLowerCase();
    const rawAttrs = isClosing ? "" : tagMatch[2] ?? "";
    const isVoid = /\/>$/.test(fullTag) || ["br", "img", "meta", "link", "input"].includes(tagName);

    if (isClosing) {
      while (stack.length > 1) {
        const current = stack.pop();
        current.closeTagStart = tag.start;
        current.closeTagEnd = tag.end;
        if (current.tagName === tagName) {
          break;
        }
      }
      continue;
    }

    const attrs = parseAttributes(rawAttrs);
    const parent = stack[stack.length - 1];
    parent.hasChildTags = true;
    const siblingIndex = parent.childCounters.get(tagName) ?? 0;
    parent.childCounters.set(tagName, siblingIndex + 1);
    const segment = buildPathSegment(tagName, attrs, siblingIndex);
    const nodePath = parent.path ? `${parent.path}>${segment}` : segment;

    const node = {
      tagName,
      path: nodePath,
      attrs,
      openTagStart: tag.start,
      openTagEnd: tag.end,
      contentStart: tag.end,
      closeTagStart: tag.end,
      closeTagEnd: tag.end,
      hasChildTags: false,
      childCounters: new Map()
    };

    if (Object.prototype.hasOwnProperty.call(attrs, "data-zh") && Object.prototype.hasOwnProperty.call(attrs, "data-en")) {
      nodes.push(node);
    }

    if (!isVoid) {
      stack.push(node);
    }
  }

  return nodes;
}

function buildNodeLookup(nodes) {
  const lookup = new Map();
  for (const node of nodes) {
    lookup.set(node.path, node);
    const trimmedPath = node.path.replace(/^html\[0\]>body\[0\]>/, "");
    lookup.set(trimmedPath, node);
  }
  return lookup;
}

async function main() {
  const [html, editsRaw] = await Promise.all([
    readFile(templatePath, "utf8"),
    readFile(editsPath, "utf8")
  ]);

  const edits = JSON.parse(editsRaw);
  const nodes = collectEditableNodes(html);
  const nodeMap = buildNodeLookup(nodes);
  const replacements = [];
  let appliedCount = 0;

  for (const [key, patch] of Object.entries(edits)) {
    const node = nodeMap.get(key);
    if (!node) {
      continue;
    }
    const isRich = node.attrs["data-rich"] === "true";

    let nextOpenTag = html.slice(node.openTagStart, node.openTagEnd);
    nextOpenTag = replaceAttribute(nextOpenTag, "data-zh", patch.zh ?? node.attrs["data-zh"] ?? "");
    nextOpenTag = replaceAttribute(nextOpenTag, "data-en", patch.en ?? node.attrs["data-en"] ?? "");
    replacements.push({
      start: node.openTagStart,
      end: node.openTagEnd,
      value: nextOpenTag
    });

    replacements.push({
      start: node.contentStart,
      end: node.closeTagStart,
      value: toNodeContent(patch.zh ?? "", isRich)
    });

    appliedCount += 1;
  }

  const nextHtml = replacements
    .sort((a, b) => b.start - a.start)
    .reduce((source, replacement) => {
      return source.slice(0, replacement.start) + replacement.value + source.slice(replacement.end);
    }, html);

  await writeFile(templatePath, nextHtml, "utf8");
  console.log(`Applied ${appliedCount} inline edit(s) to ${path.relative(rootDir, templatePath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
