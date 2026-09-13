const DEFAULTS = { enabled: true, blockedKeywords: [], blockedUsers: [], hideLinks: false, hideEmojiSpam: true, hideRepeatedSpam: true, hideVeryShort: false, minLength: 3, hideReplies: false, showPlaceholder: true };
const SPAM_PRESET = { enabled: true, blockedKeywords: ["telegram", "whatsapp me", "contact me", "investment opportunity", "guaranteed profit", "giveaway winner"], blockedUsers: [], hideLinks: true, hideEmojiSpam: true, hideRepeatedSpam: true, hideVeryShort: false, minLength: 3, hideReplies: false, showPlaceholder: true };
const $ = id => document.getElementById(id);
function arrayToLines(value) { return Array.isArray(value) ? value.join("\n") : ""; }
function linesToArray(value) { return String(value || "").split(/\r?\n/).map(item => item.trim()).filter(Boolean); }
async function render() { const s = await chrome.storage.sync.get(DEFAULTS); $("enabled").checked = Boolean(s.enabled); $("blockedKeywords").value = arrayToLines(s.blockedKeywords); $("blockedUsers").value = arrayToLines(s.blockedUsers); $("hideLinks").checked = Boolean(s.hideLinks); $("hideEmojiSpam").checked = Boolean(s.hideEmojiSpam); $("hideRepeatedSpam").checked = Boolean(s.hideRepeatedSpam); $("hideVeryShort").checked = Boolean(s.hideVeryShort); $("minLength").value = String(s.minLength || 3); $("hideReplies").checked = Boolean(s.hideReplies); $("showPlaceholder").checked = Boolean(s.showPlaceholder); }
let saveTimer = null;
function flash(text = "Saved.") { $("status").textContent = text; setTimeout(() => { $("status").textContent = "Settings save automatically."; }, 1000); }
async function saveAll() { const minLength = Math.max(1, Math.min(100, Number($("minLength").value) || 3)); $("minLength").value = String(minLength); await chrome.storage.sync.set({ enabled: $("enabled").checked, blockedKeywords: linesToArray($("blockedKeywords").value), blockedUsers: linesToArray($("blockedUsers").value), hideLinks: $("hideLinks").checked, hideEmojiSpam: $("hideEmojiSpam").checked, hideRepeatedSpam: $("hideRepeatedSpam").checked, hideVeryShort: $("hideVeryShort").checked, minLength, hideReplies: $("hideReplies").checked, showPlaceholder: $("showPlaceholder").checked }); flash(); }
function queueSave() { clearTimeout(saveTimer); saveTimer = setTimeout(() => saveAll().catch(() => {}), 250); }
for (const id of ["enabled", "hideLinks", "hideEmojiSpam", "hideRepeatedSpam", "hideVeryShort", "hideReplies", "showPlaceholder"]) $(id).addEventListener("change", queueSave);
for (const id of ["blockedKeywords", "blockedUsers", "minLength"]) $(id).addEventListener("input", queueSave);
$("spamPreset").addEventListener("click", async () => { await chrome.storage.sync.set(SPAM_PRESET); await render(); flash("Spam preset applied."); });
$("reset").addEventListener("click", async () => { await chrome.storage.sync.set(DEFAULTS); await render(); flash("Default settings restored."); });
render().catch(() => {});
