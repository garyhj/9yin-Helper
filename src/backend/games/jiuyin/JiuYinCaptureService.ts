import { app } from 'electron';
import { FileType, Region, screen } from '@nut-tree-fork/nut-js';
import path from 'path';
import fs from 'fs/promises';
import type { JiuYinBounds, JiuYinCaptureRequest, JiuYinCaptureResult } from '../../../shared/jiuyin-stage1.ts';
import { jiuYinWindowHelper } from './JiuYinWindowHelper.ts';
import { toAbsoluteRegion } from './JiuYinCoordinateMapper.ts';

const toRegion = (bounds: JiuYinBounds) => (
    new Region(Math.round(bounds.left), Math.round(bounds.top), Math.round(bounds.width), Math.round(bounds.height))
);

export class JiuYinCaptureService {
    private getOutputDir(): string {
        return path.join(app.getPath('userData'), 'captures', 'jiuyin');
    }

    public async captureRegion(request: JiuYinCaptureRequest): Promise<JiuYinCaptureResult> {
        const match = await jiuYinWindowHelper.findBestWindow();
        if (!match) {
            throw new Error('未找到九阴窗口，无法保存调试截图。');
        }

        const region = request.useWindowRegion || !request.relativeRegion
            ? match.info.bounds
            : toAbsoluteRegion(match.info.bounds, request.relativeRegion);

        await fs.mkdir(this.getOutputDir(), { recursive: true });

        const fileName = `jiuyin-${new Date().toISOString().replace(/[:.]/g, '-')}`;
        const filePath = await screen.captureRegion(fileName, toRegion(region), FileType.PNG, this.getOutputDir());

        return {
            success: true,
            filePath,
            region,
            message: '截图已保存，可用于后续采集模板或排查识别区域。',
        };
    }
}

export const jiuYinCaptureService = new JiuYinCaptureService();
