(function () {
  var storageKey = "content-navigator-collapsed";
  var layout = document.querySelector(".article-layout-with-navigator");
  var toggle = document.querySelector("[data-content-navigator-toggle]");
  var navigatorBody = document.querySelector("[data-content-navigator-body]");
  var links = Array.prototype.slice.call(
    document.querySelectorAll("[data-content-navigator] a[href^='#'], [data-content-navigator-mobile] a[href^='#']")
  );

  if (!links.length) {
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
  var headings = links.reduce(function (items, link) {
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

  function getStoredCollapsed() {
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch (error) {
      return false;
    }
  }

  function storeCollapsed(collapsed) {
    try {
      localStorage.setItem(storageKey, collapsed ? "true" : "false");
    } catch (error) {
      return;
    }
  }

  function applyNavigatorState(collapsed, shouldStore) {
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

    if (shouldStore) {
      storeCollapsed(collapsed);
    }
  }

  function getScrollOffset() {
    var header = document.querySelector(".site-header");

    if (!header || getComputedStyle(header).position !== "sticky") {
      return 24;
    }

    return header.offsetHeight + 24;
  }

  function setActiveHeading(id) {
    links.forEach(function (link) {
      var isActive = getTargetId(link) === id;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "true");
      } else {
        link.removeAttribute("aria-current");
      }
    });
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

  links.forEach(function (link) {
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
    applyNavigatorState(getStoredCollapsed(), false);

    toggle.addEventListener("click", function () {
      var collapsed = !layout.classList.contains("is-navigator-collapsed");
      applyNavigatorState(collapsed, true);
      scheduleUpdate();
    });
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  window.addEventListener("load", scheduleUpdate);
  updateActiveHeading();
}());
