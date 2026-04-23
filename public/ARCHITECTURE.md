# JiuYin-Helper 架构说明

本文记录阶段 0 后的目标结构。旧 TFT 业务代码会逐步清理，新的功能只围绕九阴真经展开。

## 项目边界

```text
JiuYin-Helper/
├── src/                         # React 渲染进程
│   ├── main/                    # Electron 主进程、preload 和 IPC 协议
│   ├── renderer/                # React 渲染进程
│   │   ├── components/          # 布局、弹窗、Toast 等可复用组件
│   │   ├── pages/               # 九阴首页、设置页、错误页
│   │   ├── overlay/             # 九阴浮窗占位，业务启用前不展示任务数据
│   │   ├── stores/              # 通用前端状态
│   │   └── styles/              # 主题和全局样式
│   ├── shared/                  # main/renderer 共享类型和轻量协议
│   └── backend/
│       ├── games/
│       │   ├── common/          # GameOperator、InputBackend 等通用边界
│       │   └── jiuyin/          # 九阴模块入口
│       └── utils/               # 日志、设置、快捷键等通用工具
└── public/resources/9yin/
    ├── templates/               # 九阴模板资源
    └── captures/failed/         # 识别失败截图
```

## 阶段 0 已落地

- `SupportedGameId` 只包含 `jiuyin`。
- `JiuYinOperator` 只返回空状态，不执行自动化动作。
- `InputBackend` 抽象已建立，包含点击、移动、拖拽、按键和文本输入接口。
- `NutInputBackend` 是默认输入路线的占位实现，阶段 1 才接入真实探针。
- `HardwareInputBackend` 仅预留接口，第一版不接入幽灵键鼠等硬件。
- 前端入口改为九阴首页，设置页移除 TFT 用户功能。

## 下一阶段

阶段 1 先做九阴基础环境与输入验证：

1. 识别九阴窗口标题和窗口坐标。
2. 保存指定区域截图，记录 DPI、缩放和分辨率。
3. 使用 `nut-js` 验证前台点击、普通按键、组合键和拖拽。
4. 在团练/授业类提示中确认输入是否真实生效。
5. 如果输入失败，暂停业务功能，优先完善输入后端。
