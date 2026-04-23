/**
 * 通用游戏模块协议
 * @description 阶段 0 先定义稳定边界，后续九阴功能都挂在这个边界下。
 */

export type SupportedGameId = 'jiuyin';

export type GameModuleStatus = 'planning' | 'ready' | 'disabled';

export interface GameModule {
    id: SupportedGameId;
    name: string;
    displayName: string;
    status: GameModuleStatus;
    description: string;
    capabilities: string[];
}

export interface GameRuntimeStatus {
    gameId: SupportedGameId;
    isAvailable: boolean;
    isRunning: boolean;
    message: string;
}

export interface GameOperator {
    readonly gameId: SupportedGameId;
    initialize(): Promise<GameRuntimeStatus>;
    getStatus(): Promise<GameRuntimeStatus>;
    shutdown(): Promise<void>;
}

