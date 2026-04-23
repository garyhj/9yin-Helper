import type { GameModule, GameOperator, GameRuntimeStatus, SupportedGameId } from '../common';

const GAME_ID: SupportedGameId = 'jiuyin';

export const jiuyinGameModule: GameModule = {
    id: GAME_ID,
    name: 'jiuyin',
    displayName: '九阴真经',
    status: 'planning',
    description: '九阴真经专用自动化模块。阶段 1 提供窗口识别、截图调试和输入探针，不启用业务自动化。',
    capabilities: [
        'window-detection',
        'screen-capture-debug',
        'input-probe',
        'input-backend-abstracted',
        'template-debug-planned',
    ],
};

export class JiuYinOperator implements GameOperator {
    public readonly gameId = GAME_ID;

    public async initialize(): Promise<GameRuntimeStatus> {
        return this.getStatus();
    }

    public async getStatus(): Promise<GameRuntimeStatus> {
        return {
            gameId: this.gameId,
            isAvailable: false,
            isRunning: false,
            message: '九阴阶段 1 已接入窗口识别、截图调试和输入探针；业务自动化尚未启用。',
        };
    }

    public async shutdown(): Promise<void> {
        // 阶段 0 没有启动任何外部资源，保留统一生命周期接口。
    }
}

export const jiuYinOperator = new JiuYinOperator();
