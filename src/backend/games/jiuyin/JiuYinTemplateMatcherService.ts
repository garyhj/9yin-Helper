import { app } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import type {
    JiuYinTemplateInfo,
    JiuYinTemplateMatchReport,
    JiuYinTemplateMatchRequest,
    JiuYinTemplateMatchResult,
} from '../../../shared/jiuyin-stage2.ts';
import { jiuYinCaptureService } from './JiuYinCaptureService.ts';
import { jiuYinTemplateService } from './JiuYinTemplateService.ts';

interface RawImage {
    width: number;
    height: number;
    channels: number;
    data: Buffer;
}

interface TemplateCandidate {
    template: JiuYinTemplateInfo;
    image: RawImage;
}

const DEFAULT_THRESHOLD = 0.88;
const DEFAULT_MAX_RESULTS = 20;
const DEFAULT_SCAN_STEP = 4;

const clampScanStep = (step: number | undefined) => {
    if (!Number.isFinite(step ?? NaN)) return DEFAULT_SCAN_STEP;
    return Math.min(32, Math.max(1, Math.round(step ?? DEFAULT_SCAN_STEP)));
};

const loadRawImage = async (filePath: string): Promise<RawImage> => {
    const { data, info } = await sharp(filePath)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    return {
        width: info.width,
        height: info.height,
        channels: info.channels,
        data,
    };
};

const scoreAt = (source: RawImage, template: RawImage, left: number, top: number) => {
    const sampleStepX = Math.max(1, Math.floor(template.width / 24));
    const sampleStepY = Math.max(1, Math.floor(template.height / 24));
    let totalDifference = 0;
    let samples = 0;

    for (let y = 0; y < template.height; y += sampleStepY) {
        const sourceRow = (top + y) * source.width * source.channels;
        const templateRow = y * template.width * template.channels;

        for (let x = 0; x < template.width; x += sampleStepX) {
            const sourceOffset = sourceRow + (left + x) * source.channels;
            const templateOffset = templateRow + x * template.channels;

            totalDifference += Math.abs(source.data[sourceOffset] - template.data[templateOffset]);
            totalDifference += Math.abs(source.data[sourceOffset + 1] - template.data[templateOffset + 1]);
            totalDifference += Math.abs(source.data[sourceOffset + 2] - template.data[templateOffset + 2]);
            samples += 1;
        }
    }

    if (samples === 0) return 0;
    const averageDifference = totalDifference / (samples * 3 * 255);
    return Math.max(0, 1 - averageDifference);
};

const findBestMatch = (
    source: RawImage,
    candidate: TemplateCandidate,
    scanStep: number,
): JiuYinTemplateMatchResult | null => {
    const { template, image } = candidate;
    if (image.width <= 0 || image.height <= 0) return null;
    if (image.width > source.width || image.height > source.height) return null;

    let bestScore = 0;
    let bestLeft = 0;
    let bestTop = 0;
    const maxLeft = source.width - image.width;
    const maxTop = source.height - image.height;

    for (let top = 0; top <= maxTop; top += scanStep) {
        for (let left = 0; left <= maxLeft; left += scanStep) {
            const score = scoreAt(source, image, left, top);
            if (score > bestScore) {
                bestScore = score;
                bestLeft = left;
                bestTop = top;
            }
        }
    }

    return {
        template,
        score: Number(bestScore.toFixed(4)),
        bounds: {
            left: bestLeft,
            top: bestTop,
            width: image.width,
            height: image.height,
        },
        center: {
            x: Math.round(bestLeft + image.width / 2),
            y: Math.round(bestTop + image.height / 2),
        },
    };
};

export class JiuYinTemplateMatcherService {
    public async matchTemplates(request: JiuYinTemplateMatchRequest): Promise<JiuYinTemplateMatchReport> {
        const library = await jiuYinTemplateService.listTemplates();
        const threshold = request.threshold ?? DEFAULT_THRESHOLD;
        const maxResults = request.maxResults ?? DEFAULT_MAX_RESULTS;
        const scanStep = clampScanStep(request.step);
        const sourceImagePath = request.captureWindow || !request.sourceImagePath
            ? (await jiuYinCaptureService.captureRegion({ useWindowRegion: true })).filePath
            : request.sourceImagePath;

        const selectedTemplates = library.templates.filter((template) => {
            const categoryMatches = !request.category || request.category === 'all' || template.category === request.category;
            const idMatches = !request.templateIds?.length || request.templateIds.includes(template.id);
            return categoryMatches && idMatches;
        });

        const sourceImage = await loadRawImage(sourceImagePath);
        const candidates = await Promise.all(selectedTemplates.map(async (template): Promise<TemplateCandidate> => ({
            template,
            image: await loadRawImage(template.filePath),
        })));

        const matches = candidates
            .map(candidate => findBestMatch(sourceImage, candidate, scanStep))
            .filter((match): match is JiuYinTemplateMatchResult => match !== null)
            .filter(match => match.score >= threshold)
            .sort((a, b) => b.score - a.score)
            .slice(0, maxResults);

        const failedCapturePath = matches.length === 0 && request.saveFailedCapture
            ? await this.saveFailedCapture(sourceImagePath)
            : null;

        return {
            matchedAt: new Date().toISOString(),
            sourceImagePath,
            threshold,
            templateCount: selectedTemplates.length,
            matches,
            failedCapturePath,
            message: matches.length > 0
                ? `找到 ${matches.length} 个模板匹配结果。`
                : '未找到达到阈值的模板匹配结果，可将截图作为失败样本复盘。',
        };
    }

    private async saveFailedCapture(sourceImagePath: string): Promise<string> {
        const outputDir = path.join(app.getPath('userData'), 'captures', 'jiuyin', 'failed');
        await fs.mkdir(outputDir, { recursive: true });

        const extension = path.extname(sourceImagePath) || '.png';
        const outputPath = path.join(
            outputDir,
            `template-match-${new Date().toISOString().replace(/[:.]/g, '-')}${extension}`,
        );
        await fs.copyFile(sourceImagePath, outputPath);
        return outputPath;
    }
}

export const jiuYinTemplateMatcherService = new JiuYinTemplateMatcherService();
