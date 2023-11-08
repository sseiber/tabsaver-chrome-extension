chrome.runtime.onMessage.addListener(async function (req, sender, sendResponse) {
    if (req.color) {
        console.log("Receive color = " + req.color);
        document.body.style.backgroundColor = req.color;
        sendResponse("Change color to " + req.color);
    }
    else if (req.message === "copyText") {
        await navigator.clipboard.writeText("data from extension");

        sendResponse("copied text to clipboard");
    }
    else if (req.message === "fileData") {
        sendResponse(`fileData: ${req.data.text}`);
    }
    else {
        sendResponse("Color message is none.");
    }
});
