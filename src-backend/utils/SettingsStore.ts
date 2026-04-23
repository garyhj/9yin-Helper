import type { Rectangle } from 'electron';
import Store from 'electron-store';

type WindowBounds = Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>;

export type LogAutoCleanThreshold = 0 | 100 | 200 | 500 | 1000;

interface AppSettings {
    isFirstLaunch: boolean;
    logAutoCleanThreshold: LogAutoCleanThreshold;
    toggleHotkeyAccelerator: string;
    stopAfterGameHotkeyAccelerator: string;
    window: {
        bounds: WindowBounds | null;
        isMaximized: boolean;
    };
}

const defaults: AppSettings = {
    isFirstLaunch: true,
    logAutoCleanThreshold: 500,
    toggleHotkeyAccelerator: 'F1',
    stopAfterGameHotkeyAccelerator: 'F2',
    window: {
        bounds: null,
        isMaximized: false,
    },
};

class SettingsStore {
    private static instance: SettingsStore;
    private store: Store<AppSettings>;

    public static getInstance(): SettingsStore {
        if (!SettingsStore.instance) {
            SettingsStore.instance = new SettingsStore();
        }
        return SettingsStore.instance;
    }

    private constructor() {
        this.store = new Store<AppSettings>({ defaults });
    }

    public get<T = unknown>(key: string): T {
        return this.store.get(key as any) as T;
    }

    public set<T = unknown>(key: string, value: T): void {
        this.store.set(key as any, value as any);
    }

    public getRawStore(): Store<AppSettings> {
        return this.store;
    }
}

export const settingsStore = SettingsStore.getInstance();
