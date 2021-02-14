// ==UserScript==
// @name         YouTube fast fullscreen toggle
// @namespace    http://tampermonkey.net/
// @version      2
// @description  Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning
// @author       Brendan Weibrecht
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const fluff = ['#secondary', '#info', '#meta', '#comments', '#masthead-container', '#speedyg']

    const setFluffDisplay = (value) => {
        fluff.forEach(sel => { document.querySelector(sel).style.display = value })
    }

    const hideFluff = () => setFluffDisplay('none')
    const showFluff = () => setFluffDisplay('')

    const fastToggleFullScreen = () => {
        hideFluff()
        setTimeout(showFluff, 40)
    }

    document.querySelector('.ytp-fullscreen-button').addEventListener("click", e => {
        fastToggleFullScreen()
    })

    document.addEventListener("keydown", e => {
        if (e.code == 'KeyF') {
            fastToggleFullScreen()
        }
    })
})();
