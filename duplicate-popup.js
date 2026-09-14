(() => {
  const input = document.getElementById("hideDuplicateComments");
  if (!input) return;
  chrome.storage.sync.get({ hideDuplicateComments: true }).then(settings => {
    input.checked = Boolean(settings.hideDuplicateComments);
  }).catch(() => {});
  input.addEventListener("change", () => {
    chrome.storage.sync.set({ hideDuplicateComments: input.checked }).catch(() => {});
  });
})();
