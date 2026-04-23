/**
 * 输入后端抽象
 * @description 默认先走 nut-js；如果九阴不接受软件输入，再评估硬件 HID 后端。
 */

export interface InputPoint {
    x: number;
    y: number;
}

export type InputBackendKind = 'nut-js' | 'hardware-hid';

export interface InputBackendStatus {
    kind: InputBackendKind;
    isAvailable: boolean;
    message: string;
}

export interface InputBackend {
    readonly kind: InputBackendKind;
    isAvailable(): Promise<InputBackendStatus>;
    click(point: InputPoint): Promise<void>;
    move(point: InputPoint): Promise<void>;
    drag(from: InputPoint, to: InputPoint): Promise<void>;
    pressKey(key: string): Promise<void>;
    typeText(text: string): Promise<void>;
}

const notImplemented = (backendName: string, action: string) => {
    throw new Error(`${backendName} ${action} 尚未接入。阶段 1 需先在九阴窗口内验证输入是否生效。`);
};

export class NutInputBackend implements InputBackend {
    public readonly kind = 'nut-js' as const;

    public async isAvailable(): Promise<InputBackendStatus> {
        return {
            kind: this.kind,
            isAvailable: true,
            message: 'nut-js 后端已作为默认路线登记，阶段 1 会接入真实前台输入探针。',
        };
    }

    public async click(_point: InputPoint): Promise<void> {
        notImplemented('NutInputBackend', '点击');
    }

    public async move(_point: InputPoint): Promise<void> {
        notImplemented('NutInputBackend', '移动');
    }

    public async drag(_from: InputPoint, _to: InputPoint): Promise<void> {
        notImplemented('NutInputBackend', '拖拽');
    }

    public async pressKey(_key: string): Promise<void> {
        notImplemented('NutInputBackend', '按键');
    }

    public async typeText(_text: string): Promise<void> {
        notImplemented('NutInputBackend', '文本输入');
    }
}

export class HardwareInputBackend implements InputBackend {
    public readonly kind = 'hardware-hid' as const;

    public async isAvailable(): Promise<InputBackendStatus> {
        return {
            kind: this.kind,
            isAvailable: false,
            message: '硬件 HID 后端仅预留接口，第一版不接入幽灵键鼠等硬件设备。',
        };
    }

    public async click(_point: InputPoint): Promise<void> {
        notImplemented('HardwareInputBackend', '点击');
    }

    public async move(_point: InputPoint): Promise<void> {
        notImplemented('HardwareInputBackend', '移动');
    }

    public async drag(_from: InputPoint, _to: InputPoint): Promise<void> {
        notImplemented('HardwareInputBackend', '拖拽');
    }

    public async pressKey(_key: string): Promise<void> {
        notImplemented('HardwareInputBackend', '按键');
    }

    public async typeText(_text: string): Promise<void> {
        notImplemented('HardwareInputBackend', '文本输入');
    }
}

export const nutInputBackend = new NutInputBackend();
export const hardwareInputBackend = new HardwareInputBackend();
