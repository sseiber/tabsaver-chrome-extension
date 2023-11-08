import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Message, Segment } from 'semantic-ui-react';

const Popup = () => {
    const [currentTabId, setCurrentTabId] = useState(0);
    const [currentURL, setCurrentURL] = useState("");
    const [fileData, setFileData] = useState("");

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            setCurrentTabId(tabs[0].id || 0);
            setCurrentURL(tabs[0].url || "");
        });
    }, []);

    useEffect(() => {
        if (currentTabId) {
            const sendMessage = async () => {
                const response = await sendMessageAsync(currentTabId, {
                    request: "tabConfiguration",
                    data: fileData
                });

                console.log(response.message);
            };

            sendMessage();
        }
    }, [fileData]);

    const sendMessageAsync = async (tabId: number, message: any): Promise<any> => {
        return new Promise((resolve, reject) => {
            try {
                chrome.tabs.sendMessage(
                    tabId,
                    message,
                    (response) => {
                        if (chrome.runtime.lastError) {
                            reject(chrome.runtime.lastError);
                        }
                        else {
                            resolve(response);
                        }
                    }
                );
            }
            catch (ex) {
                return reject(ex)
            }
        });
    }

    // const saveTabData = async () => {
    //     try {
    //         const fileHandle = await window.showSaveFilePicker({
    //             types: [
    //                 {
    //                     description: "Text files",
    //                     accept: {
    //                         "text/plain": [".txt"]
    //                     }
    //                 }
    //             ],
    //             suggestedName: "Untitled.txt"
    //         });
    //         const writableStream = await fileHandle.createWritable();
    //         await writableStream.write("Hello World");
    //         await writableStream.close();

    //         const filename = fileHandle.name;
    //     }
    //     catch (ex) {
    //         console.log(ex);
    //     }
    // }

    const saveAllTabs = async () => {
        try {
            const windows = await chrome.windows.getAll({
                populate: true,
                windowTypes: ["normal"]
            });

            for (const window of windows) {
                const tabs = window.tabs || [];
                for (const tab of tabs) {
                    if (tab.url && tab.id) {
                        const response = await sendMessageAsync(tab.id, {
                            request: "tabData",
                            tab
                        });

                        console.log(response.message);
                    }
                }
            }
        }
        catch (ex) {
            console.log(`Error in saveTabs: ${(ex as Error).message}`);
        }
    }

    const restoreTabs = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files![0];
        const reader = new FileReader();
        reader.addEventListener('load', (readerEvent) => {
            let data = readerEvent.target?.result;
            if (data instanceof ArrayBuffer) {
                data = new TextDecoder("utf-8").decode(data);
            }
            setFileData(data || "");
        });
        reader.readAsText(file, 'UTF-8');
    }

    return (
        <Segment>
            <Message>
                <Message.Header>Tab Saver</Message.Header>
                <p>
                    Select the option below to restore or save all tabs in all open windows.
                </p>
            </Message>
            {/*
            <ul style={{ minWidth: "700px" }}>
                <li>Current URL: {currentURL}</li>
                <li>Current Time: {new Date().toLocaleTimeString()}</li>
            </ul>
            */}

            <input type="file" accept="text/*" id="fileInput" hidden onChange={restoreTabs} />
            <Button size="tiny" color="green" as="label" htmlFor="fileInput">
                Restore Tabs
            </Button>
            <Button size="tiny" color="green" onClick={saveAllTabs}>
                Save Tabs
            </Button>
        </Segment>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
