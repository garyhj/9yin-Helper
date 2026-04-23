import { Window, getWindows } from '@nut-tree-fork/nut-js';
import type { Region } from '@nut-tree-fork/nut-js';
import type { JiuYinBounds, JiuYinWindowInfo } from '../../../shared/jiuyin-stage1.ts';

const TITLE_PATTERNS = [/九阴真经/i, /九阴/i, /jiuyin/i, /9yin/i, /age of wushu/i];

const toBounds = (region: Region): JiuYinBounds => ({
    left: Math.round(region.left),
    top: Math.round(region.top),
    width: Math.round(region.width),
    height: Math.round(region.height),
});

const getMatchReason = (title: string): string => {
    const matched = TITLE_PATTERNS.find(pattern => pattern.test(title));
    return matched ? `标题匹配 ${matched.toString()}` : '未匹配九阴标题关键字';
};

export class JiuYinWindowHelper {
    public async listWindows(): Promise<JiuYinWindowInfo[]> {
        const windows = await getWindows();
        const infos: JiuYinWindowInfo[] = [];

        for (const window of windows) {
            try {
                const title = (await window.getTitle()).trim();
                if (!title) continue;

                const bounds = toBounds(await window.getRegion());
                infos.push({
                    title,
                    bounds,
                    isVisible: bounds.width > 0 && bounds.height > 0,
                    isLikelyJiuYin: TITLE_PATTERNS.some(pattern => pattern.test(title)),
                    matchReason: getMatchReason(title),
                });
            } catch {
                // 部分系统窗口可能拒绝读取标题或坐标，跳过即可。
            }
        }

        return infos.sort((a, b) => Number(b.isLikelyJiuYin) - Number(a.isLikelyJiuYin));
    }

    public async findBestWindow(): Promise<{ window: Window; info: JiuYinWindowInfo } | null> {
        const windows = await getWindows();
        let fallback: { window: Window; info: JiuYinWindowInfo } | null = null;

        for (const window of windows) {
            try {
                const title = (await window.getTitle()).trim();
                if (!title) continue;

                const bounds = toBounds(await window.getRegion());
                const info: JiuYinWindowInfo = {
                    title,
                    bounds,
                    isVisible: bounds.width > 0 && bounds.height > 0,
                    isLikelyJiuYin: TITLE_PATTERNS.some(pattern => pattern.test(title)),
                    matchReason: getMatchReason(title),
                };

                if (info.isLikelyJiuYin && info.isVisible) {
                    return { window, info };
                }

                if (!fallback && info.isLikelyJiuYin) {
                    fallback = { window, info };
                }
            } catch {
                // 保持窗口枚举健壮性。
            }
        }

        return fallback;
    }

    public async focusBestWindow(): Promise<JiuYinWindowInfo | null> {
        const match = await this.findBestWindow();
        if (!match) return null;

        await match.window.restore();
        await match.window.focus();
        return match.info;
    }
}

export const jiuYinWindowHelper = new JiuYinWindowHelper();
