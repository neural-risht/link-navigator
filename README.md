# Link Navigator

Link Navigator is a Chromium browser extension that lets you open visible webpage links using short keyboard sequences instead of clicking them.

## Features

- Displays a letter label beside each visible link.
- Uses sequences such as `a`, `b`, `c`, and so on.
- Opens the selected link in a new tab.
- Remembers whether the extension is enabled.
- Ignores key presses while typing in an input, textarea, select, or editable element.

## Installation

1. Clone or download this repository.
2. Open Chrome or another Chromium-based browser.
3. Visit `chrome://extensions`.
4. Enable **Developer mode**.
5. Select **Load unpacked**.
6. Choose the repository folder containing `manifest.json`.

## Usage

1. Open a webpage.
2. Click the **Link Navigator** extension icon.
3. Turn the switch on.
4. Letter labels will appear beside links visible in the current viewport.
5. Type the label shown beside a link. The link opens in a new tab.
6. Turn the switch off to remove the labels and disable keyboard navigation.

For pages with many links, labels can contain multiple letters. Type the full sequence within one second, for example `aa` or `ab`.

## Development

The extension is built with plain JavaScript, HTML, and CSS:

- `manifest.json` defines the extension configuration.
- `content/content.js` finds visible links, renders labels, and handles keyboard navigation.
- `content/content.css` styles the link labels.
- `popup/popup.html`, `popup/popup.css`, and `popup/popup.js` provide the enable/disable control.

After changing the extension files, return to `chrome://extensions`, click **Reload** for Link Navigator, and refresh the webpage being tested.

## Limitations

- Only links visible in the viewport when navigation is activated are labeled.
- Browser-protected pages such as the Chrome Web Store and some internal browser pages do not allow content scripts to run.
- Keyboard navigation is disabled while focus is inside a form control or editable area.
