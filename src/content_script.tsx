import { ISendMessageResponse } from "./tabSaverTypes";

chrome.runtime.onMessage.addListener(async (message, _sender, sendResponse) => {
    const response: ISendMessageResponse = {
        success: true,
        message: ""
    };

    switch (message.request) {
        case "tabConfiguration":
            response.message = `Received tab configuration`;

            console.log(response.message);
            console.log(JSON.stringify(message.data, null, 4));
            break;

        case "tabData":
            response.message = `Received tab data`;

            console.log(response.message);
            console.log(JSON.stringify(message.tab, null, 4));
            break;

        default:
            response.success = false;
            response.message = `Unknown message: ${message.request}`;
    }

    sendResponse(response);
});
