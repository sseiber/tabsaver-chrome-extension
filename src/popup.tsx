import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Message, Segment } from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import { ISendMessageRequest, ISendMessageResponse } from "./common";

const Popup = () => {
    const [currentTabId, setCurrentTabId] = useState(0);
    const [currentURL, setCurrentURL] = useState("");

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            setCurrentTabId(tabs[0].id || 0);
            setCurrentURL(tabs[0].url || "");
        });
    }, []);

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
            const response = await chrome.runtime.sendMessage<ISendMessageRequest, ISendMessageResponse>({
                request: "saveAllTabs"
            });

            const file = new File([(response as any).data], "hello world.txt", { type: "text/plain;charset=utf-8" });
            saveAs(file);
        }
        catch (ex) {
            console.log(`Error in saveTabs: ${(ex as Error).message}`);
        }
    }

    const restoreTabs = async (inputElementEvent: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const tabConfigFile = inputElementEvent.target.files![0];
            const reader = new FileReader();

            const fileData = await new Promise<string>((resolve, reject) => {
                reader.addEventListener('load', (readerEvent) => {
                    let data = readerEvent.target?.result;
                    if (data instanceof ArrayBuffer) {
                        data = new TextDecoder("utf-8").decode(data);
                    }

                    return resolve(data as string);
                });

                reader.readAsText(tabConfigFile, 'UTF-8');
            });

            const response = await chrome.runtime.sendMessage<ISendMessageRequest, ISendMessageResponse>({
                request: "restoreAllTabs",
                data: fileData
            });
        }
        catch (ex) {
            console.log(`Error in restoreTabs: ${(ex as Error).message}`);
        }
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
