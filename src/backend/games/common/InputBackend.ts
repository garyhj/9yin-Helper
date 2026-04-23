import { Button, Key, Point, keyboard, mouse } from '@nut-tree-fork/nut-js';

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
    pressKeyCombination(keys: string[]): Promise<void>;
    typeText(text: string): Promise<void>;
}

const notImplemented = (backendName: string, action: string) => {
    throw new Error(`${backendName} ${action} 尚未接入。阶段 1 需先在九阴窗口内验证输入是否生效。`);
};

const keyMap: Record<string, Key> = {
    CTRL: Key.LeftControl,
    CONTROL: Key.LeftControl,
    ALT: Key.LeftAlt,
    SHIFT: Key.LeftShift,
    META: Key.LeftMeta,
    WIN: Key.LeftWin,
    CMD: Key.LeftCmd,
    COMMAND: Key.LeftCmd,
    SPACE: Key.Space,
    ENTER: Key.Return,
    RETURN: Key.Return,
    ESC: Key.Escape,
    ESCAPE: Key.Escape,
    TAB: Key.Tab,
    UP: Key.Up,
    DOWN: Key.Down,
    LEFT: Key.Left,
    RIGHT: Key.Right,
};

for (let index = 1; index <= 12; index += 1) {
    keyMap[`F${index}`] = Key[`F${index}` as keyof typeof Key] as Key;
}

for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    keyMap[letter] = Key[letter as keyof typeof Key] as Key;
}

for (let index = 0; index <= 9; index += 1) {
    keyMap[String(index)] = Key[`Num${index}` as keyof typeof Key] as Key;
}

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

const toNutPoint = (point: InputPoint) => new Point(Math.round(point.x), Math.round(point.y));

const parseKey = (key: string): Key => {
    const normalized = key.trim().toUpperCase();
    const mapped = keyMap[normalized];
    if (mapped === undefined) {
        throw new Error(`暂不支持按键 "${key}"，请使用 F10、A、Space、Ctrl 等标准按键名称。`);
    }
    return mapped;
};

export class NutInputBackend implements InputBackend {
    public readonly kind = 'nut-js' as const;

    public async isAvailable(): Promise<InputBackendStatus> {
        try {
            await mouse.getPosition();
        } catch (error) {
            return {
                kind: this.kind,
                isAvailable: false,
                message: `nut-js 后端不可用：${error instanceof Error ? error.message : String(error)}`,
            };
        }

        return {
            kind: this.kind,
            isAvailable: true,
            message: 'nut-js 后端可用，可执行前台点击、按键、组合键和拖拽探针。',
        };
    }

    public async click(point: InputPoint): Promise<void> {
        await mouse.setPosition(toNutPoint(point));
        await mouse.click(Button.LEFT);
    }

    public async move(point: InputPoint): Promise<void> {
        await mouse.setPosition(toNutPoint(point));
    }

    public async drag(from: InputPoint, to: InputPoint): Promise<void> {
        await mouse.setPosition(toNutPoint(from));
        await mouse.drag([toNutPoint(from), toNutPoint(to)]);
    }

    public async pressKey(key: string): Promise<void> {
        const nutKey = parseKey(key);
        await keyboard.pressKey(nutKey);
        await wait(80);
        await keyboard.releaseKey(nutKey);
    }

    public async pressKeyCombination(keys: string[]): Promise<void> {
        const nutKeys = keys.map(parseKey);
        await keyboard.pressKey(...nutKeys);
        await wait(120);
        await keyboard.releaseKey(...nutKeys.slice().reverse());
    }

    public async typeText(text: string): Promise<void> {
        await keyboard.type(text);
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

    public async pressKeyCombination(_keys: string[]): Promise<void> {
        notImplemented('HardwareInputBackend', '组合键');
    }

    public async typeText(_text: string): Promise<void> {
        notImplemented('HardwareInputBackend', '文本输入');
    }
}

export const nutInputBackend = new NutInputBackend();
export const hardwareInputBackend = new HardwareInputBackend();
