// ==UserScript==
// @name         YouTube fast fullscreen toggle
// @namespace    http://tampermonkey.net/
// @version      2.7.0
// @description  Avoids the ~3 second lag when entering/exiting fullscreen on a YouTube video - by hiding the heavy fluff while transitioning
// @author       Brendan Weibrecht
// @match        https://www.youtube.com/*
// @noframes
// @icon         https://raw.githubusercontent.com/ZimbiX/youtube-fast-fullscreen-toggle/master/extension/icon-128.png
// @downloadURL  https://raw.githubusercontent.com/ZimbiX/youtube-fast-fullscreen-toggle/master/extension/contentScript.js
// @grant        none
// ==/UserScript==

'use strict';

const isWatchVideoPage = () => window.location.pathname === "/watch"

const fluff = ['#secondary-inner', '#info', '#meta', '#comments', '#masthead-container', '#speedyg']

const setFluffDisplay = (value) => {
    fluff.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.style.display = value
        })
    })
}

const hideFluff = () => {
    setFluffDisplay('none')
}
const showFluff = () => {
    setFluffDisplay('')
}

const isInFullscreen = () => Boolean(document.fullscreenElement)

// Opposite since we will be checking this only after it's changed by YouTube
const checkIfDirectionIsLeavingFullscreen = () => !isInFullscreen()

const playerWidthDiff = (player) => Math.abs(player.clientWidth - window.innerWidth)
const playerHeightDiff = (player) => Math.abs(player.clientHeight - window.innerHeight)

const playerIsFullWidth = (player) => playerWidthDiff(player) <= 2
const playerIsFullHeight = (player) => playerHeightDiff(player) <= 2

const playerIsFullscreen = () => {
    const player = document.querySelector('ytd-player')
    return playerIsFullHeight(player) && playerIsFullWidth(player)
}

const transitionIsFinished = (directionIsLeavingFullscreen) => (
    directionIsLeavingFullscreen ? !playerIsFullscreen() : playerIsFullscreen()
)

const timedOut = (startedAt) => new Date() - startedAt >= 2000

const showFluffWhenReady = (directionIsLeavingFullscreen, startedAt) => {
    if (timedOut(startedAt)) {
        showFluff()
    } else if (transitionIsFinished(directionIsLeavingFullscreen)) {
        // Delay a little after entering fullscreen for reliability, since delay before showing the fluff when entering fullscreen is not noticeable
        if (directionIsLeavingFullscreen) {
            showFluff()
        } else {
            setTimeout(showFluff, 20)
        }
    } else {
        setTimeout(() => showFluffWhenReady(directionIsLeavingFullscreen, startedAt), 10)
    }
}

const fastToggleFullScreen = () => {
    hideFluff()
    // Wait until YouTube's event handler has executed. This is required since the order of event handler execution is not guaranteed, and we need to be able to reliably detect the transition direction
    setTimeout(() => {
        const directionIsLeavingFullscreen = checkIfDirectionIsLeavingFullscreen()
        showFluffWhenReady(directionIsLeavingFullscreen, new Date())
    }, 10)
}

const isWritingText = (e) => (
    e.path[0].tagName === 'INPUT' ||
    e.path[0].id === 'contenteditable-root'
)

const delegateEvent = (eventName, elementSelector, handler) => {
    document.addEventListener(eventName, (e) => {
        // loop parent nodes from the target to the delegation node
        for (let target = e.target; target && target !== window; target = target.parentNode) {
            if (target.matches && target.matches(elementSelector)) {
                handler(target, e)
                break
            }
        }
    }, false)
}

const addEventListeners = () => {
    delegateEvent('click', '.ytp-fullscreen-button', () => {
        if (isWatchVideoPage()) {
            fastToggleFullScreen()
        }
    })

    delegateEvent('dblclick', 'video', () => {
        if (isWatchVideoPage()) {
            fastToggleFullScreen()
        }
    })

    document.addEventListener("keydown", e => {
        if (isWatchVideoPage() && e.code === 'KeyF' && !isWritingText(e)) {
            fastToggleFullScreen()
        }
    })
}

addEventListeners()
