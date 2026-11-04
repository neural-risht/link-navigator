(() => {
    let isEnabled = false
    let linkMap = new Map()
    let keyBuffer = ""
    let bufferTimeout = null

    const KEY_ALPHABET = "abcdefghijklmnopqrstuvwxyz"

    function generatedKeySequence(index) {
        let key = ""
        let i = index
        while (i >= 0) {
            key = KEY_ALPHABET[i % KEY_ALPHABET.length] + key
            i = Math.floor(i / KEY_ALPHABET.length) - 1
        }
        return key
    }

    function activateNavigator() {
        deactivateNavigator()

        if (!document.body) return

        const links = Array.from(document.querySelectorAll("a[href]")).filter(isElementVisible)

        links.forEach((link, index) => {
            const keySeq = generatedKeySequence(index)
            const badge = document.createElement("span")
            badge.className = "link-navigator-badge"
            badge.textContent = keySeq

            const rect = link.getBoundingClientRect()
            badge.style.top = `${rect.top + window.scrollY}px`
            badge.style.left = `${rect.left + window.scrollX}px`

            document.body.appendChild(badge)

            linkMap.set(keySeq, { href: link.href, element: link, badgeElement: badge })
        })

        window.addEventListener("keydown", handleKeyDown, true)
    }

    function deactivateNavigator() {
        const badges = document.querySelectorAll(".link-navigator-badge")
        badges.forEach((b) => b.remove())

        linkMap.clear()
        keyBuffer = ""

        if (bufferTimeout) {
            clearTimeout(bufferTimeout)
            bufferTimeout = null
        }

        window.removeEventListener("keydown", handleKeyDown, true)
    }

    function openLink(key) {
        if (bufferTimeout) {
            clearTimeout(bufferTimeout)
            bufferTimeout = null
        }

        const item = linkMap.get(key)
        keyBuffer = ""

        if (!item || !item.href) return

        if (item.href.startsWith("javascript:")) {
            item.element?.click()
            return
        }

        window.open(item.href, "_blank", "noopener,noreferrer")
    }

    function isElementVisible(element) {
        if (!element || !(element instanceof Element)) return false

        const style = window.getComputedStyle(element)
        if (style.visibility === "hidden" || style.display === "none") {
            return false
        }

        const rect = element.getBoundingClientRect()
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.bottom > 0 &&
            rect.right > 0 &&
            rect.top < viewportHeight &&
            rect.left < viewportWidth
        )
    }

    function handleKeyDown(event) {
        const activeElem = document.activeElement
        const isInput = Boolean(
            activeElem && (
                ["INPUT", "TEXTAREA", "SELECT"].includes(activeElem.tagName) ||
                activeElem.isContentEditable ||
                activeElem.closest?.("[contenteditable='true']")
            )
        )

        if (isInput) return

        if (event.key === "Escape") {
            keyBuffer = ""
            if (bufferTimeout) {
                clearTimeout(bufferTimeout)
                bufferTimeout = null
            }
            return
        }

        if (event.ctrlKey || event.altKey || event.metaKey || event.key.length > 1 || event.isComposing) {
            return
        }

        const char = event.key.toLowerCase()
        if (!KEY_ALPHABET.includes(char)) {
            keyBuffer = ""
            if (bufferTimeout) {
                clearTimeout(bufferTimeout)
                bufferTimeout = null
            }
            return
        }

        if (bufferTimeout) {
            clearTimeout(bufferTimeout)
            bufferTimeout = null
        }

        event.preventDefault()
        event.stopPropagation()

        keyBuffer += char

        const hasExactMatch = linkMap.has(keyBuffer)
        const hasLongerMatch = Array.from(linkMap.keys()).some((key) =>
            key.length > keyBuffer.length && key.startsWith(keyBuffer)
        )

        if (!hasExactMatch && !hasLongerMatch) {
            keyBuffer = ""
            return
        }

        if (hasExactMatch && !hasLongerMatch) {
            openLink(keyBuffer)
            return
        }

        bufferTimeout = setTimeout(() => {
            if (linkMap.has(keyBuffer)) {
                openLink(keyBuffer)
            } else {
                keyBuffer = ""
            }
            bufferTimeout = null
        }, 1000)
    }

    function setNavigatorState(enabled) {
        if (isEnabled === enabled) return
        isEnabled = enabled
        console.log(`[Link Navigator] Toggle status changed to ${isEnabled}`)

        if (isEnabled) {
            activateNavigator()
        } else {
            deactivateNavigator()
        }
    }

    // Initialize state from storage
    chrome.storage.local.get("isEnabled", ({ isEnabled: savedState = false }) => {
        setNavigatorState(Boolean(savedState))
    })

    // Listen to messages from popup or background script
    chrome.runtime.onMessage.addListener((request) => {
        if (request?.action === "TOGGLE_NAVIGATOR" && typeof request.enabled === "boolean") {
            setNavigatorState(request.enabled)
        }
    })

    // Listen to storage changes to keep tabs in sync
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local" && changes.isEnabled && typeof changes.isEnabled.newValue === "boolean") {
            setNavigatorState(changes.isEnabled.newValue)
        }
    })
})()
