(() => {
  if (window.__ytcfDuplicateFilterLoaded) return;
  window.__ytcfDuplicateFilterLoaded = true;

  let enabled = true;
  let timer = null;

  function normalize(value) {
    return String(value || "")
      .normalize("NFKC")
      .toLocaleLowerCase()
      .replace(/https?:\/\/\S+/g, "<url>")
      .replace(/\s+/g, " ")
      .trim();
  }

  function apply() {
    const comments = [...document.querySelectorAll("ytd-comment-thread-renderer, ytd-comment-view-model")];
    const seen = new Set();

    for (const comment of comments) {
      comment.classList.remove("ytcf-duplicate-hidden");
      if (!enabled) continue;

      const textNode = comment.querySelector("#content-text, yt-attributed-string#content-text");
      const text = normalize(textNode?.innerText || textNode?.textContent || "");
      if (text.length < 12) continue;

      if (seen.has(text)) {
        comment.classList.add("ytcf-duplicate-hidden");
      } else {
        seen.add(text);
      }
    }
  }

  async function load() {
    const settings = await chrome.storage.sync.get({ hideDuplicateComments: true });
    enabled = Boolean(settings.hideDuplicateComments);
    apply();
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "sync" || !changes.hideDuplicateComments) return;
    enabled = Boolean(changes.hideDuplicateComments.newValue);
    apply();
  });

  new MutationObserver(() => {
    clearTimeout(timer);
    timer = setTimeout(apply, 180);
  }).observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("yt-navigate-finish", () => setTimeout(apply, 400));
  load().catch(() => {});
})();
