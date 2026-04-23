import { contextBridge, ipcRenderer } from 'electron';
import type { IpcRendererEvent } from 'electron';
import { IpcChannel } from './protocol.ts';
import type { IpcApi, SettingsApi, UtilApi } from '../shared/preload-api.ts';

contextBridge.exposeInMainWorld('ipcRenderer', {
    on(...args: Parameters<typeof ipcRenderer.on>) {
        const [channel, listener] = args;
        return ipcRenderer.on(channel, (event, ...listenerArgs) => listener(event, ...listenerArgs));
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...rest] = args;
        return ipcRenderer.off(channel, ...rest);
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...rest] = args;
        return ipcRenderer.send(channel, ...rest);
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...rest] = args;
        return ipcRenderer.invoke(channel, ...rest);
    },
});

const ipcApi: IpcApi = {
    on: (channel: string, callback: (...args: any[]) => void) => {
        const listener = (_event: IpcRendererEvent, ...args: any[]) => {
            callback(...args);
        };

        ipcRenderer.on(channel, listener);

        return () => {
            ipcRenderer.removeListener(channel, listener);
        };
    },
};
contextBridge.exposeInMainWorld('ipc', ipcApi);

const utilApi: UtilApi = {
    getToggleHotkey: (): Promise<string> => ipcRenderer.invoke(IpcChannel.HOTKEY_GET_TOGGLE),
    setToggleHotkey: (accelerator: string): Promise<boolean> => (
        ipcRenderer.invoke(IpcChannel.HOTKEY_SET_TOGGLE, accelerator)
    ),
    getStopAfterGameHotkey: (): Promise<string> => ipcRenderer.invoke(IpcChannel.HOTKEY_GET_STOP_AFTER_GAME),
    setStopAfterGameHotkey: (accelerator: string): Promise<boolean> => (
        ipcRenderer.invoke(IpcChannel.HOTKEY_SET_STOP_AFTER_GAME, accelerator)
    ),
    getAppVersion: (): Promise<string> => ipcRenderer.invoke(IpcChannel.APP_GET_VERSION),
};
contextBridge.exposeInMainWorld('util', utilApi);

const settingsApi: SettingsApi = {
    get: <T = any>(key: string): Promise<T> => ipcRenderer.invoke(IpcChannel.SETTINGS_GET, key),
    set: <T = any>(key: string, value: T): Promise<void> => ipcRenderer.invoke(IpcChannel.SETTINGS_SET, key, value),
};
contextBridge.exposeInMainWorld('settings', settingsApi);
