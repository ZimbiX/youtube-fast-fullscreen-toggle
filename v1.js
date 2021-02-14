// ==UserScript==
// @name         YouTube fast fullscreen toggle on X key
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
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

    const isFluffShown = () => document.querySelector(fluff[0]).style.display != 'none'

    const clickFullScreenButton = () => document.querySelector('.ytp-fullscreen-button').click()

    const enterFullScreen = () => {
        hideFluff()
        clickFullScreenButton()
        setTimeout(() => showFluff(), 40)
    }

    const exitFullScreen = () => {
        hideFluff()
        clickFullScreenButton()
        setTimeout(() => showFluff(), 40)
    }

    const isFullScreen = () => document.querySelector('.html5-video-player.ytp-fullscreen')

    const fastToggleFullScreen = () => {
        isFullScreen() ? exitFullScreen() : enterFullScreen()
    }

    document.addEventListener("keydown", e => {
        if (e.code == 'KeyX') {
            fastToggleFullScreen()
        } else if (e.code == 'KeyF') {
            alert('Reminder: Press X instead for speed!')
        }
    })

    /*document.addEventListener('wheel', e => {
        if (e.deltaY > 0 && !isFluffShown()) {
            showFluff()
        }
    })*/
})();
