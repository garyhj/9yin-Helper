import { screen as electronScreen } from 'electron';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { screen as nutScreen } from '@nut-tree-fork/nut-js';
import type {
    JiuYinCheckStatus,
    JiuYinEnvironmentCheckItem,
    JiuYinEnvironmentReport,
    JiuYinRuntimeState,
} from '../../../shared/jiuyin-stage1.ts';
import { nutInputBackend } from '../common/InputBackend.ts';
import { jiuYinWindowHelper } from './JiuYinWindowHelper.ts';

const execFileAsync = promisify(execFile);

const checkAdmin = async (): Promise<boolean | null> => {
    if (process.platform !== 'win32') {
        return typeof process.getuid === 'function' ? process.getuid() === 0 : null;
    }

    try {
        await execFileAsync('net', ['session'], { windowsHide: true });
        return true;
    } catch {
        return false;
    }
};

const makeCheck = (
    id: string,
    label: string,
    status: JiuYinCheckStatus,
    message: string,
): JiuYinEnvironmentCheckItem => ({ id, label, status, message });

export class JiuYinEnvironmentService {
    public async runCheck(runtime: JiuYinRuntimeState): Promise<JiuYinEnvironmentReport> {
        const [windows, primaryWindow, inputBackend, isAdministrator, width, height] = await Promise.all([
            jiuYinWindowHelper.listWindows(),
            jiuYinWindowHelper.findBestWindow(),
            nutInputBackend.isAvailable(),
            checkAdmin(),
            nutScreen.width(),
            nutScreen.height(),
        ]);

        const display = electronScreen.getPrimaryDisplay();
        const checks: JiuYinEnvironmentCheckItem[] = [
            makeCheck(
                'window-found',
                '九阴窗口',
                primaryWindow ? 'pass' : 'fail',
                primaryWindow ? `已找到：${primaryWindow.info.title}` : '未找到标题包含九阴 / JiuYin / Age of Wushu 的窗口。',
            ),
            makeCheck(
                'window-visible',
                '窗口可见性',
                primaryWindow?.info.isVisible ? 'pass' : 'fail',
                primaryWindow?.info.isVisible ? '窗口有可截图区域。' : '窗口不可见、最小化，或坐标读取失败。',
            ),
            makeCheck(
                'resolution',
                '屏幕分辨率',
                width >= 1280 && height >= 720 ? 'pass' : 'warn',
                `主屏幕分辨率：${width} x ${height}`,
            ),
            makeCheck(
                'dpi',
                'DPI / 缩放',
                display.scaleFactor === 1 ? 'pass' : 'warn',
                `当前缩放系数：${display.scaleFactor}。非 100% 缩放后续需要校准截图坐标。`,
            ),
            makeCheck(
                'administrator',
                '管理员权限',
                isAdministrator ? 'pass' : 'warn',
                isAdministrator === null
                    ? '当前平台无法确认管理员权限。'
                    : (isAdministrator ? '当前进程具备管理员权限。' : '建议以管理员模式运行，避免窗口聚焦或输入受限。'),
            ),
            makeCheck(
                'input-backend',
                'nut-js 输入后端',
                inputBackend.isAvailable ? 'pass' : 'fail',
                inputBackend.message,
            ),
        ];

        return {
            checkedAt: new Date().toISOString(),
            isAdministrator,
            display: {
                width,
                height,
                scaleFactor: display.scaleFactor,
            },
            primaryWindow: primaryWindow?.info ?? null,
            windows,
            inputBackend,
            runtime,
            checks,
        };
    }
}

export const jiuYinEnvironmentService = new JiuYinEnvironmentService();
