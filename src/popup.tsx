import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
// import 'semantic-ui-css/semantic.min.css'
import { Button } from 'semantic-ui-react';

const Popup = () => {
    const [count, setCount] = useState(0);
    const [currentURL, setCurrentURL] = useState<string>();

    useEffect(() => {
        chrome.action.setBadgeText({ text: count.toString() });
    }, [count]);

    useEffect(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            setCurrentURL(tabs[0].url);
        });
    }, []);

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

    const saveAllTabs = async() = {
        browserWindows = await chrome.windows.getAll(
            {
                populate: true,
                windowTypes: ["normal"]
            }
        )
    }

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
        </>
    );
};

const root = createRoot(document.getElementById("root")!);

root.render(
    <React.StrictMode>
        <Popup />
    </React.StrictMode>
);
