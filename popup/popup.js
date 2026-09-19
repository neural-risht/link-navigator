document.addEventListener("DOMContentLoaded", async() => {
    const toggleSwitch = document.getElementById("toggle-switch")
    const statusText = document.getElementById("status-text")

    // Loading the saved state

    const{ isEnabled = false} = await chrome.storage.local.get("isEnabled")

    toggleSwitch.checked = isEnabled
    updatedStatusText(isEnabled)

    toggleSwitch.addEventListener("change", async ()=>{
        const enabled = toggleSwitch.checked
        updatedStatusText(enabled)


        await chrome.storage.local.set({isEnabled:enabled})

        const [tab] = await chrome.tabs.query({active:true, currentWindow:true})

        if(tab?.id){
            chrome.tabs.sendMessage(tab.id, {action:"TOGGLE_NAVIAGTOR", enabled})
        }
    })

    function updatedStatusText(enabled){
        statusText.textContent = enabled? "Extension ON" : "EXTENSION OFF"
    }


})
