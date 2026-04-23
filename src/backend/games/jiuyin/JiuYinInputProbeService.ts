import type { JiuYinInputProbeRequest, JiuYinInputProbeResult } from '../../../shared/jiuyin-stage1.ts';
import { nutInputBackend } from '../common/InputBackend.ts';
import { toAbsolutePoint } from './JiuYinCoordinateMapper.ts';
import { jiuYinDiagnosticsLogger } from './JiuYinDiagnosticsLogger.ts';
import { jiuYinWindowHelper } from './JiuYinWindowHelper.ts';

const splitCombo = (combo: string) => combo.split('+').map(part => part.trim()).filter(Boolean);

export class JiuYinInputProbeService {
    public async runProbe(request: JiuYinInputProbeRequest): Promise<JiuYinInputProbeResult> {
        const startedAt = Date.now();
        try {
            const match = await jiuYinWindowHelper.findBestWindow();
            if (!match) {
                throw new Error('未找到九阴窗口，无法执行输入探针。');
            }

            await match.window.restore();
            await match.window.focus();

            if (request.action === 'click') {
                const target = toAbsolutePoint(match.info.bounds, request.relativePoint ?? { x: 0.5, y: 0.5 });
                await nutInputBackend.click(target);
            }

            if (request.action === 'key') {
                await nutInputBackend.pressKey(request.key || 'F10');
            }

            if (request.action === 'combo') {
                const keys = request.keys?.length ? request.keys : splitCombo(request.key || 'Ctrl+J');
                await nutInputBackend.pressKeyCombination(keys);
            }

            if (request.action === 'drag') {
                const from = toAbsolutePoint(match.info.bounds, request.relativeFrom ?? { x: 0.45, y: 0.5 });
                const to = toAbsolutePoint(match.info.bounds, request.relativeTo ?? { x: 0.55, y: 0.5 });
                await nutInputBackend.drag(from, to);
            }

            jiuYinDiagnosticsLogger.info('input.probe.completed', {
                action: request.action,
                key: request.key,
                keys: request.keys,
                targetWindow: match.info.title,
                windowBounds: match.info.bounds,
                durationMs: Date.now() - startedAt,
            });

            return {
                success: true,
                action: request.action,
                targetWindow: match.info,
                message: '输入探针已发送。请在九阴窗口内确认是否产生真实响应，并在文档记录结果。',
            };
        } catch (error) {
            jiuYinDiagnosticsLogger.error('input.probe.failed', error, {
                request,
                durationMs: Date.now() - startedAt,
            });
            throw error;
        }
    }
}

export const jiuYinInputProbeService = new JiuYinInputProbeService();
