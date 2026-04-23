import type { Rectangle } from 'electron';
import Store from 'electron-store';

type WindowBounds = Pick<Rectangle, 'x' | 'y' | 'width' | 'height'>;

export type LogAutoCleanThreshold = 0 | 100 | 200 | 500 | 1000;
export const DEFAULT_TOGGLE_HOTKEY = 'F10';
export const DEFAULT_STOP_AFTER_TASK_HOTKEY = 'F12';

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
    toggleHotkeyAccelerator: DEFAULT_TOGGLE_HOTKEY,
    stopAfterGameHotkeyAccelerator: DEFAULT_STOP_AFTER_TASK_HOTKEY,
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

    public migrateStageOneHotkeys(): void {
        const toggleHotkey = this.get<string>('toggleHotkeyAccelerator');
        const stopAfterTaskHotkey = this.get<string>('stopAfterGameHotkeyAccelerator');

        if (toggleHotkey === 'F1') {
            this.set('toggleHotkeyAccelerator', DEFAULT_TOGGLE_HOTKEY);
        }

        if (stopAfterTaskHotkey === 'F2') {
            const nextToggleHotkey = this.get<string>('toggleHotkeyAccelerator');
            const nextStopHotkey = nextToggleHotkey === DEFAULT_STOP_AFTER_TASK_HOTKEY
                ? 'F11'
                : DEFAULT_STOP_AFTER_TASK_HOTKEY;
            this.set('stopAfterGameHotkeyAccelerator', nextStopHotkey);
        }
    }

    public getRawStore(): Store<AppSettings> {
        return this.store;
    }
}

export const settingsStore = SettingsStore.getInstance();
