export const JIUYIN_TEMPLATE_CATEGORIES = [
    'common',
    'task',
    'team-practice',
    'teaching',
    'gathering',
    'life',
    'daily',
    'hermit',
] as const;

export type JiuYinTemplateCategory = typeof JIUYIN_TEMPLATE_CATEGORIES[number];

export interface JiuYinTemplateCategorySummary {
    category: JiuYinTemplateCategory;
    label: string;
    count: number;
    directory: string;
}

export interface JiuYinTemplateInfo {
    id: string;
    category: JiuYinTemplateCategory;
    name: string;
    fileName: string;
    filePath: string;
    width: number;
    height: number;
}

export interface JiuYinTemplateLibrarySummary {
    rootPath: string;
    categories: JiuYinTemplateCategorySummary[];
    templates: JiuYinTemplateInfo[];
}

export interface JiuYinTemplateMatchRequest {
    category?: JiuYinTemplateCategory | 'all';
    templateIds?: string[];
    threshold?: number;
    maxResults?: number;
    sourceImagePath?: string;
    captureWindow?: boolean;
    saveFailedCapture?: boolean;
    step?: number;
}

export interface JiuYinTemplateMatchResult {
    template: JiuYinTemplateInfo;
    score: number;
    bounds: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    center: {
        x: number;
        y: number;
    };
}

export interface JiuYinTemplateMatchReport {
    matchedAt: string;
    sourceImagePath: string;
    threshold: number;
    templateCount: number;
    matches: JiuYinTemplateMatchResult[];
    failedCapturePath: string | null;
    message: string;
}
