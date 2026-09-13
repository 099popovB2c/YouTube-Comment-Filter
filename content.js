(() => {
  if (window.__ytCommentFilterLoaded) return;
  window.__ytCommentFilterLoaded = true;

  const DEFAULTS = {
    enabled: true,
    blockedKeywords: [],
    blockedUsers: [],
    hideLinks: false,
    hideEmojiSpam: true,
    hideRepeatedSpam: true,
    hideVeryShort: false,
    minLength: 3,
    hideReplies: false,
    showPlaceholder: true
  };

  let settings = { ...DEFAULTS };
  let mutationTimer = null;
  let filteredCount = 0;

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function list(value) {
    return Array.isArray(value)
      ? value.map(normalize).filter(Boolean)
      : [];
  }

  function commentText(thread) {
    const node =
      thread.querySelector("#content-text") ||
      thread.querySelector("yt-attributed-string#content-text") ||
      thread.querySelector('[id="content-text"]');

    return (node?.innerText || node?.textContent || "").trim();
  }

  function authorText(thread) {
    const node =
      thread.querySelector("#author-text") ||
      thread.querySelector("#author-text span") ||
      thread.querySelector("ytd-comment-view-model #author-text");

    return (node?.innerText || node?.textContent || "").trim();
  }

  function containsUrl(text) {
    return /(?:https?:\/\/|www\.|[\w-]+\.(?:com|net|org|io|co|me|gg|ly|tv)\b)/i.test(text);
  }

  function emojiRatio(text) {
    const chars = [...String(text || "")];
    if (!chars.length) return 0;

    let emoji = 0;

    for (const ch of chars) {
      if (/\p{Extended_Pictographic}/u.test(ch)) emoji += 1;
    }

    return emoji / chars.length;
  }

  function repeatedSpam(text) {
    const compact = String(text || "").replace(/\s+/g, "");
    if (!compact) return false;

    if (/(.)\1{5,}/u.test(compact)) return true;
    if (/^(.{1,4})\1{3,}$/iu.test(compact)) return true;

    return false;
  }

  function isReply(thread) {
    return Boolean(
      thread.closest("ytd-comment-replies-renderer") ||
      thread.closest("#replies") ||
      thread.matches("ytd-comment-view-model[is-reply]")
    );
  }

  function reasonFor(thread) {
    const text = commentText(thread);
    const author = authorText(thread);
    const normalizedText = normalize(text);
    const normalizedAuthor = normalize(author);

    if (!text && !author) return null;

    if (settings.hideReplies && isReply(thread)) return "Reply hidden";

    const keywords = list(settings.blockedKeywords);
    if (keywords.some(keyword => normalizedText.includes(keyword))) return "Blocked keyword";

    const users = list(settings.blockedUsers);
    if (users.some(user => normalizedAuthor === user || normalizedAuthor.includes(user))) return "Blocked user";

    if (settings.hideLinks && containsUrl(text)) return "Link detected";

    if (settings.hideEmojiSpam) {
      const ratio = emojiRatio(text);
      const emojiCount = [...text].filter(ch => /\p{Extended_Pictographic}/u.test(ch)).length;
      if (emojiCount >= 5 && ratio >= 0.35) return "Emoji spam";
    }

    if (settings.hideRepeatedSpam && repeatedSpam(text)) return "Repeated spam";

    if (settings.hideVeryShort && normalizedText.length > 0 && normalizedText.length < Math.max(1, Number(settings.minLength || 3))) {
      return "Very short comment";
    }

    return null;
  }

  function getCommentNodes() {
    return [...document.querySelectorAll("ytd-comment-thread-renderer, ytd-comment-view-model")];
  }

  function restore(thread) {
    if (!thread.dataset.ytcfFiltered) return;
    thread.classList.remove("ytcf-hidden-comment");
    thread.removeAttribute("data-ytcf-filtered");
    thread.querySelector(":scope > .ytcf-placeholder")?.remove();
  }

  function filterThread(thread) {
    restore(thread);
    if (!settings.enabled) return false;

    const reason = reasonFor(thread);
    if (!reason) return false;

    thread.dataset.ytcfFiltered = reason;
    thread.classList.add("ytcf-hidden-comment");

    if (settings.showPlaceholder) {
      const placeholder = document.createElement("button");
      placeholder.type = "button";
      placeholder.className = "ytcf-placeholder";
      placeholder.textContent = `Comment hidden — ${reason}. Click to show.`;
      placeholder.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        thread.classList.remove("ytcf-hidden-comment");
        placeholder.remove();
      });
      thread.prepend(placeholder);
    }

    return true;
  }

  function updateBadge() {
    let badge = document.getElementById("ytcf-counter");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "ytcf-counter";
      document.documentElement.appendChild(badge);
    }
    badge.textContent = settings.enabled ? `Comments hidden: ${filteredCount}` : "Comment Filter: Off";
  }

  function applyFilters() {
    filteredCount = 0;
    for (const thread of getCommentNodes()) {
      if (filterThread(thread)) filteredCount += 1;
    }
    updateBadge();
  }

  async function loadSettings() {
    const stored = await chrome.storage.sync.get(DEFAULTS);
    settings = { ...DEFAULTS, ...stored };
    applyFilters();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync") return;
    for (const [key, change] of Object.entries(changes)) settings[key] = change.newValue;
    applyFilters();
  });

  const observer = new MutationObserver(() => {
    clearTimeout(mutationTimer);
    mutationTimer = setTimeout(applyFilters, 150);
  });

  observer.observe(document.documentElement, { subtree: true, childList: true });

  window.addEventListener("yt-navigate-finish", () => {
    setTimeout(applyFilters, 300);
    setTimeout(applyFilters, 1000);
  });

  loadSettings().catch(() => {});
})();
