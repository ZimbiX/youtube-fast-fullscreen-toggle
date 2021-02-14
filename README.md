# YouTube Fast Fullscreen Toggle

Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning

If your computer isn't brand new, there's anoying lag period when entering/exiting fullscreen on a YouTube video. On my machine, it's normally ~2 seconds; but with a large playlist expanded, it gets up to ~3 seconds. This extension reduces the transition time to under a second.

Techical detail:

This bug's been present for years now, and I got so sick of it that I spent one night experimenting to find a way to avoid it - and I found one! The extra HTML content on the page (playlist, recommendations, comments, description, likes, etc.) is pretty heavy, and when you toggle fullscreen, YouTube moves it around, which ends up incuring a fair bit of processing. I've worked out that it's significantly faster to hide that extra content before transitioning, then display it again afterwards once it's reached its new position.

Before:

![before](demo/before.gif)

After:

![after](demo/after.gif)
