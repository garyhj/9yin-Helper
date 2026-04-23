import { app, BrowserWindow, ipcMain, shell } from 'electron';
import type { Rectangle } from 'electron';
import 'source-map-support/register';
import path from 'path';
import { is, optimizer } from '@electron-toolkit/utils';
import { IpcChannel } from './protocol.ts';
import {
    jiuyinGameModule,
    jiuYinCaptureService,
    jiuYinEnvironmentService,
    jiuYinInputProbeService,
    jiuYinTemplateMatcherService,
    jiuYinTemplateService,
    jiuYinWindowHelper,
} from '../backend/games';
import { initGlobalCrashHandler } from '../backend/utils/CrashLogger.ts';
import { globalHotkeyManager } from '../backend/utils/GlobalHotkeyManager.ts';
import { logger } from '../backend/utils/Logger.ts';
import { settingsStore } from '../backend/utils/SettingsStore.ts';
import { showToast } from '../backend/utils/ToastBridge.ts';
import type {
    JiuYinCaptureRequest,
    JiuYinInputProbeRequest,
    JiuYinRuntimeState,
} from '../shared/jiuyin-stage1.ts';
import type { JiuYinTemplateMatchRequest } from '../shared/jiuyin-stage2.ts';

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
let runtimeState: JiuYinRuntimeState = {
    isRunning: false,
    stopAfterCurrentTask: false,
    updatedAt: new Date().toISOString(),
    message: '阶段 1 待机：仅提供环境检查和输入探针。',
};
let registeredToggleHotkey = '';
let registeredStopAfterTaskHotkey = '';

const preloadPath = () => path.join(__dirname, '../preload/preload.cjs');
const publicPath = () => process.env.VITE_PUBLIC ?? path.join(process.env.APP_ROOT ?? '.', '../public');

const emitRuntimeState = () => {
    for (const browserWindow of BrowserWindow.getAllWindows()) {
        browserWindow.webContents.send(IpcChannel.JIUYIN_RUNTIME_UPDATED, runtimeState);
    }
};

const updateRuntimeState = (patch: Partial<JiuYinRuntimeState>) => {
    runtimeState = {
        ...runtimeState,
        ...patch,
        updatedAt: new Date().toISOString(),
    };
    emitRuntimeState();
};

const toggleJiuYinRuntime = () => {
    const nextRunning = !runtimeState.isRunning;
    updateRuntimeState({
        isRunning: nextRunning,
        stopAfterCurrentTask: nextRunning ? runtimeState.stopAfterCurrentTask : false,
        message: nextRunning
            ? '阶段 1 输入验证模式已启用；仍不会执行业务自动化。'
            : '阶段 1 输入验证模式已停止。',
    });

    showToast(nextRunning ? '阶段 1 输入验证模式已启用' : '阶段 1 输入验证模式已停止', {
        type: nextRunning ? 'success' : 'warning',
    });
};

const requestStopAfterCurrentTask = () => {
    if (!runtimeState.isRunning) {
        showToast('当前没有运行中的九阴验证模式。', { type: 'info' });
        return;
    }

    updateRuntimeState({
        stopAfterCurrentTask: true,
        message: '已请求在当前验证动作结束后停止。',
    });
    showToast('已请求当前验证动作结束后停止', { type: 'warning' });
};

const registerHotkey = (
    previousAccelerator: string,
    nextAccelerator: string,
    callback: () => void,
): { success: boolean; activeAccelerator: string } => {
    if (previousAccelerator) {
        globalHotkeyManager.unregister(previousAccelerator);
    }

    if (!nextAccelerator) {
        return { success: true, activeAccelerator: '' };
    }

    const success = globalHotkeyManager.register(nextAccelerator, callback);
    return {
        success,
        activeAccelerator: success ? nextAccelerator : '',
    };
};

const registerJiuYinHotkeys = () => {
    const toggleHotkey = settingsStore.get<string>('toggleHotkeyAccelerator');
    const stopAfterTaskHotkey = settingsStore.get<string>('stopAfterGameHotkeyAccelerator');

    if (toggleHotkey && stopAfterTaskHotkey && toggleHotkey === stopAfterTaskHotkey) {
        showToast('阶段 1 快捷键配置冲突，请在设置页使用不同快捷键。', { type: 'warning' });
        return false;
    }

    const toggleResult = registerHotkey(registeredToggleHotkey, toggleHotkey, toggleJiuYinRuntime);
    registeredToggleHotkey = toggleResult.activeAccelerator;

    const stopResult = registerHotkey(
        registeredStopAfterTaskHotkey,
        stopAfterTaskHotkey,
        requestStopAfterCurrentTask,
    );
    registeredStopAfterTaskHotkey = stopResult.activeAccelerator;

    return toggleResult.success && stopResult.success;
};

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
        const stopAfterTaskHotkey = settingsStore.get<string>('stopAfterGameHotkeyAccelerator');
        if (accelerator && accelerator === stopAfterTaskHotkey) return false;

        settingsStore.set('toggleHotkeyAccelerator', accelerator);
        return registerJiuYinHotkeys();
    });

    ipcMain.handle(IpcChannel.HOTKEY_GET_STOP_AFTER_GAME, async () => {
        return settingsStore.get<string>('stopAfterGameHotkeyAccelerator');
    });

    ipcMain.handle(IpcChannel.HOTKEY_SET_STOP_AFTER_GAME, async (_event, accelerator: string) => {
        const toggleHotkey = settingsStore.get<string>('toggleHotkeyAccelerator');
        if (accelerator && accelerator === toggleHotkey) return false;

        settingsStore.set('stopAfterGameHotkeyAccelerator', accelerator);
        return registerJiuYinHotkeys();
    });

    ipcMain.handle(IpcChannel.APP_GET_VERSION, async () => app.getVersion());

    ipcMain.handle(IpcChannel.OVERLAY_CLOSE, async () => {
        overlayWindow?.close();
        overlayWindow = null;
    });
    if (win) {
        logger.init(win);
    }

    ipcMain.handle(IpcChannel.JIUYIN_CHECK_ENVIRONMENT, async () => {
        return jiuYinEnvironmentService.runCheck(runtimeState);
    });

    ipcMain.handle(IpcChannel.JIUYIN_LIST_WINDOWS, async () => {
        return jiuYinWindowHelper.listWindows();
    });

    ipcMain.handle(IpcChannel.JIUYIN_CAPTURE_REGION, async (_event, request: JiuYinCaptureRequest) => {
        return jiuYinCaptureService.captureRegion(request);
    });

    ipcMain.handle(IpcChannel.JIUYIN_INPUT_PROBE, async (_event, request: JiuYinInputProbeRequest) => {
        const result = await jiuYinInputProbeService.runProbe(request);
        if (runtimeState.stopAfterCurrentTask) {
            updateRuntimeState({
                isRunning: false,
                stopAfterCurrentTask: false,
                message: '验证动作完成，已按请求安全停止。',
            });
        }
        return result;
    });

    ipcMain.handle(IpcChannel.JIUYIN_RUNTIME_GET, async () => runtimeState);

    ipcMain.handle(IpcChannel.JIUYIN_TEMPLATE_LIST, async () => {
        return jiuYinTemplateService.listTemplates();
    });

    ipcMain.handle(IpcChannel.JIUYIN_TEMPLATE_MATCH, async (_event, request: JiuYinTemplateMatchRequest) => {
        return jiuYinTemplateMatcherService.matchTemplates(request);
    });

    ipcMain.handle(IpcChannel.JIUYIN_TEMPLATE_OPEN_ROOT, async () => {
        const rootPath = jiuYinTemplateService.getTemplateRoot();
        await jiuYinTemplateService.ensureTemplateDirectories();
        await shell.openPath(rootPath);
        return rootPath;
    });
}

app.whenReady().then(() => {
    settingsStore.migrateStageOneHotkeys();
    registerHandlers();
    createWindow();
    registerJiuYinHotkeys();

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window);
    });
});

app.on('before-quit', () => {
    globalHotkeyManager.stop();
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
