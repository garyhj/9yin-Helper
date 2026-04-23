export interface JiuYinInputPoint {
    x: number;
    y: number;
}

export interface JiuYinInputBackendStatus {
    kind: 'nut-js' | 'hardware-hid';
    isAvailable: boolean;
    message: string;
}

export interface JiuYinBounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

export interface JiuYinWindowInfo {
    title: string;
    bounds: JiuYinBounds;
    isVisible: boolean;
    isLikelyJiuYin: boolean;
    matchReason: string;
}

export type JiuYinCheckStatus = 'pass' | 'warn' | 'fail';

export interface JiuYinEnvironmentCheckItem {
    id: string;
    label: string;
    status: JiuYinCheckStatus;
    message: string;
}

export interface JiuYinDisplayInfo {
    width: number;
    height: number;
    scaleFactor: number;
}

export interface JiuYinEnvironmentReport {
    checkedAt: string;
    isAdministrator: boolean | null;
    display: JiuYinDisplayInfo;
    primaryWindow: JiuYinWindowInfo | null;
    windows: JiuYinWindowInfo[];
    inputBackend: JiuYinInputBackendStatus;
    runtime: JiuYinRuntimeState;
    checks: JiuYinEnvironmentCheckItem[];
}

export interface JiuYinCaptureRequest {
    useWindowRegion: boolean;
    relativeRegion?: JiuYinBounds;
}

export interface JiuYinCaptureResult {
    success: boolean;
    filePath: string;
    region: JiuYinBounds;
    message: string;
}

export type JiuYinInputProbeAction = 'click' | 'key' | 'combo' | 'drag';

export interface JiuYinInputProbeRequest {
    action: JiuYinInputProbeAction;
    relativePoint?: JiuYinInputPoint;
    relativeFrom?: JiuYinInputPoint;
    relativeTo?: JiuYinInputPoint;
    key?: string;
    keys?: string[];
}

export interface JiuYinInputProbeResult {
    success: boolean;
    action: JiuYinInputProbeAction;
    message: string;
    targetWindow: JiuYinWindowInfo | null;
}

export interface JiuYinRuntimeState {
    isRunning: boolean;
    stopAfterCurrentTask: boolean;
    updatedAt: string;
    message: string;
}

export interface JiuYinApi {
    checkEnvironment(): Promise<JiuYinEnvironmentReport>;
    listWindows(): Promise<JiuYinWindowInfo[]>;
    captureRegion(request: JiuYinCaptureRequest): Promise<JiuYinCaptureResult>;
    runInputProbe(request: JiuYinInputProbeRequest): Promise<JiuYinInputProbeResult>;
    getRuntimeState(): Promise<JiuYinRuntimeState>;
}
