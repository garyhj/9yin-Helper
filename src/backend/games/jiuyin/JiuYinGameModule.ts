import type { GameModule, GameOperator, GameRuntimeStatus, SupportedGameId } from '../common';

const GAME_ID: SupportedGameId = 'jiuyin';

export const jiuyinGameModule: GameModule = {
    id: GAME_ID,
    name: 'jiuyin',
    displayName: '九阴真经',
    status: 'planning',
    description: '九阴真经专用自动化模块。阶段 0 仅接入项目壳，后续先验证窗口识别和输入后端。',
    capabilities: [
        'window-detection-planned',
        'screen-capture-planned',
        'input-probe-planned',
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
            message: '九阴模块已接入项目壳，窗口识别与输入验证尚未实现。',
        };
    }

    public async shutdown(): Promise<void> {
        // 阶段 0 没有启动任何外部资源，保留统一生命周期接口。
    }
}

export const jiuYinOperator = new JiuYinOperator();
