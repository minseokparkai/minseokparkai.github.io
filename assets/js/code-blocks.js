(function () {
  "use strict";

  var blocks = document.querySelectorAll("[data-code-block]");

  if (!blocks.length) {
    return;
  }

  var extensionByLanguage = {
    bash: "sh",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    css: "css",
    go: "go",
    html: "html",
    java: "java",
    javascript: "js",
    js: "js",
    json: "json",
    jsx: "jsx",
    kotlin: "kt",
    markdown: "md",
    md: "md",
    php: "php",
    plain: "txt",
    plaintext: "txt",
    powershell: "ps1",
    python: "py",
    rb: "rb",
    rs: "rs",
    ruby: "rb",
    rust: "rs",
    sh: "sh",
    shell: "sh",
    sql: "sql",
    svg: "svg",
    swift: "swift",
    text: "txt",
    toml: "toml",
    ts: "ts",
    tsx: "tsx",
    typescript: "ts",
    xml: "xml",
    yaml: "yaml",
    yml: "yml",
    zsh: "sh"
  };

  function trimFinalLineBreaks(value) {
    return String(value || "").replace(/(?:\r?\n)+$/, "");
  }

  function getSource(block) {
    var source = block.querySelector("[data-code-source]");

    if (!source) {
      return "";
    }

    try {
      return trimFinalLineBreaks(JSON.parse(source.textContent));
    } catch (error) {
      return trimFinalLineBreaks(source.textContent);
    }
  }

  function sanitizeFilenamePart(value, fallback) {
    var cleaned = String(value || "").toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");

    return cleaned || fallback;
  }

  function getExtension(language) {
    return extensionByLanguage[String(language || "").toLowerCase()] || "txt";
  }

  function getFilename(block) {
    var base = sanitizeFilenamePart(block.getAttribute("data-code-filename-base"), "code");
    var index = sanitizeFilenamePart(block.getAttribute("data-code-index"), "1");
    var language = block.getAttribute("data-code-language");

    return base + "-code-" + index + "." + getExtension(language);
  }

  function writeClipboardWithFallback(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      var copied;

      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.inset = "0 auto auto 0";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        copied = document.execCommand("copy");
      } catch (error) {
        document.body.removeChild(textarea);
        reject(error);
        return;
      }

      document.body.removeChild(textarea);

      if (copied) {
        resolve();
      } else {
        reject(new Error("Copy command failed."));
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return writeClipboardWithFallback(text);
  }

  function setTemporaryLabel(button, label) {
    var originalLabel = button.getAttribute("aria-label") || "";
    var originalTitle = button.getAttribute("title") || "";

    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.dataset.codeState = label.toLowerCase();

    window.setTimeout(function () {
      button.setAttribute("aria-label", originalLabel);
      button.setAttribute("title", originalTitle);
      button.removeAttribute("data-code-state");
    }, 1400);
  }

  function downloadSource(block) {
    var source = getSource(block);
    var filename = getFilename(block);
    var blob = new Blob([source], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 0);
  }

  function toggleCollapse(block, button) {
    var isCollapsed = block.classList.toggle("is-collapsed");
    var label = isCollapsed ? "Expand code" : "Collapse code";

    button.setAttribute("aria-expanded", String(!isCollapsed));
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
  }

  blocks.forEach(function (block) {
    var copyButton = block.querySelector("[data-code-copy]");
    var downloadButton = block.querySelector("[data-code-download]");
    var collapseButton = block.querySelector("[data-code-collapse]");

    if (copyButton) {
      copyButton.addEventListener("click", function () {
        copyText(getSource(block)).then(function () {
          setTemporaryLabel(copyButton, "Copied");
        }).catch(function () {
          setTemporaryLabel(copyButton, "Copy failed");
        });
      });
    }

    if (downloadButton) {
      downloadButton.addEventListener("click", function () {
        downloadSource(block);
      });
    }

    if (collapseButton) {
      collapseButton.addEventListener("click", function () {
        toggleCollapse(block, collapseButton);
      });
    }
  });
}());
