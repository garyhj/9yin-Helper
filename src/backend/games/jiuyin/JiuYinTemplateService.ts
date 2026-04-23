import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import {
    JIUYIN_TEMPLATE_CATEGORIES,
    type JiuYinTemplateCategory,
    type JiuYinTemplateCategorySummary,
    type JiuYinTemplateInfo,
    type JiuYinTemplateLibrarySummary,
} from '../../../shared/jiuyin-stage2.ts';

const CATEGORY_LABELS: Record<JiuYinTemplateCategory, string> = {
    common: '通用 UI',
    task: '任务栏 / 状态',
    'team-practice': '团练',
    teaching: '授业',
    gathering: '采集',
    life: '生活',
    daily: '日常',
    hermit: '隐士 / 门派',
};

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.bmp', '.webp']);

const toTemplateId = (category: JiuYinTemplateCategory, fileName: string) => {
    const parsed = path.parse(fileName);
    return `${category}/${parsed.name}`;
};

export class JiuYinTemplateService {
    public getTemplateRoot(): string {
        const publicRoot = process.env.VITE_PUBLIC
            ?? path.join(process.env.APP_ROOT ?? process.cwd(), '../public');
        return path.join(publicRoot, 'resources', '9yin', 'templates');
    }

    public async ensureTemplateDirectories(): Promise<void> {
        await Promise.all(JIUYIN_TEMPLATE_CATEGORIES.map(async (category) => {
            const directory = path.join(this.getTemplateRoot(), category);
            await fs.mkdir(directory, { recursive: true });

            const keepFile = path.join(directory, '.gitkeep');
            try {
                await fs.access(keepFile);
            } catch {
                await fs.writeFile(keepFile, '\n', 'utf-8');
            }
        }));
    }

    public async listTemplates(): Promise<JiuYinTemplateLibrarySummary> {
        await this.ensureTemplateDirectories();

        const templates: JiuYinTemplateInfo[] = [];
        const categories: JiuYinTemplateCategorySummary[] = [];

        for (const category of JIUYIN_TEMPLATE_CATEGORIES) {
            const directory = path.join(this.getTemplateRoot(), category);
            const files = await fs.readdir(directory);
            let count = 0;

            for (const fileName of files) {
                const extension = path.extname(fileName).toLowerCase();
                if (!SUPPORTED_EXTENSIONS.has(extension)) continue;

                const filePath = path.join(directory, fileName);
                const metadata = await sharp(filePath).metadata();
                templates.push({
                    id: toTemplateId(category, fileName),
                    category,
                    name: path.parse(fileName).name,
                    fileName,
                    filePath,
                    width: metadata.width ?? 0,
                    height: metadata.height ?? 0,
                });
                count += 1;
            }

            categories.push({
                category,
                label: CATEGORY_LABELS[category],
                count,
                directory,
            });
        }

        return {
            rootPath: this.getTemplateRoot(),
            categories,
            templates,
        };
    }
}

export const jiuYinTemplateService = new JiuYinTemplateService();
