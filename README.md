# YouTube Fast Fullscreen Toggle

Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning

## Install

Options:

- From the [Chrome Web Store](https://chrome.google.com/webstore/detail/dggbkbndbcaknaeobfieifmdcncmpaba) (once it passes review)
- Using [Tampermonkey](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) - [script](extension/contentScript.js)
- Manually:
  + [Download the CRX file](https://github.com/ZimbiX/youtube-fast-fullscreen-toggle/releases/download/v2.2.0/youtube-fast-fullscreen-toggle-v2.2.0.crx)
  + Browse to `chrome://extensions`
  + Enable the Developer mode setting in the top-right
  + Drag in the file

Note that Firefox doesn't seem to have the same issue as Chrome; so in Firefox the improvement is barely noticeable.

## Description

There's an annoying lag period when entering/exiting fullscreen on a YouTube video. On my machine, it's normally ~2 seconds; but with a large playlist expanded, it gets up to ~3 seconds. This extension reduces the transition time to almost nothing.

Technical detail:

This bug's been present for years now, and I got so sick of it that I spent one night experimenting to find a way to avoid it - and I found one! The extra HTML content on the page (playlist, recommendations, comments, description, likes, etc.) is pretty heavy, and when you toggle fullscreen, YouTube moves it around, which ends up incuring a fair bit of processing. I've worked out that it's significantly faster to hide that extra content before transitioning, then display it again afterwards once it's reached its new position.

Before:

![before](demo/before.gif)

After:

![after](demo/after.gif)
