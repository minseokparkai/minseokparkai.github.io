(function () {
  var comments = document.querySelector("[data-comments]");

  if (!comments) {
    return;
  }

  var widget = comments.querySelector("[data-comments-widget]");

  if (!widget) {
    return;
  }

  var utterancesOrigin = "https://utteranc.es";
  var systemDarkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function getThemeMode() {
    var forcedTheme = document.documentElement.dataset.theme;

    if (forcedTheme === "light" || forcedTheme === "dark") {
      return forcedTheme;
    }

    return systemDarkQuery.matches ? "dark" : "light";
  }

  function getUtterancesTheme() {
    return getThemeMode() === "dark" ? "github-dark" : "github-light";
  }

  function updateUtterancesTheme() {
    var iframe = widget.querySelector("iframe.utterances-frame");

    if (!iframe || !iframe.contentWindow) {
      return;
    }

    iframe.contentWindow.postMessage({
      type: "set-theme",
      theme: getUtterancesTheme()
    }, utterancesOrigin);
  }

  function loadUtterances() {
    if (widget.querySelector("iframe, script")) {
      return;
    }

    widget.textContent = "";

    var script = document.createElement("script");
    var label = comments.dataset.commentsLabel;

    script.src = utterancesOrigin + "/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("repo", comments.dataset.commentsRepo);
    script.setAttribute("issue-term", comments.dataset.commentsIssueTerm || "pathname");
    script.setAttribute("theme", getUtterancesTheme());

    if (label) {
      script.setAttribute("label", label);
    }

    widget.appendChild(script);
  }

  new MutationObserver(updateUtterancesTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  if (systemDarkQuery.addEventListener) {
    systemDarkQuery.addEventListener("change", updateUtterancesTheme);
  } else if (systemDarkQuery.addListener) {
    systemDarkQuery.addListener(updateUtterancesTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadUtterances, { once: true });
  } else {
    loadUtterances();
  }
}());
