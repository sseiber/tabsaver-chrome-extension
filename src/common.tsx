import "chrome";

export interface ISendMessageRequest {
    request: string;
    data?: any | chrome.tabs.Tab;
}

export interface ISendMessageResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface ISavedTab {
    active: boolean;
    audible: boolean;
    muted: boolean;
    url: string;
}