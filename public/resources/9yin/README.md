# 九阴资源目录规范

阶段 2 用于保存模板素材、调试截图和失败样本。模板调试页会扫描 `templates` 下的分类目录，并用当前窗口截图或指定图片进行匹配。

## 目录

- `templates/common`：通用 UI 模板，例如确定、取消、关闭、NPC 对话、任务栏。
- `templates/task`：任务栏、任务状态、坐标和进度相关模板。
- `templates/team-practice`：团练相关模板，例如方向键、J/K/L、开始、加入、完成。
- `templates/teaching`：授业相关模板，例如高人、授业状态、交互按钮。
- `templates/gathering`：采集相关模板，例如矿、树、草药和地图采集状态。
- `templates/life`：生活技能模板，例如种地、钓鱼、养蚕。
- `templates/daily`：日常任务模板，例如踢馆、门禁、凌霄城。
- `templates/hermit`：隐士和门派日常模板，例如五仙、华山、达摩、天涯。
- `captures/failed`：识别失败时保存的调试截图。
- 应用运行时截图会保存到 Electron `userData/captures/jiuyin`，不直接写入仓库资源目录。

## 约束

- 模板只来自用户自行截图或可公开使用的素材。
- 不保存账号、角色名、聊天内容等敏感信息。
- 不加入反检测、窗口绑定、内存或封包相关资源。
