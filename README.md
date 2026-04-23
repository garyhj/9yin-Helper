# JiuYin-Helper

九阴真经助手。项目已从原 TFT 助手改造为九阴专用方向，不再保留 TFT、阵容、棋盘和对局自动化入口。

## 当前阶段

阶段 0：项目拆壳与命名。

- 前端默认进入九阴真经空状态页。
- 设置页仅保留九阴通用说明、快捷键和日志配置。
- 后端新增 `src/backend/games` 九阴模块边界。
- 新增 `InputBackend` 抽象，默认路线为 `NutInputBackend`，并预留 `HardwareInputBackend`。
- 新增 `public/resources/9yin` 模板和失败截图目录规范。

当前不会执行九阴自动化任务。下一阶段会先验证九阴窗口识别、截图区域和 `nut-js` 输入是否真实生效。

## 安全边界

- 只考虑窗口可见、非最小化、前台图色识别和鼠标键盘输入。
- 不做反检测、虚拟机绕过、驱动绕过、内存、封包、注入、后台窗口绑定、关闭安全软件或加入白名单。
- 若 `nut-js` 在九阴窗口内输入无效，将先暂停业务功能开发，转为评估输入后端抽象。

## 参考文档

九阴资料、竞品观察、风险边界和后续路线图记录在：

- `markdown/九阴真经支持参考与计划.md`
- `public/resources/9yin/README.md`

## 开发

```bash
npm install
npm run typecheck
npm run dev
```

## 技术栈

- Electron
- React
- TypeScript
- styled-components
- `@nut-tree-fork/nut-js`
- OpenCV / OCR 基础能力
