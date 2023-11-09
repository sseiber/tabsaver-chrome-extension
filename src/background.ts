import { ISavedTab, ISendMessageResponse } from "./common";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    (async () => {
        const response: ISendMessageResponse = {
            success: true,
            message: `Received ${message.request} request`
        };

        switch (message.request) {
            case "saveAllTabs": {
                const serializedTabData = await saveAllTabs();

                response.message = `Finished collecting all tab information`;
                response.data = serializedTabData;

                console.log(response.message);
                break;
            }

            case "restoreAllTabs":
                await restoreAllTabs(message.data);

                console.log(response.message);
                break;

            case "tabConfiguration":
                console.log(response.message);
                console.log(JSON.stringify(message.data, null, 4));
                break;

            case "tabData":
                console.log(response.message);
                console.log(JSON.stringify(message.data, null, 4));
                break;

            default:
                response.success = false;
                response.message = `Unknown message: ${message.request}`;

                console.log(response.message);
        }

        sendResponse(response);
    })();

    return true;
});

const saveAllTabs = async (): Promise<string> => {
    let serializedTabData = "";

    try {
        const windows = await chrome.windows.getAll({
            populate: true,
            windowTypes: ["normal"]
        });

        let windowCount = 0;
        const savedTabsMap: Map<number, ISavedTab[]> = new Map();

        for (const window of windows) {
            const savedTabs: ISavedTab[] = [];

            const tabs = window.tabs || [];
            for (const tab of tabs) {
                if (tab.url && tab.id) {
                    savedTabs.push({
                        active: tab.active,
                        audible: tab.audible || true,
                        muted: tab.mutedInfo?.muted || false,
                        url: tab.url
                    });
                }
            }

            savedTabsMap.set(windowCount++, savedTabs);
        }

        serializedTabData = JSON.stringify(Array.from(savedTabsMap.entries()));
    }
    catch (ex) {
        console.log(`Error in saveTabs: ${(ex as Error).message}`);
    }

    return serializedTabData;
}

const restoreAllTabs = async (fileData: string): Promise<void> => {
    try {
        const savedTabsMap = new Map<number, ISavedTab[]>(JSON.parse(fileData));
        const foo = 5;

        await chrome.windows.create({
            url: savedTabsMap.get(0)?.map(tab => tab.url) || []
        });
    }
    catch (ex) {
        console.log(`Error in restoreTabs: ${(ex as Error).message}`);
    }
}
