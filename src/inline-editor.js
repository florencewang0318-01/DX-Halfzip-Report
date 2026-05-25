function canUseInlineEditor() {
  const params = new URLSearchParams(window.location.search);
  const editFlag = params.get("edit");
  const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  const isLocalFile = window.location.protocol === "file:";
  return editFlag === "1" && (isLocalHost || isLocalFile);
}

function computeEditableKey(node) {
  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.dataset.editKey) {
    return node.dataset.editKey;
  }

  const segments = [];
  let current = node;
  while (current && current !== document.body) {
    const parent = current.parentElement;
    const siblings = parent ? Array.from(parent.children).filter((child) => child.tagName === current.tagName) : [];
    const index = siblings.indexOf(current);
    const idPart = current.id ? `#${current.id}` : "";
    const classPart =
      current.classList.length > 0
        ? `.${Array.from(current.classList)
            .slice(0, 2)
            .join(".")}`
        : "";
    segments.unshift(`${current.tagName.toLowerCase()}${idPart}${classPart}[${index}]`);
    current = parent;
  }

  const key = segments.join(">");
  node.dataset.editKey = key;
  return key;
}

function loadInlineEdits() {
  try {
    return JSON.parse(window.localStorage.getItem("dx-inline-edits") || "{}");
  } catch {
    return {};
  }
}

function saveInlineEdits(edits) {
  try {
    window.localStorage.setItem("dx-inline-edits", JSON.stringify(edits));
  } catch {
    // ignore storage failures
  }
}

function downloadInlineEdits(edits) {
  const blob = new Blob([JSON.stringify(edits, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "edits.json";
  link.click();
  URL.revokeObjectURL(url);
}

function applyStoredEditsToNode(node, edits) {
  if (!(node instanceof HTMLElement) || !node.dataset.zh || !node.dataset.en) {
    return;
  }

  const key = computeEditableKey(node);
  const patch = edits[key];
  if (!patch) {
    return;
  }

  if (typeof patch.zh === "string") {
    node.dataset.zh = patch.zh;
  }
  if (typeof patch.en === "string") {
    node.dataset.en = patch.en;
  }

  const lang = document.body.dataset.lang === "en" ? "en" : "zh";
  const nextValue = lang === "en" ? node.dataset.en || "" : node.dataset.zh || "";
  if (node.dataset.rich === "true") {
    node.innerHTML = nextValue;
  } else {
    node.textContent = nextValue;
  }
}

function bindEditableNode(node, edits) {
  if (!(node instanceof HTMLElement) || node.dataset.inlineEditorBound === "true") {
    return;
  }
  if (!node.dataset.zh || !node.dataset.en) {
    return;
  }

  node.dataset.inlineEditorBound = "true";
  node.classList.add("is-inline-editable");
  computeEditableKey(node);

  node.addEventListener("dblclick", () => {
    if (node.isContentEditable) {
      return;
    }

    const lang = document.body.dataset.lang === "en" ? "en" : "zh";
    const key = computeEditableKey(node);
    const originalZh = node.dataset.zh || "";
    const originalEn = node.dataset.en || "";
    const isRich = node.dataset.rich === "true";

    node.contentEditable = "true";
    node.classList.add("is-inline-editing");
    node.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(node);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const finishEdit = (commit) => {
      node.contentEditable = "false";
      node.classList.remove("is-inline-editing");

      if (!commit) {
        const originalValue = lang === "en" ? originalEn : originalZh;
        if (isRich) {
          node.innerHTML = originalValue;
        } else {
          node.textContent = originalValue;
        }
        return;
      }

      const nextValue = isRich ? node.innerHTML.trim() : node.textContent.trim();
      if (lang === "en") {
        node.dataset.en = nextValue;
      } else {
        node.dataset.zh = nextValue;
      }

      edits[key] = {
        zh: node.dataset.zh || "",
        en: node.dataset.en || ""
      };
      saveInlineEdits(edits);
      const renderValue = lang === "en" ? node.dataset.en || "" : node.dataset.zh || "";
      if (isRich) {
        node.innerHTML = renderValue;
      } else {
        node.textContent = renderValue;
      }
    };

    const handleBlur = () => {
      finishEdit(true);
      node.removeEventListener("blur", handleBlur);
      node.removeEventListener("keydown", handleKeyDown);
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        node.blur();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        finishEdit(false);
        node.removeEventListener("blur", handleBlur);
        node.removeEventListener("keydown", handleKeyDown);
      }
    };

    node.addEventListener("blur", handleBlur);
    node.addEventListener("keydown", handleKeyDown);
  });
}

function ensureInlineEditorToolbar(edits) {
  let toolbar = document.querySelector(".inline-editor-toolbar");
  if (toolbar) {
    return toolbar;
  }

  toolbar = document.createElement("div");
  toolbar.className = "inline-editor-toolbar";
  toolbar.innerHTML = `
    <div class="inline-editor-toolbar-title">Local Edit Mode</div>
    <div class="inline-editor-toolbar-actions">
      <button type="button" data-inline-export="true">Export JSON</button>
      <button type="button" data-inline-clear="true">Clear Saved</button>
    </div>
    <div class="inline-editor-toolbar-note">Double-click any highlighted text to edit.</div>
  `;

  toolbar.querySelector("[data-inline-export='true']")?.addEventListener("click", () => {
    const exportPayload = {};
    document.querySelectorAll("[data-zh][data-en]").forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }
      const key = computeEditableKey(node);
      if (edits[key]) {
        exportPayload[key] = edits[key];
      }
    });
    downloadInlineEdits(exportPayload);
  });

  toolbar.querySelector("[data-inline-clear='true']")?.addEventListener("click", () => {
    window.localStorage.removeItem("dx-inline-edits");
    window.location.reload();
  });

  document.body.appendChild(toolbar);
  return toolbar;
}

function refreshInlineEditor() {
  if (!canUseInlineEditor()) {
    return;
  }

  const edits = loadInlineEdits();
  document.body.classList.add("is-inline-editor-enabled");
  ensureInlineEditorToolbar(edits);

  document.querySelectorAll("[data-zh][data-en]").forEach((node) => {
    if (!(node instanceof HTMLElement)) {
      return;
    }
    applyStoredEditsToNode(node, edits);
    bindEditableNode(node, edits);
  });
}

function setupInlineEditor() {
  if (!canUseInlineEditor()) {
    return;
  }

  refreshInlineEditor();
  window.__dxInlineEditorRefresh = refreshInlineEditor;
}
