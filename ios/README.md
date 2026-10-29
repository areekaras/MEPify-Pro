# MEPify for iOS

The iPhone/iPad app shows the same web app as Android and the website, bundled inside the app, so it works fully offline.

## Open and run (needs a Mac with Xcode 16 or newer)
1. Open `ios/MEPify.xcodeproj` in Xcode.
2. Pick an iPhone simulator at the top and press Run (⌘R).
3. To run on your own iPhone: select the MEPify target → Signing & Capabilities → choose your Team.
   If the bundle ID `com.shafaf.mepify` is taken, change it there.

A build step called **Copy web app** copies `index.html`, `css/`, `js/`, `images/` and `manifest.json`
from the repo root into the app, so any change to the web app is picked up on the next build.

## What the native side adds
- `window.SiteCalcNative` (same as Android): share text, save a file (share sheet → Save to Files), print / Save as PDF.
- Swipe in from the left edge = the app's Back.
- Links to email, WhatsApp, LinkedIn and websites open outside the app.
- Saved data (job log, settings, heat-load projects) stays in the web view's storage between launches.

## Automatic build
`.github/workflows/ios.yml` builds the app on GitHub's Macs on every push (unsigned), runs it on an iPhone simulator,
opens every tool, and checks saved data survives closing and reopening the app. The simulator build and screenshots
are in the run's Artifacts.

## Files
- `MEPify/MEPifyApp.swift` – app entry
- `MEPify/WebViewController.swift` – web view, native helpers, swipe-back, links
- `MEPify/SelfTest.swift` – automatic check, only runs with the `-MEPifySelfTest` launch argument
