// ==UserScript==
// @name         YouTube fast fullscreen toggle
// @namespace    http://tampermonkey.net/
// @version      2.10.0
// @description  Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning
// @author       Brendan Weibrecht
// @match        https://www.youtube.com/*
// @noframes
// @icon         https://raw.githubusercontent.com/ZimbiX/youtube-fast-fullscreen-toggle/master/extension/icon-128.png
// @downloadURL  https://raw.githubusercontent.com/ZimbiX/youtube-fast-fullscreen-toggle/master/extension/contentScript.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const isWatchVideoPage = () => window.location.pathname == "/watch"

    const fluff = [
        // Header
        '#masthead-container',

        // Right column contents
        '#secondary-inner',
        '#fixed-secondary',

        // Below video
        '#below',
        '#speedyg',
    ]

    const setFluffDisplay = (value) => {
        fluff.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                el.style.display = value
            })
        })
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

    const playerWidthDiff = (player) => Math.abs(player.clientWidth - window.innerWidth)
    const playerHeightDiff = (player) => Math.abs(player.clientHeight - window.innerHeight)

    const playerIsFullWidth = (player) => playerWidthDiff(player) <= 2
    const playerIsFullHeight = (player) => playerHeightDiff(player) <= 2

    const debugPlayerSize = (player) => {
        console.log('[YT-FFT] w:', player.clientHeight, window.innerHeight, 'h:', player.clientWidth, window.innerWidth)
    }

    const playerIsFullscreen = () => {
        const player = document.querySelector('ytd-player')
        debugPlayerSize(player)
        return playerIsFullHeight(player) && playerIsFullWidth(player)
    }

    const isFinishedLeavingFullscreen = () => !playerIsFullscreen()
    const isFinishedEnteringFullscreen = () => playerIsFullscreen()

    const transitionIsFinished = (directionIsLeavingFullscreen) => (
        directionIsLeavingFullscreen ? isFinishedLeavingFullscreen() : isFinishedEnteringFullscreen()
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

    const isWritingText = (e) => {
        const path = e.composedPath()
        return (
            path[0].tagName == 'INPUT' ||
            path[0].id == 'contenteditable-root'
        )
    }

    const delegateEvent = (eventName, elementSelector, handler) => {
        document.addEventListener(eventName, (e) => {
            // loop parent nodes from the target to the delegation node
            for (var target = e.target; target && target != this; target = target.parentNode) {
                if (target.matches && target.matches(elementSelector)) {
                    handler(target, e)
                    break
                }
            }
        }, false)
    }

    const addEventListeners = () => {
        delegateEvent('click', '.ytp-fullscreen-button', e => {
            if (isWatchVideoPage()) {
                fastToggleFullScreen()
            }
        })

        delegateEvent('dblclick', 'video', e => {
            if (isWatchVideoPage()) {
                fastToggleFullScreen()
            }
        })

        document.addEventListener("keydown", e => {
            if (isWatchVideoPage() && !e.ctrlKey && e.code == 'KeyF' && !isWritingText(e)) {
                console.log(e)
                fastToggleFullScreen()
            }
        })
    }

    addEventListeners()

    console.log(`[YT-FFT] Initialised`)
})();
