import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from 'semantic-ui-react';

const Popup = () => {
    const [count, setCount] = useState(0);
    const [currentTabId, setCurrentTabId] = useState(0);
    const [currentURL, setCurrentURL] = useState("");
    const [fileData, setFileData] = useState("");

    useEffect(() => {
        chrome.action.setBadgeText({ text: count.toString() });
    }, [count]);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentTabId(tabs[0].id || 0);
            setCurrentURL(tabs[0].url || "");
        });
    }, []);

    useEffect(() => {
        if (currentTabId) {
            chrome.tabs.sendMessage(
                currentTabId,
                {
                    message: "fileData",
                    data: {
                        field1: "value1",
                        field2: "value2",
                        text: fileData
                    },
                },
                sendMessageResponse
            );
        }
    }, [fileData])

    const sendMessageResponse = (msg: any) => {
        console.log("result message:", msg);
    }

    const queryTabResponse = (tabs: any) => {
        const tab = tabs[0];
        if (tab.id) {
            chrome.tabs.sendMessage(
                tab.id,
                {
                    color: "#777777",
                },
                sendMessageResponse
            );
        }
    }

    const changeBackground = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, queryTabResponse);
    };

    // const restoreTabData = async () => {
    //     try {
    //         const fileHandles = await chrome.windows.showOpenFilePicker({
    //             startIn: "downloads",
    //             description: "Text files",
    //             accept: {
    //                 "text/plain": [".txt"]
    //             }
    //         });
    //         const fileHandle = fileHandles[0];
    //         const filename = fileHandle.name;
    //         const fd = await fileHandle.getFile();
    //         const fileContent = await fd.text();
    //     }
    //     catch (ex) {
    //         console.log(ex);
    //     }
    // }

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
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            chrome.tabs.sendMessage(
                tabs[0].id!,
                {
                    message: "copyText",
                },
                sendMessageResponse
            );

            const browserWindows = await chrome.windows.getAll(
                {
                    populate: true,
                    windowTypes: ["normal"]
                }
            )
        }
        catch (ex) {
            console.log(ex);
        }
    }

    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    // const testAction = async () => {
    //     const el = document.createElement('textarea');
    //     el.value = "data from extension";
    //     el.setAttribute('readonly', '');
    //     el.style.position = 'absolute';
    //     el.style.left = '-9999px';
    //     document.body.appendChild(el);
    //     el.select();
    //     document.execCommand('copy');
    //     document.body.removeChild(el);
    // }

    return (
        <>
            <ul style={{ minWidth: "700px" }}>
                <li>Current URL: {currentURL}</li>
                <li>Current Time: {new Date().toLocaleTimeString()}</li>
            </ul>
            <Button size="tiny" color="green" onClick={saveAllTabs}>
                Save All Tabs
            </Button>

            <button
                onClick={() => setCount(count + 1)}
                style={{ marginRight: "5px" }}
            >
                count up
            </button>
            <button onClick={changeBackground}>change background</button>

            <Button size="tiny" color="green" as="label" htmlFor="file" type="button">
                Input Button Test
            </Button>
            <input type="file" accept="text/*" id="file" hidden onChange={handleFileInput} />
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
