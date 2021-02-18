// ==UserScript==
// @name         YouTube fast fullscreen toggle
// @namespace    http://tampermonkey.net/
// @version      2.2.0
// @description  Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning
// @author       Brendan Weibrecht
// @match        https://www.youtube.com/watch*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const fluff = ['#secondary-inner', '#info', '#meta', '#comments', '#masthead-container', '#speedyg']

    const setFluffDisplay = (value) => {
        fluff.forEach(sel => { document.querySelector(sel).style.display = value })
    }

    const hideFluff = () => setFluffDisplay('none')
    const showFluff = () => setFluffDisplay('')

    const fastToggleFullScreen = () => {
        hideFluff()
        setTimeout(() => {
            setTimeout(showFluff, 10)
        }, 10)
    }

    const isWritingText = (e) => (
        e.path[0].tagName == 'INPUT' ||
        e.path[0].id == 'contenteditable-root'
    )

    document.querySelector('.ytp-fullscreen-button').addEventListener("click", e => {
        fastToggleFullScreen()
    })

    document.addEventListener("keydown", e => {
        if (e.code == 'KeyF' && !isWritingText(e)) {
            console.log(e)
            fastToggleFullScreen()
        }
    })
})();
