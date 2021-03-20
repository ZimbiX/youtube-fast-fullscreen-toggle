// ==UserScript==
// @name         YouTube fast fullscreen toggle
// @namespace    http://tampermonkey.net/
// @version      2.3.1
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

    const hideFluff = () => {
        console.log(`[YT-FFT] Hiding fluff`)
        setFluffDisplay('none')
    }
    const showFluff = () => {
        console.log(`[YT-FFT] Showing fluff again`)
        setFluffDisplay('')
    }

    const isInFullscreen = () => !!document.fullscreenElement

    // Opposite since we will be checking this only after it's changed by YouTube
    const checkIfDirectionIsLeavingFullscreen = () => !isInFullscreen()

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
            console.log(`[YT-FFT] Timed out detecting finish of ${directionIsLeavingFullscreen ? 'leaving' : 'entering'} fullscreen transition`)
            showFluff()
        } else if (transitionIsFinished(directionIsLeavingFullscreen)) {
            console.log(`[YT-FFT] Finished ${directionIsLeavingFullscreen ? 'leaving' : 'entering'} fullscreen transition`)
            // Delay a little after entering fullscreen for reliability, since delay before showing the fluff when entering fullscreen is not noticeable
            directionIsLeavingFullscreen ? showFluff() : setTimeout(showFluff, 20)
        } else {
            setTimeout(() => showFluffWhenReady(directionIsLeavingFullscreen, startedAt), 10)
        }
    }

    const fastToggleFullScreen = () => {
        hideFluff()
        // Wait until YouTube's event handler has executed. This is required since the order of event handler execution is not guaranteed, and we need to be able to reliably detect the transition direction
        setTimeout(() => {
            const directionIsLeavingFullscreen = checkIfDirectionIsLeavingFullscreen()
            console.log(`[YT-FFT] Waiting until ${directionIsLeavingFullscreen ? 'leaving' : 'entering'} fullscreen transition has finished`)
            showFluffWhenReady(directionIsLeavingFullscreen, new Date())
        }, 10)
    }

    const isWritingText = (e) => (
        e.path[0].tagName == 'INPUT' ||
        e.path[0].id == 'contenteditable-root'
    )

    const addEventListeners = () => {
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
    }

    addEventListeners()
})();
