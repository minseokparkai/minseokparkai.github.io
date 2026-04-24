(function () {
  "use strict";

  var overlay = document.querySelector("[data-search-overlay]");
  var dialog = document.querySelector(".search-dialog");
  var form = document.querySelector("[data-search-form]");
  var input = document.querySelector("[data-search-input]");
  var results = document.querySelector("[data-search-results]");
  var status = document.querySelector("[data-search-status]");
  var openButtons = document.querySelectorAll("[data-search-open]");
  var closeButtons = document.querySelectorAll("[data-search-close]");

  if (!overlay || !dialog || !form || !input || !results || !status) {
    return;
  }

  var posts = [];
  var indexPromise = null;
  var indexFailed = false;
  var isOpen = false;
  var lastActiveElement = null;
  var dateMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function normalize(value) {
    var normalized = value == null ? "" : String(value).toLowerCase();

    if (typeof normalized.normalize === "function") {
      normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    return normalized;
  }

  function arrayToText(value) {
    return Array.isArray(value) ? value.join(" ") : "";
  }

  function preparePost(post) {
    var tags = Array.isArray(post.tags) ? post.tags : [];
    var categories = Array.isArray(post.categories) ? post.categories : [];
    var prepared = {
      title: post.title || "Untitled",
      description: post.description || "",
      date: post.date || "",
      permalink: post.permalink || "#",
      tags: tags,
      categories: categories,
      content: post.content || ""
    };

    prepared.fields = [
      { text: normalize(prepared.title), weight: 24 },
      { text: normalize(arrayToText(tags.concat(categories))), weight: 14 },
      { text: normalize(prepared.description), weight: 9 },
      { text: normalize(prepared.content), weight: 2 }
    ];

    return prepared;
  }

  function clearResults() {
    while (results.firstChild) {
      results.removeChild(results.firstChild);
    }
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function ensureIndex() {
    if (posts.length > 0) {
      return Promise.resolve(posts);
    }

    if (indexPromise) {
      return indexPromise;
    }

    setStatus("Loading posts...");
    indexFailed = false;

    indexPromise = fetch(overlay.getAttribute("data-search-index"), {
      headers: {
        Accept: "application/json"
      }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Search index request failed.");
      }

      return response.json();
    }).then(function (items) {
      posts = Array.isArray(items) ? items.map(preparePost) : [];
      return posts;
    }).catch(function (error) {
      indexPromise = null;
      indexFailed = true;
      posts = [];
      setStatus("Search is unavailable right now.");

      if (window.console && typeof window.console.error === "function") {
        window.console.error(error);
      }

      return posts;
    });

    return indexPromise;
  }

  function getTerms(query) {
    return normalize(query).split(/\s+/).filter(function (term) {
      return term.length > 0;
    });
  }

  function countOccurrences(text, term, firstIndex) {
    var count = 0;
    var index = firstIndex;

    while (index !== -1 && count < 4) {
      count += 1;
      index = text.indexOf(term, index + term.length);
    }

    return count;
  }

  function hasWordPrefix(text, term) {
    var words = text.split(/\s+/);
    var i;

    for (i = 0; i < words.length; i += 1) {
      if (words[i].indexOf(term) === 0) {
        return true;
      }
    }

    return false;
  }

  function fieldScore(text, term, weight) {
    var index = text.indexOf(term);
    var score;

    if (index === -1) {
      return 0;
    }

    score = weight;

    if (index === 0) {
      score += weight * 0.75;
    }

    if (hasWordPrefix(text, term)) {
      score += weight * 0.5;
    }

    score += countOccurrences(text, term, index) * weight * 0.15;

    return score;
  }

  function scorePost(post, terms) {
    var total = 0;
    var i;
    var j;
    var termTotal;

    for (i = 0; i < terms.length; i += 1) {
      termTotal = 0;

      for (j = 0; j < post.fields.length; j += 1) {
        termTotal += fieldScore(post.fields[j].text, terms[i], post.fields[j].weight);
      }

      if (termTotal === 0) {
        return 0;
      }

      total += termTotal;
    }

    return total;
  }

  function searchPosts(query) {
    var terms = getTerms(query);
    var scored = [];
    var i;
    var score;

    if (terms.length === 0) {
      return [];
    }

    for (i = 0; i < posts.length; i += 1) {
      score = scorePost(posts[i], terms);

      if (score > 0) {
        scored.push({
          post: posts[i],
          score: score
        });
      }
    }

    scored.sort(function (a, b) {
      if (b.score === a.score) {
        return a.post.title.localeCompare(b.post.title);
      }

      return b.score - a.score;
    });

    return scored.slice(0, 10).map(function (item) {
      return item.post;
    });
  }

  function formatDate(date) {
    var parts = String(date || "").split("-");
    var month;

    if (parts.length !== 3) {
      return date || "";
    }

    month = dateMonths[Number(parts[1]) - 1];

    if (!month) {
      return date;
    }

    return month + " " + Number(parts[2]) + ", " + parts[0];
  }

  function appendMeta(meta, text) {
    var item;

    if (!text) {
      return;
    }

    item = document.createElement("span");
    item.textContent = text;
    meta.appendChild(item);
  }

  function createResult(post) {
    var item = document.createElement("li");
    var link = document.createElement("a");
    var title = document.createElement("span");
    var meta = document.createElement("span");
    var description = document.createElement("p");
    var topics = post.tags.concat(post.categories).slice(0, 3).join(", ");

    link.className = "search-result-link";
    link.href = post.permalink;

    title.className = "search-result-title";
    title.textContent = post.title;
    link.appendChild(title);

    meta.className = "search-result-meta";
    appendMeta(meta, formatDate(post.date));
    appendMeta(meta, topics);
    link.appendChild(meta);

    description.className = "search-result-description";
    description.textContent = post.description || post.content.substring(0, 140);
    link.appendChild(description);

    item.appendChild(link);

    return item;
  }

  function createEmptyResult(query) {
    var item = document.createElement("li");

    item.className = "search-empty";
    item.textContent = "No posts found for \"" + query + "\".";

    return item;
  }

  function renderResults(query) {
    var trimmedQuery = query.trim();
    var matches;
    var i;

    clearResults();

    if (indexFailed) {
      setStatus("Search is unavailable right now.");
      return;
    }

    if (!trimmedQuery) {
      setStatus("Type to search posts.");
      return;
    }

    matches = searchPosts(trimmedQuery);

    if (matches.length === 0) {
      setStatus("No results.");
      results.appendChild(createEmptyResult(trimmedQuery));
      return;
    }

    setStatus(matches.length + (matches.length === 1 ? " result" : " results") + " for \"" + trimmedQuery + "\".");

    for (i = 0; i < matches.length; i += 1) {
      results.appendChild(createResult(matches[i]));
    }
  }

  function isTypingTarget(element) {
    var tagName = element && element.tagName ? element.tagName.toLowerCase() : "";

    return element && (element.isContentEditable || tagName === "input" || tagName === "textarea" || tagName === "select");
  }

  function getFocusableElements() {
    return dialog.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])");
  }

  function trapFocus(event) {
    var focusable = getFocusableElements();
    var first;
    var last;

    if (focusable.length === 0) {
      return;
    }

    first = focusable[0];
    last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openSearch(event) {
    if (event) {
      event.preventDefault();
    }

    if (isOpen) {
      input.focus();
      return;
    }

    lastActiveElement = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("search-open");
    isOpen = true;

    window.setTimeout(function () {
      input.focus();
    }, 0);

    ensureIndex().then(function () {
      if (isOpen) {
        renderResults(input.value);
      }
    });
  }

  function closeSearch() {
    if (!isOpen) {
      return;
    }

    overlay.hidden = true;
    document.body.classList.remove("search-open");
    input.value = "";
    clearResults();
    setStatus("Type to search posts.");
    isOpen = false;

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
  }

  openButtons.forEach(function (button) {
    button.addEventListener("click", openSearch);
  });

  closeButtons.forEach(function (button) {
    button.addEventListener("click", closeSearch);
  });

  overlay.addEventListener("mousedown", function (event) {
    if (event.target === overlay) {
      closeSearch();
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  input.addEventListener("input", function () {
    ensureIndex().then(function () {
      if (isOpen) {
        renderResults(input.value);
      }
    });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen) {
      closeSearch();
      return;
    }

    if (event.key === "Tab" && isOpen) {
      trapFocus(event);
      return;
    }

    if (event.key === "/" && !isOpen && !isTypingTarget(event.target)) {
      openSearch(event);
    }
  });
}());
