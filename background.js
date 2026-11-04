chrome.runtime.onInstalled.addListener(async () => {
    const { isEnabled } = await chrome.storage.local.get("isEnabled")
    if (isEnabled === undefined) {
        await chrome.storage.local.set({ isEnabled: false })
    }
})

chrome.commands.onCommand.addListener(async (command) => {
    if (command === "toggle-navigator") {
        const { isEnabled = false } = await chrome.storage.local.get("isEnabled")
        const newState = !isEnabled

        await chrome.storage.local.set({ isEnabled: newState })

        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (activeTab?.id) {
            chrome.tabs.sendMessage(activeTab.id, {
                action: "TOGGLE_NAVIGATOR",
                enabled: newState
            }).catch(() => {
                // Ignore tabs where content script cannot be reached
            })
        }
    }
})
