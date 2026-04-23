import { app, BrowserWindow, ipcMain, shell } from 'electron';
import type { Rectangle } from 'electron';
import 'source-map-support/register';
import path from 'path';
import { is, optimizer } from '@electron-toolkit/utils';
import { IpcChannel } from './protocol.ts';
import { jiuyinGameModule } from '../backend/games';
import { initGlobalCrashHandler } from '../backend/utils/CrashLogger.ts';
import { settingsStore } from '../backend/utils/SettingsStore.ts';

initGlobalCrashHandler();

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disable-gpu-sandbox');

process.env.APP_ROOT = path.join(__dirname, '..');
process.env.VITE_PUBLIC = is.dev
    ? path.join(process.env.APP_ROOT, '../public')
    : process.resourcesPath;

let win: BrowserWindow | null = null;
let overlayWindow: BrowserWindow | null = null;

const preloadPath = () => path.join(__dirname, '../preload/preload.cjs');
const publicPath = () => process.env.VITE_PUBLIC ?? path.join(process.env.APP_ROOT ?? '.', '../public');

function createWindow() {
    const savedWindowInfo = settingsStore.get<{
        bounds: Rectangle | null;
        isMaximized: boolean;
    }>('window');

    win = new BrowserWindow({
        title: `${jiuyinGameModule.displayName}助手`,
        icon: path.join(publicPath(), 'icon.png'),
        autoHideMenuBar: true,
        webPreferences: {
            preload: preloadPath(),
            sandbox: false,
        },
        ...(savedWindowInfo.bounds ?? { width: 1120, height: 720 }),
    });

    if (savedWindowInfo.isMaximized) {
        win.maximize();
    }

    optimizer.watchWindowShortcuts(win);

    let saveBoundsTimer: NodeJS.Timeout | null = null;
    const saveBounds = () => {
        if (saveBoundsTimer) {
            clearTimeout(saveBoundsTimer);
        }

        saveBoundsTimer = setTimeout(() => {
            if (!win || win.isMaximized() || win.isFullScreen()) return;
            settingsStore.set('window.bounds', win.getBounds());
        }, 500);
    };

    win.on('resize', saveBounds);
    win.on('move', saveBounds);

    win.on('close', () => {
        if (win) {
            settingsStore.set('window.isMaximized', win.isMaximized());
        }
    });

    win.on('closed', () => {
        win = null;
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            shell.openExternal(url);
        }
        return { action: 'deny' };
    });

    if (is.dev && process.env.ELECTRON_RENDERER_URL) {
        win.loadURL(process.env.ELECTRON_RENDERER_URL);
    } else {
        win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }
}

function registerHandlers() {
    ipcMain.handle(IpcChannel.SETTINGS_GET, async (_event, key: string) => {
        return settingsStore.get(key);
    });

    ipcMain.handle(IpcChannel.SETTINGS_SET, async (_event, key: string, value: unknown) => {
        settingsStore.set(key, value);
    });

    ipcMain.handle(IpcChannel.HOTKEY_GET_TOGGLE, async () => {
        return settingsStore.get<string>('toggleHotkeyAccelerator');
    });

    ipcMain.handle(IpcChannel.HOTKEY_SET_TOGGLE, async (_event, accelerator: string) => {
        settingsStore.set('toggleHotkeyAccelerator', accelerator);
        return true;
    });

    ipcMain.handle(IpcChannel.HOTKEY_GET_STOP_AFTER_GAME, async () => {
        return settingsStore.get<string>('stopAfterGameHotkeyAccelerator');
    });

    ipcMain.handle(IpcChannel.HOTKEY_SET_STOP_AFTER_GAME, async (_event, accelerator: string) => {
        settingsStore.set('stopAfterGameHotkeyAccelerator', accelerator);
        return true;
    });

    ipcMain.handle(IpcChannel.APP_GET_VERSION, async () => app.getVersion());

    ipcMain.handle(IpcChannel.OVERLAY_CLOSE, async () => {
        overlayWindow?.close();
        overlayWindow = null;
    });
}

app.whenReady().then(() => {
    registerHandlers();
    createWindow();

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
