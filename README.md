# Keka Chrome Extension

A minimal Chrome extension with content script injection.

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in the top right)
3. Click "Load unpacked"
4. Select this directory (`keka-chrome-extension`)

## Files

- `manifest.json` - Extension configuration file
- `content.js` - Content script that runs on all webpages

## Development

After making changes to the extension:

1. Go to `chrome://extensions/`
2. Click the refresh icon on the extension card
3. Reload the webpage where you want to test

## Notes

- The content script runs on all URLs (`<all_urls>`)
- The script executes when the DOM is ready (`document_end`)
- Check the browser console to see the extension logs
