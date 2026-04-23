import type { InputPoint } from '../common/InputBackend.ts';
import type { JiuYinBounds } from '../../../shared/jiuyin-stage1.ts';

export const DEFAULT_JIUYIN_CLIENT_REGION: JiuYinBounds = {
    left: 0,
    top: 0,
    width: 1920,
    height: 1080,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const toAbsolutePoint = (windowBounds: JiuYinBounds, relativePoint: InputPoint): InputPoint => ({
    x: windowBounds.left + clamp(relativePoint.x, 0, 1) * windowBounds.width,
    y: windowBounds.top + clamp(relativePoint.y, 0, 1) * windowBounds.height,
});

export const toAbsoluteRegion = (windowBounds: JiuYinBounds, relativeRegion: JiuYinBounds): JiuYinBounds => {
    const leftRatio = clamp(relativeRegion.left, 0, 1);
    const topRatio = clamp(relativeRegion.top, 0, 1);
    const widthRatio = clamp(relativeRegion.width, 0.01, 1 - leftRatio);
    const heightRatio = clamp(relativeRegion.height, 0.01, 1 - topRatio);

    return {
        left: Math.round(windowBounds.left + leftRatio * windowBounds.width),
        top: Math.round(windowBounds.top + topRatio * windowBounds.height),
        width: Math.round(widthRatio * windowBounds.width),
        height: Math.round(heightRatio * windowBounds.height),
    };
};
