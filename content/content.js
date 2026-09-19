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
            key = KEY_ALPHABET[i % KEY_ALPHABET] + key
            i = Math.floor(i / KEY_ALPHABET.length) - 1;
        }
        return key
    }


    function activateNavigator() {
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

            linkMap.set(keySeq, { href: link.href, badgeElement: badge })
        })
        window.addEventListener("keydown", handleKeyDown, true)
    }

    function deactivateNavigator() {
        const badges = document.querySelectorAll(".link-navigator-badge")

        badges.forEach((b) => b.remove())

        linkMap.clear()
        keyBuffer = ""

        if (bufferTimeout) clearTimeout(bufferTimeout);
        window.removeEventListener("keydown", handleKeyDown, true)
    }

    function openLink(key) {
        const {href} = linkMap.get(key)
        window.open(href,"_blank", "noopener, noreferrer")
        keyBuffer = ""
    }

    function isElementVisible(element) {
        const rect = element.getBoundingClientRect()

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        )
    }

    function handleKeyDown(event){
        const activeElem = document.activeElement
        const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(activeElem.tagName) || activeElem.isContentEditable

        if(isInput)return;

        if(event.ctrlKey || event.altKey || event.metaKey || event.key.length >1)return;

        const char = event.key.toLowerCase()
        if(!KEY_ALPHABET.includes(char))return;
        event.preventDefault()
        event.stopPropagation()

        keyBuffer += char

        const hasExactMatch = linkMap.has(keyBuffer)
        const hasLongerMatch = Array.from(linkMap.keys()).some((key) =>
            key.length > keyBuffer.length && key.startsWith(keyBuffer)
        )

        if(!hasExactMatch && !hasLongerMatch){
            keyBuffer = ""
            return
        }

        if(hasExactMatch && !hasLongerMatch){
            openLink(keyBuffer)
            return
        }

        if(bufferTimeout)clearTimeout(bufferTimeout)
        bufferTimeout = setTimeout(() =>{
            if(linkMap.has(keyBuffer)){
                openLink(keyBuffer)
            } else {
                keyBuffer = ""
            }
        },1000)
    }

    chrome.runtime.onMessage.addListener((request) =>{
        isEnabled = request.enabled
        if(isEnabled){
            activateNavigator()
        }
        else{
            deactivateNavigator()
        }
    })

    chrome.storage.local.get("isEnabled",({isEnabled: savedState = false}) => {
        isEnabled = savedState;
        if(isEnabled){
            activateNavigator()
        }
    })

})()