# JiuYin-Helper 架构说明

本文记录阶段 2 后的目标结构。旧 TFT 业务代码已从入口和公共资源中清理，新功能只围绕九阴真经展开。

## 项目边界

```text
JiuYin-Helper/
├── src/
│   ├── main/                    # Electron 主进程、preload 和 IPC 协议
│   ├── renderer/                # React 渲染进程
│   │   ├── components/          # 布局、弹窗、Toast 等可复用组件
│   │   ├── pages/               # 九阴首页、环境检查页、模板调试页、设置页、错误页
│   │   ├── overlay/             # 九阴浮窗占位，业务启用前不展示任务数据
│   │   ├── stores/              # 通用前端状态
│   │   └── styles/              # 主题和全局样式
│   ├── shared/                  # main/renderer 共享类型和轻量协议
│   └── backend/
│       ├── games/
│       │   ├── common/          # GameOperator、InputBackend 等通用边界
│       │   └── jiuyin/          # 九阴模块、窗口、截图、环境检查、输入探针和模板调试
│       └── utils/               # 日志、设置、快捷键等通用工具
└── public/resources/9yin/
    ├── templates/               # 九阴模板资源
    └── captures/failed/         # 识别失败截图
```

## 阶段 2 已落地

- `SupportedGameId` 只包含 `jiuyin`。
- `JiuYinOperator` 仍只返回空状态，不执行业务自动化动作。
- `InputBackend` 抽象已建立，`NutInputBackend` 已接入真实鼠标键盘输入。
- `JiuYinWindowHelper` 负责查找疑似九阴窗口、读取标题和窗口坐标。
- `JiuYinCoordinateMapper` 负责把相对窗口坐标转换为绝对屏幕坐标。
- `JiuYinCaptureService` 负责保存九阴窗口区域调试截图。
- `JiuYinEnvironmentService` 负责汇总窗口、分辨率、DPI、管理员权限和输入后端状态。
- `JiuYinInputProbeService` 负责前台点击、按键、组合键和拖拽探针。
- `JiuYinTemplateService` 负责扫描模板分类目录和读取模板尺寸。
- `JiuYinTemplateMatcherService` 负责使用九阴窗口截图或指定图片运行轻量模板匹配。
- 渲染进程新增“环境检查”和“模板调试”页面，主进程新增对应 IPC 和 preload API。
- F10/F12 已作为阶段 1 安全热键接入，并在设置中阻止冲突配置，避免占用游戏常用的 F1~F9。

## 后续阶段

阶段 2 仍需用真实客户端素材继续补齐：

1. 采集通用 UI、团练、授业、采集、生活、日常等首批模板。
2. 建立失败截图命名、标注和复盘流程。
3. 调整模板匹配阈值、扫描步长和模板尺寸规范。
4. 阶段 3 才开始团练/授业 MVP 状态机，继续禁止后台绑定、内存、封包和注入。
