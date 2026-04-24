(function () {
  var layout = document.querySelector(".article-layout-with-navigator");
  var desktopNavigator = document.querySelector("[data-content-navigator]");
  var toggle = document.querySelector("[data-content-navigator-toggle]");
  var navigatorBody = document.querySelector("[data-content-navigator-body]");
  var desktopLinks = desktopNavigator ? Array.prototype.slice.call(desktopNavigator.querySelectorAll("a[href^='#']")) : [];
  var mobileLinks = Array.prototype.slice.call(document.querySelectorAll("[data-content-navigator-mobile] a[href^='#']"));

  if (!desktopLinks.length) {
    return;
  }

  function getTargetId(link) {
    var href = link.getAttribute("href");

    if (!href || href.charAt(0) !== "#") {
      return "";
    }

    try {
      return decodeURIComponent(href.slice(1));
    } catch (error) {
      return href.slice(1);
    }
  }

  var seen = {};
  var headings = desktopLinks.reduce(function (items, link) {
    var id = getTargetId(link);
    var heading = id && !seen[id] ? document.getElementById(id) : null;

    if (heading) {
      seen[id] = true;
      items.push(heading);
    }

    return items;
  }, []);

  if (!headings.length) {
    return;
  }

  var pending = false;
  var activeHeadingId = headings[0].id;

  function applyNavigatorState(collapsed) {
    var label = collapsed ? "Show contents" : "Hide contents";

    if (!layout || !toggle) {
      return;
    }

    layout.classList.toggle("is-navigator-collapsed", collapsed);
    toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    toggle.setAttribute("aria-label", label);
    toggle.setAttribute("title", label);

    if (navigatorBody) {
      navigatorBody.setAttribute("aria-hidden", collapsed ? "true" : "false");
    }
  }

  function getScrollOffset() {
    var header = document.querySelector(".site-header");

    if (!header || getComputedStyle(header).position !== "sticky") {
      return 24;
    }

    return header.offsetHeight + 24;
  }

  function revealActiveDesktopLink(activeLink) {
    var navigatorRect;
    var linkRect;
    var padding = 12;

    if (!desktopNavigator || !activeLink || !desktopNavigator.getClientRects().length) {
      return;
    }

    if (layout && layout.classList.contains("is-navigator-collapsed")) {
      return;
    }

    navigatorRect = desktopNavigator.getBoundingClientRect();
    linkRect = activeLink.getBoundingClientRect();

    if (linkRect.top < navigatorRect.top + padding) {
      desktopNavigator.scrollTop -= navigatorRect.top + padding - linkRect.top;
    } else if (linkRect.bottom > navigatorRect.bottom - padding) {
      desktopNavigator.scrollTop += linkRect.bottom - (navigatorRect.bottom - padding);
    }
  }

  function setActiveHeading(id) {
    var activeLink = null;

    activeHeadingId = id;

    desktopLinks.forEach(function (link) {
      var isActive = getTargetId(link) === id;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
        activeLink = link;
      } else {
        link.removeAttribute("aria-current");
      }
    });

    mobileLinks.forEach(function (link) {
      var isActive = getTargetId(link) === id;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    revealActiveDesktopLink(activeLink);
  }

  function activateHashHeading() {
    var id;

    if (!window.location.hash) {
      return false;
    }

    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch (error) {
      id = window.location.hash.slice(1);
    }

    if (id && document.getElementById(id) && desktopLinks.some(function (link) {
      return getTargetId(link) === id;
    })) {
      setActiveHeading(id);
      return true;
    }

    return false;
  }

  function updateActiveHeading() {
    var offset = getScrollOffset();
    var activeId = headings[0].id;

    pending = false;

    headings.forEach(function (heading) {
      if (heading.getBoundingClientRect().top <= offset) {
        activeId = heading.id;
      }
    });

    setActiveHeading(activeId);
  }

  function scheduleUpdate() {
    if (pending) {
      return;
    }

    pending = true;
    window.requestAnimationFrame(updateActiveHeading);
  }

  desktopLinks.concat(mobileLinks).forEach(function (link) {
    link.addEventListener("click", function () {
      var id = getTargetId(link);
      var mobileNavigator = link.closest("[data-content-navigator-mobile]");

      if (id) {
        setActiveHeading(id);
      }

      if (mobileNavigator) {
        window.setTimeout(function () {
          mobileNavigator.open = false;
        }, 150);
      }

      scheduleUpdate();
    });
  });

  if (toggle && layout) {
    applyNavigatorState(false);

    toggle.addEventListener("click", function () {
      var collapsed = !layout.classList.contains("is-navigator-collapsed");
      applyNavigatorState(collapsed);
      setActiveHeading(activeHeadingId);
      scheduleUpdate();
    });
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", function () {
    window.setTimeout(function () {
      if (!activateHashHeading()) {
        scheduleUpdate();
      }
    }, 0);
  });
  window.addEventListener("load", function () {
    if (!activateHashHeading()) {
      scheduleUpdate();
    }
  });

  if (!activateHashHeading()) {
    updateActiveHeading();
  }
}());
