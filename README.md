# YouTube Comment Filter

A privacy-first Chrome extension that hides unwanted YouTube comments locally.

It does **not** delete, report, dislike or modify comments on YouTube. Filtering only changes what is displayed in your own browser.

## Features

- Block comments containing custom keywords or phrases.
- Block comments from selected usernames/channels.
- Optionally hide comments containing links.
- Hide emoji-heavy spam.
- Hide repeated-character and repeated-group spam.
- Optionally hide very short comments.
- Optionally hide all replies.
- Show a placeholder for filtered comments so you can reveal them manually.
- Small local counter showing how many comments were filtered on the current page.
- One-click spam preset.
- No account required.
- No external API.
- No backend.

## Privacy

All settings are stored with Chrome extension sync storage.

The extension does not send:

- comment text;
- usernames;
- video titles;
- watch history;
- cookies;
- passwords;
- authentication tokens

to any external service.

## How filtering works

The extension observes YouTube's dynamically loaded comment elements and applies local display rules.

A comment can be hidden because of:

- blocked keyword;
- blocked user;
- detected URL/domain;
- emoji-heavy content;
- long repeated characters/groups;
- optional minimum-length rule;
- optional reply hiding.

## Install

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this extension folder.
6. Open a YouTube video.
7. Configure filters from the extension popup.

## Notes

YouTube changes its page structure over time. DOM selectors may require maintenance in future versions.

Spam detection is heuristic. A legitimate comment can occasionally match a rule, which is why the optional placeholder allows individual comments to be revealed.

## Disclaimer

This project is not affiliated with, endorsed by, or sponsored by YouTube or Google.
