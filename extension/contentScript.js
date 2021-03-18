// ==UserScript==
// @name         YouTube fast fullscreen toggle
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning
// @author       Brendan Weibrecht
// @match        https://www.youtube.com/watch*
// @downloadURL  https://raw.githubusercontent.com/ZimbiX/youtube-fast-fullscreen-toggle/master/extension/contentScript.js
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

    const checkIfDirectionIsLeavingFullscreen = () => document.querySelector('ytd-watch-flexy').fullscreen

    const isFinishedLeavingFullscreen = () => {
        const video = document.querySelector('ytd-player')
        return Math.abs(video.clientWidth - window.innerWidth) > 1 &&
               video.clientHeight != window.innerHeight
    }
    const isFinishedEnteringFullscreen = () => {
        const video = document.querySelector('ytd-player')
        return Math.abs(video.clientWidth - window.innerWidth) <= 1 &&
               video.clientHeight == window.innerHeight
    }

    const transitionIsFinished = (directionIsLeavingFullscreen) => (
        directionIsLeavingFullscreen && isFinishedLeavingFullscreen() ||
        !directionIsLeavingFullscreen && isFinishedEnteringFullscreen()
    )

    const timedOut = (startedAt) => new Date() - startedAt >= 2000

    const showFluffWhenReady = (directionIsLeavingFullscreen, startedAt) => {
        if (timedOut(startedAt)) {
            console.log(`[YT-FFT] Timed out detecting finish of ${directionIsLeavingFullscreen ? 'leaving' : 'entering'} fullscreen transition; showing fluff again`)
            showFluff()
        } else if (transitionIsFinished(directionIsLeavingFullscreen)) {
            console.log(`[YT-FFT] Finished ${directionIsLeavingFullscreen ? 'leaving' : 'entering'} fullscreen transition; showing fluff again`)
            showFluff()
        } else {
            setTimeout(() => showFluffWhenReady(directionIsLeavingFullscreen, startedAt), 10)
        }
    }

    const fastToggleFullScreen = () => {
        hideFluff()
        const directionIsLeavingFullscreen = checkIfDirectionIsLeavingFullscreen()
        console.log(`[YT-FFT] ${directionIsLeavingFullscreen ? 'Leaving' : 'Entering'} fullscreen; fluff has been hidden`)
        showFluffWhenReady(directionIsLeavingFullscreen, new Date())
    }

    const isWritingText = (e) => (
        e.path[0].tagName == 'INPUT' ||
        e.path[0].id == 'contenteditable-root'
    )

    document.querySelector('.ytp-fullscreen-button').addEventListener("click", e => {
        fastToggleFullScreen()
    })

    document.querySelector('#player').addEventListener('dblclick', e => {
        fastToggleFullScreen()
    })

    document.addEventListener("keydown", e => {
        if (e.code == 'KeyF' && !isWritingText(e)) {
            console.log(e)
            fastToggleFullScreen()
        }
    })
})();
