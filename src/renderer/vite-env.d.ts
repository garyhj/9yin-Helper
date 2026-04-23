/// <reference types="vite/client" />

import type { IpcApi, JiuYinApi, SettingsApi, UtilApi } from '../shared/preload-api.ts';

export {};

type IpcRendererListener = (event: unknown, ...args: unknown[]) => void;

interface ExposedIpcRenderer {
    on(channel: string, listener: IpcRendererListener): unknown;
    off(channel: string, listener: IpcRendererListener): unknown;
    send(channel: string, ...args: unknown[]): void;
    invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T>;
}

declare global {
    interface Window {
        ipcRenderer: ExposedIpcRenderer;
        ipc: IpcApi;
        util: UtilApi;
        settings: SettingsApi;
        jiuyin: JiuYinApi;
    }
}
