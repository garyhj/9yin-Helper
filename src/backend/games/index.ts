import type { GameModule, SupportedGameId } from './common';
import { jiuyinGameModule } from './jiuyin';

export type {
    GameModule,
    GameModuleStatus,
    GameOperator,
    GameRuntimeStatus,
    SupportedGameId,
} from './common';

export type {
    InputBackend,
    InputBackendKind,
    InputBackendStatus,
    InputPoint,
} from './common';

export {
    HardwareInputBackend,
    NutInputBackend,
    hardwareInputBackend,
    nutInputBackend,
} from './common';

export {
    JiuYinCaptureService,
    JiuYinEnvironmentService,
    JiuYinInputProbeService,
    JiuYinOperator,
    JiuYinWindowHelper,
    jiuYinCaptureService,
    jiuYinEnvironmentService,
    jiuYinInputProbeService,
    jiuYinOperator,
    jiuYinWindowHelper,
    jiuyinGameModule,
} from './jiuyin';

const gameModules: Record<SupportedGameId, GameModule> = {
    jiuyin: jiuyinGameModule,
};

export function getGameModule(gameId: SupportedGameId): GameModule {
    return gameModules[gameId];
}

export function getAllGameModules(): GameModule[] {
    return Object.values(gameModules);
}
