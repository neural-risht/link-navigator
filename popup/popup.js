document.addEventListener("DOMContentLoaded", async () => {
    const toggleSwitch = document.getElementById("toggle-switch")
    const statusText = document.getElementById("status-text")

    // Loading the saved state
    const { isEnabled = false } = await chrome.storage.local.get("isEnabled")

    toggleSwitch.checked = isEnabled
    updateStatusText(isEnabled)

    toggleSwitch.addEventListener("change", async () => {
        const enabled = toggleSwitch.checked
        updateStatusText(enabled)

        await chrome.storage.local.set({ isEnabled: enabled })

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (tab?.id) {
            chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_NAVIGATOR", enabled }).catch(() => {
                // Ignore tabs where content script cannot be reached
            })
        }
    })

    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === "local" && changes.isEnabled && typeof changes.isEnabled.newValue === "boolean") {
            toggleSwitch.checked = changes.isEnabled.newValue
            updateStatusText(changes.isEnabled.newValue)
        }
    })

    function updateStatusText(enabled) {
        statusText.textContent = enabled ? "Extension ON" : "Extension OFF"
    }
})
