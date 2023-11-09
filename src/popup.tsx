import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, Divider, Form, Message, Segment } from 'semantic-ui-react';
import { saveAs } from 'file-saver';
import { ISendMessageRequest, ISendMessageResponse } from "./common";

const Popup = () => {
    const [currentTabId, setCurrentTabId] = useState(0);
    const [currentURL, setCurrentURL] = useState("");
    const [savedTabsFilename, setSavedTabsFilename] = useState("");

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            setCurrentTabId(tabs[0].id || 0);
            setCurrentURL(tabs[0].url || "");
        });
    }, []);

    const saveAllTabs = async () => {
        try {
            const response = await chrome.runtime.sendMessage<ISendMessageRequest, ISendMessageResponse>({
                request: "saveAllTabs"
            });

            const file = new File([(response as any).data], `${savedTabsFilename}.json`, { type: "application/json;charset=utf-8" });
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

            const fileData = await new Promise<string>((resolve) => {
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

    const handleSavedTabsFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSavedTabsFilename(event.target.value);
    }

    return (
        <Segment>
            <Message>
                <Message.Header>Tab Saver</Message.Header>
                <p>
                    Select the option below to restore or save all tabs in all open windows.
                </p>
            </Message>

            <Form>
                <Form.Field>
                    <label>Saved tabs filename</label>
                    <input placeholder='browser-tabs' value={savedTabsFilename} onChange={handleSavedTabsFilenameChange} />
                </Form.Field>
            </Form>
            <Divider hidden />
            <input type="file" accept="application/json" id="fileInput" hidden onChange={restoreTabs} />
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
