import type { JiuYinApi } from './jiuyin-stage1.ts';

export type IpcCleanup = () => void;

export interface IpcApi {
    on(channel: string, callback: (...args: any[]) => void): IpcCleanup;
}

export interface UtilApi {
    getToggleHotkey(): Promise<string>;
    setToggleHotkey(accelerator: string): Promise<boolean>;
    getStopAfterGameHotkey(): Promise<string>;
    setStopAfterGameHotkey(accelerator: string): Promise<boolean>;
    getAppVersion(): Promise<string>;
}

export interface SettingsApi {
    get<T = any>(key: string): Promise<T>;
    set<T = any>(key: string, value: T): Promise<void>;
}

export type { JiuYinApi };
