chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-navigator") {
        const { isEnabled = false } = await chrome.storage.local.get("isEnabled")
        const newState = !isEnabled

        await chrome.storage.local.get({ isEnabled: newState })

        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (activeTab?.id) {
            chrome.tabs.sendMessage(activeTab.id, {
                action: "TOGGLE_NAVIGATOR",
                enabled: newState
            }).catch(() => {
                console.log("Error !!")
            })
        }
    }
})